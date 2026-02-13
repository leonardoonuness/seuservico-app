const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/:userId', chatController.listByUser);
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router;
