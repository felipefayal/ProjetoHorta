<<<<<<< HEAD

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

import models
from database import get_db
from logica.processamento import calcular_estatisticas
=======
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Literal, Optional

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_connection
from schemas import RegistroHorta
from security import get_current_user
>>>>>>> 9bd6925 (novo)

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
    deviceId: Optional[int] = None


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


<<<<<<< HEAD
class EstatisticasUmidade(BaseModel):
    media: Optional[float] = None
    minimo: Optional[float] = None
    maximo: Optional[float] = None
=======
class GardenBedActionResponse(BaseModel):
    bed: GardenBed
    alerts: list[GardenAlert]


BED_QUERY = """
SELECT c.id_canteiro, c.nome_identificacao, c.id_dispositivo,
       tp.nome_popular,
       leitura.umidade_solo, leitura.temperatura,
       irrigacao.data_hora_inicio AS ultima_irrigacao
FROM canteiro AS c
LEFT JOIN tipo_planta AS tp ON tp.id_planta = c.id_planta
LEFT JOIN LATERAL (
    SELECT m.umidade_solo, m.temperatura
    FROM medicao AS m
    WHERE m.id_dispositivo = c.id_dispositivo
    ORDER BY m.data_hora DESC
    LIMIT 1
) AS leitura ON TRUE
LEFT JOIN LATERAL (
    SELECT h.data_hora_inicio
    FROM historico_irrigacao AS h
    WHERE h.id_canteiro = c.id_canteiro
    ORDER BY h.data_hora_inicio DESC
    LIMIT 1
) AS irrigacao ON TRUE
"""


def _bed_from_row(row: dict) -> dict:
    moisture = float(row["umidade_solo"]) if row["umidade_solo"] is not None else 0
    temperature = float(row["temperatura"]) if row["temperatura"] is not None else 0
    status = (
        "Atenção"
        if row["umidade_solo"] is None
        else "Solo seco"
        if moisture < 40
        else "Excesso de água"
        if moisture > 80
        else "Normal"
    )
    last_watered = row["ultima_irrigacao"]
    return {
        "id": str(row["id_canteiro"]),
        "name": row["nome_identificacao"],
        "plant": row["nome_popular"] or "Não cadastrada",
        "plantType": row["nome_popular"] or "Não cadastrada",
        "moisture": moisture,
        "temperature": temperature,
        "status": status,
        "lastWatered": last_watered.isoformat() if last_watered else None,
        "solarExposure": None,
        "plantedDate": None,
        "deviceId": row["id_dispositivo"],
    }


