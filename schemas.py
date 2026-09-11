from pydantic import BaseModel
from typing import List, Optional


class BattingStatBase(BaseModel):
    matches: int
    innings: int
    runs: int
    average: float
    strike_rate: float
    hundreds: int
    fifties: int


class BattingStatCreate(BattingStatBase):
    format_id: Optional[int] = None


class BattingStat(BattingStatBase):
    stat_id: int
    player_id: int
    format_id: Optional[int] = None

    class Config:
        from_attributes = True


class BowlingStatBase(BaseModel):
    matches: int
    overs: float
    wickets: int
    average: float
    economy: float
    best_figures: str


class BowlingStatCreate(BowlingStatBase):
    format_id: Optional[int] = None


class BowlingStat(BowlingStatBase):
    stat_id: int
    player_id: int
    format_id: Optional[int] = None

    class Config:
        from_attributes = True


class PlayerBase(BaseModel):
    player_name: str
    role: str
    team_id: Optional[int] = None


class PlayerCreate(PlayerBase):
    pass


class Player(PlayerBase):
    player_id: int
    batting_stats: List[BattingStat] = []
    bowling_stats: List[BowlingStat] = []

    class Config:
        from_attributes = True
