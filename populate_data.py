import requests
import json

BASE_URL = "http://localhost:8000"

def populate_data():
    # 1. Create Player: Virat Kohli
    player_data = {
        "name": "Virat Kohli",
        "role": "Batsman",
        "country": "India"
    }
    response = requests.post(f"{BASE_URL}/players/", json=player_data)
    if response.status_code == 200:
        player_id = response.json()["id"]
        print(f"Created player: {player_data['name']} with ID: {player_id}")
        
        # Add Batting Stats
        batting_stats = {
            "matches": 254,
            "innings": 245,
            "runs": 12040,
            "average": 59.07,
            "strike_rate": 93.25,
            "hundreds": 43,
            "fifties": 62
        }
        requests.post(f"{BASE_URL}/players/{player_id}/batting/", json=batting_stats)
        print(f"Added batting stats for {player_data['name']}")
    else:
        print(f"Failed to create player {player_data['name']}: {response.text}")

    # 2. Create Player: Jasprit Bumrah
    player_data = {
        "name": "Jasprit Bumrah",
        "role": "Bowler",
        "country": "India"
    }
    response = requests.post(f"{BASE_URL}/players/", json=player_data)
    if response.status_code == 200:
        player_id = response.json()["id"]
        print(f"Created player: {player_data['name']} with ID: {player_id}")
        
        # Add Bowling Stats
        bowling_stats = {
            "matches": 70,
            "overs": 600.5,
            "wickets": 120,
            "average": 24.30,
            "economy": 4.65,
            "best_figures": "5/27"
        }
        requests.post(f"{BASE_URL}/players/{player_id}/bowling/", json=bowling_stats)
        print(f"Added bowling stats for {player_data['name']}")
    else:
        print(f"Failed to create player {player_data['name']}: {response.text}")

if __name__ == "__main__":
    populate_data()
