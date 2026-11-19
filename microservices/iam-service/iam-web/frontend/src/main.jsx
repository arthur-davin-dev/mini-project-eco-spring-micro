import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/providers';
import { detectBrowserAndDevice } from './utils/browserDetection';
import './styles/index.css';
import App from './App.jsx';

detectBrowserAndDevice().catch(() => {});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppProviders>
            <App />
        </AppProviders>
    </StrictMode>,
);
