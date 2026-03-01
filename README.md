# 🧠 Hub Educacional Inteligente (AI-Powered)

Este projeto é uma plataforma Fullstack desenvolvida para facilitar o cadastro e organização de recursos educacionais (aulas, vídeos, artigos). 

O diferencial do sistema é o uso da **Inteligência Artificial (Google Gemini)** para analisar o título do material e gerar automaticamente uma **descrição pedagógica** e **tags técnicas**, agilizando o trabalho de professores e curadores de conteúdo.

## 🚀 Tecnologias Utilizadas

### Backend (API)
- **Python** (Linguagem principal)
- **FastAPI** (Framework moderno e rápido para APIs)
- **Google Generative AI** (Integração com o modelo Gemini)
- **Uvicorn** (Servidor ASGI)

### Frontend (Interface)
- **React.js** (Biblioteca para construção de interfaces)
- **Vite** (Ferramenta de build rápida)
- **Axios** (Consumo de API)
- **CSS Modules** (Estilização)

---

## ⚙️ Como Rodar o Projeto Localmente

### 1. Configurando o Backend (Servidor)

```bash
# Entre na pasta raiz e ative o ambiente virtual
# Windows:
.venv\Scripts\activate

# Instale as dependências
pip install fastapi uvicorn google-generativeai python-dotenv pydantic

# Inicie o servidor
python -m uvicorn app.main:app --reload