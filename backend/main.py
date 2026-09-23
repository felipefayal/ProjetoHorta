from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/")
def home():
    return {"mensagem": "API da horta no ar"}

@app.get("/sensores/{sensor_id}")
def ler_sensor(sensor_id: str):
    return {"sensor_id": sensor_id, "umidade": 45.2}

class LeituraSensor(BaseModel):
    sensor_id: str
    umidade: float
    temperatura: float

@app.post("/sensores/leituras")
def receber_leitura(leitura: LeituraSensor):
    print(f"Recebido do sensor {leitura.sensor_id}: umidade={leitura.umidade}, temp={leitura.temperatura}")
    return {"status": "recebido", "dados": leitura}