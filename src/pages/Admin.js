import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Admin.css'; 

// --- 1. DADOS DA API (Confirme que estão corretos) ---
const YOUR_SHEETY_TOKEN = "Bearer davidpc102";
const API_JOGOS_URL = "https://api.sheety.co/5649671ab79be60509611cf0d6e3f249/gamepediaApi/jogos"; 
const API_ESTUDIOS_URL = "https://api.sheety.co/5649671ab79be60509611cf0d6e3f249/gamepediaApi/estudios";

// Estado inicial para o formulário
const defaultGameState = {
  titulo: '',
  anoLancamento: 2024,
  'capa (url)': '',
  descricao: '',
  estudiosId: '',
  likes: 0,
  dislikes: 0
};

function Admin() {
  // States de Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // States do CRUD
  const [jogos, setJogos] = useState([]);
  const [estudios, setEstudios] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // --- STATES DE CONTROLO DE VISTA ---
  const [isCreating, setIsCreating] = useState(false);
  // 'null' se não estiver a editar, ou o 'jogo' se estiver
  const [isEditing, setIsEditing] = useState(null); 
  
  // State para os formulários (usado para Criar e Editar)
  const [formData, setFormData] = useState(defaultGameState);


  // --- FUNÇÕES DE FETCH E LOGIN (Não mudam) ---
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [jogosResponse, estudiosResponse] = await Promise.all([
        fetch(API_JOGOS_URL, { headers: { 'Authorization': YOUR_SHEETY_TOKEN } }),
        fetch(API_ESTUDIOS_URL, { headers: { 'Authorization': YOUR_SHEETY_TOKEN } })
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

  const handleLogin = (event) => {
    event.preventDefault(); 
    if (username === 'admin' && password === 'password') {
      setIsLoggedIn(true);
      fetchAdminData(); 
    } else {
      alert('Username ou password incorretos!');
    }
  };

  // --- FUNÇÕES CRUD ---

  // Função Delete
  const handleDelete = async (gameId) => {
    if (!window.confirm("Tem a certeza que quer apagar este jogo?")) return;
    try {
      await fetch(`${API_JOGOS_URL}/${gameId}`, {
        method: 'DELETE',
        headers: { 'Authorization': YOUR_SHEETY_TOKEN }
      });
      setJogos(jogos.filter(jogo => jogo.id !== gameId));
    } catch (error) {
      console.error("Erro ao apagar o jogo:", error);
      alert("Erro ao apagar o jogo.");
    }
  };

  // Função para atualizar o formulário
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Função Create (Adicionar)
  const handleCreate = async (e) => {
    e.preventDefault(); 
    if (!formData.titulo || !formData.estudiosId) {
      alert("Título e Estúdio são campos obrigatórios.");
      return;
    }
    const newGameData = {
      jogo: {
        ...formData,
        anoLancamento: Number(formData.anoLancamento),
        estudiosId: Number(formData.estudiosId),
        likes: Number(formData.likes),
        dislikes: Number(formData.dislikes)
      }
    };
    try {
      const response = await fetch(API_JOGOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': YOUR_SHEETY_TOKEN },
        body: JSON.stringify(newGameData)
      });
      if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);
      const result = await response.json();
      setJogos(prevJogos => [...prevJogos, result.jogo]);
      setIsCreating(false); 
      setFormData(defaultGameState); // Limpa o formulário
    } catch (error) {
      console.error("Erro ao criar o jogo:", error);
      alert("Erro ao criar o jogo.");
    }
  };

  // --- FUNÇÃO: HandleUpdate (O "U" do CRUD) ---
  const handleUpdate = async (e) => {
    e.preventDefault();

    const gameId = isEditing.id; 
    const { id, ...gameData } = formData; 
    const updatedGameData = {
      jogo: {
        ...gameData,
        anoLancamento: Number(formData.anoLancamento),
        estudiosId: Number(formData.estudiosId),
        likes: Number(formData.likes),
        dislikes: Number(formData.dislikes)
      }
    };

    try {
      const response = await fetch(`${API_JOGOS_URL}/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': YOUR_SHEETY_TOKEN 
        },
        body: JSON.stringify(updatedGameData)
      });
      if (!response.ok) throw new Error(`Erro da API: ${response.statusText}`);
      const result = await response.json();

      setJogos(prevJogos => 
        prevJogos.map(jogo => (jogo.id === gameId ? result.jogo : jogo))
      );
      
      setIsEditing(null); 
      setFormData(defaultGameState);

    } catch (error) {
      console.error("Erro ao atualizar o jogo:", error);
      alert("Erro ao atualizar o jogo.");
    }
  };

  // --- FUNÇÃO: Para abrir o formulário de Edição ---
  const handleEditClick = (jogo) => {
    setIsEditing(jogo); // Define o jogo que estamos a editar
    setFormData(jogo);  // Preenche o formulário com os dados desse jogo
  };


  // --- VISTAS (RENDER) ---

  // --- ECRÃ DE LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="admin-page-wrapper">
        <div className="login-container">
          <h1>Backoffice Login</h1>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username:</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="login-button">Entrar</button>
          </form>
          <Link to="/" className="back-to-site">Voltar ao site</Link>
        </div>
      </div>
    );
  }

  // --- ECRÃ DE FORMULÁRIO (Usado para Criar OU Editar) ---
  if (isCreating || isEditing) {
    const isEditingMode = !!isEditing; // true se estiver a editar, false se a criar

    return (
      <div className="admin-page-wrapper">
        <div className="admin-panel">
          <h1>{isEditingMode ? 'Editar Jogo' : 'Adicionar Novo Jogo'}</h1>
          
          <form onSubmit={isEditingMode ? handleUpdate : handleCreate} className="admin-form">
            <div className="form-group">
              <label>Título:</label>
              <input type="text" name="titulo" value={formData.titulo} onChange={handleFormChange} required />
            </div>

            <div className="form-group">
              <label>Ano de Lançamento:</label>
              <input type="number" name="anoLancamento" value={formData.anoLancamento} onChange={handleFormChange} />
            </div>

            <div className="form-group">
              <label>Estúdio:</label>
              <select name="estudiosId" value={formData.estudiosId} onChange={handleFormChange} required>
                <option value="">-- Selecione um estúdio --</option>
                {estudios.map(estudio => (
                  <option key={estudio.id} value={estudio.num}>
                    {estudio.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>URL da Capa:</label>
              <input type="text" name="capa (url)" value={formData['capa (url)']} onChange={handleFormChange} />
            </div>

            <div className="form-group">
              <label>Descrição:</label>
              <textarea name="descricao" value={formData.descricao} onChange={handleFormChange}></textarea>
            </div>
            
            {/* Campos de Likes/Dislikes (só para edição) */}
            {isEditingMode && (
              <div className="form-row">
                <div className="form-group">
                  <label>Likes:</label>
                  <input type="number" name="likes" value={formData.likes} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Dislikes:</label>
                  <input type="number" name="dislikes" value={formData.dislikes} onChange={handleFormChange} />
                </div>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="admin-button-new">Guardar Alterações</button>
              <button type="button" className="admin-button-delete" onClick={() => {
                setIsCreating(false);
                setIsEditing(null);
                setFormData(defaultGameState); // Limpa o formulário
              }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }


  // --- PAINEL DE ADMIN (TABELA) ---
  return (
    <div className="admin-page-wrapper">
      <div className="admin-panel">
        <h1>Painel de Administração</h1>
        <Link to="/" className="back-to-site">Ir para o Frontoffice</Link>

        <button className="admin-button-new" onClick={() => {
          setIsCreating(true);
          setFormData(defaultGameState); // Garante que o formulário está vazio
        }}>
          + Adicionar Novo Jogo
        </button>

        <h2>Gerir Jogos</h2>
        {loading ? (
          <p>A carregar jogos...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Capa</th>
                <th>Título</th>
                <th>Ano</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {jogos.map(jogo => (
                <tr key={jogo.id}>
                  <td>
                    <img 
                      src={jogo["capa (url)"]} 
                      alt={jogo.titulo} 
                      className="admin-table-image"
                    />
                  </td>
                  <td>{jogo.titulo}</td>
                  <td>{jogo.anoLancamento}</td>
                  <td className="admin-table-actions">
                    {}
                    <button 
                      className="admin-button-edit"
                      onClick={() => handleEditClick(jogo)}
                    >
                      Editar
                    </button>
                    <button 
                      className="admin-button-delete"
                      onClick={() => handleDelete(jogo.id)}
                    >
                      Apagar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Admin;