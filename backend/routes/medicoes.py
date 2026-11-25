from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

import models
from database import get_db
from schemas import LeituraSensor

router = APIRouter(
    prefix="/medicoes",
    tags=["medições"]
)


# Transformar uma medição em dicionário
def converter_medicao(medicao):
    return {
        "id_medicao": medicao.id_medicao,
        "id_dispositivo": medicao.id_dispositivo,
        "data_hora": medicao.data_hora,
        "umidade_solo": medicao.umidade_solo,
        "umidade_ar": medicao.umidade_ar,
        "temperatura": medicao.temperatura,
        "luminosidade": medicao.luminosidade
    }


# Listar todas as medições
@router.get("/")
def listar_medicoes(db: Session = Depends(get_db)):
    medicoes = (
        db.query(models.Medicao)
        .order_by(models.Medicao.data_hora.desc())
        .all()
    )

    return [converter_medicao(m) for m in medicoes]


# Listar medições de um dispositivo
@router.get("/dispositivo/{id_dispositivo}")
def listar_medicoes_dispositivo(
    id_dispositivo: int,
    db: Session = Depends(get_db)
):
    medicoes = (
        db.query(models.Medicao)
        .filter(models.Medicao.id_dispositivo == id_dispositivo)
        .order_by(models.Medicao.data_hora.desc())
        .all()
    )

    return [converter_medicao(m) for m in medicoes]


# Consultar uma medição pelo ID
@router.get("/{id_medicao}")
def obter_medicao(
    id_medicao: int,
    db: Session = Depends(get_db)
):
    medicao = (
        db.query(models.Medicao)
        .filter(models.Medicao.id_medicao == id_medicao)
        .first()
    )

    if medicao is None:
        raise HTTPException(
            status_code=404,
            detail="Medição não encontrada"
        )

    return converter_medicao(medicao)


# Registrar uma nova medição
@router.post("/", status_code=201)
def registrar_medicao(
    leitura: LeituraSensor,
    db: Session = Depends(get_db)
):
    dados = leitura.model_dump(exclude={"tipo_planta"})

    nova_medicao = models.Medicao(
        **dados,
        data_hora=datetime.now(timezone.utc)
    )

    try:
        db.add(nova_medicao)
        db.commit()
        db.refresh(nova_medicao)

        return {
            "mensagem": "Medição registrada com sucesso",
            "medicao": converter_medicao(nova_medicao)
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao salvar a medição no banco de dados"
        )
