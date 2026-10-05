import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyAppIcon, readAppIcon } from './hooks/useAppIcon';
import './index.css';

// Point favicon / home-screen icon / manifest at the chosen icon before anything renders.
applyAppIcon(readAppIcon());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
