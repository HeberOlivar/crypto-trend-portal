import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Signup = ({ setUserId, setUserInfo }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Cria o novo usuário
      const signupResponse = await axios.post('http://15.229.222.90:8000/signup', formData);
      const { username, password, user_id } = signupResponse.data;

      // Faz o login automaticamente
      const loginResponse = await axios.post('http://15.229.222.90:8000/login', {
        username,
        password,
      });

      // Define o userId e as informações do usuário
      setUserId(loginResponse.data.user_id);
      setUserInfo({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setCredentials({ username, password });
      setError(null);

      // Redireciona para a página de portfólios
      navigate('/portfolios');
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao criar conta.');
      setCredentials(null);
    }
  };

  return (
    <div className="signup">
      <h2>Criar Conta</h2>
      {error && <div className="error">{error}</div>}
      {credentials ? (
        <div>
          <p>Conta criada com sucesso!</p>
          <p>Seu username: <strong>{credentials.username}</strong></p>
          <p>Sua senha: <strong>{credentials.password}</strong></p>
          <p>Você foi logado automaticamente e redirecionado para a criação de portfólios.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Nome:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Telefone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit">Criar Conta</button>
        </form>
      )}
    </div>
  );
};

export default Signup;