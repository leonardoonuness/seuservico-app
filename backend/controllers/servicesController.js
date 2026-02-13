const ServiceRequest = require('../models/ServiceRequest');
const Chat = require('../models/Chat');

async function create(req, res) {
  try {
    const {
      clientId,
      professionalId,
      category,
      service,
      description,
      location,
      scheduledDate,
    } = req.body;

    const serviceRequest = new ServiceRequest({
      clientId,
      professionalId,
      category,
      service,
      description,
      location,
      scheduledDate,
    });
    await serviceRequest.save();

    if (professionalId) {
      const chat = new Chat({
        participants: [clientId, professionalId],
        serviceRequestId: serviceRequest._id,
        messages: [],
      });
      await chat.save();
    }

    res.status(201).json(serviceRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function list(req, res) {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    const services = await ServiceRequest.find(query)
      .populate('clientId', 'name email phone')
      .populate('professionalId', 'userId')
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    const total = await ServiceRequest.countDocuments(query);

    res.json({
      services,
      total,
      page: pageNumber,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { create, list };
