const mongoose = require('mongoose');

const AvailabilityDaySchema = new mongoose.Schema({
  available: { type: Boolean, default: false },
  hours: [{ type: String }]
}, { _id: false });

const ProfessionalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  categories: [{ type: String }],
  services: [{ type: String }],
  bio: String,
  experience: String,
  portfolio: [{ type: String }],
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  hourlyRate: Number,
  availability: {
    monday: AvailabilityDaySchema,
    tuesday: AvailabilityDaySchema,
    wednesday: AvailabilityDaySchema,
    thursday: AvailabilityDaySchema,
    friday: AvailabilityDaySchema,
    saturday: AvailabilityDaySchema,
    sunday: AvailabilityDaySchema,
  },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProfessionalSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Professional', ProfessionalSchema);
