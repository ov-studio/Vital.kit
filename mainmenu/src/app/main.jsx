import * as react from 'react-dom/client';
import * as app_mainmenu from './mainmenu.jsx';
import './index.css';

// Globally disable Tab-driven focus traversal (mirrors console behaviour).
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') e.preventDefault();
}, true);

const root = react.createRoot(document.getElementById('root'));
root.render(<app_mainmenu.MainMenu />);