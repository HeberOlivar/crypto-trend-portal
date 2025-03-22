import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PortfolioSetup({ userId, portfolio, onAddPortfolio, onCancel }) {
  const [name, setName] = useState(portfolio ? portfolio.name : '');
  const [totalAmount, setTotalAmount] = useState(portfolio ? portfolio.total_amount : '');
  const [exchange] = useState('Bybit'); // Apenas Bybit
  const [apiKey, setApiKey] = useState(portfolio ? portfolio.api_key : '');
  const [apiSecret, setApiSecret] = useState(portfolio ? portfolio.api_secret : '');
  const [cryptos, setCryptos] = useState([]);
  const [assets, setAssets] = useState(
    portfolio
      ? portfolio.assets.map(asset => ({
          symbol: asset.symbol,
          leverage: asset.leverage,
        }))
      : [{ symbol: 'GALAUSDT', leverage: 1 }]
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await axios.get('http://15.229.222.90:8000/cryptos');
        setCryptos(response.data);
      } catch (err) {
        console.error('Erro ao buscar criptomoedas:', err);
      }
    };
    fetchCryptos();
  }, []);

  const handleAddCrypto = () => {
    setAssets([...assets, { symbol: 'GALAUSDT', leverage: 1 }]);
  };

  const handleRemoveCrypto = (index) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const handleCryptoChange = (index, field, value) => {
    const newAssets = [...assets];
    newAssets[index][field] = value;
    setAssets(newAssets);
  };

  const calculateAmountPerCrypto = () => {
    if (!totalAmount || assets.length === 0) return 0;
    const totalLeverage = assets.reduce((sum, asset) => sum + asset.leverage, 0);
    return Number(totalAmount) / totalLeverage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !totalAmount || !apiKey || !apiSecret) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    const amountPerCrypto = calculateAmountPerCrypto();
    if (amountPerCrypto <= 0) {
      setError('O valor total deve ser maior que zero e as criptomoedas devem ter alavancagem válida.');
      return;
    }

    const portfolioData = {
      id: portfolio ? portfolio.id : Date.now(),
      user_id: userId,
      name,
      total_amount: Number(totalAmount),
      exchange,
      api_key: apiKey,
      api_secret: apiSecret,
      assets: assets.map(asset => ({
        symbol: asset.symbol,
        amount_in_usd: calculateAmountPerCrypto() * asset.leverage,
        leverage: Number(asset.leverage),
      })),
    };

    try {
      if (portfolio) {
        // Modo de edição: faz uma requisição PUT para atualizar a carteira
        await axios.put(`http://15.229.222.90:8000/portfolios/${portfolio.id}`, portfolioData);
      } else {
        // Modo de criação: faz uma requisição POST para criar uma nova carteira
        const response = await axios.post(`http://15.229.222.90:8000/portfolios/${userId}`, portfolioData);
        onAddPortfolio(response.data.portfolio_id);
      }
      onAddPortfolio();
    } catch (err) {
      console.error('Erro ao salvar carteira:', err);
      setError('Erro ao salvar carteira. Tente novamente.');
    }
  };

  return (
    <div className="portfolio-setup">
      <h2>{portfolio ? 'Editar Carteira' : 'Criar Nova Carteira'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4>Informações da Carteira</h4>
          <div className="form-group">
            <label>Nome da Carteira</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Carteira Principal"
            />
          </div>
          <div className="form-group">
            <label>Valor Total (USDT)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Ex.: 1000"
            />
          </div>
          <div className="form-group">
            <label>Exchange</label>
            <input type="text" value={exchange} readOnly />
          </div>
          <div className="form-group">
            <label>API Key</label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Digite sua API Key"
            />
          </div>
          <div className="form-group">
            <label>API Secret</label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Digite sua API Secret"
            />
          </div>
        </div>

        <div className="form-section">
          <h4>Criptomoedas</h4>
          {assets.map((asset, index) => (
            <div key={index} className="crypto-item">
              <div>
                <label>Ativo</label>
                <select
                  value={asset.symbol}
                  onChange={(e) => handleCryptoChange(index, 'symbol', e.target.value)}
                >
                  {cryptos.map(crypto => (
                    <option key={crypto.symbol} value={crypto.symbol}>
                      {crypto.name} ({crypto.symbol})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Alavancagem</label>
                <select
                  value={asset.leverage}
                  onChange={(e) => handleCryptoChange(index, 'leverage', e.target.value)}
                >
                  {[1, 2].map(leverage => (
                    <option key={leverage} value={leverage}>
                      {leverage}x
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Valor Calculado (USDT)</label>
                <input
                  type="text"
                  value={(calculateAmountPerCrypto() * asset.leverage).toFixed(2)}
                  readOnly
                />
              </div>
              {assets.length > 1 && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => handleRemoveCrypto(index)}
                >
                  Remover
                </button>
              )}
            </div>
          ))}
          <button type="button" className="add-btn" onClick={handleAddCrypto}>
            + Adicionar Criptomoeda
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-actions">
          <button type="submit">{portfolio ? 'Salvar Alterações' : 'Criar Carteira'}</button>
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

export default PortfolioSetup;