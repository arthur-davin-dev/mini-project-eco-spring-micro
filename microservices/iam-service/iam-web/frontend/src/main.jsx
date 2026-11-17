import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { IamProvider } from './contexts/IamContext';
import { detectBrowserAndDevice } from './utils/browserDetection';
import './index.css';
import App from './App.jsx';

detectBrowserAndDevice().catch(() => {});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <IamProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </IamProvider>
    </StrictMode>,
);
