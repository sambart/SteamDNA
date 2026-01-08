# SteamDNA 🎮

Steam 프로필을 분석하여 나만의 게이밍 취향을 발견하세요. SteamDNA는 게임 데이터를 수집하고, 플레이 패턴을 분석하여 고유한 게이밍 성향에 대한 인사이트를 제공합니다.

## 주요 기능

- 🔍 **Steam ID 검색** - Steam ID를 입력하여 간편하게 시작
- 📊 **데이터 수집** - Steam 게임 데이터 자동 수집 및 분석
- 🧬 **ML 기반 분석** - 머신러닝 기반의 게이밍 행동 분석
- 📈 **인터랙티브 대시보드** - 아름다운 차트로 게임 통계 시각화
- 🎯 **게이밍 페르소나** - AI가 분류하는 게임 성향 (5가지 페르소나)
- 🤖 **특성 추출** - 심층 인사이트를 위한 16차원 특성 벡터

## 기술 스택

### 백엔드
- **NestJS** - Progressive Node.js 프레임워크
- **TypeORM** - TypeScript/JavaScript용 ORM
- **PostgreSQL** - 메인 데이터베이스
- **Redis** - 캐싱 및 세션 관리
- **Steam Web API** - 데이터 수집을 위한 직접 연동

### ML 서비스
- **FastAPI** - 고성능 Python API 프레임워크
- **scikit-learn** - 머신러닝 알고리즘 (K-means 클러스터링)
- **pandas/numpy** - 데이터 처리 및 특성 엔지니어링
- **SQLAlchemy** - Python용 데이터베이스 ORM

### 프론트엔드
- **Next.js 14** - App Router를 사용하는 React 프레임워크
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크
- **Recharts** - 조합 가능한 차트 라이브러리
- **TypeScript** - 타입 안전 개발

### DevOps
- **Docker** - 컨테이너화
- **Docker Compose** - 멀티 컨테이너 오케스트레이션

## 시작하기

### 사전 요구사항

- Node.js 18+ 및 npm 9+
- Docker 및 Docker Compose (선택사항, 컨테이너 설정용)
- Steam API Key ([여기서 발급](https://steamcommunity.com/dev/apikey))

### 설치

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd steam-dna
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
   npm install
   ```

### Docker로 실행 (권장)

```bash
# 모든 서비스 시작 (PostgreSQL, Redis, Backend, ML Service, Frontend)
npm run docker:up

# 로그 확인
npm run docker:logs

# 모든 서비스 중지
npm run docker:down
```

애플리케이션 접근:
- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:4000/api
- 백엔드 API 문서: http://localhost:4000/api/docs
- ML 서비스 API: http://localhost:5000
- ML 서비스 문서: http://localhost:5000/docs

### 로컬에서 실행

1. **PostgreSQL과 Redis 시작**
   ```bash
   docker-compose up postgres redis -d
   ```

2. **백엔드 실행**
   ```bash
   npm run dev:backend
   ```

3. **프론트엔드 실행** (새 터미널에서)
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
# Steam API 설정
STEAM_API_KEY=your_steam_api_key_here

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=steamdna
DB_PASSWORD=steamdna_password
DB_DATABASE=steamdna
```

### Steam API Key 발급받기

1. https://steamcommunity.com/dev/apikey 방문
2. Steam 계정으로 로그인
3. 도메인 이름 입력 (개발 시 `localhost` 사용)
4. 생성된 API 키를 `.env` 파일에 복사

## API 문서

백엔드가 실행 중일 때 http://localhost:4000/api/docs 에서 Swagger 기반 대화형 API 문서를 확인할 수 있습니다.

### 주요 엔드포인트

모든 엔드포인트는 Steam ID64, vanity URL 이름 또는 프로필 URL을 식별자로 받습니다:

- `GET /api/steam/user/:identifier` - 완전한 Steam 사용자 데이터 조회
- `GET /api/steam/games/:identifier` - 보유 게임 조회
- `GET /api/steam/player/:identifier` - 플레이어 요약 정보 조회
- `GET /api/analysis/summary/:identifier` - 게임 프로필 요약 조회
- `GET /api/analysis/dashboard/:identifier` - 상세 대시보드 데이터 조회

예시:
- `/api/steam/user/76561197960287930` (Steam ID64)
- `/api/steam/user/gaben` (Vanity URL)
- `/api/steam/user/steamcommunity.com/id/gaben` (프로필 URL)

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
```