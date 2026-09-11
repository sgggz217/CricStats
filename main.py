from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db, Player, BatsmenStat, BowlerStat, AllrounderStat
from typing import Optional

app = FastAPI()

# ============ CORS ============
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ API ENDPOINTS ============

@app.get("/api/home")
def home_stats(db: Session = Depends(get_db)):
    total_players = db.query(Player).count()
    total_runs = db.query(func.sum(BatsmenStat.runs)).scalar() or 0
    total_wickets = db.query(func.sum(BowlerStat.wickets)).scalar() or 0
    avg_strike = db.query(func.avg(BatsmenStat.strike_rate)).scalar() or 0
    
    top_batsmen = db.query(Player, BatsmenStat).join(BatsmenStat).order_by(BatsmenStat.runs.desc()).limit(10).all()
    top_bowlers = db.query(Player, BowlerStat).join(BowlerStat).order_by(BowlerStat.wickets.desc()).limit(10).all()
    
    return {
        "total_players": total_players,
        "total_runs": int(total_runs),
        "total_wickets": int(total_wickets),
        "avg_strike_rate": round(float(avg_strike), 2),
        "top_batsmen": [
            {"name": p.player_name, "team": p.team, "runs": s.runs, 
             "centuries": s.centuries, "strike_rate": float(s.strike_rate)}
            for p, s in top_batsmen
        ],
        "top_bowlers": [
            {"name": p.player_name, "team": p.team, "wickets": s.wickets,
             "economy": float(s.economy), "five_wickets": s.five_wickets}
            for p, s in top_bowlers
        ]
    }

@app.get("/api/players")
def get_players(
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Player)
    if type:
        query = query.filter(Player.player_type == type)
    if team:
        query = query.filter(Player.team == team)
    if search:
        query = query.filter(Player.player_name.like(f"%{search}%"))
    
    players = query.order_by(Player.player_name).all()
    return [
        {"id": p.player_id, "name": p.player_name, "team": p.team, 
         "type": p.player_type, "debut_year": p.debut_year}
        for p in players
    ]

@app.get("/api/teams")
def get_teams(db: Session = Depends(get_db)):
    teams = db.query(Player.team).distinct().order_by(Player.team).all()
    result = []
    for team in teams:
        team_name = team[0]
        players = db.query(Player).filter(Player.team == team_name).all()
        result.append({
            "name": team_name,
            "count": len(players),
            "players": [
                {"name": p.player_name, "type": p.player_type, "debut_year": p.debut_year}
                for p in players
            ]
        })
    return result

@app.get("/api/search/{term}")
def search_players(term: str, db: Session = Depends(get_db)):
    players = db.query(Player).filter(Player.player_name.like(f"%{term}%")).limit(20).all()
    return [
        {"id": p.player_id, "name": p.player_name, "team": p.team, "type": p.player_type}
        for p in players
    ]

@app.get("/api/filters")
def get_filters(db: Session = Depends(get_db)):
    types = db.query(Player.player_type).distinct().all()
    teams = db.query(Player.team).distinct().order_by(Player.team).all()
    return {
        "types": [t[0] for t in types],
        "teams": [t[0] for t in teams]
    }

@app.get("/api/compare/{p1}/{p2}")
def compare_players(p1: int, p2: int, db: Session = Depends(get_db)):
    player1 = db.query(Player).filter(Player.player_id == p1).first()
    player2 = db.query(Player).filter(Player.player_id == p2).first()
    
    if not player1 or not player2:
        return {"error": "Player not found"}
    
    b1 = db.query(BatsmenStat).filter(BatsmenStat.player_id == p1).first()
    b2 = db.query(BatsmenStat).filter(BatsmenStat.player_id == p2).first()
    bo1 = db.query(BowlerStat).filter(BowlerStat.player_id == p1).first()
    bo2 = db.query(BowlerStat).filter(BowlerStat.player_id == p2).first()
    
    return {
        "player1": {
            "name": player1.player_name,
            "team": player1.team,
            "type": player1.player_type,
            "runs": b1.runs if b1 else 0,
            "wickets": bo1.wickets if bo1 else 0,
            "centuries": b1.centuries if b1 else 0,
            "strike_rate": float(b1.strike_rate) if b1 else 0
        },
        "player2": {
            "name": player2.player_name,
            "team": player2.team,
            "type": player2.player_type,
            "runs": b2.runs if b2 else 0,
            "wickets": bo2.wickets if bo2 else 0,
            "centuries": b2.centuries if b2 else 0,
            "strike_rate": float(b2.strike_rate) if b2 else 0
        }
    }

# ============ FRONTEND ENDPOINTS ============

@app.get("/stats/summary")
def stats_summary(db: Session = Depends(get_db)):
    total_players = db.query(Player).count()
    total_runs = db.query(func.sum(BatsmenStat.runs)).scalar() or 0
    total_wickets = db.query(func.sum(BowlerStat.wickets)).scalar() or 0
    avg_strike = db.query(func.avg(BatsmenStat.strike_rate)).scalar() or 0
    
    return {
        "total_players": total_players,
        "total_runs": int(total_runs),
        "total_wickets": int(total_wickets),
        "avg_strike_rate": round(float(avg_strike), 2)
    }

