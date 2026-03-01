import os
import json
import uuid
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv

# 1. Carrega o .env
env_file = find_dotenv()
load_dotenv(env_file)

# 2. Configura a IA
api_key = os.getenv("GEMINI_API_KEY")

# Variável global para o modelo
model = None

if not api_key:
    print("❌ ERRO: Chave não encontrada. Verifique o arquivo .env")
else:
    print(f"✅ Chave carregada! Configurando modelo compatível...")
    genai.configure(api_key=api_key)
    
    # 👇 AQUI ESTÁ O SEGREDO: Usando os nomes que apareceram na SUA lista
    try:
        # Tenta o Flash mais recente (Geralmente Gratuito e Rápido)
        print("Tentando conectar com 'gemini-flash-latest'...")
        model = genai.GenerativeModel("gemini-flash-latest")
        print("✅ Conectado ao Gemini Flash Latest!")
    except:
        try:
            # Se falhar, tenta o Pro mais recente
            print("⚠️ Flash falhou. Tentando 'gemini-pro-latest'...")
            model = genai.GenerativeModel("gemini-pro-latest")
            print("✅ Conectado ao Gemini Pro Latest!")
        except Exception as e:
            print(f"❌ Nenhum modelo funcionou. Erro: {e}")
            model = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Banco de dados na memória
db = []

# --- MODELOS ---
class SmartAssistRequest(BaseModel):
    title: str
    type: str

class Resource(BaseModel):
    id: str = None 
    title: str
    description: str
    type: str
    url: str
    tags: str

# --- ROTAS ---
@app.get("/resources/")
def get_resources():
    return db

@app.post("/resources/")
def add_resource(resource: Resource):
    new_res = resource.dict()
    new_res["id"] = str(uuid.uuid4())
    db.append(new_res)
    print(f"💾 Salvo: {new_res['title']}")
    return {"message": "Salvo!", "id": new_res["id"]}

@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: str):
    global db
    original_len = len(db)
    db = [r for r in db if r.get("id") != resource_id]
    if len(db) == original_len:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    return {"message": "Excluído"}

@app.put("/resources/{resource_id}")
def update_resource(resource_id: str, resource: Resource):
    for r in db:
        if r.get("id") == resource_id:
            r.update(resource.dict())
            r["id"] = resource_id 
            return {"message": "Atualizado!"}
    raise HTTPException(status_code=404, detail="Item não encontrado")

@app.post("/smart-assist/")
async def smart_assist(data: SmartAssistRequest):
    if not model:
        raise HTTPException(status_code=500, detail="IA não configurada no Backend.")
    
    print(f"🤖 IA processando: {data.title}...")
    
    try:
        prompt = (f"Analise o recurso educacional '{data.title}' (Tipo: {data.type}). "
                  "Responda APENAS um JSON válido neste formato:\n"
                  '{"suggested_description": "Descrição curta aqui", "suggested_tags": ["tag1", "tag2"]}')
        
        response = model.generate_content(prompt)
        text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(text)
        
    except Exception as e:
        print(f"🔥 Erro na IA: {e}")
        # Dica: Se der erro de cota aqui, o usuário verá no console
        raise HTTPException(status_code=500, detail=f"Erro na IA: {str(e)}")