const http = require('http');
const path = require('path');
const express = require('./backend/node_modules/express');
const httpProxy = require('./frontend/node_modules/http-proxy');

const frontendPort = Number(process.env.GUAMEGI_FRONTEND_PORT || 8080);
const backendUrl = process.env.GUAMEGI_BACKEND_URL || 'http://localhost:3000';
const publicDir = path.join(__dirname, 'backend', 'public');
const indexFile = path.join(publicDir, 'index.html');

const app = express();
const proxy = httpProxy.createProxyServer({
  target: backendUrl,
  changeOrigin: true,
  ws: true,
});

proxy.on('error', (error, request, response) => {
  console.error('[프록시 오류]', error.message);
  if (response && !response.headersSent) {
    response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('백엔드 서버에 연결할 수 없습니다.');
  }
});

app.use((request, response, next) => {
  if (request.url.startsWith('/api') || request.url.startsWith('/socket.io')) {
    proxy.web(request, response);
    return;
  }
  next();
});
app.use(express.static(publicDir));
app.get('*', (request, response) => response.sendFile(indexFile));

const server = http.createServer(app);

server.on('upgrade', (request, socket, head) => {
  if (request.url.startsWith('/socket.io')) {
    proxy.ws(request, socket, head);
    return;
  }
  socket.destroy();
});

server.listen(frontendPort, () => {
  console.log(`Guamegi frontend: http://localhost:${frontendPort}`);
  console.log(`API/WebSocket proxy: ${backendUrl}`);
});