

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
from database import get_db
from schemas import DispositivoCreate

router = APIRouter(
    prefix="/dispositivos",
    tags=["dispositivos"]
)


# Listar todos os dispositivos cadastrados
@router.get("/")
def listar_dispositivos(db: Session = Depends(get_db)):
    dispositivos = db.query(models.Dispositivo).all()

    return [
        {
            "id_dispositivo": d.id_dispositivo,
            "nome": d.nome,
            "localizacao": d.localizacao,
            "status": d.status,
            "bateria": d.bateria,
            "sinal_dbm": d.sinal_dbm
        }
        for d in dispositivos
    ]


# Consultar um dispositivo pelo ID
@router.get("/{id_dispositivo}")
def obter_dispositivo(
    id_dispositivo: int,
    db: Session = Depends(get_db)
):
    dispositivo = (
        db.query(models.Dispositivo)
        .filter(
            models.Dispositivo.id_dispositivo == id_dispositivo
        )
        .first()
    )

    if dispositivo is None:
        raise HTTPException(
            status_code=404,
            detail="Dispositivo não encontrado"
        )

    return {
        "id_dispositivo": dispositivo.id_dispositivo,
        "nome": dispositivo.nome,
        "localizacao": dispositivo.localizacao,
        "status": dispositivo.status,
        "bateria": dispositivo.bateria,
        "sinal_dbm": dispositivo.sinal_dbm
    }


# Cadastrar um novo dispositivo
@router.post("/", status_code=201)
def cadastrar_dispositivo(
    dispositivo: DispositivoCreate,
    db: Session = Depends(get_db)
):
    novo_dispositivo = models.Dispositivo(
        **dispositivo.model_dump()
    )

    db.add(novo_dispositivo)
    db.commit()
    db.refresh(novo_dispositivo)

    return {
        "mensagem": "Dispositivo cadastrado com sucesso",
        "dispositivo": {
            "id_dispositivo": novo_dispositivo.id_dispositivo,
            "nome": novo_dispositivo.nome,
            "localizacao": novo_dispositivo.localizacao,
            "status": novo_dispositivo.status,
            "bateria": novo_dispositivo.bateria,
            "sinal_dbm": novo_dispositivo.sinal_dbm
        }
    }
# Consultar status e última comunicação do dispositivo
@router.get("/{id_dispositivo}/status")
def consultar_status_dispositivo(
    id_dispositivo: int,
    db: Session = Depends(get_db)
):
    dispositivo = db.query(models.Dispositivo).filter(
        models.Dispositivo.id_dispositivo == id_dispositivo
    ).first()

    if dispositivo is None:
        raise HTTPException(
            status_code=404,
            detail="Dispositivo não encontrado"
        )

    ultima_medicao = db.query(models.Medicao).filter(
        models.Medicao.id_dispositivo == id_dispositivo
    ).order_by(
        models.Medicao.data_hora.desc()
    ).first()

    return {
        "id_dispositivo": dispositivo.id_dispositivo,
        "nome": dispositivo.nome,
        "localizacao": dispositivo.localizacao,
        "status": dispositivo.status,
        "bateria": dispositivo.bateria,
        "sinal_dbm": dispositivo.sinal_dbm,
        "possui_medicao": ultima_medicao is not None,
        "ultima_comunicacao": (
            ultima_medicao.data_hora.isoformat()
            if ultima_medicao and ultima_medicao.data_hora
            else None
        )
    }