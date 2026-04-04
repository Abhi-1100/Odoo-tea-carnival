require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/config/socket');

const PORT = process.env.PORT || 5050;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════╗
  ║       🍵 POS Cafe Server Running          ║
  ║                                            ║
  ║   🌐 API:    http://localhost:${PORT}         ║
  ║   🔌 WS:     ws://localhost:${PORT}           ║
  ║   📝 Health:  /api/health                  ║
  ╚════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
