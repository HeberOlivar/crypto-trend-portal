import React, { useState } from 'react';
import { signUp } from '@aws-amplify/auth'; // Nova importação
import { Link } from 'react-router-dom';

const Signup = ({ onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async () => {
    try {
      await signUp({
        username: email,
        password,
        attributes: { email },
      });
      setSuccess('Usuário registrado! Entre em contato com o administrador para confirmar seu cadastro.');
      setError('');
    } catch (err) {
      setError('Erro ao registrar: ' + err.message);
      setSuccess('');
    }
  };

  return (
    <div className="signup">
      <h2>Registrar</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label>Senha:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={handleSignUp}>Registrar</button>
      <p>
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </div>
  );
};

export default Signup;