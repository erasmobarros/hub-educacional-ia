import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, TextField, Button, Card, CardContent, 
  Grid, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, AppBar, Toolbar, IconButton, 
  CardActions, Chip, Fade, Skeleton, Paper, ThemeProvider, createTheme
} from '@mui/material';
import { 
  AutoAwesome, School, Delete, Edit, Link as LinkIcon, 
  PictureAsPdf, YouTube, AddCircleOutline 
} from '@mui/icons-material';

// --- CONFIGURAÇÃO ---
const API_URL = 'http://127.0.0.1:8000';

// 🎨 1. TEMA PERSONALIZADO (Visual Profissional)
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea', // Roxo Tecnológico
    },
    secondary: {
      main: '#00bfa5', // Verde Água para destaque
    },
    background: {
      default: '#f4f6f8', // Cinza muito suave para o fundo
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 12, // Bordas mais arredondadas e modernas
  },
});

function App() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true); // Estado geral de carregamento
  const [loadingAI, setLoadingAI] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [formData, setFormData] = useState({ title: '', description: '', type: 'Link', url: '', tags: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState({ id: '', title: '', description: '', type: '', url: '', tags: '' });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/resources/`);
      setResources(response.data);
    } catch (error) {
      console.error("Erro ao buscar", error);
    } finally {
      // Pequeno delay para mostrar o efeito bonito de esqueleto
      setTimeout(() => setLoading(false), 800);
    }
  };

  const showNotification = (msg, sev) => {
    setNotification({ open: true, message: msg, severity: sev });
  };

  const handleSmartAssist = async () => {
    if (!formData.title) {
      showNotification('Digite um título para a IA analisar!', 'warning');
      return;
    }
    setLoadingAI(true);
    try {
      const response = await axios.post(`${API_URL}/smart-assist/`, {
        title: formData.title,
        type: formData.type
      });
      setFormData(prev => ({
        ...prev,
        description: response.data.suggested_description,
        tags: response.data.suggested_tags.join(', ')
      }));
      showNotification('IA gerou o conteúdo com sucesso!', 'success');
    } catch (error) {
      showNotification('Erro na IA. Verifique sua cota ou chave.', 'error');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/resources/`, formData);
      showNotification('Material salvo com sucesso!', 'success');
      setFormData({ title: '', description: '', type: 'Link', url: '', tags: '' });
      fetchResources();
    } catch (error) {
      showNotification('Erro ao salvar.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja excluir este material?")) {
      try {
        await axios.delete(`${API_URL}/resources/${id}`);
        showNotification("Item excluído!", "success");
        fetchResources();
      } catch (error) {
        showNotification("Erro ao excluir.", "error");
      }
    }
  };

  const handleOpenEdit = (resource) => {
    setEditItem(resource);
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`${API_URL}/resources/${editItem.id}`, editItem);
      showNotification("Atualizado com sucesso!", "success");
      setEditOpen(false);
      fetchResources();
    } catch (error) {
      showNotification("Erro ao atualizar.", "error");
    }
  };

  // Ícone dinâmico baseado no tipo
  const getIcon = (type) => {
    if (type === 'Video') return <YouTube sx={{ color: '#f44336' }} />;
    if (type === 'PDF') return <PictureAsPdf sx={{ color: '#ff9800' }} />;
    return <LinkIcon sx={{ color: '#2196f3' }} />;
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
        
        {/* 🚀 2. NAVBAR MODERNA */}
        <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main', mb: 4 }}>
          <Toolbar>
            <School sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, letterSpacing: 1 }}>
              EDU.HUB <span style={{ opacity: 0.7, fontSize: '0.8em' }}>| Painel Inteligente</span>
            </Typography>
            <Button color="inherit" startIcon={<AddCircleOutline />}>Novo</Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg">
          <Grid container spacing={4}>
            
            {/* ESQUERDA: Formulário de Cadastro */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AddCircleOutline /> Novo Material
                </Typography>
                
                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <TextField 
                    label="Título do Material" variant="outlined" fullWidth required
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  
                  <TextField 
                    select label="Formato" fullWidth SelectProps={{ native: true }}
                    value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Link">🌐 Site / Artigo</option>
                    <option value="PDF">📄 Documento PDF</option>
                    <option value="Video">🎥 Vídeo / Aula</option>
                  </TextField>

                  <Button 
                    variant="outlined" color="secondary" onClick={handleSmartAssist} disabled={loadingAI}
                    startIcon={loadingAI ? <CircularProgress size={20} /> : <AutoAwesome />}
                    sx={{ borderStyle: 'dashed', borderWidth: 2 }}
                  >
                    {loadingAI ? 'A IA está criando...' : 'Gerar com IA'}
                  </Button>

                  <TextField 
                    label="Descrição Inteligente" multiline rows={3} fullWidth
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                  
                  <TextField 
                    label="URL de Acesso" fullWidth required placeholder="https://..."
                    value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})}
                  />

                  <TextField 
                    label="Tags (separadas por vírgula)" fullWidth size="small"
                    value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />

                  <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 1, boxShadow: 2 }}>
                    Salvar na Biblioteca
                  </Button>
                </Box>
              </Paper>
            </Grid>

            {/* DIREITA: Lista de Cards */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" color="text.secondary">
                  📚 Minha Biblioteca
                </Typography>
                <Chip label={`${resources.length} itens`} color="primary" size="small" />
              </Box>

              <Grid container spacing={2}>
                {loading ? (
                  // 💀 3. EFEITO DE SKELETON (Carregando)
                  Array.from(new Array(3)).map((_, index) => (
                    <Grid item xs={12} key={index}>
                      <Card sx={{ display: 'flex', p: 2, alignItems: 'center' }}>
                        <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 2, mr: 2 }} />
                        <Box sx={{ width: '100%' }}>
                          <Skeleton width="60%" height={30} />
                          <Skeleton width="40%" height={20} />
                        </Box>
                      </Card>
                    </Grid>
                  ))
                ) : resources.length === 0 ? (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 2 }}>Nenhum material encontrado. Comece adicionando um!</Alert>
                  </Grid>
                ) : (
                  resources.map((resource) => (
                    <Grid item xs={12} key={resource.id}>
                      <Fade in={true} timeout={500}>
                        <Card 
                          sx={{ 
                            display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, 
                            transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } 
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f5f5f5', minWidth: 100 }}>
                            {getIcon(resource.type)}
                          </Box>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                            <CardContent sx={{ flex: '1 0 auto', pb: 1 }}>
                              <Typography component="div" variant="h6" color="primary.main">
                                {resource.title}
                              </Typography>
                              <Typography variant="subtitle2" color="text.secondary" component="div" sx={{ mb: 1 }}>
                                {resource.type}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {resource.description}
                              </Typography>
                              
                              <Box sx={{ mt: 1 }}>
                                {resource.tags && resource.tags.split(',').map((tag, i) => (
                                  <Chip key={i} label={tag.trim()} size="small" sx={{ mr: 0.5, bgcolor: '#e3f2fd', color: '#1565c0' }} />
                                ))}
                              </Box>
                            </CardContent>
                            
                            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                              <Button size="small" startIcon={<LinkIcon />} href={resource.url} target="_blank" variant="contained" disableElevation>
                                Acessar
                              </Button>
                              <IconButton size="small" color="warning" onClick={() => handleOpenEdit(resource)}>
                                <Edit />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(resource.id)}>
                                <Delete />
                              </IconButton>
                            </CardActions>
                          </Box>
                        </Card>
                      </Fade>
                    </Grid>
                  ))
                )}
              </Grid>
            </Grid>

          </Grid>
        </Container>

        {/* DIALOG DE EDIÇÃO (Mantido igual, só visualmente integrado) */}
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>✏️ Editar Material</DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Título" fullWidth value={editItem.title} onChange={(e) => setEditItem({...editItem, title: e.target.value})} />
              <TextField label="Descrição" fullWidth multiline rows={3} value={editItem.description} onChange={(e) => setEditItem({...editItem, description: e.target.value})} />
              <TextField label="URL" fullWidth value={editItem.url} onChange={(e) => setEditItem({...editItem, url: e.target.value})} />
              <TextField label="Tags" fullWidth value={editItem.tags} onChange={(e) => setEditItem({...editItem, tags: e.target.value})} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">Salvar Alterações</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={notification.open} autoHideDuration={4000} onClose={() => setNotification({...notification, open: false})}>
          <Alert severity={notification.severity} variant="filled">{notification.message}</Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;