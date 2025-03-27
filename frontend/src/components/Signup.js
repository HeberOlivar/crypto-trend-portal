import React, { useState } from 'react';
import { signUp } from '@aws-amplify/auth'; // Importação correta para v6.x
import { Link } from 'react-router-dom';

const Signup = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signUp({
        username: email,
        password,
        attributes: {
          email,
        },
      });
      setError(null);
      onSignUp();
    } catch (err) {
      console.error('Erro ao cadastrar:', err);
      setError('Erro ao cadastrar: ' + err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Cadastro</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
      <p>
        Já tem uma conta? <Link to="/login">Faça login</Link>
      </p>
    </div>
  );
};

export default Signup;