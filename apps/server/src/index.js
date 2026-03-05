require('dotenv').config();

const http    = require('http');
const express = require('express');

async function init() {
  if (!process.env.REDIS_URL) {
    process.stderr.write('REDIS_URL is not set\n');
    process.exit(1);
  }

  const app    = express();
  const server = http.createServer(app);
  const PORT   = process.env.PORT || 8000;

  app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin',  '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.get('/health', function(_req, res) {
    res.json({ status: 'ok' });
  });

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
