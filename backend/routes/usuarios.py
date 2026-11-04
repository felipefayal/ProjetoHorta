
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import models
from database import get_db

router = APIRouter(
    prefix="/usuarios",
    tags=["usuarios"]
)


# Listar usuários cadastrados
@router.get("/")
def listar_usuarios(db: Session = Depends(get_db)):

    # Contar quantos usuários existem na tabela
    total = db.query(models.Usuario).count()

    # Mostrar a quantidade no terminal do VS Code
    print("Total de usuários encontrados:", total)

    # Buscar todos os usuários
    usuarios = db.query(models.Usuario).all()

    # Retornar somente os dados necessários
    return [
        {
            "id_user": usuario.id_user,
            "nome": usuario.nome,
            "perfil": usuario.perfil
        }
        for usuario in usuarios
    ]
