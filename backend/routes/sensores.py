<<<<<<< HEAD

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

import models
from database import get_db
=======
import psycopg
from fastapi import APIRouter, Depends, HTTPException

from database import get_connection
>>>>>>> 9bd6925 (novo)
from logica.processamento import avaliar_leitura
from schemas import LeituraSensor
from security import get_current_user, verify_sensor_request

router = APIRouter(prefix="/sensores", tags=["sensores"])


<<<<<<< HEAD


@router.get("/{id_dispositivo}")
def ler_sensor(
    id_dispositivo: int,
    db: Session = Depends(get_db)
):
    # 1. Verificar se o dispositivo existe
    dispositivo = db.query(models.Dispositivo).filter(
        models.Dispositivo.id_dispositivo == id_dispositivo
    ).first()

    if dispositivo is None:
        raise HTTPException(
            status_code=404,
            detail="Dispositivo não encontrado"
        )

    # 2. Buscar a medição mais recente
    medicao = (
        db.query(models.Medicao)
        .filter(
            models.Medicao.id_dispositivo == id_dispositivo
        )
        .order_by(models.Medicao.data_hora.desc())
        .first()
    )

    # 3. Verificar se existem medições
    if medicao is None:
        raise HTTPException(
            status_code=404,
            detail="Nenhuma medição encontrada para este dispositivo"
        )

    # 4. Retornar os dados da última medição
    return {
        "id_dispositivo": medicao.id_dispositivo,
        "id_medicao": medicao.id_medicao,
        "data_hora": medicao.data_hora,
        "umidade_solo": medicao.umidade_solo,
        "umidade_ar": medicao.umidade_ar,
        "temperatura": medicao.temperatura,
        "luminosidade": medicao.luminosidade
    }



@router.post("/leituras")
@router.post("/leituras")
def receber_leitura(
    leitura: LeituraSensor,
    db: Session = Depends(get_db)
):
    # 1. Verificar se o dispositivo existe
    dispositivo = db.query(models.Dispositivo).filter(
        models.Dispositivo.id_dispositivo == leitura.id_dispositivo
    ).first()

    if dispositivo is None:
        raise HTTPException(
            status_code=404,
            detail="Dispositivo não encontrado"
        )

    # 2. Preparar os dados da medição
    dados = leitura.model_dump(
        exclude={"id_dispositivo", "tipo_planta"}
    )

=======
@router.get("/{sensor_id}")
def ler_sensor(
    sensor_id: int,
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    row = connection.execute(
        """
        SELECT d.id_dispositivo, m.data_hora, m.umidade_solo, m.umidade_ar,
               m.temperatura, m.luminosidade
        FROM dispositivo AS d
        LEFT JOIN LATERAL (
            SELECT data_hora, umidade_solo, umidade_ar, temperatura, luminosidade
            FROM medicao
            WHERE id_dispositivo = d.id_dispositivo
            ORDER BY data_hora DESC
            LIMIT 1
        ) AS m ON TRUE
        WHERE d.id_dispositivo = %s
        """,
        (sensor_id,),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Dispositivo não encontrado.")
    return {
        "sensor_id": row["id_dispositivo"],
        "data_hora": row["data_hora"],
        "umidade_solo": row["umidade_solo"],
        "umidade_ar": row["umidade_ar"],
        "temperatura": row["temperatura"],
        "luminosidade": row["luminosidade"],
    }


@router.post("/leituras")
def receber_leitura(
    leitura: LeituraSensor,
    _: None = Depends(verify_sensor_request),
    connection: psycopg.Connection = Depends(get_connection),
):
    try:
        sensor_id = int(leitura.sensor_id)
    except ValueError as error:
        raise HTTPException(status_code=422, detail="sensor_id deve ser numérico.") from error

    device = connection.execute(
        "SELECT id_dispositivo FROM dispositivo WHERE id_dispositivo = %s",
        (sensor_id,),
    ).fetchone()
    if not device:
        raise HTTPException(status_code=404, detail="Dispositivo não cadastrado.")

    dados = leitura.model_dump(exclude={"sensor_id", "tipo_planta"})
>>>>>>> 9bd6925 (novo)
    tipo_planta = leitura.tipo_planta.strip().lower()

    # 3. Avaliar as condições da planta
    alertas = avaliar_leitura(dados, tipo_planta)
<<<<<<< HEAD

    # 4. Criar a medição
    data_hora_atual = datetime.now(timezone.utc)

    nova_medicao = models.Medicao(
        id_dispositivo=leitura.id_dispositivo,
        umidade_solo=leitura.umidade_solo,
        umidade_ar=leitura.umidade_ar,
        temperatura=leitura.temperatura,
        luminosidade=leitura.luminosidade,
        data_hora=data_hora_atual
    )

    try:
        # 5. Salvar a medição para obter seu ID
        db.add(nova_medicao)
        db.flush()

        # 6. Criar um registro para cada alerta identificado
        alertas_salvos = []

        for mensagem_alerta in alertas:
            tipo_alerta = mensagem_alerta.split(":", 1)[0]

            novo_alerta = models.Alerta(
                id_medicao=nova_medicao.id_medicao,
                tipo=tipo_alerta,
                mensagem=mensagem_alerta,
                data_hora=data_hora_atual,
                status_resolvido=False
            )

            db.add(novo_alerta)
            alertas_salvos.append(novo_alerta)

        # 7. Confirmar a gravação de tudo
        db.commit()

        return {
            "status": "recebido e salvo",
            "id_medicao": nova_medicao.id_medicao,
            "id_dispositivo": nova_medicao.id_dispositivo,
            "data_hora": nova_medicao.data_hora,
            "dados": dados,
            "alertas": alertas,
            "quantidade_alertas_salvos": len(alertas_salvos)
        }

    except SQLAlchemyError:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Erro ao salvar medição e alertas no Supabase"
        )
=======
    measurement = connection.execute(
        """
        INSERT INTO medicao (
            id_dispositivo, data_hora, umidade_solo, umidade_ar,
            temperatura, luminosidade
        )
        VALUES (%s, NOW(), %s, %s, %s, %s)
        RETURNING id_medicao
        """,
        (
            sensor_id,
            leitura.umidade_solo,
            leitura.umidade_ar,
            leitura.temperatura,
            leitura.luminosidade,
        ),
    ).fetchone()
    connection.execute(
        "UPDATE dispositivo SET status = TRUE, atual_em = NOW() WHERE id_dispositivo = %s",
        (sensor_id,),
    )
    for alert_text in alertas:
        normalized_alert = alert_text.lower()
        alert_type = (
            "umidade_baixa"
            if "umidade" in normalized_alert and "abaixo" in normalized_alert
            else "umidade_alta"
            if "umidade" in normalized_alert
            else "temperatura"
            if "temperatura" in normalized_alert
            else "telemetria"
        )
        connection.execute(
            """
            INSERT INTO alerta (id_medicao, tipo, mensagem, data_hora, status_resolvido)
            VALUES (%s, %s, %s, NOW(), FALSE)
            """,
            (
                measurement["id_medicao"],
                alert_type,
                alert_text,
            ),
        )
    return {"status": "recebido", "dados": leitura, "alertas": alertas}
>>>>>>> 9bd6925 (novo)
