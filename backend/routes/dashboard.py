
from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import get_db
from logica.processamento import calcular_estatisticas

router = APIRouter(tags=["dashboard"])


class GardenBed(BaseModel):
    id: str
    name: str
    plant: str
    plantType: str
    moisture: Optional[float] = None
    temperature: Optional[float] = None
    status: Literal[
        "Normal", "Solo seco", "Atenção",
        "Excesso de água", "Sem leitura"
    ]
    lastWatered: Optional[str] = None
    solarExposure: Optional[str] = None
    plantedDate: Optional[str] = None


class GardenAlert(BaseModel):
    id: str
    title: str
    description: str
    timeAgo: str
    timestamp: str
    type: Literal["moisture", "temperature", "record", "system"]
    severity: Literal["warning", "info", "critical"]
    bedId: Optional[str] = None
    read: Optional[bool] = None


class EnvironmentMetric(BaseModel):
    title: str
    value: str
    status: str
    icon: Literal["sun", "cloud-rain", "thermometer", "droplet"]


class ChartDataPoint(BaseModel):
    label: str
    value: float
    time: str
    status: Optional[str] = None


class EstatisticasUmidade(BaseModel):
    media: Optional[float] = None
    minimo: Optional[float] = None
    maximo: Optional[float] = None

class DashboardResumo(BaseModel):
    total_canteiros: int
    total_dispositivos: int
    dispositivos_ativos: int
    alertas_ativos: int
    ultima_leitura: Optional[str] = None
    umidade_solo: Optional[float] = None
    umidade_ar: Optional[float] = None
    temperatura: Optional[float] = None
    luminosidade: Optional[float] = None

class DashboardGraficos(BaseModel):
    umidade: list[ChartDataPoint]
    temperatura: list[ChartDataPoint]

def montar_canteiro(canteiro, db):
    planta = db.query(models.TipoPlanta).filter(
        models.TipoPlanta.id_planta == canteiro.id_planta
    ).first()

    nome_planta = planta.nome_popular if planta else "Não identificada"

    # Verifica quantos canteiros estão associados ao dispositivo.
    # Evita apresentar a mesma leitura como se fosse independente
    # em vários canteiros.
    quantidade_canteiros = db.query(models.Canteiro).filter(
        models.Canteiro.id_dispositivo == canteiro.id_dispositivo
    ).count()

    medicao = None

    if quantidade_canteiros == 1:
        medicao = db.query(models.Medicao).filter(
            models.Medicao.id_dispositivo == canteiro.id_dispositivo
        ).order_by(
            models.Medicao.data_hora.desc()
        ).first()

    irrigacao = db.query(models.HistoricoIrrigacao).filter(
        models.HistoricoIrrigacao.id_canteiro == canteiro.id_canteiro
    ).order_by(
        models.HistoricoIrrigacao.data_hora_inicio.desc()
    ).first()

    if medicao is None:
        status = "Sem leitura"
        umidade = None
        temperatura = None
    else:
        umidade = medicao.umidade_solo
        temperatura = medicao.temperatura

        if umidade < 30:
            status = "Solo seco"
        elif umidade > 70:
            status = "Excesso de água"
        else:
            status = "Normal"

    return {
        "id": str(canteiro.id_canteiro),
        "name": canteiro.nome_identificacao,
        "plant": nome_planta,
        "plantType": nome_planta,
        "moisture": umidade,
        "temperature": temperatura,
        "status": status,
        "lastWatered": (
            irrigacao.data_hora_inicio.isoformat()
            if irrigacao else None
        ),
        "solarExposure": None,
        "plantedDate": None
    }


@router.get(
    "/dashboard/canteiros",
    response_model=list[GardenBed]
)
def listar_canteiros(db: Session = Depends(get_db)):
    canteiros = db.query(models.Canteiro).order_by(
        models.Canteiro.id_canteiro
    ).all()

    return [montar_canteiro(c, db) for c in canteiros]


@router.get(
    "/dashboard/canteiros/{bed_id}",
    response_model=GardenBed
)
def obter_canteiro(
    bed_id: str,
    db: Session = Depends(get_db)
):
    try:
        id_canteiro = int(bed_id)
    except ValueError:
        raise HTTPException(
            status_code=404,
            detail="Canteiro não encontrado"
        )

    canteiro = db.query(models.Canteiro).filter(
        models.Canteiro.id_canteiro == id_canteiro
    ).first()

    if canteiro is None:
        raise HTTPException(
            status_code=404,
            detail="Canteiro não encontrado"
        )

    return montar_canteiro(canteiro, db)



@router.get("/alertas", response_model=list[GardenAlert])
def listar_alertas(db: Session = Depends(get_db)):
    alertas = (
        db.query(models.Alerta)
        .order_by(models.Alerta.data_hora.desc())
        .all()
    )

    resultado = []

    for alerta in alertas:
        medicao = db.query(models.Medicao).filter(
            models.Medicao.id_medicao == alerta.id_medicao
        ).first()

        canteiro = None

        if medicao:
            canteiros = db.query(models.Canteiro).filter(
                models.Canteiro.id_dispositivo == medicao.id_dispositivo
            ).all()

            # Só associa quando existe um único canteiro
            if len(canteiros) == 1:
                canteiro = canteiros[0]

        resultado.append({
            "id": str(alerta.id_alerta),
            "title": alerta.tipo or "Alerta",
            "description": alerta.mensagem or "",
            "timeAgo": (
                alerta.data_hora.isoformat()
                if alerta.data_hora else ""
            ),
            "timestamp": (
                alerta.data_hora.strftime("%H:%M")
                if alerta.data_hora else ""
            ),
            "type": (
                alerta.tipo
                if alerta.tipo in [
                    "moisture", "temperature", "record", "system"
                ]
                else "system"
            ),
            "severity": "warning",
            "bedId": (
                str(canteiro.id_canteiro)
                if canteiro else None
            ),
            "read": False
        })

    return resultado



