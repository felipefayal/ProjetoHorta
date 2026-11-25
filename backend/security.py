import hashlib
import hmac
import os
import secrets

from fastapi import Header, HTTPException
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

PASSWORD_ITERATIONS = 600_000
TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7


def _serializer() -> URLSafeTimedSerializer:
    secret = os.getenv("SESSION_SECRET", "").strip()
    if not secret:
        raise HTTPException(
            status_code=503,
            detail="Autenticação não configurada. Defina SESSION_SECRET.",
        )
    return URLSafeTimedSerializer(secret, salt="projetohorta-session")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PASSWORD_ITERATIONS,
    )
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations, salt_hex, digest_hex = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        expected = bytes.fromhex(digest_hex)
        actual = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iterations),
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(actual, expected)


def create_access_token(user_id: int) -> str:
    return _serializer().dumps({"user_id": user_id})


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Autenticação necessária.")

    try:
        payload = _serializer().loads(
            authorization.removeprefix("Bearer "),
            max_age=TOKEN_MAX_AGE_SECONDS,
        )
        user_id = int(payload["user_id"])
    except (BadSignature, SignatureExpired, KeyError, TypeError, ValueError):
        raise HTTPException(status_code=401, detail="Sessão inválida ou expirada.")

    return {"id": user_id}


def verify_sensor_request(
    sensor_token: str | None = Header(default=None, alias="X-Sensor-Token"),
) -> None:
    expected = os.getenv("SENSOR_INGEST_TOKEN", "").strip()
    if not expected:
        raise HTTPException(
            status_code=503,
            detail="Ingestão de sensores não configurada.",
        )
    if not sensor_token or not hmac.compare_digest(sensor_token, expected):
        raise HTTPException(status_code=401, detail="Credencial do sensor inválida.")

