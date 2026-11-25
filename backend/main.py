import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_connection
from routes.auth import router as auth_router
from routes.colegios import router as colegios_router
from routes.dashboard import router as dashboard_router
from routes.sensores import router as sensores_router
from routes.dispositivos import router as dispositivos_router
from routes.medicoes import router as medicoes_router
from routes.irrigacoes import router as irrigacoes_router
from routes.plantas import router as plantas_router
from routes.canteiros import router as canteiros_router
from routes.usuarios import router as usuarios_router

app = FastAPI()
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(colegios_router)
app.include_router(sensores_router)
app.include_router(dashboard_router)
app.include_router(dispositivos_router)
app.include_router(medicoes_router)
app.include_router(irrigacoes_router)
app.include_router(plantas_router)
app.include_router(canteiros_router)
app.include_router(usuarios_router)

@app.get("/")
def home():
    return {"mensagem": "API da horta no ar"}
<<<<<<< HEAD
=======


@app.get("/health", tags=["monitoramento"])
def health(connection=Depends(get_connection)):
    connection.execute("SELECT 1")
    return {"status": "ok", "database": "connected"}
>>>>>>> 9bd6925 (novo)
