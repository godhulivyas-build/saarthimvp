import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppStateProvider } from './state/AppState';
import { V2SessionProvider } from './state/v2Session';
import { VoiceAssistantProvider } from './voice/VoiceAssistantProvider';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <V2SessionProvider>
          <VoiceAssistantProvider>
            <App />
          </VoiceAssistantProvider>
        </V2SessionProvider>
      </AppStateProvider>
    </BrowserRouter>
  </React.StrictMode>
);
