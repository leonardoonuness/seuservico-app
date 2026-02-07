const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');

router.get('/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.params.userId })
      .populate('participants', 'name profileImage')
      .populate('serviceRequestId', 'service status')
      .sort({ 'messages.timestamp': -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:chatId/messages', async (req, res) => {
  try {
    const { senderId, content } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ error: 'Chat não encontrado' });

    chat.messages.push({ senderId, content });
    await chat.save();

    res.json(chat.messages[chat.messages.length - 1]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
