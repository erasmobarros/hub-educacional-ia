import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, TextField, Button, Card, CardContent, 
  Grid, Chip, CircularProgress, IconButton, Snackbar, Alert 
} from '@mui/material';
import { Delete as DeleteIcon, AutoAwesome as AutoAwesomeIcon } from '@mui/icons-material';

// --- CONFIGURAÇÃO ---
// Garanta que esta porta é a mesma que aparece no terminal do Python (uvicorn)
const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [resources, setResources] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Link',
    url: '',
    tags: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Carregar recursos ao iniciar
  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await axios.get(`${API_URL}/resources/`);
      setResources(response.data);
    } catch (error) {
      console.error("Erro ao buscar recursos:", error);
      // Se der erro, tenta sem o prefixo /api/v1 (caso você não tenha configurado no main.py)
      if (API_URL.includes('/api/v1')) {
          try {
              const retryResponse = await axios.get('http://127.0.0.1:8000/resources/');
              setResources(retryResponse.data);
          } catch (e) { console.error("Tentativa sem prefixo falhou tb", e)}
      }
    }
  };

  const handleSmartAssist = async () => {
    if (!formData.title) {
      showNotification('Digite um título para a IA analisar!', 'warning');
      return;
    }
    setLoadingAI(true);
    try {
      // Tenta endpoint com prefixo
      let url = `${API_URL}/smart-assist/`;
      // Se seu backend não tem prefixo /api/v1, usa a raiz. Ajuste se necessário.
      
      const response = await axios.post(url, {
        title: formData.title,
        type: formData.type
      });

      setFormData(prev => ({
        ...prev,
        description: response.data.suggested_description,
        tags: response.data.suggested_tags.join(', ')
      }));
      showNotification('IA gerou a descrição com sucesso!', 'success');
    } catch (error) {
      console.error("Erro na IA:", error);
      // Fallback para tentar sem prefixo caso dê 404
      try {
          const response = await axios.post('http://127.0.0.1:8000/smart-assist/', {
            title: formData.title,
            type: formData.type
          });
          setFormData(prev => ({
            ...prev,
            description: response.data.suggested_description,
            tags: response.data.suggested_tags.join(', ')
          }));
          showNotification('IA gerou a descrição com sucesso! (Rota alternativa)', 'success');
      } catch (e) {
          showNotification('Erro ao conectar com a IA. O backend está rodando?', 'error');
      }
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/resources/`, formData);
      showNotification('Recurso salvo!', 'success');
      fetchResources();
      setFormData({ title: '', description: '', type: 'Link', url: '', tags: '' });
    } catch (error) {
      // Fallback simples
      try {
          await axios.post('http://127.0.0.1:8000/resources/', formData);
          showNotification('Recurso salvo!', 'success');
          fetchResources();
          setFormData({ title: '', description: '', type: 'Link', url: '', tags: '' });
      } catch (e) {
          showNotification('Erro ao salvar.', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/resources/${id}`);
      fetchResources();
    } catch (error) {
       try {
          await axios.delete(`http://127.0.0.1:8000/resources/${id}`);
          fetchResources();
       } catch (e) {}
    }
  };

  const showNotification = (msg, sev) => {
    setNotification({ open: true, message: msg, severity: sev });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#1565c0', textAlign: 'center', mb: 4 }}>
        🎓 Hub Educacional Inteligente
      </Typography>

      <Card sx={{ mb: 4, p: 2, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField 
                  fullWidth label="Título do Material" variant="outlined" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Ex: Aula de Cálculo I"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField 
                  select fullWidth label="Tipo" 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  SelectProps={{ native: true }}
                >
                  <option value="Link">Link / Artigo</option>
                  <option value="PDF">PDF</option>
                  <option value="Video">Vídeo</option>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Button 
                  fullWidth
                  variant="contained" 
                  onClick={handleSmartAssist}
                  disabled={loadingAI}
                  startIcon={loadingAI ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                  sx={{ 
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
                    color: 'white',
                    py: 1.5,
                    fontWeight: 'bold'
                  }}
                >
                  {loadingAI ? 'A IA está analisando...' : '✨ Preencher Automaticamente com IA'}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField 
                  fullWidth label="Descrição" multiline rows={3} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField 
                  fullWidth label="Tags" 
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                 <TextField 
                  fullWidth label="URL" 
                  value={formData.url}
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="outlined" size="large" fullWidth sx={{ mt: 1 }}>
                  Salvar no Banco de Dados
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2, fontWeight: 'medium' }}>
        📚 Materiais Salvos
      </Typography>
      
      {resources.length === 0 && (
        <Typography variant="body1" color="text.secondary" align="center">
          Nenhum material cadastrado ainda. Use a IA acima para criar o primeiro!
        </Typography>
      )}

      <Grid container spacing={2}>
        {resources.map((res) => (
          <Grid item xs={12} key={res.id}>
            <Card variant="outlined" sx={{ '&:hover': { boxShadow: 2 } }}>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h6" color="primary">
                    {res.title} 
                    <Chip label={res.type} size="small" sx={{ ml: 1, backgroundColor: '#e3f2fd', color: '#1565c0' }} />
                  </Typography>
                  <Typography variant="body2" sx={{ my: 1 }}>{res.description}</Typography>
                  <Box sx={{ mb: 1 }}>
                    {res.tags && res.tags.split(',').map((tag, idx) => (
                      <Chip key={idx} label={tag.trim()} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Box>
                  <Typography variant="caption" component="a" href={res.url} target="_blank" sx={{ textDecoration: 'none', color: 'gray' }}>
                    🔗 {res.url}
                  </Typography>
                </Box>
                <IconButton onClick={() => handleDelete(res.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={() => setNotification({...notification, open: false})}>
        <Alert severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;