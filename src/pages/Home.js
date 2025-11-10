import React, { useState, useEffect } from 'react';

function Home() {
  
  const [jogos, setJogos] = useState([]);
  const [estudios, setEstudios] = useState([]);
  
  // Estado de Loading para evitar "race conditions"
  const [loading, setLoading] = useState(true); 

  // URLs da API
  const API_JOGOS_URL = 'https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/jogos';
  const API_ESTUDIOS_URL = 'https://api.sheety.co/8cffd316e8dcac18ca085f6517ac25de/gamepediaApi/estudios';

  // useEffect melhorado
  useEffect(() => {
    
    // Usar Promise.all para garantir que ambos os fetches terminam
    const fetchData = async () => {
      try {
        const [jogosResponse, estudiosResponse] = await Promise.all([
          fetch(API_JOGOS_URL),
          fetch(API_ESTUDIOS_URL)
        ]);

        const jogosData = await jogosResponse.json();
        const estudiosData = await estudiosResponse.json();

        setJogos(jogosData.jogos || []); 
        setEstudios(estudiosData.estudios || []); 

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        // Parar o loading quando tudo terminar
        setLoading(false);
      }
    };

    fetchData();
  }, []); // O array vazio [] significa que só corre uma vez

  
  // Função para encontrar o nome do estúdio
  const getEstudioName = (estudiosId) => {
    
    // ****** AQUI ESTÁ A ALTERAÇÃO ******
    // Agora, ele compara o 'estudiosId' do jogo (ex: 1) 
    // com a sua nova coluna 'num' (que vem do 'NUM' na Sheet).
    const estudio = estudios.find(e => e.num == estudiosId); 
    
    return estudio ? estudio.nome : 'Desconhecido';
  };

  
  // Mostrar mensagem de loading
  if (loading) {
    return <div>A carregar jogos...</div>;
  }

  // Renderizar os dados
  return (
    <div>
      <h1>Gamepedia - Frontoffice</h1>
      <div className="lista-jogos">
        
        {/* Usamos 'jogo.id' (minúsculo) para a key, 
            pois é o ID da linha que o Sheety cria e é sempre único. */}
        {jogos.map((jogo) => (
          <div key={jogo.id} className="card-jogo">
            
            {/* Usamos ["capa (url)"] por causa dos espaços/parênteses */}
            <img 
              src={jogo["capa (url)"]} 
              alt={jogo.titulo} 
              style={{width: '100px'}} 
            /> 
            
            <h2>{jogo.titulo} ({jogo.anoLancamento})</h2>
            
            {/* Passamos 'jogo.estudiosId' (d minúsculo), 
                que é a chave correta do JSON dos jogos */}
            <p>Estúdio: {getEstudioName(jogo.estudiosId)}</p>
            
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;