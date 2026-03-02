Ficou muito bom 👏 já está com cara de projeto de portfólio mesmo.

Vou te devolver uma versão **mais profissional, organizada e completa**, ajustando:

* ✔ Estrutura Markdown correta
* ✔ Melhor descrição técnica
* ✔ Correção do trecho de código quebrado
* ✔ Melhor explicação da IA
* ✔ Melhor organização das funcionalidades
* ✔ Pequenos ajustes de linguagem
* ✔ Seção de arquitetura
* ✔ Melhor apresentação sua como autor

---

# ✅ README Atualizado

````markdown
# 🧠 Hub Educacional Inteligente (AI-Powered)

Plataforma Fullstack para organização de recursos educacionais com suporte de Inteligência Artificial para geração automática de descrições e tags.

---

## 🚀 Sobre o Projeto

O **Hub Educacional Inteligente** é uma aplicação web que permite o cadastro, organização e gerenciamento de materiais pedagógicos (Links, Vídeos e PDFs).

O diferencial do sistema é a integração com o **Google Gemini**, que:

- Analisa o título e tipo do material
- Gera automaticamente uma descrição pedagógica
- Sugere tags técnicas relevantes
- Retorna dados estruturados em JSON

Isso otimiza o fluxo de trabalho de professores, curadores de conteúdo e estudantes.

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura Fullstack desacoplada:

Frontend (React SPA)  
⬇  
Backend (FastAPI REST API)  
⬇  
Google Gemini (Serviço de IA)

---

## 🛠️ Tecnologias Utilizadas

### 🔹 Backend (API)
- **Python 3.12+**
- **FastAPI**
- **Google Generative AI (Gemini)**
- **Pydantic**
- **Uvicorn**
- **Logging estruturado**
- **Health Check endpoint**

### 🔹 Frontend (Interface)
- **React.js**
- **Vite**
- **Axios**
- **CSS personalizado**

---

## ⚙️ Como Rodar o Projeto

### 📌 Pré-requisitos

- Python 3.12+
- Node.js 18+

---

### 1️⃣ Backend

```bash
# Entre na pasta do backend
cd backend

# Ative o ambiente virtual (Windows)
.venv\Scripts\activate

# Ou (Linux/Mac)
source .venv/bin/activate

# Instale as dependências
pip install -r requirements.txt

# Inicie o servidor
python -m uvicorn app.main:app --reload
````

A API ficará disponível em:

```
http://localhost:8000
```

⚠️ Importante:
Crie um arquivo `.env` dentro da pasta `backend` com:

```
GEMINI_API_KEY=sua_chave_aqui
```

---

### 2️⃣ Frontend

```bash
# Entre na pasta do frontend
cd frontend

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

O frontend ficará disponível em:

```
http://localhost:5173
```

---

## 🛠️ Funcionalidades

* ✅ Cadastro de Recursos (CRUD completo)
* ✅ Edição parcial de campos
* ✅ Exclusão de materiais
* ✅ Listagem dinâmica
* ✅ Botão para abrir link externo
* ✅ Smart Assist (IA)
* ✅ Geração automática de descrição
* ✅ Geração automática de tags
* ✅ Endpoint de Health Check (`/health`)
* ✅ Logs estruturados no backend

---

## 🛡️ Qualidade de Código (CI/CD)

O projeto possui pipeline automatizado com **GitHub Actions** que executa:

* `flake8` (análise estática)
* `black` (formatação automática)

A cada push no repositório, garantindo:

* Padronização do código
* Redução de erros básicos
* Melhor manutenção

---

## 🔍 Endpoint de Monitoramento

### Health Check

```
GET /health
```

Retorna:

* Status da aplicação
* Status da conexão com a IA
* Uptime do servidor

---

## 📌 Possíveis Melhorias Futuras

* Persistência em banco de dados (PostgreSQL)
* Autenticação de usuários
* Deploy em nuvem (Render / Railway / AWS)
* Testes automatizados
* Cache para respostas da IA

---

## 👤 Autor

**José Erasmo do Nascimento Barros Filho**
Estudante de Ciência da Computação – UFAPE


```



