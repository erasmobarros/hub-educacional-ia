import os
import json
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# 1. Carrega as variáveis de ambiente
load_dotenv()

# 2. Configura a IA
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("⚠️ AVISO: A chave GEMINI_API_KEY não foi encontrada no .env!")
else:
    genai.configure(api_key=api_key)

# --- AQUI ESTÁ A MUDANÇA MÁGICA ---
# Usamos um modelo que apareceu na sua lista
model = genai.GenerativeModel("gemini-flash-latest")

app = FastAPI()

# 3. Configura o CORS (Permite o React acessar)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Banco de dados simulado
db = []

# Modelos de Dados
class SmartAssistRequest(BaseModel):
    title: str
    type: str

class Resource(BaseModel):
    title: str
    description: str
    type: str
    url: str
    tags: str

# --- ROTAS ---

@app.get("/")
def read_root():
    return {"message": "API Online 🚀"}

@app.get("/resources/")
def get_resources():
    return db

@app.post("/resources/")
def add_resource(resource: Resource):
    db.append(resource.dict())
    return {"message": "Recurso salvo com sucesso!"}

@app.post("/smart-assist/")
async def smart_assist(data: SmartAssistRequest):
    print(f"\n🤖 RECEBI UM PEDIDO: {data.title} ({data.type})")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Chave de API não configurada.")

    try:
        # O Prompt para a IA
        prompt = (
            f"Atue como um assistente pedagógico. Analise o recurso '{data.title}' do tipo '{data.type}'. "
            f"Gere uma descrição curta e 3 tags técnicas. "
            f"Responda APENAS um JSON válido neste formato exato, sem crase ou markdown: "
            f'{{"suggested_description": "...", "suggested_tags": ["tag1", "tag2", "tag3"]}}'
        )

        print("⏳ Enviando para o Google Gemini (2.0 Flash)...")
        response = model.generate_content(prompt)
        print("📩 Resposta recebida da IA.")

        # Limpeza da resposta
        text_response = response.text.replace("```json", "").replace("```", "").strip()
        
        # Converte para JSON
        dados_json = json.loads(text_response)
        
        print(f"✅ Sucesso! Dados prontos para o site: {dados_json}")
        return dados_json

    except Exception as e:
        print(f"🔥 ERRO NA IA: {str(e)}")
        # Se der erro, vamos tentar um modelo de backup (Flash Lite)
        try:
             print("🔄 Tentando modelo de backup...")
             backup_model = genai.GenerativeModel("gemini-2.0-flash-lite")
             response = backup_model.generate_content(prompt)
             text_response = response.text.replace("```json", "").replace("```", "").strip()
             return json.loads(text_response)
        except:
             raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")