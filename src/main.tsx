import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import './index.css';

// Register the PWA service worker on every app launch so an installed PWA
// can detect and activate a newly deployed version without being reinstalled.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      await registration.update();

      // The new worker uses skipWaiting() and takes control immediately.
      // Reload once so the current tab uses the freshly deployed Vite bundle.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      }, { once: true });
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);