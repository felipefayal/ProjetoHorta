from typing import Literal

from pydantic import BaseModel, Field
from typing import Optional


class LeituraSensor(BaseModel):
    id_dispositivo: int = Field(gt=0)

    umidade_solo: float = Field(ge=0, le=100)
    umidade_ar: float = Field(ge=0, le=100)

    temperatura: float = Field(ge=-40, le=85)
<<<<<<< HEAD

    luminosidade: float = Field(ge=0, le=120000)

    tipo_planta: str = "padrao"


class DispositivoCreate(BaseModel):
    nome: str
    localizacao: str
    status: bool = True
    bateria: Optional[int] = None
    sinal_dbm: Optional[int] = None



class IrrigacaoCreate(BaseModel):
    id_canteiro: int = Field(gt=0)
    id_user: int = Field(gt=0)
=======
    luminosidade: float
    tipo_planta: str = "padrao"


class RegistroHorta(BaseModel):
    bed_id: str = Field(alias="bedId", min_length=1)
    type: Literal["irrigacao", "leitura", "plantio"]
    moisture: float = Field(ge=0, le=100)
    temperature: float = Field(ge=-40, le=85)
    notes: str = ""
    plant_name: str | None = Field(default=None, alias="plantName")
>>>>>>> 9bd6925 (novo)
