from typing import Literal, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .dados_exemplo import CANTEIROS, ALERTAS, METRICAS_AMBIENTE, GRAFICOS
from logica.processamento import calcular_estatisticas

router = APIRouter(tags=["dashboard"])


class GardenBed(BaseModel):
    id: str
    name: str
    plant: str
    plantType: str
    moisture: float
    temperature: float
    status: Literal["Normal", "Solo seco", "Atenção", "Excesso de água"]
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


@router.get("/canteiros", response_model=list[GardenBed])
def listar_canteiros():
    return CANTEIROS


@router.get("/canteiros/{bed_id}", response_model=GardenBed)
def obter_canteiro(bed_id: str):
    for canteiro in CANTEIROS:
        if canteiro["id"] == bed_id:
            return canteiro
    raise HTTPException(status_code=404, detail="Canteiro não encontrado")


@router.get("/alertas", response_model=list[GardenAlert])
def listar_alertas():
    return ALERTAS


@router.get("/metricas-ambiente", response_model=list[EnvironmentMetric])
def metricas_ambiente():
    return METRICAS_AMBIENTE


@router.get("/graficos/umidade", response_model=list[ChartDataPoint])
def grafico_umidade(periodo: Literal["24h", "7d", "30d"] = "24h"):
    return GRAFICOS[periodo]

class EstatisticasUmidade(BaseModel):
    media: Optional[float] = None
    minimo: Optional[float] = None
    maximo: Optional[float] = None


@router.get("/graficos/umidade/estatisticas", response_model=EstatisticasUmidade)
def estatisticas_umidade(periodo: Literal["24h", "7d", "30d"] = "24h"):
    valores = [ponto["value"] for ponto in GRAFICOS[periodo]]
    return calcular_estatisticas(valores)