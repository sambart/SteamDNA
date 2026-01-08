# SteamDNA 🎮

Steam 프로필을 분석하여 나만의 게이밍 취향을 발견하세요. SteamDNA는 게임 데이터를 수집하고, 플레이 패턴을 분석하여 고유한 게이밍 성향에 대한 인사이트를 제공합니다.

## 주요 기능

- 🔍 **Steam ID 검색** - Steam ID, 사용자명, 프로필 URL로 간편하게 시작
- 📊 **데이터 수집** - Steam 게임 데이터 자동 수집 및 분석
- 🧬 **ML 기반 분석** - 머신러닝 기반의 게이밍 행동 분석
- 📈 **인터랙티브 대시보드** - 아름다운 차트로 게임 통계 시각화
- 🎯 **게이밍 페르소나** - Feature 분석 기반 5가지 게임 성향 분류
- 🤖 **특성 추출** - 심층 인사이트를 위한 27차원 특성 벡터

## 🎯 게이밍 페르소나 (5가지)

SteamDNA는 사용자를 다음 5가지 페르소나로 분류합니다:

| 페르소나 | 설명 | 특징 |
|---------|------|------|
| **몰입형/사색형** | 스토리와 세계관에 깊이 몰입 | Story/RPG 선호, 긴 세션, 감정이입 |
| **분석형/계획형** | 전략과 최적화를 중시 | Strategy/Simulation 선호, 효율 중시 |
| **자유형/탐색형** | 다양한 경험을 추구 | 다양한 장르, 트렌드 소비, 탐험 |
| **성취지향/경쟁형** | 목표 달성과 경쟁을 즐김 | PvP/랭크 선호, 반복 플레이, 성과 중시 |
| **소셜형/협동형** | 함께 플레이하는 것을 즐김 | Co-op/멀티플레이 선호, 협력 중시 |

## 💡 Feature 기반 페르소나 분석

> 📌 ML 모델이 학습되기 전에도 정교한 Feature 분석을 통해
> 5가지 게이밍 페르소나 중 하나를 자동으로 판단합니다.

**동작 방식:**
1. **27차원 Feature 추출** - 장르 선호도, 플레이 패턴, 게임 다양성 등 분석
2. **모델 미학습 시** - Rule-based 점수 계산으로 페르소나 결정
3. **모델 학습 후** - K-means 클러스터링으로 더 정확한 분류

**목적:**
- 초기 유저에게도 의미 있는 분석 결과 제공
- Feature 추출 로직 검증 및 데이터 수집
- 점진적 ML 모델 전환을 위한 인프라 구축

## 기술 스택

### 백엔드
- **NestJS** - Progressive Node.js 프레임워크
- **TypeORM** - TypeScript/JavaScript용 ORM
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 게임 정보 캐싱 (분석 결과는 캐싱 안 함)
- **Steam Web API** - 데이터 수집을 위한 직접 연동

### ML 서비스
- **FastAPI** - 고성능 Python API 프레임워크
- **scikit-learn** - 머신러닝 알고리즘 (K-means 클러스터링)
- **pandas/numpy** - 데이터 처리 및 특성 엔지니어링
- **SQLAlchemy** - Python용 데이터베이스 ORM
- **27차원 Feature 벡터** - 플레이타임(11) + 장르(6) + 다양성(4) + 업적(3) + 시간(3)

### 프론트엔드
- **Next.js 14** - App Router를 사용하는 React 프레임워크
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Recharts** - 인터랙티브 차트 라이브러리
- **TypeScript** - 타입 안전 개발

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 오케스트레이션
- **Monorepo 구조** - 효율적인 코드 관리

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (3000)                 │
│  • 한글 UI                                                    │
│  • 인터랙티브 대시보드                                         │
│  • Recharts 차트                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────────┐
│                  NestJS Backend (4000)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Steam API Integration                              │    │
│  │  • 게임 데이터 수집                                   │    │
│  │  • Redis 캐싱 (게임 정보만, 7일)                     │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PostgreSQL Database                                │    │
│  │  • User, Game, UserGame, Analysis                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP
┌──────────────────────▼──────────────────────────────────────┐
│                FastAPI ML Service (5000)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Feature Extraction (27D)                           │    │
│  │  • Playtime Features (11개)                         │    │
│  │  • Genre Features (6개)                             │    │
│  │  • Diversity Features (4개)                         │    │
│  │  • Achievement Features (3개)                       │    │
│  │  • Temporal Features (3개)                          │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Persona Classification                             │    │
│  │  • Rule-based (모델 미학습 시)                       │    │
│  │  • K-means Clustering (모델 학습 후)                │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## 시작하기

### 사전 요구사항

