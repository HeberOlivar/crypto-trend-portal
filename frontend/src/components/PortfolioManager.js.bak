import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PortfolioSetup from './PortfolioSetup';

function PortfolioManager({ userId }) {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
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

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleViewPortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
  };

  const handleDeletePortfolio = async (portfolioId) => {
    if (window.confirm('Tem certeza que deseja excluir esta carteira?')) {
      try {
        await axios.delete(`http://15.229.222.90:8000/portfolios/${portfolioId}`);
        fetchPortfolios(); // Atualiza a lista de carteiras após a exclusão
      } catch (err) {
        console.error('Erro ao excluir carteira:', err);
        alert('Erro ao excluir carteira. Tente novamente.');
      }
    }
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
                  <button className="view-btn" onClick={() => handleViewPortfolio(portfolio)}>
                    Visualizar
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
        <div className="portfolio-details">
          <button className="cancel-btn" onClick={() => setSelectedPortfolio(null)}>
            Voltar
          </button>
          <h4>{selectedPortfolio.name}</h4>
          <ul>
            <li>Valor Total: {selectedPortfolio.total_amount.toFixed(2)} USDT</li>
            <li>Exchange: {selectedPortfolio.exchange}</li>
            <li>Criptomoedas:</li>
            <ul>
              {selectedPortfolio.assets.map(asset => (
                <li key={asset.symbol}>
                  {asset.symbol}: {asset.amount_in_usd.toFixed(2)} USDT (Alavancagem: {asset.leverage}x)
                </li>
              ))}
            </ul>
          </ul>
        </div>
      )}
    </div>
  );
}

export default PortfolioManager;