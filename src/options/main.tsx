import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { OptionsApp } from './App';
import { useDashboard } from '../newtab/store/dashboard';
import { subscribeStorage } from '../newtab/lib/chromeStorage';
import '../newtab/styles/globals.css';
import '../newtab/styles/app.css';
import './options.css';

subscribeStorage('sync', 'dashboard', () => {
  useDashboard.persist.rehydrate();
});

const el = document.getElementById('root');
if (!el) throw new Error('Missing #root');
createRoot(el).render(
  <StrictMode>
    <OptionsApp />
  </StrictMode>,
);
