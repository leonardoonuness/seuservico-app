import React, { useState } from 'react';
import axios from 'axios';
import { getErrorMessage } from '../utils/http';

const Login = ({ onLogin }) => {
  const [form, setForm] = useState({ email: 'admin@example.com', password: 'admin123' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', form);
      const { token, user } = response.data;

      if (!user || user.type !== 'admin') {
        setError('Acesso permitido apenas para administradores.');
        return;
      }

      onLogin(user._id || token);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="card login-card">
        <h1>Admin Panel</h1>
        <p className="hint">Faça login com credenciais de administrador.</p>

        {error ? <div className="error">{error}</div> : null}

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            className="control"
            name="email"
            type="email"
            placeholder="E-mail"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="control"
            name="password"
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="primary" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
