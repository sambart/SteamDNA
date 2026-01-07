# SteamDNA ML Service

FastAPI 기반의 머신러닝 서비스로, Steam 게임 데이터를 분석하여 유저의 게임 성향(Persona)을 분류합니다.
NestJS 백엔드와의 연동을 전제로 설계되었습니다.

## Features

- **특징 벡터 추출**: 게임 플레이 데이터를 기반으로 16차원 특징 벡터 생성
- **유저 클러스터링**: K-means 알고리즘을 활용한 유저 성향 군집화
- **Persona 분석**: 유저를 5가지 게임 플레이 Persona 중 하나로 분류
- **RESTful API**: NestJS 백엔드에서 손쉽게 연동 가능

## Gaming Personas

1. **Casual Explorer** - 다양한 게임을 가볍게 즐기는 탐험형 유저
2. **Hardcore Completionist** - 특정 게임에 깊이 몰입하여 끝까지 파고드는 유저
3. **Genre Specialist** - 특정 장르(FPS, RPG 등)에 집중하는 전문형 유저
4. **Achievement Hunter** - 업적과 도전 과제 달성을 중요시하는 유저
5. **Social Gamer** - 멀티플레이 및 사회적 상호작용을 중시하는 유저

## API Endpoints

### Analysis

- `POST /api/ml/analysis/analyze` - 유저 게임 데이터를 분석하여 Persona 결과 반환
- `GET /api/ml/analysis/personas` - 지원하는 Persona 목록 조회

### Features

- `POST /api/ml/features/extract` - 게임 데이터로부터 16차원 특징 벡터 추출
- `GET /api/ml/features/schema` - 특징 벡터 스키마 정보 조회

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
