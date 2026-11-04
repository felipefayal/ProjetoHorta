
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field

import models
from database import get_db

router = APIRouter(prefix="/canteiros", tags=["canteiros"])


# Dados necessários para cadastrar um canteiro
class CanteiroCreate(BaseModel):
    nome_identificacao: str = Field(min_length=2)
    id_planta: int = Field(gt=0)
    id_dispositivo: int = Field(gt=0)


# Listar todos os canteiros
@router.get("/")
def listar_canteiros(db: Session = Depends(get_db)):

    canteiros = db.query(models.Canteiro).order_by(
        models.Canteiro.id_canteiro
    ).all()

    return [
        {
            "id_canteiro": c.id_canteiro,
            "nome_identificacao": c.nome_identificacao,
            "id_planta": c.id_planta,
            "id_dispositivo": c.id_dispositivo
        }
        for c in canteiros
    ]


# Testar diretamente a consulta ao banco
@router.get("/teste-banco")
def testar_banco(db: Session = Depends(get_db)):

    canteiros = db.query(models.Canteiro).all()

    return {
        "total": len(canteiros),
        "registros": [
            {
                "id": c.id_canteiro,
                "nome": c.nome_identificacao
            }
            for c in canteiros
        ]
    }


# Consultar um canteiro pelo ID
@router.get("/{id_canteiro}")
def obter_canteiro(
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

    return {
        "id_canteiro": canteiro.id_canteiro,
        "nome_identificacao": canteiro.nome_identificacao,
        "id_planta": canteiro.id_planta,
        "id_dispositivo": canteiro.id_dispositivo
    }


# Cadastrar um novo canteiro
@router.post("/", status_code=201)
def cadastrar_canteiro(
    dados: CanteiroCreate,
    db: Session = Depends(get_db)
):

    nome = dados.nome_identificacao.strip()

    if not nome:
        raise HTTPException(
            status_code=400,
            detail="O nome do canteiro não pode ficar vazio"
        )

    # Verificar se a planta existe
    planta = db.query(models.TipoPlanta).filter(
        models.TipoPlanta.id_planta == dados.id_planta
    ).first()

    if planta is None:
        raise HTTPException(
            status_code=404,
            detail="Planta não encontrada"
        )

    # Verificar se o dispositivo existe
    dispositivo = db.query(models.Dispositivo).filter(
        models.Dispositivo.id_dispositivo == dados.id_dispositivo
    ).first()

    if dispositivo is None:
        raise HTTPException(
            status_code=404,
            detail="Dispositivo não encontrado"
        )

    novo_canteiro = models.Canteiro(
        nome_identificacao=nome,
        id_planta=dados.id_planta,
        id_dispositivo=dados.id_dispositivo
    )

    try:
        db.add(novo_canteiro)
        db.commit()
        db.refresh(novo_canteiro)

        return {
            "mensagem": "Canteiro cadastrado com sucesso",
            "canteiro": {
                "id_canteiro": novo_canteiro.id_canteiro,
                "nome_identificacao": novo_canteiro.nome_identificacao,
                "id_planta": novo_canteiro.id_planta,
                "id_dispositivo": novo_canteiro.id_dispositivo
            }
        }

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Erro ao cadastrar canteiro no banco de dados"
        )
# Consultar histórico de medições de um canteiro
@router.get("/{id_canteiro}/medicoes")
def listar_medicoes_canteiro(
    id_canteiro: int,
    db: Session = Depends(get_db)
):
    # Verificar se o canteiro existe
    canteiro = db.query(models.Canteiro).filter(
        models.Canteiro.id_canteiro == id_canteiro
    ).first()

    if canteiro is None:
        raise HTTPException(
            status_code=404,
            detail="Canteiro não encontrado"
        )

    # Verificar se possui dispositivo associado
    if canteiro.id_dispositivo is None:
        return {
            "canteiro_id": id_canteiro,
            "historico_compartilhado": False,
            "mensagem": "Este canteiro não possui dispositivo associado.",
            "medicoes": []
        }

    # Verificar quantos canteiros utilizam o mesmo dispositivo
    quantidade_canteiros = db.query(models.Canteiro).filter(
        models.Canteiro.id_dispositivo == canteiro.id_dispositivo
    ).count()

    # Evitar atribuir a mesma leitura a vários canteiros
    if quantidade_canteiros > 1:
        return {
            "canteiro_id": id_canteiro,
            "dispositivo_id": canteiro.id_dispositivo,
            "historico_compartilhado": True,
            "mensagem": (
                "O dispositivo está associado a vários canteiros. "
                "As medições não podem ser atribuídas exclusivamente "
                "a este canteiro."
            ),
            "medicoes": []
        }

    # Buscar o histórico de medições
    medicoes = db.query(models.Medicao).filter(
        models.Medicao.id_dispositivo == canteiro.id_dispositivo
    ).order_by(
        models.Medicao.data_hora.desc()
    ).all()

    return {
        "canteiro_id": id_canteiro,
        "dispositivo_id": canteiro.id_dispositivo,
        "historico_compartilhado": False,
        "mensagem": "Histórico de medições do canteiro.",
        "medicoes": [
            {
                "id_medicao": m.id_medicao,
                "data_hora": (
                    m.data_hora.isoformat()
                    if m.data_hora else None
                ),
                "umidade_solo": m.umidade_solo,
                "umidade_ar": m.umidade_ar,
                "temperatura": m.temperatura,
                "luminosidade": m.luminosidade
            }
            for m in medicoes
        ]
    }