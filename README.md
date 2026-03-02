# 🧠 Hub Educacional Inteligente (AI-Powered)

Plataforma Fullstack voltada à organização de recursos educacionais, utilizando Inteligência Artificial para análise e catalogação automatizada.

## 🚀 Sobre o Projeto
O sistema facilita o cadastro de materiais pedagógicos. O grande diferencial é a integração com o **Google Gemini**, que analisa o título dos materiais e gera automaticamente descrições pedagógicas e tags técnicas, otimizando o fluxo de trabalho de professores e curadores.

---

## 🛠️ Tecnologias Utilizadas

### Backend (API)
- **Python** (Linguagem principal)
- **FastAPI** (Framework de alto desempenho)
- **Google Generative AI** (IA para processamento de conteúdo)
- **Pydantic** (Validação de dados)
- **Uvicorn** (Servidor ASGI)

### Frontend (Interface)
- **React.js** (Single Page Application - SPA)
- **Vite** (Build tool)
- **Axios** (Integração com a API)
- **CSS Modules** (Estilização modular)

---

## ⚙️ Como Rodar o Projeto

### Pré-requisitos
- Python 3.12+
- Node.js 18+

### 1. Backend
```bash
# Entre na pasta raiz
cd backend

# Ative o ambiente virtual
.venv\Scripts\activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor (o app ficará em http://localhost:8000)
python -m uvicorn app.main:app --reload
Nota: Certifique-se de ter um arquivo .env com sua GEMINI_API_KEY configurada na pasta do backend.

2. Frontend
Bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Inicie o modo de desenvolvimento
npm run dev
🛡️ Qualidade de Código (CI/CD)
Este projeto conta com um pipeline automatizado no GitHub Actions que executa o flake8 e black a cada push, garantindo que o código esteja sempre formatado e livre de erros de sintaxe básicos.

---

## 🛠️ Funcionalidades
[x] Cadastro de Recursos: Interface intuitiva para inserção de links e dados.

[x] Smart Assist (IA): Integração com Gemini para preenchimento inteligente.

[x] Listagem em Tempo Real: Visualização dinâmica dos materiais cadastrados.

--- 

## 👤 Autor
Jose Erasmo do Nascimento Barros Filho
Estudante de Ciência da Computação na UFAPE. Desenvolvedor em formação