import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { useDashboard } from './store/dashboard';
import { subscribeStorage } from './lib/chromeStorage';
import './styles/globals.css';
import './styles/widgets.css';
import './styles/app.css';

subscribeStorage('sync', 'dashboard', () => {
  useDashboard.persist.rehydrate();
});

const el = document.getElementById('root');
if (!el) throw new Error('Missing #root');
createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
