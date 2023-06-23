import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './components/Home.jsx';
import './client.css';

const app = document.getElementById('app');

const root = ReactDOM.createRoot(app);

root.render(<Home />);

console.log(`Application rendered. Time: ${new Date()}`);
