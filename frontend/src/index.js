import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'sa-east-1',
    userPoolId: 'USER_POOL_ID', // Substitua pelo User Pool ID do Cognito
    userPoolWebClientId: 'APP_CLIENT_ID', // Substitua pelo App Client ID do Cognito
    mandatorySignIn: false,
  },
});

ReactDOM.render(<App />, document.getElementById('root'));