const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('join_chat', (chatId) => socket.join(`chat_${chatId}`));
    socket.on('leave_chat', (chatId) => socket.leave(`chat_${chatId}`));

    socket.on('send_message', async (data) => {
      const { chatId, senderId, content } = data;
      try {
        const Chat = require('./models/Chat');
        const chat = await Chat.findById(chatId);
        if (!chat) return;

        const message = { senderId, content, timestamp: new Date(), read: false };
        chat.messages.push(message);
        await chat.save();

        io.to(`chat_${chatId}`).emit('new_message', {
          ...message,
          chatId,
          _id: chat.messages[chat.messages.length - 1]._id
        });

        chat.participants.forEach(participantId => {
          if (participantId.toString() !== senderId) {
            io.to(`user_${participantId}`).emit('notification', {
              type: 'new_message',
              chatId,
              senderId,
              content: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
              timestamp: new Date()
            });
          }
        });
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        socket.emit('error', { message: 'Erro ao enviar mensagem' });
      }
    });

    socket.on('service_update', (data) => {
      const { serviceId, userId, status } = data;
      io.to(`user_${userId}`).emit('service_notification', { type: 'status_update', serviceId, status, timestamp: new Date() });
    });

    socket.on('mark_as_read', async (data) => {
      const { chatId, messageId } = data;
      try {
        const Chat = require('./models/Chat');
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        const message = chat.messages.id(messageId);
        if (message && !message.read) {
          message.read = true;
          message.readAt = new Date();
          await chat.save();
          io.to(`user_${message.senderId}`).emit('message_read', { chatId, messageId, readAt: message.readAt });
        }
      } catch (error) {
        console.error('Erro ao marcar mensagem como lida:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.IO não inicializado');
  return io;
};

module.exports = { initializeSocket, getIO };
