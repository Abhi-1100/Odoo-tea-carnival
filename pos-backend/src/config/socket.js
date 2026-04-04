const { Server } = require('socket.io');

let io;

/**
 * Initialize Socket.io with the HTTP server
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Kitchen namespace — real-time ticket updates
  const kitchenNs = io.of('/kitchen');
  kitchenNs.on('connection', (socket) => {
    console.log(`🍳 Kitchen display connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`🍳 Kitchen display disconnected: ${socket.id}`);
    });
  });

  // Customer namespace — order and payment status
  const customerNs = io.of('/customer');
  customerNs.on('connection', (socket) => {
    console.log(`👤 Customer display connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`👤 Customer display disconnected: ${socket.id}`);
    });
  });

  // POS namespace — terminal sync
  const posNs = io.of('/pos');
  posNs.on('connection', (socket) => {
    console.log(`💻 POS terminal connected: ${socket.id}`);
    socket.on('disconnect', () => {
      console.log(`💻 POS terminal disconnected: ${socket.id}`);
    });
  });

  console.log('🔌 Socket.io initialized with /kitchen, /customer, /pos namespaces');
  return io;
}

/**
 * Get the Socket.io instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return io;
}

module.exports = { initSocket, getIO };
