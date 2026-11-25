import os
import re

import psycopg
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from database import get_connection
from security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["autenticação"])


class RegisterRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=10, max_length=128)


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    password: str = Field(min_length=1, max_length=128)


def _normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", normalized):
        raise HTTPException(status_code=422, detail="Informe um e-mail válido.")
    return normalized


def _public_user(row: dict) -> dict:
    return {
        "id": row["id_user"],
        "name": row["nome"],
        "email": row["email"],
        "profile": "admin" if row["perfil"] == "admin" else "usuario",
        "role": "Administrador" if row["perfil"] == "admin" else "Usuário",
    }


def _session(row: dict) -> dict:
    return {
        "access_token": create_access_token(row["id_user"]),
        "token_type": "bearer",
        "user": _public_user(row),
    }


@router.post("/register", status_code=201)
def register(
    request: RegisterRequest,
    connection: psycopg.Connection = Depends(get_connection),
):
    email = _normalize_email(request.email)
    name = request.name.strip()
    if len(name) < 2:
        raise HTTPException(status_code=422, detail="Informe seu nome.")

    administrator_email = os.getenv("INITIAL_ADMIN_EMAIL", "").strip().lower()
    profile = "admin" if administrator_email and email == administrator_email else "usuario"
    try:
        row = connection.execute(
            """
            INSERT INTO usuario (nome, email, senha_hash, perfil)
            VALUES (%s, %s, %s, %s)
            RETURNING id_user, nome, email, perfil
            """,
            (name, email, hash_password(request.password), profile),
        ).fetchone()
    except psycopg.errors.UniqueViolation as error:
        raise HTTPException(
            status_code=409,
            detail="Já existe uma conta cadastrada com esse e-mail.",
        ) from error
    return _session(row)


@router.post("/login")
def login(
    request: LoginRequest,
    connection: psycopg.Connection = Depends(get_connection),
):
    email = _normalize_email(request.email)
    row = connection.execute(
        """
        SELECT id_user, nome, email, senha_hash, perfil
        FROM usuario
        WHERE lower(email) = %s
        """,
        (email,),
    ).fetchone()
    if not row or not verify_password(request.password, row["senha_hash"]):
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")
    return _session(row)


@router.get("/me")
def current_session(
    user: dict = Depends(get_current_user),
    connection: psycopg.Connection = Depends(get_connection),
):
    row = connection.execute(
        "SELECT id_user, nome, email, perfil FROM usuario WHERE id_user = %s",
        (user["id"],),
    ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")
    return _public_user(row)


def verify_admin(
    user: dict,
    connection: psycopg.Connection,
) -> None:
    row = connection.execute(
        "SELECT perfil FROM usuario WHERE id_user = %s",
        (user["id"],),
    ).fetchone()
    if not row or row["perfil"] != "admin":
        raise HTTPException(status_code=403, detail="Ação permitida somente para administradores.")
