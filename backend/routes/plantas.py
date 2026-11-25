
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field

import models
from database import get_db

router = APIRouter(prefix="/plantas", tags=["plantas"])


class PlantaCreate(BaseModel):
    nome_popular: str = Field(min_length=2)
    ciclo_colheita_dias: int | None = Field(default=None, gt=0)


@router.get("/")
def listar_plantas(db: Session = Depends(get_db)):
    plantas = db.query(models.TipoPlanta).order_by(
        models.TipoPlanta.nome_popular
    ).all()

    return [
        {
            "id_planta": planta.id_planta,
            "nome_popular": planta.nome_popular,
            "ciclo_colheita_dias": planta.ciclo_colheita_dias
        }
        for planta in plantas
    ]


@router.get("/{id_planta}")
def obter_planta(id_planta: int, db: Session = Depends(get_db)):
    planta = db.query(models.TipoPlanta).filter(
        models.TipoPlanta.id_planta == id_planta
    ).first()

    if planta is None:
        raise HTTPException(
            status_code=404,
            detail="Planta não encontrada"
        )

    return {
        "id_planta": planta.id_planta,
        "nome_popular": planta.nome_popular,
        "ciclo_colheita_dias": planta.ciclo_colheita_dias
    }


@router.post("/", status_code=201)
def cadastrar_planta(
    dados: PlantaCreate,
    db: Session = Depends(get_db)
):
    nome = dados.nome_popular.strip()

    if not nome:
        raise HTTPException(
            status_code=400,
            detail="O nome da planta não pode ficar vazio"
        )

    existente = db.query(models.TipoPlanta).filter(
        models.TipoPlanta.nome_popular.ilike(nome)
    ).first()

    if existente:
        raise HTTPException(
            status_code=409,
            detail="Essa planta já está cadastrada"
        )

    nova_planta = models.TipoPlanta(
        nome_popular=nome,
        ciclo_colheita_dias=dados.ciclo_colheita_dias
    )

    try:
        db.add(nova_planta)
        db.commit()
        db.refresh(nova_planta)

        return {
            "mensagem": "Planta cadastrada com sucesso",
            "planta": {
                "id_planta": nova_planta.id_planta,
                "nome_popular": nova_planta.nome_popular,
                "ciclo_colheita_dias": nova_planta.ciclo_colheita_dias
            }
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao cadastrar planta no Supabase"
        )
