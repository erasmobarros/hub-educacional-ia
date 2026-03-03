import os
import time
import json
import uuid
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

import google.generativeai as genai
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv, find_dotenv

from sqlalchemy import create_engine, Column, String, Text
from sqlalchemy.orm import sessionmaker, declarative_base, Session


# =========================
# LOGGING
# =========================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("api")

load_dotenv(find_dotenv())


# =========================
# SQLITE CONFIG
# =========================

DATABASE_URL = "sqlite:///./eduhub.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class ResourceDB(Base):
    __tablename__ = "resources"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(Text)
    url = Column(String, nullable=False)
    tags = Column(String)


Base.metadata.create_all(bind=engine)


# =========================
# SUA CONFIGURAÇÃO DE IA 
# =========================

ai_model = None
start_time = time.time()


@asynccontextmanager
async def lifespan(app: FastAPI):

    global ai_model
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        logger.error("GEMINI_API_KEY não encontrada no .env")
    else:
        genai.configure(api_key=api_key)

        models = ["gemini-flash-latest", "gemini-pro-latest", "gemini-1.5-flash"]

        for model_name in models:
            try:
                logger.info(f"Tentando carregar modelo: {model_name}...")
                ai_model = genai.GenerativeModel(model_name)
                logger.info(f"IA Conectada: {model_name}")
                break
            except Exception as e:
                logger.warning(f"Falha ao carregar {model_name}: {e}")

    yield

    logger.info("Desligando API")


# =========================
# FASTAPI APP
# =========================

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


# =========================
# DB DEPENDENCY
# =========================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# SCHEMAS
# =========================

class ResourceBase(BaseModel):
    title: str = Field(..., min_length=3)
    type: str
    description: Optional[str] = ""
    url: str
    tags: str = ""

class Resource(ResourceBase):
    id: str

class AIRequest(BaseModel):
    title: str
    type: str


# =========================
# MIDDLEWARE
# =========================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    process_time = time.time() - start

    if request.url.path != "/health":
        logger.info(
            f"Method={request.method} Path={request.url.path} "
            f"Status={response.status_code} Latency={process_time:.2f}s"
        )

    return response


# =========================
# HEALTH
# =========================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ai_connected": ai_model is not None,
        "uptime_seconds": round(time.time() - start_time, 2)
    }


# =========================
# CRUD SQLITE
# =========================

@app.get("/resources/", response_model=List[Resource])
def list_resources(db: Session = Depends(get_db)):
    return db.query(ResourceDB).all()


@app.post("/resources/", status_code=201)
def create_resource(resource: ResourceBase, db: Session = Depends(get_db)):
    new_item = ResourceDB(
        id=str(uuid.uuid4()),
        **resource.dict()
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    logger.info(f"Resource Created: ID={new_item.id}")
    return {"message": "Salvo", "id": new_item.id}


@app.put("/resources/{resource_id}")
def update_resource(resource_id: str, resource: ResourceBase, db: Session = Depends(get_db)):
    item = db.query(ResourceDB).filter(ResourceDB.id == resource_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    for key, value in resource.dict().items():
        setattr(item, key, value)

    db.commit()
    logger.info(f"Resource Updated: ID={resource_id}")
    return {"message": "Atualizado"}


@app.delete("/resources/{resource_id}")
def delete_resource(resource_id: str, db: Session = Depends(get_db)):
    item = db.query(ResourceDB).filter(ResourceDB.id == resource_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item não encontrado")

    db.delete(item)
    db.commit()

    logger.info(f"Resource Deleted: ID={resource_id}")
    return {"message": "Excluído"}


# =========================
# SMART ASSIST ROBUSTO
# =========================

@app.post("/smart-assist/")
async def smart_assist(data: AIRequest):
    if not ai_model:
        raise HTTPException(status_code=503, detail="Serviço de IA indisponível")

    req_start = time.time()

    prompt = (
        f"Atue como especialista educacional. Analise: '{data.title}' ({data.type}). "
        "Retorne APENAS JSON válido: "
        '{"suggested_description": "Resumo curto...", '
        '"suggested_tags": ["tag1", "tag2", "tag3"]}'
    )

    try:
        response = await ai_model.generate_content_async(prompt)

        if not response or not response.text:
            raise ValueError("Resposta vazia da IA")

        clean_text = (
            response.text
            .replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:
            result = json.loads(clean_text)
        except json.JSONDecodeError:
            logger.error(f"JSON mal formatado: {clean_text}")
            raise HTTPException(status_code=500, detail="Resposta inválida da IA")

        # Validação estrutural
        if (
            "suggested_description" not in result
            or "suggested_tags" not in result
            or not isinstance(result["suggested_tags"], list)
        ):
            logger.error(f"Estrutura inválida retornada: {result}")
            raise HTTPException(status_code=500, detail="Estrutura inválida da IA")

        # Garantir exatamente 3 tags
        tags = result["suggested_tags"][:3]
        while len(tags) < 3:
            tags.append("educação")

        result["suggested_tags"] = tags

        latency = round(time.time() - req_start, 2)

        logger.info(
            f"AI Request Success | Title='{data.title}' | "
            f"Latency={latency}s"
        )

        return result

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"AI Failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro ao processar IA")
