// src/components/ApiSettings.js
import React, { useState } from 'react';
import { FaKey } from 'react-icons/fa';

function ApiSettings({ credentials, updateCredentials }) {
  const [apiKey, setApiKey] = useState(credentials.apiKey || '');
  const [apiSecret, setApiSecret] = useState(credentials.apiSecret || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCredentials({ apiKey, apiSecret });
    alert('Credenciais salvas com sucesso!');
  };

  return (
    <div className="api-settings">
      <h2><FaKey /> Configurações de API</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <input
          type="password"
          placeholder="API Secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
        <button type="submit">Salvar Credenciais</button>
      </form>
    </div>
  );
}

export default ApiSettings;