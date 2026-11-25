

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

import models
from database import get_db
from schemas import IrrigacaoCreate

router = APIRouter(
    prefix="/irrigacoes",
    tags=["irrigacoes"]
)


# Converter uma irrigação em dicionário
def converter_irrigacao(irrigacao):
    return {
        "id_irrigacao": irrigacao.id_irrigacao,
        "id_canteiro": irrigacao.id_canteiro,
        "id_user": irrigacao.id_user,
        "data_hora_inicio": irrigacao.data_hora_inicio
    }


# Listar todas as irrigações
@router.get("/")
def listar_irrigacoes(db: Session = Depends(get_db)):
    irrigacoes = (
        db.query(models.HistoricoIrrigacao)
        .order_by(
            models.HistoricoIrrigacao.data_hora_inicio.desc()
        )
        .all()
    )

    return [converter_irrigacao(i) for i in irrigacoes]


# Buscar uma irrigação pelo ID
@router.get("/{id_irrigacao}")
def obter_irrigacao(
    id_irrigacao: int,
    db: Session = Depends(get_db)
):
    irrigacao = (
        db.query(models.HistoricoIrrigacao)
        .filter(
            models.HistoricoIrrigacao.id_irrigacao == id_irrigacao
        )
        .first()
    )

    if irrigacao is None:
        raise HTTPException(
            status_code=404,
            detail="Irrigação não encontrada"
        )

    return converter_irrigacao(irrigacao)


# Listar irrigações de um canteiro
# Esta rota fica antes da rota com {id_irrigacao}
@router.get("/canteiro/{id_canteiro}")

# Listar irrigações de um canteiro
@router.get("/canteiro/{id_canteiro}")
def listar_irrigacoes_canteiro(
    id_canteiro: int,
    db: Session = Depends(get_db)
):
    canteiro = db.query(models.Canteiro).filter(
        models.Canteiro.id_canteiro == id_canteiro
    ).first()

    if canteiro is None:
        raise HTTPException(
            status_code=404,
            detail="Canteiro não encontrado"
        )

    irrigacoes = (
        db.query(models.HistoricoIrrigacao)
        .filter(
            models.HistoricoIrrigacao.id_canteiro == id_canteiro
        )
        .order_by(
            models.HistoricoIrrigacao.data_hora_inicio.desc()
        )
        .all()
    )

    return [converter_irrigacao(i) for i in irrigacoes]



# Registrar uma irrigação
@router.post("/", status_code=201)
def registrar_irrigacao(
    dados: IrrigacaoCreate,
    db: Session = Depends(get_db)
):
    # Verificar se o canteiro existe
    canteiro = db.query(models.Canteiro).filter(
        models.Canteiro.id_canteiro == dados.id_canteiro
    ).first()

    if canteiro is None:
        raise HTTPException(
            status_code=404,
            detail="Canteiro não encontrado"
        )

    # Verificar se o usuário existe
    usuario = db.query(models.Usuario).filter(
        models.Usuario.id_user == dados.id_user
    ).first()

    if usuario is None:
        raise HTTPException(
            status_code=404,
            detail="Usuário não encontrado"
        )

    # Criar o registro de irrigação
    nova_irrigacao = models.HistoricoIrrigacao(
        id_canteiro=dados.id_canteiro,
        id_user=dados.id_user,
        data_hora_inicio=datetime.now(timezone.utc)
    )

    try:
        db.add(nova_irrigacao)
        db.commit()
        db.refresh(nova_irrigacao)

        return {
            "mensagem": "Irrigação registrada com sucesso",
            "irrigacao": converter_irrigacao(nova_irrigacao)
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao registrar irrigação no banco de dados"
        )