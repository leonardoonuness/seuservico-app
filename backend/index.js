
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Modelos (carregados dos arquivos em /models)
const User = require('./models/User');
const Professional = require('./models/Professional');
const ServiceRequest = require('./models/ServiceRequest');
const Review = require('./models/Review');
const Chat = require('./models/Chat');

// Categorias e Serviços
const categories = {
  'Manutenção & Reparos': [
    'Eletricista', 'Encanador', 'Pedreiro', 'Pintor', 'Marceneiro',
    'Serralheiro', 'Técnico de ar-condicionado', 'Técnico de geladeira',
    'Técnico de máquina de lavar', 'Chaveiro'
  ],
  'Tecnologia': [
    'Técnico de celular', 'Técnico de computador', 'Montador de PC',
    'Instalador de internet', 'Designer gráfico', 'Desenvolvedor web'
  ],
  'Casa & Limpeza': [
    'Diarista', 'Passadeira', 'Faxineiro pós-obra', 'Jardineiro', 'Dedetização'
  ],
  'Educação & Aulas': [
    'Professor de inglês', 'Professor de matemática', 'Reforço escolar',
    'Aulas de violão', 'Aulas de informática'
  ],
  'Beleza & Estética': [
    'Barbeiro', 'Cabeleireiro', 'Manicure', 'Maquiador', 'Designer de sobrancelha'
  ],
  'Automotivo': [
    'Mecânico', 'Lava jato', 'Martelinho de ouro', 'Auto elétrica', 'Guincho'
  ],
  'Eventos & Criativos': [
    'Fotógrafo', 'Videomaker', 'DJ', 'Decorador', 'Cerimonialista'
  ],
  'Saúde & Bem-Estar': [
    'Personal trainer', 'Massagista', 'Nutricionista'
  ]
};

// Montar rotas modulares
const authRoutes = require('./routes/auth');
const professionalsRoutes = require('./routes/professionals');
const servicesRoutes = require('./routes/services');
const chatRoutes = require('./routes/chat');

app.use('/api/auth', authRoutes);
app.use('/api/professionals', professionalsRoutes);
app.use('/api/service-requests', servicesRoutes);
app.use('/api/chats', chatRoutes);

// Rotas de Categorias (mantidas aqui)
app.get('/api/categories', (req, res) => {
  res.json(categories);
});

// Middleware de Autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Rotas Protegidas
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    let profile = { user };
    
    if (user.type === 'professional') {
      const professional = await Professional.findOne({ userId: user._id });
      profile.professional = professional;
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Servir uploads estáticos
app.use('/uploads', express.static('uploads'));

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Inicializar servidor HTTP e Socket.IO em startServer
const http = require('http');
const { initializeSocket } = require('./socket');

async function startServer({ port = process.env.PORT || 5000 } = {}) {
  // Conectar ao MongoDB
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seuservico', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const server = http.createServer(app);
  const io = initializeSocket(server);

  return new Promise((resolve, reject) => {
    server.listen(port, (err) => {
      if (err) return reject(err);
      console.log(`Servidor rodando na porta ${port}`);
      resolve({ server, io });
    });
  });
}

if (require.main === module) {
  startServer().catch(err => {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  });
}

module.exports = { app, startServer };