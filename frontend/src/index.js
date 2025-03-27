import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    region: 'sa-east-1',
    userPoolId: 'sa-east-1_WDdjlqLSj', // Substitua pelo novo User Pool ID
    userPoolWebClientId: 'f4868vlo487ccudgo70ce18v4', // Substitua pelo novo App Client ID
    mandatorySignIn: false,
  },
});

ReactDOM.render(<App />, document.getElementById('root'));