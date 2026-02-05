import React from 'react';
import ReactDOM from 'react-dom/client';
import AppContent from './App';
import { AppProvider } from './contexts/AppContext';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppProvider>
      <AppContent />
    </AppProvider>
  </React.StrictMode>
);