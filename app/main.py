import os
import time
import json
import uuid
import logging
import asyncio
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from collections import defaultdict
from typing import List, Optional

import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv, find_dotenv


logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("api")


load_dotenv(find_dotenv())

db_memory = []
ai_model = None
start_time = time.time()


class ResourceBase(BaseModel):
    title: str = Field(..., min_length=3, description="Título do material")
    type: str = Field(..., description="Tipo: PDF, Video, Link")
    description: Optional[str] = ""
    url: str
    tags: str = ""

class Resource(ResourceBase):
    id: str

class AIRequest(BaseModel):
    title: str
    type: str


@asynccontextmanager
async def lifespan(app: FastAPI):
    
    global ai_model
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.error("❌ GEMINI_API_KEY não encontrada no .env")
    else:
        genai.configure(api_key=api_key)
        
        models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash"]
        
        for model_name in models:
            try:
                logger.info(f"Tentando carregar modelo: {model_name}...")
                ai_model = genai.GenerativeModel(model_name)
                logger.info(f"✅ IA Conectada: {model_name}")
                break 
            except Exception as e:
                logger.warning(f"Falha ao carregar {model_name}: {e}")
    
    yield 
    
   
    logger.info("Desligando API...")


app = FastAPI(
    title="EduHub API",
    version="1.0.0",
    lifespan=lifespan 
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Mede o tempo de cada requisição e gera logs automáticos."""
    start = time.time()
    response = await call_next(request)
    process_time = time.time() - start
    
   
    if request.url.path != "/health":
        logger.info(
            f"Method={request.method} Path={request.url.path} "
            f"Status={response.status_code} Latency={process_time:.2f}s"
        )
    
    return response



@app.get("/health")
def health_check():
    """Verifica saúde do sistema (Requisito DevOps)."""
    uptime = round(time.time() - start_time, 2)
    return {
        "status": "healthy",
        "ai_connected": ai_model is not None,
        "uptime_seconds": uptime
    }

@app.get("/resources/", response_model=List[Resource])
def list_resources():
    return db_memory

@app.post("/resources/", status_code=201)
def create_resource(resource: ResourceBase):
    item = resource.dict()
    item["id"] = str(uuid.uuid4())
    db_memory.append(item)
    logger.info(f"Resource Created: ID={item['id']} Title='{item['title']}'")
    return {"message": "Salvo", "id": item["id"]}

@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: str):
    global db_memory
    initial_len = len(db_memory)
    db_memory = [r for r in db_memory if r["id"] != resource_id]
    
    if len(db_memory) == initial_len:
        raise HTTPException(status_code=404, detail="Item não encontrado")
    
    logger.info(f"Resource Deleted: ID={resource_id}")
    return {"message": "Excluído"}

@app.put("/resources/{resource_id}")
def update_resource(resource_id: str, resource: ResourceBase):
    for r in db_memory:
        if r["id"] == resource_id:
            r.update(resource.dict())
            r["id"] = resource_id
            logger.info(f"Resource Updated: ID={resource_id}")
            return {"message": "Atualizado"}
            
    raise HTTPException(status_code=404, detail="Item não encontrado")


@app.post("/smart-assist/")
async def smart_assist(data: AIRequest):
    if not ai_model:
        raise HTTPException(status_code=503, detail="Serviço de IA indisponível")

    
    req_start = time.time()
    
    try:
        prompt = (
            f"Atue como especialista educacional. Analise: '{data.title}' ({data.type}). "
            "Retorne APENAS JSON válido: "
            '{"suggested_description": "Resumo curto...", "suggested_tags": ["tag1", "tag2"]}'
        )

        
        response = await ai_model.generate_content_async(prompt)
        
       
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        result = json.loads(clean_text)

        
        latency = round(time.time() - req_start, 2)
        
        tokens_in = len(prompt) // 4
        tokens_out = len(clean_text) // 4
        total_tokens = tokens_in + tokens_out

        
        logger.info(
            f"AI Request Success | Title='{data.title}' | "
            f"Latency={latency}s | Tokens={total_tokens}"
        )
        
        return result

    except Exception as e:
        logger.error(f"AI Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar IA")