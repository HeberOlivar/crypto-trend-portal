import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { getCurrentUser, fetchAuthSession, signOut } from '@aws-amplify/auth';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import PortfolioForm from './components/PortfolioForm';
import PortfolioList from './components/PortfolioList';
import './styles.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [error, setError] = useState(null); // Novo estado para erros

  const fetchPortfolios = useCallback(async () => {
    if (user) {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        const response = await axios.get(`http://15.229.222.90:8000/portfolios/${user.userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPortfolios(response.data);
        const shouldShowForm = response.data.length === 0;
        setShowPortfolioForm(shouldShowForm);
      } catch (err) {
        console.error('Erro ao carregar portfólios:', err);
      }
    }
  }, [user]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPortfolios();
    }
  }, [user, fetchPortfolios]);

  const checkUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      setUser({ ...currentUser, attributes: session.tokens?.idToken?.payload });
      setUserInfo(session.tokens?.idToken?.payload);
      setError(null); // Limpa o erro se a autenticação for bem-sucedida
    } catch (err) {
      console.error('Erro ao verificar usuário:', err);
      setUser(null);
      setUserInfo(null);
      setError('Falha ao inicializar a autenticação. Verifique a configuração do Cognito.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setPortfolios([]);
      setShowPortfolioForm(false);
      setUserInfo(null);
      setEditingPortfolio(null);
      setError(null);
    } catch (err) {
      console.error('Erro ao sair:', err);
      setError('Erro ao fazer logout: ' + err.message);
    }
  };

  const handlePortfolioCreated = () => {
    fetchPortfolios();
  };

  const handleEdit = (portfolio) => {
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Erro</h2>
        <p>{error}</p>
        <button onClick={checkUser}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <Router>
      <header className="header">
        <div className="logo">CryptoTrend</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/portfolios">Portfólios</Link>
          {user ? (
            <button onClick={handleSignOut}>Sair</button>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </header>

      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login onSignIn={checkUser} />} />
          <Route path="/signup" element={<Signup onSignUp={checkUser} />} />
          <Route
            path="/portfolios"
            element={
              user ? (
                <>
                  {showPortfolioForm ? (
                    <PortfolioForm
                      userId={user.userId}
                      onPortfolioCreated={handlePortfolioCreated}
                      isFirstPortfolio={portfolios.length === 0}
                      userInfo={userInfo}
                      editingPortfolio={editingPortfolio}
                    />
                  ) : (
                    portfolios.length > 0 && (
                      <PortfolioList
                        userId={user.userId}
                        portfolios={portfolios}
                        setPortfolios={setPortfolios}
                        setShowPortfolioForm={setShowPortfolioForm}
                        onEdit={handleEdit}
                      />
                    )
                  )}
                </>
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="/" element={<Navigate to={user ? "/portfolios" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;