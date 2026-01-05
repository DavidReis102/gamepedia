import React from 'react';
import { Link } from 'react-router-dom';
import './GameCard.css';

// Usar 'export function' para o import com { }
export function GameCard({ jogo, estudioNome }) {
  
  if (!jogo) {
    return null;
  }

  // O 'Link' é o cartão
  // A classe "game-card" é aplicada diretamente no Link
  return (
    <Link to={`/jogo/${jogo.id}`} className="game-card">
      
      <img 
        src={jogo["capa (url)"]} 
        alt={jogo.titulo} 
        className="game-card-image"
      />
      
      <div className="game-card-info">
        <h3 className="game-card-title">{jogo.titulo} ({jogo.anoLancamento})</h3>
        <p className="game-card-studio">Estúdio: {estudioNome}</p>
      </div>

    </Link>
  );
}