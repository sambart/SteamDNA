# SteamDNA ML Service

FastAPI-based machine learning service for gaming profile analysis and user classification.

## Features

- **Feature Extraction**: Extract 16-dimensional feature vectors from gaming data
- **User Clustering**: K-means clustering for gaming persona classification
- **Persona Analysis**: Classify users into 5 gaming personas
- **RESTful API**: Easy integration with NestJS backend

## Gaming Personas

1. **Casual Explorer** - Enjoys exploring various games without deep commitment
2. **Hardcore Completionist** - Dedicates significant time to mastering games
3. **Genre Specialist** - Focuses deeply on specific game genres
4. **Achievement Hunter** - Driven by completing achievements and challenges
5. **Social Gamer** - Enjoys multiplayer and social gaming experiences

## API Endpoints

### Analysis

- `POST /api/ml/analysis/analyze` - Analyze user gaming profile
- `GET /api/ml/analysis/personas` - Get list of gaming personas

### Features

- `POST /api/ml/features/extract` - Extract feature vector from gaming data
- `GET /api/ml/features/schema` - Get feature vector schema

## Feature Vector (16 dimensions)

1-7. **Playtime Features**
   - Total playtime (hours)
   - Average playtime per game
   - Median playtime
   - Max playtime
   - Playtime standard deviation
   - Never played ratio
   - Heavily played ratio (>50h)

8-9. **Genre Features**
   - Genre diversity (Shannon entropy)
   - Number of unique genres

10-12. **Diversity Features**
   - Total unique games
   - Free games ratio
   - Average Metacritic score

13-15. **Achievement Features**
   - Average achievement rate
   - Total achievements unlocked
   - Achievement hunter score

16. **Temporal Features**
   - Recent playtime (last 2 weeks)

## Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
uvicorn app.main:app --reload --port 5000

# Run with Docker
docker-compose up ml-service
```

## Usage Example

```python
import requests

# Analyze user
response = requests.post('http://localhost:5000/api/ml/analysis/analyze', json={
    "userId": 123,
    "userGames": [
        {"appId": 730, "playtimeForever": 5000, ...},
        ...
    ],
    "gamesInfo": [
        {"appId": 730, "name": "Counter-Strike", "genres": ["Action", "FPS"], ...},
        ...
    ]
})

result = response.json()
print(f"Persona: {result['persona']['personaName']}")
print(f"Confidence: {result['persona']['confidence']}")
print(f"Top Genres: {result['topGenres']}")
```

## API Documentation

Visit http://localhost:5000/docs for interactive API documentation.
