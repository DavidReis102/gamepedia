import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import Home from './pages/Home';
import Admin from './pages/Admin';
import GameDetailPage from './pages/GameDetailPage'; 
import './index.css'; 

// Define as rotas
const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />, 
  },
  {
    path: '/admin', 
    element: <Admin />,
  },
  {
    path: '/jogo/:gameId', 
    element: <GameDetailPage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);