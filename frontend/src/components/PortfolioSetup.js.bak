import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';

function PortfolioSetup({ userId, onAddPortfolio, onCancel }) {
  const [totalAmount, setTotalAmount] = useState('');
  const [portfolioName, setPortfolioName] = useState('');
  const [exchange, setExchange] = useState('Bybit');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [selectedCryptos, setSelectedCryptos] = useState([]);
  const [cryptoOptions, setCryptoOptions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCryptoOptions();
  }, []);

  const fetchCryptoOptions = async () => {
    try {
      const response = await axios.get('http://15.229.222.90:8000/cryptos');
      setCryptoOptions(response.data);
    } catch (err) {
      console.error('Erro ao buscar criptomoedas:', err);
      setError('Erro ao carregar lista de criptomoedas.');
    }
  };

  const handleAddCrypto = (symbol) => {
    const crypto = cryptoOptions.find(c => c.symbol === symbol);
    if (!selectedCryptos.some(c => c.symbol === symbol)) {
      setSelectedCryptos([...selectedCryptos, { ...crypto, leverage: 1 }]);
    }
  };

  const handleLeverageChange = (symbol, leverage) => {
    const updatedCryptos = selectedCryptos.map(c =>
      c.symbol === symbol ? { ...c, leverage: parseInt(leverage) } : c
    );
    setSelectedCryptos(updatedCryptos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    if (isNaN(total) || total <= 0) {
      setError('Insira um valor total válido maior que 0.');
      return;
    }
    if (!apiKey || !apiSecret) {
      setError('Credenciais da API são obrigatórias.');
      return;
    }
    if (selectedCryptos.length === 0) {
      setError('Selecione pelo menos uma criptomoeda.');
      return;
    }
    setError('');
    try {
      const amountPerCrypto = total / selectedCryptos.length;
      const assets = selectedCryptos.map(crypto => ({
        symbol: crypto.symbol,
        amount_in_usd: amountPerCrypto,
        leverage: crypto.leverage,
      }));
      const response = await axios.post(`http://15.229.222.90:8000/portfolios/${userId}`, {
        name: portfolioName,
        total_amount: total,
        exchange,
        api_key: apiKey,
        api_secret: apiSecret,
        assets,
      });
      onAddPortfolio(response.data.portfolio_id);
    } catch (err) {
      console.error('Erro ao criar carteira:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Erro ao criar carteira. Verifique os dados.');
    }
  };

  return (
    <div className="portfolio-setup">
      <h3>Nova Carteira</h3>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Seção: Informações da Carteira */}
        <div className="form-section">
          <h4>Informações da Carteira</h4>
          <div className="form-group">
            <label htmlFor="portfolioName">Nome da Carteira</label>
            <input
              id="portfolioName"
              type="text"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exchange">Exchange</label>
            <select id="exchange" value={exchange} onChange={(e) => setExchange(e.target.value)}>
              <option value="Bybit">Bybit</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="totalAmount">Valor total em USDT</label>
            <input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              step="0.01"
            />
          </div>
        </div>

        {/* Seção: Credenciais da API */}
        <div className="form-section">
          <h4>Credenciais da API</h4>
          <div className="form-group">
            <label htmlFor="apiKey">API Key</label>
            <input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="apiSecret">API Secret</label>
            <input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
            />
          </div>
        </div>

        {/* Seção: Criptomoedas */}
        <div className="form-section">
          <h4>Criptomoedas</h4>
          <div className="form-group">
            <label htmlFor="addCrypto">Adicionar Criptomoeda</label>
            <select id="addCrypto" onChange={(e) => handleAddCrypto(e.target.value)}>
              <option value="">Selecione uma criptomoeda</option>
              {cryptoOptions.map(crypto => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  {crypto.name} ({crypto.symbol})
                </option>
              ))}
            </select>
          </div>
          {selectedCryptos.map(crypto => (
            <div key={crypto.symbol} className="crypto-item">
              <span>{crypto.name} ({crypto.symbol})</span>
              <select
                value={crypto.leverage}
                onChange={(e) => handleLeverageChange(crypto.symbol, e.target.value)}
              >
                <option value="1">1x</option>
                <option value="2">2x</option>
              </select>
            </div>
          ))}
        </div>

        {/* Botões */}
        <div className="form-actions">
          <button type="submit">Salvar</button>
          <button type="button" onClick={onCancel} className="cancel-btn">
            <FaTimes /> Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioSetup;