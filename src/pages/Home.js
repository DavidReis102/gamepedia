import React, { useState, useEffect, useMemo } from 'react';
import { GameCard } from '../components/GameCard';
import './Home.css';

// --- 1. ADICIONEI O SEU TOKEN AQUI ---
const YOUR_SHEETY_TOKEN = "Bearer MIRAKURO102"; 

function Home() {

  const [jogos, setJogos] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jogosPorPagina] = useState(8);
  const [sortMethod, setSortMethod] = useState("default");

  const API_JOGOS_URL = 'https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/jogos';
  const API_ESTUDIOS_URL = 'https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/estudios';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // --- 2. ADICIONEI OS HEADERS DE AUTENTICAÇÃO ---
        const [jogosResponse, estudiosResponse] = await Promise.all([
          fetch(API_JOGOS_URL, { 
            headers: { 'Authorization': YOUR_SHEETY_TOKEN } 
          }),
          fetch(API_ESTUDIOS_URL, { 
            headers: { 'Authorization': YOUR_SHEETY_TOKEN } 
          })
        ]);
        
        const jogosData = await jogosResponse.json();
        const estudiosData = await estudiosResponse.json();
        
        setJogos(jogosData.jogos || []);
        setEstudios(estudiosData.estudios || []);

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Dependência vazia está correta

  // getEstudioName
  const getEstudioName = (estudiosId) => {
    const estudio = estudios.find(e => e.num == estudiosId);
    return estudio ? estudio.nome : 'Desconhecido';
  };

  // Lógica de Filtro
  const filteredJogos = useMemo(() => {
    return jogos.filter((jogo) => {
      const search = searchTerm.toLowerCase();
      if (search === "") {
        return true;
      }
      const tituloMatch = jogo.titulo.toLowerCase().includes(search);
      const estudio = estudios.find(e => e.num == jogo.estudiosId);
      const estudioNome = estudio ? estudio.nome : '';
      const estudioMatch = estudioNome.toLowerCase().includes(search);
      return tituloMatch || estudioMatch;
    });
  }, [jogos, estudios, searchTerm]); 

  // Lógica de Ordenação
  const sortedJogos = useMemo(() => {
    const sortableJogos = [...filteredJogos]; 
    if (sortMethod === 'title') {
      sortableJogos.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (sortMethod === 'date') {
      sortableJogos.sort((a, b) => b.anoLancamento - a.anoLancamento);
    }
    return sortableJogos;
  }, [filteredJogos, sortMethod]);

  // Loading
  if (loading) {
    return <div style={{color: 'white', textAlign: 'center', paddingTop: '50px'}}>A carregar jogos...</div>;
  }

  // Lógica de Paginação
  const totalPages = Math.ceil(sortedJogos.length / jogosPorPagina);
  const indexOfLastJogo = currentPage * jogosPorPagina;
  const indexOfFirstJogo = indexOfLastJogo - jogosPorPagina;
  const jogosAtuais = sortedJogos.slice(indexOfFirstJogo, indexOfLastJogo);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Render
  return (
    <div className="home-container">
      <h1>Gamepedia - Frontoffice</h1>

      <div className="controls-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Pesquisar por título ou estúdio..."
            className="search-bar"
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="sort-container">
          <select
            className="sort-dropdown"
            value={sortMethod}
            onChange={(e) => {
              setSortMethod(e.target.value);
              setCurrentPage(1); 
            }}
          >
            <option value="default">Ordenar por...</option>
            <option value="title">Título (A-Z)</option>
            <option value="date">Data (Mais Recentes)</option>
          </select>
        </div>
      </div>

      <div className="lista-jogos">
        {jogosAtuais.map((jogo) => (
          <GameCard
            key={jogo.id}
            jogo={jogo}
            estudioNome={getEstudioName(jogo.estudiosId)}
          />
        ))}
      </div>

      <div className="pagination-container">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Anterior
        </button>
        {jogosAtuais.length > 0 && (
          <span>Página {currentPage} de {totalPages}</span>
        )}
        <button onClick={nextPage} disabled={currentPage === totalPages || jogosAtuais.length === 0}>
          Seguinte
        </button>
      </div>

      {sortedJogos.length === 0 && searchTerm !== "" && (
        <p className="search-no-results">
          Nenhum jogo encontrado com "{searchTerm}".
        </p>
      )}
      {sortedJogos.length === 0 && searchTerm === "" && (
        <p className="search-no-results">
          Nenhum jogo encontrado.
        </p>
      )}
    </div>
  );
}

export default Home;