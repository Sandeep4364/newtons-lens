import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ConfigurationWarning } from './components/ConfigurationWarning';
import { isSupabaseConfigured } from './lib/supabase';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {isSupabaseConfigured ? <App /> : <ConfigurationWarning />}
    </ErrorBoundary>
  </StrictMode>
);
