const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Auth middleware for socket
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mindcare_secret_key_2024');
        socket.userId = decoded.userId;
      } catch (e) {
        // Allow unauthenticated connections for anonymous users
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join user room
    if (socket.userId) {
      socket.join(`user_${socket.userId}`);
    }

    // Typing indicator
    socket.on('typing_start', (data) => {
      socket.to(`session_${data.sessionId}`).emit('user_typing', { userId: socket.userId });
    });

    socket.on('typing_stop', (data) => {
      socket.to(`session_${data.sessionId}`).emit('user_stopped_typing', { userId: socket.userId });
    });

    // Join chat session
    socket.on('join_session', (sessionId) => {
      socket.join(`session_${sessionId}`);
    });

    // Leave session
    socket.on('leave_session', (sessionId) => {
      socket.leave(`session_${sessionId}`);
    });

    // Mood update broadcast
    socket.on('mood_update', (data) => {
      if (socket.userId) {
        io.to(`user_${socket.userId}`).emit('mood_updated', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};
