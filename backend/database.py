
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
