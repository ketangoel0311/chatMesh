const CHARSET        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ROOM_ID_LENGTH = 8;

const generateRoomId = function() {
  let id = '';
  for (let i = 0; i < ROOM_ID_LENGTH; i++) {
    id += CHARSET.charAt(Math.floor(Math.random() * CHARSET.length));
  }
  return id;
};

module.exports = { generateRoomId };
