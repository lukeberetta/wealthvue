import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from './App.tsx';
import './index.css';
import './lib/firebase';
import { initPaddle } from './services/paddleService';

// Initialise Paddle once on app load (non-blocking)
initPaddle().catch((err) => console.warn("Paddle init failed:", err));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

