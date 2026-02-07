const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Professional = require('../models/Professional');
const ServiceRequest = require('../models/ServiceRequest');
const Review = require('../models/Review');

// Middleware de autenticação admin
const adminAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token não fornecido' });

    // Em produção, usar JWT
    const user = await User.findById(token);
    if (!user || user.type !== 'admin') {
      return res.status(403).json({ error: 'Acesso não autorizado' });
    }

    req.adminId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Dashboard stats
router.get('/dashboard/stats', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalProfessionals,
      totalServices,
      pendingApprovals,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments(),
      Professional.countDocuments({ isVerified: true }),
      ServiceRequest.countDocuments({ status: 'completed' }),
      Professional.countDocuments({ isVerified: false }),
      ServiceRequest.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$price' } } }
      ])
    ]);

    res.json({
      totalUsers,
      totalProfessionals,
      totalServices,
      pendingApprovals,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gerenciar profissionais
router.get('/professionals', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (status === 'pending') query.isVerified = false;
    if (status === 'verified') query.isVerified = true;

    const professionals = await Professional.find(query)
      .populate('userId', 'name email phone city createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Professional.countDocuments(query);

    res.json({
      professionals,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/professionals/:id/verify', adminAuth, async (req, res) => {
  try {
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { 
        isVerified: true,
        verifiedAt: new Date(),
        verifiedBy: req.adminId
      },
      { new: true }
    ).populate('userId');

    if (!professional) {
      return res.status(404).json({ error: 'Profissional não encontrado' });
    }

    // Em produção, enviar e-mail de confirmação aqui

    res.json(professional);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/professionals/:id/feature', adminAuth, async (req, res) => {
  try {
    const { featured } = req.body;
    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      { isFeatured: featured },
      { new: true }
    );

    res.json(professional);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gerenciar usuários
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (type) query.type = type;

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/users/:id/block', adminAuth, async (req, res) => {
  try {
    const { blocked, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        isBlocked: blocked,
        blockReason: reason,
        blockedAt: blocked ? new Date() : null,
        blockedBy: blocked ? req.adminId : null
      },
      { new: true }
    );

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gerenciar serviços
router.get('/services', adminAuth, async (req, res) => {
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

    res.json({
      services,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Moderação de avaliações
router.get('/reviews', adminAuth, async (req, res) => {
  try {
    const { reported, page = 1, limit = 20 } = req.query;
    let query = {};
    
    if (reported === 'true') query.isReported = true;

    const reviews = await Review.find(query)
      .populate('clientId', 'name')
      .populate('professionalId', 'userId')
      .populate('serviceRequestId', 'service')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    res.json({
      reviews,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/reviews/:id/moderate', adminAuth, async (req, res) => {
  try {
    const { action, reason } = req.body;
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ error: 'Avaliação não encontrada' });
    }

    if (action === 'remove') {
      review.isRemoved = true;
      review.removalReason = reason;
      review.removedAt = new Date();
      review.removedBy = req.adminId;
    } else if (action === 'restore') {
      review.isRemoved = false;
      review.removalReason = null;
      review.removedAt = null;
      review.removedBy = null;
    }

    await review.save();

    // Atualizar rating do profissional
    if (action === 'remove' || action === 'restore') {
      await updateProfessionalRating(review.professionalId);
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Relatórios
router.get('/reports/metrics', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter = {};
    
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Métricas por categoria
    const categoryMetrics = await ServiceRequest.aggregate([
      { $match: dateFilter },
      { $group: { 
        _id: '$category',
        totalServices: { $sum: 1 },
        totalRevenue: { $sum: '$price' },
        avgRating: { $avg: '$rating' }
      }},
      { $sort: { totalServices: -1 } }
    ]);

    // Crescimento mensal
    const growthMetrics = await ServiceRequest.aggregate([
      { 
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalServices: { $sum: 1 },
          totalUsers: { $addToSet: '$clientId' }
        }
      },
      { 
        $project: {
          month: '$_id.month',
          year: '$_id.year',
          totalServices: 1,
          totalUsers: { $size: '$totalUsers' }
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Profissionais com melhor avaliação
    const topProfessionals = await Review.aggregate([
      {
        $group: {
          _id: '$professionalId',
          avgRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 }
        }
      },
      { $match: { totalReviews: { $gte: 5 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 10 }
    ]);

    // Popular nomes dos profissionais
    for (let professional of topProfessionals) {
      const user = await User.findById(professional._id);
      if (user) {
        professional.name = user.name;
        professional.email = user.email;
      }
    }

    res.json({
      categoryMetrics,
      growthMetrics,
      topProfessionals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Função auxiliar para atualizar rating do profissional
async function updateProfessionalRating(professionalId) {
  const reviews = await Review.find({ 
    professionalId, 
    isRemoved: false 
  });
  
  const totalRatings = reviews.length;
  const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings;
  
  await Professional.findOneAndUpdate(
    { userId: professionalId },
    { 
      rating: parseFloat(avgRating.toFixed(1)),
      totalRatings 
    }
  );
}

module.exports = router;