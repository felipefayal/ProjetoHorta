from dataclasses import dataclass
from typing import Optional

@dataclass
class LimiteSensor:
      minimo: Optional[float] = None
      maximo: Optional[float] = None

LIMITES = {
    "umidade_solo": LimiteSensor(minimo=30.0, maximo=80.0),
    "umidade_ar": LimiteSensor(minimo=40.0, maximo=90.0),
    "temperatura": LimiteSensor(minimo=10.0, maximo=30.0),
}

def avaliar_metrica(tipo: str, valor: float):
    limites = LIMITES.get(tipo)

    alertas = []

    if limites is None:
         return alertas

    if limites.minimo is not None and valor < limites.minimo:
         alertas.append(f"{tipo}: abaixo do ideal ({valor})")

    if limites.maximo is not None and valor > limites.maximo:
         alertas.append(f"{tipo}: acima do ideal ({valor})")

    return alertas

def avaliar_leitura(leitura: dict):
    alertas_totais = []

    for tipo, valor in leitura.items():
          resultado = avaliar_metrica(tipo, valor)
          alertas_totais.extend(resultado)

    return alertas_totais

def calcular_estatisticas(valores: list):

     if not valores:
          return {"media": None, "minimo": None, "maximo": None}

     return {
          "media": round(sum(valores) / len(valores), 2),
          "minimo": round(min(valores), 2),
          "maximo": round(max(valores), 2),
     }