- Node.js 18+ 및 npm 9+
- Python 3.11+
- Docker 및 Docker Compose (권장)
- Steam API Key ([여기서 발급](https://steamcommunity.com/dev/apikey))

### 설치

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd SteamDNA
   ```

2. **환경 변수 설정**
   ```bash
   # 백엔드
   cp apps/backend/.env.example apps/backend/.env
   # apps/backend/.env 파일을 수정하고 Steam API 키를 추가하세요

   # 프론트엔드
   cp apps/frontend/.env.example apps/frontend/.env

   # ML 서비스
   cp apps/ml-service/.env.example apps/ml-service/.env
   ```

3. **의존성 설치**
   ```bash
   # Node.js 의존성
   npm install

   # Python 의존성 (ML Service)
   cd apps/ml-service
   pip install -r requirements.txt
   cd ../..
   ```

### Docker로 실행 (권장)

```bash
# 모든 서비스 시작 (PostgreSQL, Redis, Backend, ML Service, Frontend)
npm run docker:up

# 로그 확인
npm run docker:logs

# 특정 서비스 로그 확인
docker-compose logs -f backend
docker-compose logs -f ml-service
docker-compose logs -f frontend

# 모든 서비스 중지
npm run docker:down
```

애플리케이션 접근:
- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:4000/api
- **백엔드 API 문서**: http://localhost:4000/api/docs
- **ML 서비스 API**: http://localhost:5000
- **ML 서비스 문서**: http://localhost:5000/docs

### 로컬에서 실행

1. **PostgreSQL과 Redis 시작**
   ```bash
   docker-compose up postgres redis -d
   ```

2. **백엔드 실행**
   ```bash
   npm run dev:backend
   ```

3. **ML 서비스 실행** (새 터미널에서)
   ```bash
   cd apps/ml-service
   uvicorn app.main:app --reload --port 5000
   ```

4. **프론트엔드 실행** (새 터미널에서)
   ```bash
   npm run dev:frontend
   ```

또는 동시에 실행:
```bash
npm run dev
```

## 설정

### 백엔드 환경 변수

`apps/backend/.env` 파일 수정:

```env
# Application
NODE_ENV=development
PORT=4000

# Steam API 설정
STEAM_API_KEY=your_steam_api_key_here

# 데이터베이스 (Docker 사용 시)
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=steamdna

# 데이터베이스 (로컬 실행 시)
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=steamdna
# DB_PASSWORD=steamdna_password
# DB_DATABASE=steamdna

# Redis (Docker 사용 시)
REDIS_HOST=redis
REDIS_PORT=6379

# Redis (로컬 실행 시)
# REDIS_HOST=localhost
# REDIS_PORT=6379

# ML Service
ML_SERVICE_URL=http://ml-service:5000
```

### ML Service 환경 변수

`apps/ml-service/.env` 파일:

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

# Database
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

### Steam API Key 발급받기

1. https://steamcommunity.com/dev/apikey 방문
2. Steam 계정으로 로그인
3. 도메인 이름 입력 (개발 시 `localhost` 사용)
4. 생성된 API 키를 `.env` 파일에 복사

## API 문서

백엔드가 실행 중일 때 http://localhost:4000/api/docs 에서 Swagger 기반 대화형 API 문서를 확인할 수 있습니다.

ML 서비스 문서는 http://localhost:5000/docs 에서 확인할 수 있습니다.

### 주요 엔드포인트

**Backend API (포트 4000):**

모든 엔드포인트는 Steam ID64, vanity URL 이름 또는 프로필 URL을 식별자로 받습니다:

- `GET /api/steam/user/:identifier` - 완전한 Steam 사용자 데이터 조회
- `GET /api/steam/games/:identifier` - 보유 게임 조회
- `GET /api/steam/player/:identifier` - 플레이어 요약 정보 조회
- `GET /api/analysis/summary/:identifier` - 게임 프로필 요약 조회 (페르소나 포함)
- `GET /api/analysis/dashboard/:identifier` - 상세 대시보드 데이터 조회

예시:
- `/api/analysis/summary/76561197960287930` (Steam ID64)
- `/api/analysis/summary/gaben` (Vanity URL)
- `/api/analysis/summary/steamcommunity.com/id/gaben` (프로필 URL)

**ML Service API (포트 5000):**

- `POST /api/ml/analysis/analyze` - 유저 Feature 추출 및 페르소나 분류
- `GET /api/ml/analysis/personas` - 5가지 페르소나 목록 조회
- `GET /api/ml/monitoring/distribution` - 클러스터 분포 통계
- `GET /api/ml/monitoring/summary` - 모니터링 종합 요약

## 개발

### 사용 가능한 스크립트

```bash
# 프론트엔드와 백엔드 동시 실행
npm run dev

# 백엔드만 실행
npm run dev:backend

# 프론트엔드만 실행
npm run dev:frontend

# 모든 프로젝트 빌드
npm run build

# 백엔드만 빌드
npm run build:backend

# 프론트엔드만 빌드
npm run build:frontend

# Docker 명령어
npm run docker:up      # 모든 서비스 시작
npm run docker:down    # 모든 서비스 중지
npm run docker:logs    # 로그 확인
npm run docker:restart # 모든 서비스 재시작

# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart ml-service
docker-compose restart frontend
```