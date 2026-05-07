const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Create a new room
    socket.on('create_room', (data, callback) => {
      const roomCode = generateRoomCode();
      socket.join(roomCode);
      console.log(`Room created: ${roomCode} by ${socket.id}`);
      
      if (typeof callback === 'function') {
        callback({ roomCode, socketId: socket.id });
      }
    });

    // Join an existing room
    socket.on('join_room', (roomCode, callback) => {
      const room = io.sockets.adapter.rooms.get(roomCode);
      if (room) {
        socket.join(roomCode);
        console.log(`Socket ${socket.id} joined room ${roomCode}`);
        if (typeof callback === 'function') {
          callback({ success: true, socketId: socket.id });
        }
      } else {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room not found' });
        }
      }
    });

    // Handle game messages within a room
    socket.on('game_message', (payload) => {
      const { roomCode, message } = payload;
      
      // If we need to send to a specific target
      if (message.targetPeerId) {
        socket.to(message.targetPeerId).emit('game_message', message);
      } else {
        // Broadcast to everyone else in the room
        socket.to(roomCode).emit('game_message', message);
      }
    });

    socket.on('disconnecting', () => {
      // Notify rooms that the player is leaving
      socket.rooms.forEach(room => {
        if (room !== socket.id) {
          socket.to(room).emit('game_message', {
            type: 'leave',
            playerId: socket.id,
            playerName: '',
            playerColor: ''
          });
        }
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  server.listen(port, '0.0.0.0', () => {
    console.log(`> Ready on http://0.0.0.0:${port}`);
  });
});

// Prevent the server from crashing on common socket errors
process.on('uncaughtException', (err) => {
  if (err.code === 'ECONNRESET') {
    console.log('Handled ECONNRESET error (client disconnected abruptly)');
    return;
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
