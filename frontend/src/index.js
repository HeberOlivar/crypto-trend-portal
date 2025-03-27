import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Amplify } from 'aws-amplify';

console.log('Amplify importado:', Amplify);

try {
  const config = {
    Auth: {
      region: 'sa-east-1',
      userPoolId: 'sa-east-1_I0mixR7qZ',
      userPoolWebClientId: '2b5qd6ot970b84nd8249kbocdc',
      mandatorySignIn: false,
      authenticationFlowType: 'USER_SRP_AUTH', // Usar USER_SRP_AUTH
    },
  };
  console.log('Configuração do Amplify:', config);
  Amplify.configure(config);
  console.log('Amplify configurado com sucesso');
} catch (error) {
  console.error('Erro ao configurar o Amplify:', error);
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);