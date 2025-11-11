import React from 'react';
import { Link } from 'react-router-dom'; // <-- 1. Importar o Link
import './GameCard.css'; 

export function GameCard({ jogo, estudioNome }) {
  
  if (!jogo) {
    return null;
  }

  // --- 2. RODEAR TUDO COM UM LINK ---
  // O 'jogo.id' é o ID da linha do Sheety (ex: 2, 3, 4...)
  return (
    <Link to={`/jogo/${jogo.id}`} className="game-card-link">
      <div className="game-card">
        <img 
          src={jogo["capa (url)"]} 
          alt={jogo.titulo} 
          className="game-card-image"
        />
        <div className="game-card-info">
          <h3 className="game-card-title">{jogo.titulo} ({jogo.anoLancamento})</h3>
          <p className="game-card-studio">Estúdio: {estudioNome}</p>
        </div>
      </div>
    </Link>
  );
}