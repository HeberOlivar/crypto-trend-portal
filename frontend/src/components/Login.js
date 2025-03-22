import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Tentando login com:', { username, password }); // Depuração
    try {
      const response = await axios.post('http://15.229.222.90:8000/login', {
        username,
        password,
      });
      console.log('Resposta do login:', response.data); // Depuração
      onLogin(response.data.user_id);
    } catch (err) {
      console.error('Erro no login:', err.response?.data || err.message); // Depuração
      setError(err.response?.data?.detail || 'Erro ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="login-input"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}

export default Login;