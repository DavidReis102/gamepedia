import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import App from './App'; // O seu layout principal
import Home from './pages/Home';
import Admin from './pages/Admin';

// Define as rotas
const router = createBrowserRouter([
  {
    path: '/',        // Rota principal
    element: <Home />, // Carrega o componente Home (Frontoffice)
  },
  {
    path: '/admin',   // Rota do backoffice
    element: <Admin />,  // Carrega o componente Admin (Backoffice)
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);