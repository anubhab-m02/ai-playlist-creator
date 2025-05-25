// src/main.jsx (for Vite) or src/index.js (for CRA)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // This App is the one that includes FirebaseProvider
import './index.css'; // Your global styles and Tailwind directives

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);