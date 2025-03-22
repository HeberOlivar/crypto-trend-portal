import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import PortfolioManager from './components/PortfolioManager';

function App() {
  const [userId, setUserId] = useState(null);

  const handleLogin = (id) => {
    setUserId(id);
  };

  const handleLogout = () => {
    setUserId(null);
  };

  return (
    <div className="App">
      <header>
        <h1>Crypto Trend Portal</h1>
        {userId && (
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        )}
      </header>
      <main>
        {userId ? (
          <PortfolioManager userId={userId} />
        ) : (
          <Login onLogin={handleLogin} />
        )}
      </main>
    </div>
  );
}

export default App;