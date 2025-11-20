import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import './GameDetailPage.css'; 


function GameDetailPage() {
  const { gameId } = useParams(); 
  
  const [jogo, setJogo] = useState(null);
  const [estudioNome, setEstudioNome] = useState('');
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  
    // URLs da API
  const SHEETY_TOKEN = "Bearer davidpc102";
  const API_JOGO_URL = `https://api.sheety.co/03602968132db23fc2d009326a090693/gamepediaApi/jogos/${gameId}`;
  const API_ESTUDIOS_URL = `https://api.sheety.co/03602968132db23fc2d009326a090693/gamepediaApi/estudios`;

  // useEffect para buscar os dados
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        const jogoResponse = await fetch(API_JOGO_URL, {
          headers: { 'Authorization': SHEETY_TOKEN }
        });
        const jogoData = await jogoResponse.json();
        const jogoInfo = jogoData.jogo; 
        setJogo(jogoInfo);

        setLikes(jogoInfo.likes);
        setDislikes(jogoInfo.dislikes);

        const estudiosResponse = await fetch(API_ESTUDIOS_URL, {
          headers: { 'Authorization': SHEETY_TOKEN }
        });
        const estudiosData = await estudiosResponse.json();
        const estudiosList = estudiosData.estudios || [];

        const estudio = estudiosList.find(e => e.num == jogoInfo.estudiosId);
        setEstudioNome(estudio ? estudio.nome : 'Desconhecido');

        const voteStatus = localStorage.getItem(`game-${gameId}-voted`);
        if (voteStatus) {
          setHasVoted(true);
        }

      } catch (error) {
        console.error("Erro ao buscar dados do jogo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]); 


  // Função HandleVote
  const handleVote = async (type) => {
    if (hasVoted) return; 

    let newLikes = likes;
    let newDislikes = dislikes;

    if (type === 'like') {
      newLikes++;
      setLikes(newLikes);
    } else {
      newDislikes++;
      setDislikes(newDislikes);
    }

    setHasVoted(true);
    localStorage.setItem(`game-${gameId}-voted`, 'true');

    const updatedData = {
      jogo: {
        likes: newLikes,
        dislikes: newDislikes
      }
    };

    try {
      await fetch(API_JOGO_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': SHEETY_TOKEN 
        },
        body: JSON.stringify(updatedData)
      });
    } catch (error) {
      console.error("Erro ao enviar o voto:", error);
    }
  };


  if (loading) {
    return (
      <div className="game-detail-page-wrapper">
        <div className="detail-loading">A carregar...</div>
      </div>
    );
  }

  if (!jogo) {
    return (
      <div className="game-detail-page-wrapper">
         <div className="detail-loading">Jogo não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="game-detail-page-wrapper">
      
      <div className="detail-container">
        <Link to="/" className="back-button">
          &larr; Voltar à lista
        </Link>

        <div className="detail-content">
          <img 
            src={jogo["capa (url)"]} 
            alt={jogo.titulo} 
            className="detail-image"
          />
          <div className="detail-info">
            <h1>{jogo.titulo}</h1>
            <span className="detail-meta">
              {estudioNome} | {jogo.anoLancamento}
            </span>
            
            <h2>Descrição</h2>
            <p>{jogo.descricao}</p>

            {/* SECÇÃO DE LIKES */}
            <div className="like-container">
              <button 
                onClick={() => handleVote('like')} 
                disabled={hasVoted}
                className="like-button"
              >
                👍 {likes}
              </button>
              <button 
                onClick={() => handleVote('dislike')} 
                disabled={hasVoted}
                className="dislike-button"
              >
                👎 {dislikes}
              </button>
            </div>
            {hasVoted && <span className="vote-feedback">Obrigado pelo seu voto!</span>}

          </div>
        </div>
      </div>
    </div>
  );
}

export default GameDetailPage;