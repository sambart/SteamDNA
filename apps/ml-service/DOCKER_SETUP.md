# Docker Setup Guide for ML Service

## Docker에서 DB 연결 문제 해결 ✅ (해결됨)

### 문제 증상
- ML Service 컨테이너가 시작되지 않음
- "Connection refused" 또는 "could not translate host name" 오류
- 데이터베이스 연결 실패
- ALLOWED_ORIGINS 파싱 오류
- Backend "SASL: client password must be a string" 오류

### 해결 방법 (모두 적용됨)

#### 1. 환경 변수 확인

`.env` 파일을 생성하고 Docker용 설정 사용:

```bash
# apps/ml-service/.env
DB_HOST=postgres  # Docker 컨테이너 이름 사용 (localhost 아님!)
DB_PORT=5432
DB_USERNAME=steamdna
DB_PASSWORD=steamdna_password
DB_DATABASE=steamdna
```

#### 2. Docker Compose 실행

루트 디렉토리에서:

```bash
# 모든 서비스 시작
docker-compose up -d

# ML Service 로그 확인
docker-compose logs -f ml-service

# 데이터베이스 로그 확인
docker-compose logs -f postgres
```

#### 3. 연결 테스트

컨테이너 내부에서 테스트:

```bash
# ML Service 컨테이너 접속
docker exec -it steamdna-ml-service bash

# 연결 테스트 실행
python test_db_connection.py
```

#### 4. Health Check 확인

```bash
# Health endpoint 확인
curl http://localhost:5000/health
```

예상 응답:
```json
{
  "status": "healthy",
  "database": "connected",
  "service": "SteamDNA ML Service",
  "version": "1.0.0"
}
```

---

## 주요 변경 사항

### 1. database.py
- ✅ `pool_pre_ping=True`: 연결 전 health check
- ✅ Connection pool 설정 추가
- ✅ `init_db()`: 재시도 로직 포함
- ✅ `text()` 함수 사용으로 SQLAlchemy 2.0 호환성 보장

### 2. main.py
- ✅ FastAPI lifespan: 시작 시 DB 초기화
- ✅ 재시도 로직: 최대 10회, 2초 간격
- ✅ Health check: DB 상태 확인 포함
- ✅ `text()` 함수 사용으로 health check 수정

### 3. config.py
- ✅ `field_validator` 추가로 ALLOWED_ORIGINS 파싱
- ✅ `Union[str, List[str]]` 타입으로 환경변수와 코드 모두 지원

### 4. docker-compose.yml
- ✅ `depends_on` with `condition: service_healthy`
- ✅ PostgreSQL healthcheck 설정
- ✅ 네트워크 설정: `steamdna-network`
- ✅ ALLOWED_ORIGINS: 콤마 구분 문자열 형식으로 변경
- ✅ Backend 환경변수 문자열 타입 명시 (따옴표 추가)

### 5. apps/backend/src/app.module.ts
- ✅ 환경변수 이름 수정: `DB_Password` → `DB_PASSWORD`

---

## 트러블슈팅

### 문제 1: "Connection refused"

**원인:** PostgreSQL이 준비되기 전에 ML Service가 시작됨

**해결:**
```bash
# PostgreSQL이 완전히 시작될 때까지 대기
docker-compose up -d postgres
sleep 10
docker-compose up -d ml-service
```

### 문제 2: "could not translate host name"

**원인:** `.env` 파일에 `DB_HOST=localhost` 사용

**해결:**
```bash
# .env 파일 수정
DB_HOST=postgres  # Docker 컨테이너 이름 사용
```

### 문제 3: "FATAL: password authentication failed"

**원인:** 잘못된 인증 정보

**해결:**
```bash
# docker-compose.yml과 .env의 인증 정보 일치 확인
# PostgreSQL 데이터 볼륨 삭제 후 재시작
docker-compose down -v
docker-compose up -d
```

### 문제 4: 로그에서 계속 재시도

**정상 동작:** `init_db()`가 PostgreSQL 준비될 때까지 재시도

로그 예시:
```
Database connection attempt 1/10 failed: ...
Retrying in 2 seconds...
Database connection attempt 2/10 failed: ...
Retrying in 2 seconds...
Database connection established successfully
```

---

## 로컬 개발 vs Docker

### 로컬 개발
```bash
# .env
DB_HOST=localhost
DB_PORT=5432

# 실행
uvicorn app.main:app --reload
```

### Docker
```bash
# .env
DB_HOST=postgres
DB_PORT=5432

# 실행
docker-compose up
```

---

## 유용한 명령어

```bash
# 모든 컨테이너 상태 확인
docker-compose ps

# 특정 서비스 재시작
docker-compose restart ml-service

# 로그 실시간 확인
docker-compose logs -f ml-service postgres

# 컨테이너 내부 접속
docker exec -it steamdna-ml-service bash

# PostgreSQL 접속
docker exec -it steamdna-postgres psql -U steamdna -d steamdna

# 볼륨 삭제 (데이터 초기화)
docker-compose down -v
```

---

## 참고 자료

- [FastAPI Lifespan Events](https://fastapi.tiangolo.com/advanced/events/)
- [SQLAlchemy Connection Pooling](https://docs.sqlalchemy.org/en/20/core/pooling.html)
- [Docker Compose Healthcheck](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)
