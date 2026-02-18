const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
require('dotenv').config();

const { initializeSocket } = require('./socket');
const authMiddleware = require('./middleware/auth');
const User = require('./models/User');
const Professional = require('./models/Professional');
const { initializeFirebaseAdmin } = require('./firebaseAdmin');

const app = express();

app.use(cors());
app.use(express.json());

const categories = {
  'Manutenção & Reparos': [
    'Eletricista', 'Encanador', 'Pedreiro', 'Pintor', 'Marceneiro',
    'Serralheiro', 'Técnico de ar-condicionado', 'Técnico de geladeira',
    'Técnico de máquina de lavar', 'Chaveiro',
  ],
  Tecnologia: [
    'Técnico de celular', 'Técnico de computador', 'Montador de PC',
    'Instalador de internet', 'Designer gráfico', 'Desenvolvedor web',
  ],
  'Casa & Limpeza': [
    'Diarista', 'Passadeira', 'Faxineiro pós-obra', 'Jardineiro', 'Dedetização',
  ],
  'Educação & Aulas': [
    'Professor de inglês', 'Professor de matemática', 'Reforço escolar',
    'Aulas de violão', 'Aulas de informática',
  ],
  'Beleza & Estética': [
    'Barbeiro', 'Cabeleireiro', 'Manicure', 'Maquiador', 'Designer de sobrancelha',
  ],
  Automotivo: [
    'Mecânico', 'Lava jato', 'Martelinho de ouro', 'Auto elétrica', 'Guincho',
  ],
  'Eventos & Criativos': [
    'Fotógrafo', 'Videomaker', 'DJ', 'Decorador', 'Cerimonialista',
  ],
  'Saúde & Bem-Estar': ['Personal trainer', 'Massagista', 'Nutricionista'],
};

app.use('/api/auth', require('./routes/auth'));
app.use('/api/professionals', require('./routes/professionals'));
app.use('/api/service-requests', require('./routes/services'));
app.use('/api/chats', require('./routes/chat'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const profile = { user };
    if (user.type === 'professional') {
      profile.professional = await Professional.findOne({ userId: user._id });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/uploads', express.static('uploads'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

async function startServer({ port = process.env.PORT || 5000 } = {}) {
  initializeFirebaseAdmin({ strict: process.env.NODE_ENV === 'production' });
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seuservico');

  const server = http.createServer(app);
  const io = initializeSocket(server);

  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) return reject(err);
      console.log(`Servidor rodando na porta ${server.address().port}`);
      resolve({ server, io });
    });
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };
