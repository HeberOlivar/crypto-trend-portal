import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioSetup from './PortfolioSetup';

function PortfolioManager({ userId }) {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null); // Para edição
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, [userId]);

  const fetchPortfolios = async () => {
    try {
      const response = await axios.get(`http://15.229.222.90:8000/portfolios/${userId}`);
      setPortfolios(response.data);
    } catch (err) {
      console.error('Erro ao buscar carteiras:', err);
    }
  };

  const handleAddPortfolio = (portfolioId) => {
    setIsAdding(false);
    fetchPortfolios();
  };

  const handleEditPortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setIsAdding(false);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setSelectedPortfolio(null);
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm('Tem certeza que deseja excluir esta carteira?')) {
      try {
        await axios.delete(`http://15.229.222.90:8000/portfolios/${portfolioId}`);
        fetchPortfolios();
      } catch (err) {
        console.error('Erro ao excluir carteira:', err);
        alert('Erro ao excluir carteira. Tente novamente.');
      }
    }
  };

  const handleUpdatePortfolio = () => {
    setSelectedPortfolio(null);
    fetchPortfolios();
  };

  return (
    <div className="portfolio-manager">
      <h2>Gerenciar Carteiras</h2>
      {!isAdding && !selectedPortfolio && (
        <>
          <button className="add-btn" onClick={() => setIsAdding(true)}>
            + Adicionar Carteira
          </button>
          <div className="portfolio-list">
            {portfolios.map(portfolio => (
              <div key={portfolio.id} className="portfolio-item">
                <span>{portfolio.name}</span>
                <div>
                  <button className="view-btn" onClick={() => handleEditPortfolio(portfolio)}>
                    Editar
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeletePortfolio(portfolio.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {isAdding && (
        <PortfolioSetup
          userId={userId}
          onAddPortfolio={handleAddPortfolio}
          onCancel={handleCancelAdd}
        />
      )}
      {selectedPortfolio && (
        <PortfolioSetup
          userId={userId}
          portfolio={selectedPortfolio}
          onAddPortfolio={handleUpdatePortfolio}
          onCancel={handleCancelAdd}
        />
      )}
    </div>
  );
}

export default PortfolioManager;