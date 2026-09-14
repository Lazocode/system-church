/**
 * ============================================================================
 * PONTO DE ENTRADA DA APLICAÇÃO (MAIN)
 * ============================================================================
 * Inicializa a árvore React no elemento DOM #root e carrega os estilos globais do Tailwind CSS.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Elemento #root não encontrado no index.html');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

