const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  address: String,
  city: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
}, { _id: false });

const ServiceRequestSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: String,
  service: String,
  description: String,
  location: LocationSchema,
  scheduledDate: Date,
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  price: Number,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ServiceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServiceRequest', ServiceRequestSchema);
