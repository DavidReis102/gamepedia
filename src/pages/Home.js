import React, { useState, useEffect, useMemo } from 'react';
import { GameCard } from '../components/GameCard';
import './Home.css';

function Home() {

  const [jogos, setJogos] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [jogosPorPagina] = useState(8);
  const [sortMethod, setSortMethod] = useState("default");

  //URLs da API
  const SHEETY_TOKEN = "Bearer davidpc102";
  const API_JOGOS_URL = "https://api.sheety.co/03602968132db23fc2d009326a090693/gamepediaApi/jogos"; 
  const API_ESTUDIOS_URL = "https://api.sheety.co/03602968132db23fc2d009326a090693/gamepediaApi/estudios";


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jogosResponse, estudiosResponse] = await Promise.all([
          fetch(API_JOGOS_URL, { headers: { 'Authorization': SHEETY_TOKEN } }),
          fetch(API_ESTUDIOS_URL, { headers: { 'Authorization': SHEETY_TOKEN } })
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
  }, []);

  const getEstudioName = (estudiosId) => {
    const estudio = estudios.find(e => e.num === estudiosId);
    return estudio ? estudio.nome : 'Desconhecido';
  };

  // 1. Lógica de Filtro
  const filteredJogos = useMemo(() => {
    return jogos.filter((jogo) => {
      const search = searchTerm.toLowerCase();
      if (search === "") {
        return true;
      }
      const tituloMatch = jogo.titulo.toLowerCase().includes(search);
      const estudio = estudios.find(e => e.num === jogo.estudiosId);
      const estudioNome = estudio ? estudio.nome : '';
      const estudioMatch = estudioNome.toLowerCase().includes(search);
      return tituloMatch || estudioMatch;
    });
  }, [jogos, estudios, searchTerm]); 

  // 2. Lógica de Ordenação
  const sortedJogos = useMemo(() => {
    const sortableJogos = [...filteredJogos]; 
    if (sortMethod === 'title') {
      sortableJogos.sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (sortMethod === 'date') {
      sortableJogos.sort((a, b) => b.anoLancamento - a.anoLancamento);
    }
    return sortableJogos;
  }, [filteredJogos, sortMethod]);

  
  if (loading) {
    return <div style={{color: 'white', textAlign: 'center', paddingTop: '50px'}}>A carregar jogos...</div>;
  }

  // 3. Lógica de Paginação
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


  // --- RENDERIZAR A PÁGINA ---
  return (
   
    <div className="home-container">
      <h1>Gamepedia</h1>

      <div className="controls-container">
        {/* Barra de pesquisa */}
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

        {/* Dropdown de Ordenação */}
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

      {/* A grelha de jogos */}
      <div className="lista-jogos">
        {jogosAtuais.map((jogo) => (
          <GameCard
            key={jogo.id}
            jogo={jogo}
            estudioNome={getEstudioName(jogo.estudiosId)}
          />
        ))}
      </div>

      {/* Botões de Paginação */}
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

      {/* Mensagens */}
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