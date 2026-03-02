# 🧠 Hub Educacional Inteligente (AI-Powered)

Plataforma Fullstack para organização e catalogação inteligente de recursos educacionais, com integração a IA generativa para análise automática de conteúdo pedagógico.

---

## 🚀 Visão Geral

O Hub Educacional Inteligente foi desenvolvido para otimizar o fluxo de trabalho de professores e curadores de conteúdo, permitindo:

* Cadastro estruturado de materiais
* Geração automática de descrição pedagógica
* Sugestão inteligente de tags técnicas
* Persistência de dados com banco SQLite
* Monitoramento de saúde da aplicação

O diferencial do projeto é a integração com o Google Gemini, utilizando IA para enriquecer automaticamente os recursos cadastrados.

---

## 🏗️ Arquitetura do Sistema

Frontend (SPA) → API REST → Banco SQLite
                        ↘ Integração com IA (Gemini)

O sistema segue uma arquitetura desacoplada:

* Frontend React consome a API
* Backend FastAPI gerencia regras de negócio
* SQLite garante persistência local
* IA realiza análise semântica do conteúdo

---

## 🛠️ Tecnologias Utilizadas

### 🔙 Backend

* **Python 3.12+**
* **FastAPI**
* **SQLite**
* **Google Generative AI (Gemini)**
* **Pydantic**
* **Uvicorn**
* **Logging estruturado**
* **dotenv**

### 🎨 Frontend

* **React.js**
* **Vite**
* **Axios**
* **CSS Modules**

---

## 🤖 Integração com IA

A funcionalidade **Smart Assist**:

* Envia título e tipo do material para o modelo Gemini
* Exige retorno em JSON estrito
* Força exatamente 3 tags
* Valida estrutura antes de retornar
* Trata respostas mal formatadas
* Registra logs de latência e tokens estimados
* Evita quebra caso a IA retorne texto fora do padrão

Exemplo de resposta esperada:

```json
{
  "suggested_description": "Material introdutório sobre lógica de programação...",
  "suggested_tags": ["programacao", "iniciantes", "algoritmos"]
}
```

---

## 🗄️ Banco de Dados

* Banco local: SQLite
* Arquivo gerado automaticamente: `eduhub.db`
* Persistência garantida entre reinicializações
* Estrutura simples e escalável

Tabela principal:

```
resources
```

---

## 🔎 Endpoints da API

### Health Check

```
GET /health
```

Retorna:

* status da API
* status da IA
* uptime da aplicação

---

### Smart Assist (IA)

```
POST /smart-assist/
```

Gera descrição pedagógica e 3 tags automaticamente.

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

* Python 3.12+
* Node.js 18+
* Chave da API do Google Gemini

---

### 🔹 Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Crie um arquivo `.env`:

```
GEMINI_API_KEY=sua_chave_aqui
```

Inicie:

```bash
python -m uvicorn app.main:app --reload
```

API disponível em:

```
http://localhost:8000
```

---

### 🔹 Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

## 📊 Observabilidade e Qualidade

* Logs estruturados
* Monitoramento de latência da IA
* Health Check implementado
* Tratamento robusto de erros
* Pipeline CI com formatação automática (black + flake8)

---

## 🎯 Diferenciais Técnicos

✔ Integração real com IA
✔ Validação de JSON estrito
✔ Tratamento de respostas inesperadas da IA
✔ Persistência com SQLite
✔ Estrutura modular
✔ Arquitetura Fullstack desacoplada
✔ Boas práticas de logging

---

## 👨‍💻 Autor

**José Erasmo do Nascimento Barros Filho**
Estudante de Ciência da Computação – UFAPE

---