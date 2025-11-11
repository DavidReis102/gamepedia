import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import './GameDetailPage.css'; 

// --- 1. ADICIONEI O SEU TOKEN AQUI ---
const YOUR_SHEETY_TOKEN = "Bearer MIRAKURO102"; 

function GameDetailPage() {
  const { gameId } = useParams(); 
  
  const [jogo, setJogo] = useState(null);
  const [estudioNome, setEstudioNome] = useState('');
  const [loading, setLoading] = useState(true);

  // --- NOVOS STATES PARA LIKES ---
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [hasVoted, setHasVoted] = useState(false); 

  // URLs da API
  const API_JOGO_URL = `https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/jogos/${gameId}`;
  const API_ESTUDIOS_URL = 'https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/estudios';

  // useEffect para buscar os dados (Fetch inicial)
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setLoading(true);
        // --- 2. ADICIONEI O TOKEN AO FETCH DO JOGO ---
        const jogoResponse = await fetch(API_JOGO_URL, {
          headers: { 'Authorization': YOUR_SHEETY_TOKEN }
        });
        const jogoData = await jogoResponse.json();
        const jogoInfo = jogoData.jogo; 
        setJogo(jogoInfo);

        setLikes(jogoInfo.likes);
        setDislikes(jogoInfo.dislikes);

        // --- 3. ADICIONEI O TOKEN AO FETCH DOS ESTÚDIOS ---
        const estudiosResponse = await fetch(API_ESTUDIOS_URL, {
          headers: { 'Authorization': YOUR_SHEETY_TOKEN }
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


  // --- NOVA FUNÇÃO: HandleVote (já tem o token) ---
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
          'Authorization': YOUR_SHEETY_TOKEN 
        },
        body: JSON.stringify(updatedData)
      });
    } catch (error) {
      console.error("Erro ao enviar o voto:", error);
    }
  };


  if (loading) {
    return <div className="detail-loading">A carregar...</div>;
  }

  if (!jogo) {
    return <div className="detail-loading">Jogo não encontrado.</div>;
  }

  return (
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
  );
}

export default GameDetailPage;