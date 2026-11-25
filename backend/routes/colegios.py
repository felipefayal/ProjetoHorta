import psycopg
from fastapi import APIRouter, Depends, HTTPException

from database import get_connection
from routes.auth import verify_admin
from security import get_current_user

router = APIRouter(tags=["escolas e dispositivos"])


@router.get("/colegios")
def listar_colegios(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    rows = connection.execute(
        """
        SELECT c.id_colegio, c.nome, c.endereco, c.telefone,
               d.id_dispositivo, d.nome AS dispositivo_nome
        FROM colegio AS c
        LEFT JOIN colegio_dispositivo AS cd ON cd.id_colegio = c.id_colegio
        LEFT JOIN dispositivo AS d ON d.id_dispositivo = cd.id_dispositivo
        ORDER BY c.nome, d.id_dispositivo
        """
    ).fetchall()
    schools: dict[int, dict] = {}
    for row in rows:
        school = schools.setdefault(
            row["id_colegio"],
            {
                "id": row["id_colegio"],
                "name": row["nome"],
                "address": row["endereco"],
                "phone": row["telefone"],
                "devices": [],
            },
        )
        if row["id_dispositivo"] is not None:
            school["devices"].append(
                {"id": row["id_dispositivo"], "name": row["dispositivo_nome"]}
            )
    return list(schools.values())


@router.get("/dispositivos")
def listar_dispositivos(
    _: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    rows = connection.execute(
        """
        SELECT d.id_dispositivo, d.nome, d.localizacao, d.status, d.bateria,
               d.atual_em, c.id_colegio, c.nome AS colegio_nome
        FROM dispositivo AS d
        LEFT JOIN colegio_dispositivo AS cd ON cd.id_dispositivo = d.id_dispositivo
        LEFT JOIN colegio AS c ON c.id_colegio = cd.id_colegio
        ORDER BY d.id_dispositivo, c.nome
        """
    ).fetchall()
    devices: dict[int, dict] = {}
    for row in rows:
        device = devices.setdefault(
            row["id_dispositivo"],
            {
                "id": row["id_dispositivo"],
                "nome": row["nome"],
                "localizacao": row["localizacao"],
                "status": bool(row["status"]),
                "bateria": row["bateria"],
                "atual_em": row["atual_em"],
                "schools": [],
            },
        )
        if row["id_colegio"] is not None:
            device["schools"].append(
                {"id": row["id_colegio"], "name": row["colegio_nome"]}
            )
    return list(devices.values())


@router.put("/dispositivos/{device_id}/colegios/{school_id}", status_code=204)
def vincular_dispositivo(
    device_id: int,
    school_id: int,
    user: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    verify_admin(user, connection)
    device = connection.execute(
        "SELECT 1 FROM dispositivo WHERE id_dispositivo = %s",
        (device_id,),
    ).fetchone()
    school = connection.execute(
        "SELECT 1 FROM colegio WHERE id_colegio = %s",
        (school_id,),
    ).fetchone()
    if not device or not school:
        raise HTTPException(status_code=404, detail="Escola ou dispositivo não encontrado.")
    connection.execute(
        """
        INSERT INTO colegio_dispositivo (id_colegio, id_dispositivo)
        VALUES (%s, %s)
        ON CONFLICT (id_colegio, id_dispositivo) DO NOTHING
        """,
        (school_id, device_id),
    )
