from fastapi import APIRouter

from logica.processamento import avaliar_leitura
from schemas import LeituraSensor

router = APIRouter(prefix="/sensores", tags=["sensores"])


@router.get("/{sensor_id}")
def ler_sensor(sensor_id: str):
    return {"sensor_id": sensor_id, "umidade": 45.2}


@router.post("/leituras")
def receber_leitura(leitura: LeituraSensor):
    dados = leitura.model_dump(exclude={"sensor_id", "tipo_planta"})
    tipo_planta = leitura.tipo_planta.strip().lower()
    alertas = avaliar_leitura(dados, tipo_planta)
    print(f"Recebido do sensor {leitura.sensor_id} ({tipo_planta}): {dados}")
    return {"status": "recebido", "dados": leitura, "alertas": alertas}