import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Signup from './components/Signup';
import PortfolioForm from './components/PortfolioForm';
import PortfolioList from './components/PortfolioList';
import './styles.css';

const App = () => {
  const [userId, setUserId] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);

  useEffect(() => {
    const fetchPortfolios = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://15.229.222.90:8000/portfolios/${userId}`);
          setPortfolios(response.data);
          const shouldShowForm = response.data.length === 0;
          console.log('Portfólios:', response.data, 'Mostrar formulário:', shouldShowForm);
          setShowPortfolioForm(shouldShowForm);
        } catch (err) {
          console.error('Erro ao carregar portfólios:', err);
        }
      }
    };
    fetchPortfolios();
  }, [userId]);

  const handleLogout = () => {
    setUserId(null);
    setPortfolios([]);
    setShowPortfolioForm(false);
    setUserInfo(null);
    setEditingPortfolio(null);
  };

  const handlePortfolioCreated = () => {
    const fetchPortfolios = async () => {
      try {
        const response = await axios.get(`http://15.229.222.90:8000/portfolios/${userId}`);
        setPortfolios(response.data);
        setShowPortfolioForm(false);
        setEditingPortfolio(null);
      } catch (err) {
        console.error('Erro ao carregar portfólios:', err);
      }
    };
    fetchPortfolios();
  };

  const handleEdit = (portfolio) => {
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  return (
    <Router>
      <header className="header">
        <div className="logo">CryptoTrend</div>
        <nav className="nav">
          <Link to="/">Home</Link>
          <Link to="/portfolios">Portfólios</Link>
          {userId ? (
            <button onClick={handleLogout}>Sair</button>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
        </nav>
      </header>

      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login setUserId={setUserId} setUserInfo={setUserInfo} />} />
          <Route path="/signup" element={<Signup setUserId={setUserId} setUserInfo={setUserInfo} />} />
          <Route
            path="/portfolios"
            element={
              userId ? (
                <>
                  {showPortfolioForm ? (
                    <PortfolioForm
                      userId={userId}
                      onPortfolioCreated={handlePortfolioCreated}
                      isFirstPortfolio={portfolios.length === 0}
                      userInfo={userInfo}
                      editingPortfolio={editingPortfolio}
                    />
                  ) : (
                    portfolios.length > 0 && (
                      <PortfolioList
                        userId={userId}
                        portfolios={portfolios}
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
          <Route path="/" element={<Navigate to={userId ? "/portfolios" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;