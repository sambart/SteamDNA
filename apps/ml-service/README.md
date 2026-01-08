# SteamDNA ML Service

FastAPI 기반의 머신러닝 서비스로, Steam 게임 데이터를 분석하여 유저의 게임 성향(Persona)을 분류합니다.
NestJS 백엔드와의 연동을 전제로 설계되었습니다.

## 🎯 핵심 기능

### Feature 기반 페르소나 분석 (Pre-Training Fallback)

> 📌 ML 모델이 학습되기 전에도 Feature 분석을 통해
> 5가지 게이밍 페르소나 중 하나를 자동으로 판단합니다.

**동작 방식:**
1. 27차원 Feature 벡터 추출 (장르 선호도, 플레이 패턴, 다양성 등)
2. 모델 미학습 시: Rule-based 분석으로 페르소나 결정
3. 모델 학습 후: K-means 클러스터링으로 더 정확한 분류

**목적:**
- 초기 유저에게도 의미 있는 분석 결과 제공
- Feature 추출 로직 검증
- 데이터 수집 및 모델 학습을 위한 파이프라인 구축
- 점진적 ML 모델 전환 대비

---

## Gaming Personas

ML Service는 다음 5가지 페르소나로 유저를 분류합니다:

| ID | 페르소나 | 설명 | 특징 |
|----|---------|------|------|
| 0 | **몰입형/사색형** | 스토리와 세계관에 깊이 몰입하는 플레이어 | Story/RPG 선호, 긴 세션, 감정이입 |
| 1 | **분석형/계획형** | 전략과 최적화를 중시하는 논리적 플레이어 | Strategy/Simulation 선호, 장기 플레이, 효율 중시 |
| 2 | **자유형/탐색형** | 다양한 경험을 추구하는 개방적 플레이어 | 다양한 장르, 짧은 플레이, 트렌드 소비 |
| 3 | **성취지향/경쟁형** | 목표 달성과 경쟁을 즐기는 도전적 플레이어 | PvP/랭크 선호, 반복 플레이, 성과 중시 |
| 4 | **소셜형/협동형** | 함께 플레이하는 것을 즐기는 사교적 플레이어 | Co-op/멀티플레이 선호, 관계 지향, 협력 중시 |

## API Endpoints

### Analysis

- `POST /api/ml/analysis/analyze` - 유저 게임 데이터를 분석하여 Persona 결과 반환
  - **모델 미학습**: Feature 기반 페르소나 판단 (자동 fallback)
  - **모델 학습 완료**: ML 클러스터링 기반 분류
- `GET /api/ml/analysis/personas` - 지원하는 Persona 목록 조회

### Monitoring (Phase 4)

- `GET /api/ml/monitoring/distribution` - 클러스터 분포 통계
- `GET /api/ml/monitoring/quality` - 클러스터링 품질 메트릭
- `GET /api/ml/monitoring/features` - Feature 값 통계
- `GET /api/ml/monitoring/summary` - 모니터링 종합 요약
- `POST /api/ml/monitoring/reset` - 모니터링 데이터 초기화

## Feature Vector (27 dimensions)

### 1-11. Playtime Features (11개)
- Total playtime (hours)
- Average playtime per game
- Median playtime
- Max playtime
- Playtime standard deviation
- Never played ratio
- Heavily played ratio (>50h)
- **Average session length** ⭐ 세션 길이
- **Deep dive game count** ⭐ 100시간 이상 게임 수
- **Top game concentration** ⭐ 상위 게임 집중도
- **Repeat play intensity** ⭐ 반복 플레이 강도

### 12-17. Genre Features (6개)
- Genre diversity (Shannon entropy)
- Number of unique genres
- **Story/RPG ratio** ⭐ 스토리/RPG 비율
- **Strategy/Simulation ratio** ⭐ 전략/시뮬레이션 비율
- **Competitive/PvP ratio** ⭐ 경쟁/PvP 비율
- **Multiplayer/Co-op ratio** ⭐ 멀티플레이/협동 비율

### 18-21. Diversity Features (4개)
- Total unique games
- Free games ratio
- Average Metacritic score
- **New release purchase rate** ⭐ 신작 구매율

### 22-24. Achievement Features (3개)
- Average achievement rate
- Total achievements unlocked
- Achievement hunter score

### 25-27. Temporal Features (3개)
- Recent playtime (last 2 weeks)
- **Single player ratio** ⭐ 싱글플레이 비율
- **Casual/Indie ratio** ⭐ 캐주얼/인디 비율

⭐ = Phase 3에서 추가된 페르소나 분류용 Feature

## Rule-based Persona Prediction

모델이 학습되지 않았을 때 다음 로직으로 페르소나를 판단합니다:

```python
# 각 페르소나별 점수 계산
몰입형/사색형 점수 = story_rpg_ratio * 3.0 + single_player_ratio * 2.0 + ...
분석형/계획형 점수 = strategy_sim_ratio * 3.5 + top_game_concentration * 2.0 + ...
자유형/탐색형 점수 = genre_diversity * 1.5 + (1 - concentration) * 2.0 + ...
성취지향/경쟁형 점수 = competitive_ratio * 3.5 + repeat_intensity * 2.0 + ...
소셜형/협동형 점수 = multiplayer_coop_ratio * 4.0 + (1 - single_ratio) * 1.5

# 최고점 페르소나 선택
persona = max_score_persona
confidence = (top_score - second_score) / top_score + 0.5
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      NestJS Backend                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         analysis.service.ts                          │   │
│  │  • Steam 데이터 수집                                   │   │
│  │  • ML Service 호출                                    │   │
│  │  • DB 저장 (User, Game, UserGame, Analysis)          │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │ HTTP Request                           │
└─────────────────────┼───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI ML Service                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         analysis.py (Router)                         │   │
│  │  • Feature 추출                                       │   │
│  │  • try: ML 모델 예측                                  │   │
│  │  • except: Feature 기반 분류 (fallback)              │   │
│  └──────────────────┬──────────────┬────────────────────┘   │
│                     │              │                         │
│         ┌───────────▼──────┐  ┌───▼─────────────────┐       │
│         │ clustering.py    │  │ feature_extractor.py│       │
│         │ • K-means 모델   │  │ • 27D Feature 추출  │       │
│         │ • Feature 분석   │  │ • 장르/플레이 분석  │       │
│         └──────────────────┘  └─────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Environment variables (`.env` or `docker-compose.yml`):

```env
# Service
SERVICE_NAME=ml-service
VERSION=0.2.0
ENVIRONMENT=development
LOG_LEVEL=INFO

# Server
HOST=0.0.0.0
PORT=5000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:4000

# Database (PostgreSQL)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=steamdna

# ML Settings
MIN_GAMES_FOR_ANALYSIS=5
FEATURE_VECTOR_SIZE=27
CLUSTERING_N_CLUSTERS=5
```

## API Documentation

서비스 실행 후 다음 URL에서 인터랙티브 API 문서를 확인할 수 있습니다:

- **Swagger UI**: http://localhost:5000/docs
- **ReDoc**: http://localhost:5000/redoc
- **OpenAPI Schema**: http://localhost:5000/openapi.json
