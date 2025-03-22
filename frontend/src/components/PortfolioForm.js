// src/components/PortfolioForm.js
import React, { useState } from 'react';

function PortfolioForm({ onAddPortfolio }) {
  const [symbol, setSymbol] = useState('');
  const [amountInUsd, setAmountInUsd] = useState('');
  const [leverage, setLeverage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const portfolio = {
      symbol: symbol.toUpperCase(),
      amount_in_usd: parseFloat(amountInUsd),
      leverage: parseInt(leverage),
    };
    onAddPortfolio(portfolio);
    setSymbol('');
    setAmountInUsd('');
    setLeverage('');
  };

  return (
    <div>
      <h2>Cadastrar Carteira</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Símbolo (ex.: BTCUSDT)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <input
          type="number"
          placeholder="Montante em USD"
          value={amountInUsd}
          onChange={(e) => setAmountInUsd(e.target.value)}
        />
        <input
          type="number"
          placeholder="Alavancagem"
          value={leverage}
          onChange={(e) => setLeverage(e.target.value)}
        />
        <button type="submit">Adicionar</button>
      </form>
    </div>
  );
}

export default PortfolioForm;