const Professional = require('../models/Professional');
const Review = require('../models/Review');

async function list(req, res) {
  try {
    const { category, service, city } = req.query;
    const query = { isVerified: true };
    if (category) query.categories = category;
    if (service) query.services = service;

    const professionals = await Professional.find(query)
      .populate('userId', 'name profileImage city')
      .limit(20);

    const filtered = professionals.filter((prof) => (
      !city || prof.userId.city?.toLowerCase().includes(city.toLowerCase())
    ));

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function details(req, res) {
  try {
    const professional = await Professional.findById(req.params.id)
      .populate('userId', 'name profileImage phone email city');

    if (!professional) return res.status(404).json({ error: 'Profissional não encontrado' });

    const reviews = await Review.find({ professionalId: professional.userId._id })
      .populate('clientId', 'name')
      .sort({ createdAt: -1 });

    res.json({ professional, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { list, details };
