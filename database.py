from sqlalchemy import create_engine, Column, Integer, String, DECIMAL, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.dialects.mysql import YEAR
from sqlalchemy.orm import sessionmaker, DeclarativeBase
import urllib.parse

password = urllib.parse.quote_plus("Sonu@1702")
SQLALCHEMY_DATABASE_URL = f"mysql+mysqlconnector://root:{password}@localhost:3306/dbms_project"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Base(DeclarativeBase):
    pass

class Player(Base):
    __tablename__ = "players"
    player_id = Column(Integer, primary_key=True, autoincrement=True)
    player_name = Column(String(100), nullable=False, unique=True)
    team = Column(String(50), nullable=False)
    player_type = Column(Enum('Batsman', 'Bowler', 'Allrounder', 'Wicketkeeper'), nullable=False)
    debut_year = Column(YEAR)
    created_at = Column(TIMESTAMP, server_default='CURRENT_TIMESTAMP')

class BatsmenStat(Base):
    __tablename__ = "batsmen_stats"
    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.player_id', ondelete='CASCADE'), nullable=False, unique=True)
    matches = Column(Integer, default=0)
    innings = Column(Integer, default=0)
    runs = Column(Integer, default=0)
    highest_score = Column(Integer, default=0)
    centuries = Column(Integer, default=0)
    half_centuries = Column(Integer, default=0)
    strike_rate = Column(DECIMAL(5,2), default=0)
    average = Column(DECIMAL(5,2), default=0)

class BowlerStat(Base):
    __tablename__ = "bowlers_stats"
    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.player_id', ondelete='CASCADE'), nullable=False, unique=True)
    matches = Column(Integer, default=0)
    innings = Column(Integer, default=0)
    wickets = Column(Integer, default=0)
    best_bowling = Column(String(20), default='0/0')
    economy = Column(DECIMAL(4,2), default=0)
    strike_rate = Column(DECIMAL(5,2), default=0)
    average = Column(DECIMAL(5,2), default=0)
    five_wickets = Column(Integer, default=0)

class AllrounderStat(Base):
    __tablename__ = "allrounders_stats"
    stat_id = Column(Integer, primary_key=True, autoincrement=True)
    player_id = Column(Integer, ForeignKey('players.player_id', ondelete='CASCADE'), nullable=False, unique=True)
    matches = Column(Integer, default=0)
    batting_innings = Column(Integer, default=0)
    runs = Column(Integer, default=0)
    centuries = Column(Integer, default=0)
    half_centuries = Column(Integer, default=0)
    batting_strike_rate = Column(DECIMAL(5,2), default=0)
    bowling_innings = Column(Integer, default=0)
    wickets = Column(Integer, default=0)
    economy = Column(DECIMAL(4,2), default=0)
    bowling_strike_rate = Column(DECIMAL(5,2), default=0)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        