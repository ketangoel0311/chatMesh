const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

const fs     = require('fs');
const http   = require('http');


const express       = require('express');
const multer        = require('multer');
const SocketService = require('./services/socket');

async function init() {
  if (!process.env.REDIS_URL) {
    process.stderr.write('REDIS_URL is not set\n');
    process.exit(1);
  }

  const app           = express();
  const socketService = new SocketService();
  const server        = http.createServer(app);
  const PORT          = process.env.PORT || 8000;

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const uploadDir = path.join(__dirname, '..', 'uploads');
  fs.mkdirSync(uploadDir, { recursive: true });
  app.use('/uploads', express.static(uploadDir));

  const storage = multer.diskStorage({
    destination: function(_req, _file, cb) { cb(null, uploadDir); },
    filename: function(_req, file, cb) {
      const ext     = path.extname(file.originalname || '');
      const safeExt = (ext.length > 0 && ext.length <= 10) ? ext : '';
      const uid     = Date.now() + '_' + Math.random().toString(36).slice(2, 10);
      cb(null, uid + safeExt);
    },
  });

  const ALLOWED_MIME = { 'image/png': true, 'image/jpeg': true, 'application/pdf': true };

  const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: function(_req, file, cb) {
      if (!ALLOWED_MIME[file.mimetype]) {
        return cb(new Error('Only PNG, JPG and PDF files are accepted'));
      }
      cb(null, true);
    },
  });

  app.post('/upload', upload.single('file'), async function(req, res) {
    const body   = req.body || {};
    const roomId = body.roomId;
    const userId = body.userId;

    if (!roomId || !userId) {
      return res.status(400).json({ error: 'roomId and userId are required' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'file field is required' });
    }

    const fileUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;

    await socketService.publishToRoom(roomId, {
      type:      'file',
      fileUrl,
      fileType:  req.file.mimetype,
      filename:  req.file.originalname,
      userId,
      username:  body.username || 'Unknown',
      roomId,
      timestamp: Date.now(),
    });

    return res.json({ ok: true, fileUrl });
  });

  app.use(function(err, _req, res, _next) {
    res.status(400).json({ error: err.message || 'Upload failed' });
  });

  app.get('/health', function(_req, res) { res.json({ status: 'ok' }); });

  socketService.io.attach(server);
  socketService.initListeners();

  server.listen(PORT, function() {
    process.stdout.write('server listening on port ' + PORT + '\n');
  });

  process.on('SIGINT', function() {
    server.close(function() { process.exit(0); });
  });
}

init().catch(function(err) {
  process.stderr.write(err.message + '\n');
  process.exit(1);
});