def _get_bed(connection: psycopg.Connection, bed_id: str) -> dict:
    row = connection.execute(
        BED_QUERY + " WHERE c.id_canteiro::text = %s",
        (bed_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Canteiro não encontrado.")
    return _bed_from_row(row)


def _time_ago(value: datetime) -> str:
    seconds = max(0, int((datetime.now(value.tzinfo) - value).total_seconds()))
    if seconds < 60:
        return "Agora"
    if seconds < 3600:
        return f"Há {seconds // 60} min"
    if seconds < 86400:
        return f"Há {seconds // 3600}h"
    return f"Há {seconds // 86400} dias"


def _list_alerts(connection: psycopg.Connection) -> list[dict]:
    rows = connection.execute(
        """
        SELECT a.id_alerta, a.tipo, a.mensagem, a.data_hora,
               a.status_resolvido, c.id_canteiro
        FROM alerta AS a
        LEFT JOIN medicao AS m ON m.id_medicao = a.id_medicao
        LEFT JOIN LATERAL (
            SELECT id_canteiro
            FROM canteiro
            WHERE id_dispositivo = m.id_dispositivo
            ORDER BY id_canteiro
            LIMIT 1
        ) AS c ON TRUE
        ORDER BY a.data_hora DESC, a.id_alerta DESC
        LIMIT 100
        """
    ).fetchall()
    alerts = []
    for row in rows:
        kind = str(row["tipo"]).lower()
        alert_type = (
            "moisture"
            if "umidade" in kind or "moisture" in kind
            else "temperature"
            if "temperatura" in kind or "temperature" in kind
            else "system"
        )
        severity = (
            "critical"
            if "crit" in kind or "baixa" in kind or "high" in kind
            else "warning"
        )
        created_at = row["data_hora"]
        alerts.append(
            {
                "id": str(row["id_alerta"]),
                "title": str(row["tipo"]).replace("_", " ").capitalize(),
                "description": row["mensagem"],
                "timeAgo": _time_ago(created_at),
                "timestamp": created_at.isoformat(),
                "type": alert_type,
                "severity": severity,
                "bedId": str(row["id_canteiro"]) if row["id_canteiro"] is not None else None,
                "read": bool(row["status_resolvido"]),
            }
        )
    return alerts


@router.get("/canteiros", response_model=list[GardenBed])
def listar_canteiros(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    rows = connection.execute(BED_QUERY + " ORDER BY c.id_canteiro").fetchall()
    return [_bed_from_row(row) for row in rows]


@router.get("/canteiros/{bed_id}", response_model=GardenBed)
def obter_canteiro(
    bed_id: str,
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    return _get_bed(connection, bed_id)


@router.get("/alertas", response_model=list[GardenAlert])
def listar_alertas(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    return _list_alerts(connection)


@router.patch("/alertas/lidas", response_model=list[GardenAlert])
def marcar_alertas_como_lidos(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    connection.execute("UPDATE alerta SET status_resolvido = TRUE")
    return _list_alerts(connection)


@router.get("/metricas-ambiente", response_model=list[EnvironmentMetric])
def metricas_ambiente(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    row = connection.execute(
        """
        SELECT umidade_solo, umidade_ar, temperatura, luminosidade
        FROM medicao
        ORDER BY data_hora DESC
        LIMIT 1
        """
    ).fetchone()
    if not row:
        return []

    metrics = []
    if row["umidade_solo"] is not None:
        metrics.append(
            {
                "title": "Umidade do solo",
                "value": f'{float(row["umidade_solo"]):.1f}%',
                "status": "Leitura mais recente",
                "icon": "droplet",
            }
        )
    if row["umidade_ar"] is not None:
        metrics.append(
            {
                "title": "Umidade do ar",
                "value": f'{float(row["umidade_ar"]):.1f}%',
                "status": "Leitura mais recente",
                "icon": "cloud-rain",
            }
        )
    if row["temperatura"] is not None:
        metrics.append(
            {
                "title": "Temperatura",
                "value": f'{float(row["temperatura"]):.1f}°C',
                "status": "Leitura mais recente",
                "icon": "thermometer",
            }
        )
    if row["luminosidade"] is not None:
        metrics.append(
            {
                "title": "Luminosidade",
                "value": str(row["luminosidade"]),
                "status": "Leitura mais recente",
                "icon": "sun",
            }
        )
    return metrics


@router.get("/graficos/umidade", response_model=list[ChartDataPoint])
def grafico_umidade(
    periodo: Literal["24h", "7d", "30d"] = "24h",
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    days = {"24h": 1, "7d": 7, "30d": 30}[periodo]
    rows = connection.execute(
        """
        SELECT data_hora, umidade_solo
        FROM medicao
        WHERE data_hora >= NOW() - (%s * INTERVAL '1 day')
          AND umidade_solo IS NOT NULL
        ORDER BY data_hora
        """,
        (days,),
    ).fetchall()

    buckets: dict[datetime, list[float]] = defaultdict(list)
    for row in rows:
        value = row["data_hora"]
        if periodo == "24h":
            key = value.replace(minute=0, second=0, microsecond=0)
        elif periodo == "7d":
            key = value.replace(hour=0, minute=0, second=0, microsecond=0)
        else:
            start_of_week = value - timedelta(days=value.weekday())
            key = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        buckets[key].append(float(row["umidade_solo"]))

    points = []
    for time, values in sorted(buckets.items()):
        label = time.strftime("%Hh") if periodo == "24h" else time.strftime("%d/%m")
        points.append(
            {
                "label": label,
                "time": time.isoformat(),
                "value": sum(values) / len(values),
                "status": None,
            }
        )
    return points
>>>>>>> 9bd6925 (novo)

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

<<<<<<< HEAD
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
=======
@router.post(
    "/canteiros/{bed_id}/irrigacao",
    response_model=GardenBedActionResponse,
)
def irrigar_canteiro(
    bed_id: str,
    user: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    row = connection.execute(
        "SELECT id_canteiro FROM canteiro WHERE id_canteiro::text = %s",
        (bed_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Canteiro não encontrado.")
    connection.execute(
        """
        INSERT INTO historico_irrigacao (id_canteiro, id_user, data_hora_inicio)
        VALUES (%s, %s, NOW())
        """,
        (row["id_canteiro"], user["id"]),
    )
    return {"bed": _get_bed(connection, bed_id), "alerts": _list_alerts(connection)}


@router.post("/registros")
def criar_registro(
    registro: RegistroHorta,
    user: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    row = connection.execute(
        """
        SELECT id_canteiro, id_dispositivo
        FROM canteiro
        WHERE id_canteiro::text = %s
        """,
        (registro.bed_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Canteiro não encontrado.")

    if registro.type == "irrigacao":
        connection.execute(
            """
            INSERT INTO historico_irrigacao (id_canteiro, id_user, data_hora_inicio)
            VALUES (%s, %s, NOW())
            """,
            (row["id_canteiro"], user["id"]),
        )
    elif registro.type == "leitura":
        if row["id_dispositivo"] is None:
            raise HTTPException(
                status_code=409,
                detail="Vincule um dispositivo ao canteiro antes de registrar leituras.",
            )
        connection.execute(
            """
            INSERT INTO medicao (id_dispositivo, data_hora, umidade_solo, temperatura)
            VALUES (%s, NOW(), %s, %s)
            """,
            (row["id_dispositivo"], registro.moisture, registro.temperature),
        )
    elif registro.type == "plantio" and registro.plant_name:
        plant = connection.execute(
            "SELECT id_planta FROM tipo_planta WHERE lower(nome_popular) = lower(%s)",
            (registro.plant_name.strip(),),
        ).fetchone()
        if not plant:
            raise HTTPException(
                status_code=404,
                detail="Planta não cadastrada em tipo_planta.",
            )
        connection.execute(
            "UPDATE canteiro SET id_planta = %s WHERE id_canteiro = %s",
            (plant["id_planta"], row["id_canteiro"]),
        )

    bed = _get_bed(connection, registro.bed_id)
    return {
        "bed": bed,
        "alert": None,
        "alerts": _list_alerts(connection),
    }
>>>>>>> 9bd6925 (novo)