@app.get("/stats/top-performers")
def top_performers(db: Session = Depends(get_db)):
    top_batsmen = db.query(Player, BatsmenStat).join(BatsmenStat).order_by(BatsmenStat.runs.desc()).limit(10).all()
    top_bowlers = db.query(Player, BowlerStat).join(BowlerStat).order_by(BowlerStat.wickets.desc()).limit(10).all()
    top_allrounders = db.query(Player, AllrounderStat).join(AllrounderStat).order_by(AllrounderStat.runs.desc()).limit(10).all()
    
    return {
        "top_batsmen": [
            {"name": p.player_name, "team": p.team, "runs": s.runs, 
             "centuries": s.centuries, "half_centuries": s.half_centuries,
             "strike_rate": float(s.strike_rate), "average": float(s.average)}
            for p, s in top_batsmen
        ],
        "top_bowlers": [
            {"name": p.player_name, "team": p.team, "wickets": s.wickets,
             "economy": float(s.economy), "five_wickets": s.five_wickets,
             "strike_rate": float(s.strike_rate), "average": float(s.average)}
            for p, s in top_bowlers
        ],
        "top_allrounders": [
            {"name": p.player_name, "team": p.team, "runs": s.runs, 
             "wickets": s.wickets, "economy": float(s.economy),
             "batting_strike_rate": float(s.batting_strike_rate)}
            for p, s in top_allrounders
        ]
    }

@app.get("/players/")
def get_all_players(db: Session = Depends(get_db)):
    players = db.query(Player).order_by(Player.player_name).all()
    return [
        {"id": p.player_id, "name": p.player_name, "team": p.team, 
         "type": p.player_type, "debut_year": p.debut_year}
        for p in players
    ]

@app.get("/players/filter")
def filter_players(
    db: Session = Depends(get_db),
    type: Optional[str] = Query(None),
    team: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    query = db.query(Player)
    if type:
        query = query.filter(Player.player_type == type)
    if team:
        query = query.filter(Player.team == team)
    if search:
        query = query.filter(Player.player_name.like(f"%{search}%"))
    
    players = query.order_by(Player.player_name).all()
    return [
        {"id": p.player_id, "name": p.player_name, "team": p.team, 
         "type": p.player_type, "debut_year": p.debut_year}
        for p in players
    ]

@app.get("/teams/with-players")
def teams_with_players(db: Session = Depends(get_db)):
    teams = db.query(Player.team).distinct().order_by(Player.team).all()
    result = []
    for team in teams:
        team_name = team[0]
        players = db.query(Player).filter(Player.team == team_name).all()
        
        total_runs = db.query(func.sum(BatsmenStat.runs)).join(Player).filter(Player.team == team_name).scalar() or 0
        total_wickets = db.query(func.sum(BowlerStat.wickets)).join(Player).filter(Player.team == team_name).scalar() or 0
        
        result.append({
            "name": team_name,
            "count": len(players),
            "total_runs": int(total_runs),
            "total_wickets": int(total_wickets),
            "players": [
                {"id": p.player_id, "name": p.player_name, "type": p.player_type, "debut_year": p.debut_year}
                for p in players
            ]
        })
    return result

@app.get("/player/{player_id}")
def get_player_details(player_id: int, db: Session = Depends(get_db)):
    player = db.query(Player).filter(Player.player_id == player_id).first()
    if not player:
        return {"error": "Player not found"}
    
    batting = db.query(BatsmenStat).filter(BatsmenStat.player_id == player_id).first()
    bowling = db.query(BowlerStat).filter(BowlerStat.player_id == player_id).first()
    allrounder = db.query(AllrounderStat).filter(AllrounderStat.player_id == player_id).first()
    
    return {
        "id": player.player_id,
        "name": player.player_name,
        "team": player.team,
        "type": player.player_type,
        "debut_year": player.debut_year,
        "batting": {
            "matches": batting.matches if batting else 0,
            "innings": batting.innings if batting else 0,
            "runs": batting.runs if batting else 0,
            "highest_score": batting.highest_score if batting else 0,
            "centuries": batting.centuries if batting else 0,
            "half_centuries": batting.half_centuries if batting else 0,
            "strike_rate": float(batting.strike_rate) if batting else 0,
            "average": float(batting.average) if batting else 0
        } if batting else None,
        "bowling": {
            "matches": bowling.matches if bowling else 0,
            "innings": bowling.innings if bowling else 0,
            "wickets": bowling.wickets if bowling else 0,
            "best_bowling": bowling.best_bowling if bowling else "0/0",
            "economy": float(bowling.economy) if bowling else 0,
            "strike_rate": float(bowling.strike_rate) if bowling else 0,
            "average": float(bowling.average) if bowling else 0,
            "five_wickets": bowling.five_wickets if bowling else 0
        } if bowling else None,
        "allrounder": {
            "matches": allrounder.matches if allrounder else 0,
            "runs": allrounder.runs if allrounder else 0,
            "wickets": allrounder.wickets if allrounder else 0,
            "batting_strike_rate": float(allrounder.batting_strike_rate) if allrounder else 0,
            "economy": float(allrounder.economy) if allrounder else 0
        } if allrounder else None
    }