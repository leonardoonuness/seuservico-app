const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const Chat = require('../models/Chat');

router.post('/', async (req, res) => {
  try {
    const { clientId, professionalId, category, service, description, location, scheduledDate } = req.body;
    const serviceRequest = new ServiceRequest({ clientId, professionalId, category, service, description, location, scheduledDate });
    await serviceRequest.save();

    const chat = new Chat({ participants: [clientId, professionalId], serviceRequestId: serviceRequest._id, messages: [] });
    await chat.save();

    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.status = status;

    const services = await ServiceRequest.find(query)
      .populate('clientId', 'name email phone')
      .populate('professionalId', 'userId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ServiceRequest.countDocuments(query);

    res.json({ services, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