@router.get(
    "/metricas-ambiente",
    response_model=list[EnvironmentMetric]
)
def metricas_ambiente(db: Session = Depends(get_db)):
    medicao = db.query(models.Medicao).order_by(
        models.Medicao.data_hora.desc()
    ).first()

    if medicao is None:
        return []

    return [
        {
            "title": "Luminosidade",
            "value": f"{medicao.luminosidade:g}",
            "status": "Última leitura",
            "icon": "sun"
        },
        {
            "title": "Umidade do ar",
            "value": f"{medicao.umidade_ar:g}%",
            "status": "Última leitura",
            "icon": "droplet"
        },
        {
            "title": "Temperatura",
            "value": f"{medicao.temperatura:g}°C",
            "status": "Última leitura",
            "icon": "thermometer"
        }
    ]


@router.get(
    "/graficos/umidade",
    response_model=list[ChartDataPoint]
)
def grafico_umidade(
    periodo: Literal["24h", "7d", "30d"] = "24h",
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta, timezone

    dias = {"24h": 1, "7d": 7, "30d": 30}
    limite = datetime.now(timezone.utc) - timedelta(days=dias[periodo])

    medicoes = db.query(models.Medicao).filter(
        models.Medicao.data_hora >= limite
    ).order_by(
        models.Medicao.data_hora.asc()
    ).all()

    return [
        {
            "label": m.data_hora.strftime("%d/%m %H:%M"),
            "value": m.umidade_solo,
            "time": m.data_hora.isoformat(),
            "status": "Medição registrada"
        }
        for m in medicoes
        if m.umidade_solo is not None
    ]


@router.get(
    "/graficos/umidade/estatisticas",
    response_model=EstatisticasUmidade
)
def estatisticas_umidade(
    periodo: Literal["24h", "7d", "30d"] = "24h",
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta, timezone

    dias = {"24h": 1, "7d": 7, "30d": 30}
    limite = datetime.now(timezone.utc) - timedelta(days=dias[periodo])

    medicoes = db.query(models.Medicao).filter(
        models.Medicao.data_hora >= limite
    ).all()

    valores = [
        m.umidade_solo
        for m in medicoes
        if m.umidade_solo is not None
    ]

    return calcular_estatisticas(valores)

@router.get(
    "/dashboard/resumo",
    response_model=DashboardResumo
)
def resumo_dashboard(db: Session = Depends(get_db)):

    total_canteiros = db.query(models.Canteiro).count()

    total_dispositivos = db.query(models.Dispositivo).count()

    dispositivos_ativos = db.query(models.Dispositivo).filter(
        models.Dispositivo.status == True
    ).count()

    alertas_ativos = db.query(models.Alerta).filter(
        models.Alerta.status_resolvido == False
    ).count()

    ultima_medicao = db.query(models.Medicao).order_by(
        models.Medicao.data_hora.desc()
    ).first()

    return {
        "total_canteiros": total_canteiros,
        "total_dispositivos": total_dispositivos,
        "dispositivos_ativos": dispositivos_ativos,
        "alertas_ativos": alertas_ativos,
        "ultima_leitura": (
            ultima_medicao.data_hora.isoformat()
            if ultima_medicao and ultima_medicao.data_hora
            else None
        ),
        "umidade_solo": (
            ultima_medicao.umidade_solo if ultima_medicao else None
        ),
        "umidade_ar": (
            ultima_medicao.umidade_ar if ultima_medicao else None
        ),
        "temperatura": (
            ultima_medicao.temperatura if ultima_medicao else None
        ),
        "luminosidade": (
            ultima_medicao.luminosidade if ultima_medicao else None
        )
    }

@router.get(
    "/dashboard/graficos",
    response_model=DashboardGraficos
)
def dashboard_graficos(
    periodo: Literal["24h", "7d", "30d"] = "24h",
    db: Session = Depends(get_db)
):
    from datetime import datetime, timedelta, timezone

    dias = {"24h": 1, "7d": 7, "30d": 30}
    limite = datetime.now(timezone.utc) - timedelta(days=dias[periodo])

    medicoes = db.query(models.Medicao).filter(
        models.Medicao.data_hora >= limite
    ).order_by(
        models.Medicao.data_hora.asc()
    ).all()

    umidade = []
    temperatura = []

    for m in medicoes:
        if m.umidade_solo is not None:
            umidade.append({
                "label": m.data_hora.strftime("%d/%m %H:%M"),
                "value": m.umidade_solo,
                "time": m.data_hora.isoformat(),
                "status": "Umidade do solo"
            })

        if m.temperatura is not None:
            temperatura.append({
                "label": m.data_hora.strftime("%d/%m %H:%M"),
                "value": m.temperatura,
                "time": m.data_hora.isoformat(),
                "status": "Temperatura"
            })

    return {
        "umidade": umidade,
        "temperatura": temperatura
    }