const { createServer } = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's room
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle new messages
    socket.on('send_message', (data) => {
      const { receiverId, message } = data;
      io.to(`user_${receiverId}`).emit('receive_message', message);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { receiverId, isTyping } = data;
      io.to(`user_${receiverId}`).emit('user_typing', { isTyping });
    });

    // Handle online status
    socket.on('online_status', (data) => {
      const { userId, isOnline } = data;
      io.emit('user_status_change', { userId, isOnline });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});