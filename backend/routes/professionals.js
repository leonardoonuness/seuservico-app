const express = require('express');
const professionalsController = require('../controllers/professionalsController');

const router = express.Router();

router.get('/', professionalsController.list);
router.get('/:id', professionalsController.details);

module.exports = router;
