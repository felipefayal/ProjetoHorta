
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Float,
    DateTime,
    ForeignKey,
    Text
)
from sqlalchemy.orm import declarative_base

Base = declarative_base()


# Tabela: dispositivo
class Dispositivo(Base):
    __tablename__ = "dispositivo"

    id_dispositivo = Column(Integer, primary_key=True)
    nome = Column(String)
    localizacao = Column(String)
    status = Column(Boolean)
    bateria = Column(Integer)
    sinal_dbm = Column(Integer)


# Tabela: medicao
class Medicao(Base):
    __tablename__ = "medicao"

    id_medicao = Column(Integer, primary_key=True)
    id_dispositivo = Column(
        Integer,
        ForeignKey("dispositivo.id_dispositivo")
    )
    data_hora = Column(DateTime)
    umidade_solo = Column(Float)
    umidade_ar = Column(Float)
    temperatura = Column(Float)
    luminosidade = Column(Float)


# Tabela: alerta
class Alerta(Base):
    __tablename__ = "alerta"

    id_alerta = Column(Integer, primary_key=True)
    id_medicao = Column(Integer, ForeignKey("medicao.id_medicao"))
    tipo = Column(String)
    mensagem = Column(Text)
    data_hora = Column(DateTime)
    status_resolvido = Column(Boolean)

# Tabela: tipo_planta
class TipoPlanta(Base):
    __tablename__ = "tipo_planta"

    id_planta = Column(Integer, primary_key=True)
    nome_popular = Column(String)
    ciclo_colheita_dias = Column(Integer)


# Tabela: canteiro
class Canteiro(Base):
    __tablename__ = "canteiro"

    id_canteiro = Column(Integer, primary_key=True)
    nome_identificacao = Column(String)
    id_planta = Column(Integer, ForeignKey("tipo_planta.id_planta"))
    id_dispositivo = Column(Integer, ForeignKey("dispositivo.id_dispositivo"))

# Tabela: usuario
class Usuario(Base):
    __tablename__ = "usuario"

    id_user = Column(Integer, primary_key=True)
    nome = Column(String)
    email = Column(String)
    senha_hash = Column(String)
    perfil = Column(String)


# Tabela: fertilizante
class Fertilizante(Base):
    __tablename__ = "fertilizante"

    id_fertilizante = Column(Integer, primary_key=True)
    nome = Column(String)
    tipo = Column(String)

# Tabela: historico_irrigacao
class HistoricoIrrigacao(Base):
    __tablename__ = "historico_irrigacao"

    id_irrigacao = Column(Integer, primary_key=True)
    id_canteiro = Column(Integer, ForeignKey("canteiro.id_canteiro"))
    id_user = Column(Integer, ForeignKey("usuario.id_user"))
    data_hora_inicio = Column(DateTime)


# Tabela: aplicacao_fertilizante
class AplicacaoFertilizante(Base):
    __tablename__ = "aplicacao_fertilizante"

    id_aplicacao = Column(Integer, primary_key=True)
    id_canteiro = Column(Integer, ForeignKey("canteiro.id_canteiro"))
    id_fertilizante = Column(Integer, ForeignKey("fertilizante.id_fertilizante"))
    id_user = Column(Integer, ForeignKey("usuario.id_user"))
    data_aplicacao = Column(DateTime)