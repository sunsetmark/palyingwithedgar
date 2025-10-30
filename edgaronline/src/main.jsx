import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import USWDS precompiled CSS
import '@uswds/uswds/css/uswds.min.css';

// Import USWDS JavaScript for interactive components
import '@uswds/uswds';

// Import SEC theme customizations
import './assets/styles/sec-theme.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

