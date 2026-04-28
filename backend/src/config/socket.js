const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;

const initSocket = (httpServer) => {
  const ioInstance = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  ioInstance.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('name phone');
      if (!user) return next(new Error('User not found'));
      socket.userId = decoded.userId;
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    // Auto-join user's own room
    socket.join("sos_" + socket.userId);
    console.log(`User ${socket.user.name} connected and joined sos_${socket.userId}`);
    
    // Guardians joining to watch a user's SOS
    socket.on('watchSOS', (watchUserId) => {
      socket.join("sos_" + watchUserId);
    });

    socket.on('disconnect', () => {
      console.log(`User ${socket.user?.name || socket.id} disconnected`);
    });
  });

  io = ioInstance;
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket not initialized');
  }
  return io;
};

module.exports = initSocket;
module.exports.getIO = getIO;
