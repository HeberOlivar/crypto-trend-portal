import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PortfolioList = ({ userId, portfolios, setShowPortfolioForm, onEdit }) => {
  const [cryptos, setCryptos] = useState([]);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await axios.get('http://15.229.222.90:8000/cryptos', {
          params: { timeframe: 'daily' },
        });
        setCryptos(response.data);
      } catch (err) {
        console.error('Erro ao carregar criptomoedas:', err);
      }
    };
    fetchCryptos();
  }, []);

  const handleDelete = async (portfolioId) => {
    try {
      await axios.delete(`http://15.229.222.90:8000/portfolios/${portfolioId}`);
      const response = await axios.get(`http://15.229.222.90:8000/portfolios/${userId}`);
      setPortfolios(response.data);
    } catch (err) {
      console.error('Erro ao excluir portfólio:', err);
    }
  };

  const getCryptoName = (code) => {
    const crypto = cryptos.find((c) => c.code === code);
    return crypto ? `${crypto.name} (${crypto.code})` : code;
  };

  const getPortfolioTypeLabel = (type) => {
    switch (type) {
      case 'daily':
        return 'Diário';
      case 'intraday':
        return 'Intraday (60 min)';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="portfolio-list">
      <h2>Meus Portfólios</h2>
      <button
        className="create-portfolio-btn"
        onClick={() => setShowPortfolioForm(true)}
      >
        Criar Nova Carteira
      </button>
      {portfolios.length === 0 ? (
        <p>Nenhum portfólio encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Alavancagem</th>
              <th>Criptomoedas</th>
              <th>Capital Necessário</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((portfolio) => (
              <tr key={portfolio.id}>
                <td>{portfolio.name}</td>
                <td>{getPortfolioTypeLabel(portfolio.portfolioType)}</td>
                <td>{portfolio.assets[0]?.leverage || 1}x</td>
                <td>
                  {portfolio.assets.map((asset) => getCryptoName(asset.symbol)).join(', ')}
                </td>
                <td>${portfolio.total_amount}</td>
                <td>
                  <button className="edit-btn" onClick={() => onEdit(portfolio)}>
                    Editar
                  </button>
                  <button onClick={() => handleDelete(portfolio.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PortfolioList;