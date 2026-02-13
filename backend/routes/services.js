const express = require('express');
const servicesController = require('../controllers/servicesController');

const router = express.Router();

router.post('/', servicesController.create);
router.get('/', servicesController.list);

module.exports = router;
