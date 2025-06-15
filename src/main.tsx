
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx: Script loaded');
console.log('main.tsx: Looking for root element');

const rootElement = document.getElementById("root");
console.log('main.tsx: Root element found:', rootElement);

if (!rootElement) {
  console.error('main.tsx: Root element not found!');
} else {
  console.log('main.tsx: Creating React root');
  try {
    const root = createRoot(rootElement);
    console.log('main.tsx: React root created, rendering App');
    root.render(<App />);
    console.log('main.tsx: App rendered successfully');
  } catch (error) {
    console.error('main.tsx: Error rendering App:', error);
  }
}
