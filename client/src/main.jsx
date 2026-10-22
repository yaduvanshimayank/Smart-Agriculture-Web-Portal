import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { setupFetchInterceptor } from './utils/apiClient.js';

// Setup automatic Supabase auth token propagation for all backend API calls
setupFetchInterceptor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
