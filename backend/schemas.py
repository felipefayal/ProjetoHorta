from pydantic import BaseModel, Field


class LeituraSensor(BaseModel):
    sensor_id: str = Field(min_length=1)
    umidade_solo: float = Field(ge=0, le=100)
    umidade_ar: float = Field(ge=0, le=100)
    temperatura: float = Field(ge=-40, le=85)
    luminosidade: float
    tipo_planta: str = "padrao"