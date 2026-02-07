const mongoose = require('mongoose');
require('dotenv').config();

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI não definido. Defina a variável de ambiente e tente novamente.');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  const User = require('../models/User');
  const Professional = require('../models/Professional');
  const ServiceRequest = require('../models/ServiceRequest');
  const Chat = require('../models/Chat');
  const Review = require('../models/Review');

  console.log('Limpando coleções (se existirem)...');
  await Promise.all([
    mongoose.connection.collection('users').deleteMany({}),
    mongoose.connection.collection('professionals').deleteMany({}),
    mongoose.connection.collection('servicerequests').deleteMany({}),
    mongoose.connection.collection('chats').deleteMany({}),
    mongoose.connection.collection('reviews').deleteMany({}),
  ]).catch(() => {});

  console.log('Criando usuário admin...');
  const admin = new User({ name: 'Admin', email: 'admin@example.com', password: 'admin123', phone: '11999999999', type: 'admin', city: 'HQ' });
  await admin.save();

  console.log('Criando profissionais de exemplo...');
  const profUser = new User({ name: 'João Prof', email: 'joao@example.com', password: 'password', phone: '11988888888', type: 'professional', city: 'Cidade' });
  await profUser.save();
  const prof = new Professional({ userId: profUser._id, categories: ['Manutenção & Reparos'], services: ['Eletricista'], bio: 'Profissional experiente' });
  await prof.save();

  console.log('Criando service request de exemplo...');
  const clientUser = new User({ name: 'Cliente', email: 'cliente@example.com', password: 'password', phone: '11977777777', type: 'client', city: 'Cidade' });
  await clientUser.save();
  const sr = new ServiceRequest({ clientId: clientUser._id, professionalId: profUser._id, category: 'Manutenção & Reparos', service: 'Eletricista', description: 'Trocar tomada', location: { address: 'Rua A', city: 'Cidade' } });
  await sr.save();

  console.log('Criando chat e avaliação...');
  const chat = new Chat({ participants: [clientUser._id, profUser._id], serviceRequestId: sr._id, messages: [] });
  await chat.save();

  const review = new Review({ serviceRequestId: sr._id, clientId: clientUser._id, professionalId: profUser._id, rating: 5, comment: 'Ótimo serviço' });
  await review.save();

  console.log('Seed completo. Usuários criados: admin@example.com / cliente@example.com / joao@example.com');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('Erro no seed:', err);
  process.exit(1);
});
