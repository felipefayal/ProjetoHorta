<<<<<<< HEAD

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


load_dotenv()

# Recupera a URL de conexão com o PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")

# Verifica se a URL foi configurada
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL não foi configurada no arquivo .env"
    )

# Cria a conexão com o banco.
# pool_pre_ping testa a conexão antes de cada uso e reabre se o
# Supabase já tiver derrubado por inatividade — sem isso, depois
# de um tempo sem uso a próxima requisição quebra com erro de
# conexão encerrada.
engine = create_engine(
    DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg2://",
        1
    ),
    pool_pre_ping=True
)

# Cria sessões para executar operações no banco
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Disponibiliza uma sessão para as rotas da API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
=======
import os
from collections.abc import Generator

import psycopg
from fastapi import HTTPException
from psycopg.rows import dict_row


def connect_database() -> psycopg.Connection:
    database_url = os.getenv("DATABASE_URL", "").strip()
    if not database_url:
        raise HTTPException(
            status_code=503,
            detail="Banco não configurado. Defina DATABASE_URL no ambiente da API.",
        )

    try:
        return psycopg.connect(
            database_url,
            connect_timeout=5,
            row_factory=dict_row,
        )
    except psycopg.Error as error:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível conectar ao banco de dados.",
        ) from error


def get_connection() -> Generator[psycopg.Connection, None, None]:
    connection = connect_database()
    try:
        with connection:
            yield connection
    finally:
        connection.close()
>>>>>>> 9bd6925 (novo)
