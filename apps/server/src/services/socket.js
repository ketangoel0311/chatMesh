const { Server }     = require('socket.io');
const { generateRoomId } = require('../utils/roomUtils');

function SocketService() {
  this._io = new Server({
    cors: { origin: '*', methods: ['GET', 'POST'] },
    maxHttpBufferSize: 50 * 1024 * 1024,
  });
}

SocketService.prototype.initListeners = function() {
  const io = this._io;

  io.on('connection', function(socket) {
    socket.on('create_room', function() {
      const roomId = generateRoomId();
      socket.join(roomId);
      socket.emit('room_created', { roomId });
    });

    socket.on('join_room', function(data) {
      socket.join(data.roomId);
      socket.emit('room_joined', { roomId: data.roomId });
    });

    socket.on('disconnect', function() {});
  });
};

Object.defineProperty(SocketService.prototype, 'io', {
  get: function() { return this._io; }
});

module.exports = SocketService;
