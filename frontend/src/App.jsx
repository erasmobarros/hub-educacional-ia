import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [resources, setResources] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Link",
    url: "",
    tags: ""
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [fieldToEdit, setFieldToEdit] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/resources/`);
      setResources(response.data);
    } catch (error) {
      console.error(error);
      alert("Erro ao buscar recursos.");
    }
  };

  const handleOpenLink = (url) => {
    if (!url) {
      alert("Link inválido.");
      return;
    }

    let formattedUrl = url;

    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl;
    }

    window.open(formattedUrl, "_blank");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      alert("Digite um título primeiro.");
      return;
    }

    setLoadingAI(true);

    try {
      const response = await axios.post(
        `${API_URL}/smart-assist/`,
        {
          title: formData.title,
          type: formData.type
        }
      );

      setFormData({
        ...formData,
        description: response.data.suggested_description,
        tags: response.data.suggested_tags.join(", ")
      });
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar conteúdo com IA.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_URL}/resources/`, formData);

      setFormData({
        title: "",
        description: "",
        type: "Link",
        url: "",
        tags: ""
      });

      fetchResources();
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir?")) return;

    try {
      await axios.delete(`${API_URL}/resources/${id}`);
      fetchResources();
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir.");
    }
  };

  const openEditModal = (item) => {
    setEditingItem({ ...item });
    setFieldToEdit("");
    setNewValue("");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!fieldToEdit || !newValue.trim()) {
      alert("Escolha o que deseja atualizar.");
      return;
    }

    try {
      const updatedItem = {
        ...editingItem,
        [fieldToEdit]: newValue
      };

      await axios.put(
        `${API_URL}/resources/${editingItem.id}`,
        updatedItem
      );

      setEditModalOpen(false);
      setEditingItem(null);
      setFieldToEdit("");
      setNewValue("");

      fetchResources();
    } catch (error) {
      console.error(error);
      alert("Erro ao atualizar.");
    }
  };

  return (
    <div className="container">
      <h1>Hub Inteligente de Recursos Educacionais</h1>

      <div className="form-box">
        <h2>Novo Material</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <button
            type="button"
            onClick={handleGenerateDescription}
            className="ai-button"
            disabled={loadingAI}
          >
            {loadingAI ? "Gerando..." : "Gerar descrição com IA"}
          </button>

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
          >
            <option value="Link">Link</option>
            <option value="Video">Vídeo</option>
            <option value="PDF">PDF</option>
          </select>

          <textarea
            name="description"
            placeholder="Descrição"
            value={formData.description}
            onChange={handleChange}
          />

          <input
            type="text"
            name="url"
            placeholder="URL"
            value={formData.url}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="tags"
            placeholder="Tags"
            value={formData.tags}
            onChange={handleChange}
          />

          <button type="submit" className="save-btn">
            Salvar
          </button>
        </form>
      </div>

      <h2>Biblioteca</h2>

      {resources.length === 0 && <p>Nenhum material cadastrado.</p>}

      <ul className="list">
        {resources.map((item) => (
          <li key={item.id} className="card">
            <h3>{item.title}</h3>
            <p><strong>Tipo:</strong> {item.type}</p>
            <p>{item.description}</p>
            <p><strong>URL:</strong> {item.url}</p>
            <p><strong>Tags:</strong> {item.tags}</p>

            <div className="actions">
              <button onClick={() => handleOpenLink(item.url)}>
                Link
        
              </button>

              <button onClick={() => openEditModal(item)}>
                Editar
              </button>

              <button onClick={() => handleDelete(item.id)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      {editModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Editar Material</h3>

            <select
              value={fieldToEdit}
              onChange={(e) => setFieldToEdit(e.target.value)}
            >
              <option value="">Escolha o campo</option>
              <option value="title">Título</option>
              <option value="description">Descrição</option>
              <option value="type">Tipo</option>
              <option value="url">URL</option>
              <option value="tags">Tags</option>
            </select>

            {fieldToEdit && (
              <input
                type="text"
                placeholder="Edite aqui"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
              />
            )}

            <div className="modal-actions">
              <button onClick={handleSaveEdit}>Salvar</button>
              <button onClick={() => setEditModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;