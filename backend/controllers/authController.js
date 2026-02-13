const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Professional = require('../models/Professional');

function generateToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
}

async function register(req, res) {
  try {
    const { name, email, password, phone, type, city } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword, phone, type, city });
    await user.save();

    if (type === 'professional') {
      const professional = new Professional({ userId: user._id });
      await professional.save();
    }

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Senha inválida' });

    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function profile(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const profileData = { user };
    if (user.type === 'professional') {
      const professional = await Professional.findOne({ userId: user._id });
      profileData.professional = professional;
    }

    res.json(profileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { register, login, profile };
