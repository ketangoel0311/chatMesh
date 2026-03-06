const { Server }         = require('socket.io');
const Redis              = require('ioredis');
const { generateRoomId } = require('../utils/roomUtils');

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  process.stderr.write('REDIS_URL is not set\n');
  process.exit(1);
}

const pub   = new Redis(redisUrl, { maxRetriesPerRequest: null });
const sub   = new Redis(redisUrl, { maxRetriesPerRequest: null });
const store = new Redis(redisUrl, { maxRetriesPerRequest: null });

pub.on('error',   function(err) { process.stderr.write('redis pub: '   + err.message + '\n'); });
sub.on('error',   function(err) { process.stderr.write('redis sub: '   + err.message + '\n'); });
store.on('error', function(err) { process.stderr.write('redis store: ' + err.message + '\n'); });

const roomUsers   = new Map();
const userSockets = new Map();

function roomKey(roomId)     { return 'room:' + roomId + ':messages'; }
function roomChannel(roomId) { return 'room:' + roomId; }

function SocketService() {
  this._io = new Server({
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 50 * 1024 * 1024,
  });

  sub.psubscribe('room:*', function(err) {
    if (err) process.stderr.write('redis psubscribe: ' + err.message + '\n');
  });
}

SocketService.prototype.publishToRoom = async function(roomId, payload) {
  if (!roomId) return;
  const data = Object.assign({}, payload, {
    roomId,
    timestamp: payload.timestamp || Date.now(),
  });
  await store.lpush(roomKey(roomId), JSON.stringify(data));
  await store.ltrim(roomKey(roomId), 0, 49);
  await pub.publish(roomChannel(roomId), JSON.stringify(data));
};

SocketService.prototype.initListeners = function() {
  const io   = this._io;
  const self = this;

  io.on('connection', function(socket) {
    let currentRoomId = null;
    let currentUser   = null;
    let currentUserId = null;

    socket.on('create_room', function(data) {
      const { username, userId } = data;

      const existing = userSockets.get(userId);
      if (existing && existing !== socket.id) {
        const stale = io.sockets.sockets.get(existing);
        if (stale) stale.disconnect();
      }

      const roomId  = generateRoomId();
      currentRoomId = roomId;
      currentUser   = username;
      currentUserId = userId;

      userSockets.set(userId, socket.id);
      socket.join(roomId);

      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, { socketId: socket.id, username, userId });

      socket.emit('room_created', { roomId });
      io.to(roomId).emit('room_users', Array.from(roomUsers.get(roomId).values()));
    });

    socket.on('join_room', async function(data) {
      const { roomId, username, userId } = data;

      const existing = userSockets.get(userId);
      if (existing && existing !== socket.id) {
        const stale = io.sockets.sockets.get(existing);
        if (stale) stale.disconnect();
      }

      currentRoomId = roomId;
      currentUser   = username;
      currentUserId = userId;

      userSockets.set(userId, socket.id);
      socket.join(roomId);

      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      roomUsers.get(roomId).set(socket.id, { socketId: socket.id, username, userId });

      const cached = await store.lrange(roomKey(roomId), 0, 49);
      cached.reverse().forEach(function(raw) {
        try { socket.emit('message', JSON.parse(raw)); } catch(_) {}
      });

      socket.emit('room_joined', { roomId });
      io.to(roomId).emit('room_users', Array.from(roomUsers.get(roomId).values()));
    });

    socket.on('event:message', async function(data) {
      if (!currentRoomId || !currentUser) return;
      await self.publishToRoom(currentRoomId, {
        type:      'text',
        message:   data.message,
        userId:    currentUserId,
        username:  currentUser,
        timestamp: Date.now(),
        roomId:    currentRoomId,
      });
    });

    socket.on('disconnect', function() {
      if (currentUserId) userSockets.delete(currentUserId);
      if (currentRoomId) {
        const users = roomUsers.get(currentRoomId);
        if (users) {
          users.delete(socket.id);
          io.to(currentRoomId).emit('room_users', Array.from(users.values()));
        }
      }
    });
  });

  sub.on('pmessage', function(_pattern, channel, raw) {
    if (!channel.startsWith('room:')) return;
    const roomId = channel.slice(5);
    io.to(roomId).emit('message', JSON.parse(raw));
  });
};

Object.defineProperty(SocketService.prototype, 'io', {
  get: function() { return this._io; }
});

module.exports = SocketService;
