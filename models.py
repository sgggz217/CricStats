from sqlalchemy import Column, Integer, String, Float, ForeignKey, Numeric
from sqlalchemy.orm import relationship
from database import Base


class Team(Base):
    __tablename__ = "teams"

    team_id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String(50))
    country = Column(String(50))

    players = relationship("Player", back_populates="team")


class Format(Base):
    __tablename__ = "formats"

    format_id = Column(Integer, primary_key=True, index=True)
    format_name = Column(String(20))


class Player(Base):
    __tablename__ = "players"

    player_id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(100), index=True)
    team_id = Column(Integer, ForeignKey("teams.team_id"))
    role = Column(String(50))

    team = relationship("Team", back_populates="players")
    batting_stats = relationship("BattingStat", back_populates="player")
    bowling_stats = relationship("BowlingStat", back_populates="player")


class BattingStat(Base):
    __tablename__ = "batting_stats"

    stat_id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.player_id"))
    format_id = Column(Integer, ForeignKey("formats.format_id"))
    matches = Column(Integer)
    innings = Column(Integer)
    runs = Column(Integer)
    average = Column(Numeric(5, 2))
    strike_rate = Column(Numeric(5, 2))
    hundreds = Column(Integer)
    fifties = Column(Integer)

    player = relationship("Player", back_populates="batting_stats")


class BowlingStat(Base):
    __tablename__ = "bowling_stats"

    stat_id = Column(Integer, primary_key=True, index=True)
    player_id = Column(Integer, ForeignKey("players.player_id"))
    format_id = Column(Integer, ForeignKey("formats.format_id"))
    matches = Column(Integer)
    overs = Column(Numeric(6, 1))
    wickets = Column(Integer)
    average = Column(Numeric(5, 2))
    economy = Column(Numeric(4, 2))
    best_figures = Column(String(10))

    player = relationship("Player", back_populates="bowling_stats")
