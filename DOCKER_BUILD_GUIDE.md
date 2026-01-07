# Docker Build 최적화 가이드

## ML Service 빌드 속도 개선

### 적용된 최적화

1. **Multi-stage Build** - Dockerfile 최적화
   - Builder 스테이지: 빌드 도구와 의존성 설치
   - Runtime 스테이지: 최소한의 런타임 환경만 포함
   - 결과: 최종 이미지 크기 감소 및 빌드 캐시 효율성 향상

2. **.dockerignore** - 불필요한 파일 제외
   - Python 캐시, 테스트 파일, 문서 등 제외
   - 빌드 컨텍스트 크기 최소화

3. **BuildKit 캐싱** - docker-compose.yml 최적화
   - 레이어 캐싱으로 재빌드 시간 단축
   - `cache_from` 설정으로 이전 빌드 재사용

### 빌드 방법

#### 1. 처음 빌드 (느림, ~3-5분)
```bash
# BuildKit 활성화
set DOCKER_BUILDKIT=1
set COMPOSE_DOCKER_CLI_BUILD=1

# 빌드
docker-compose build ml-service
```

#### 2. 재빌드 (빠름, ~30초-1분)
requirements.txt가 변경되지 않았다면 캐시를 사용하여 빠르게 빌드됩니다.

```bash
docker-compose build ml-service
```

#### 3. 캐시 무시하고 완전히 새로 빌드
```bash
docker-compose build --no-cache ml-service
```

### 개발 모드

개발 중에는 빌드 없이 볼륨 마운트로 코드를 즉시 반영합니다:

```bash
docker-compose up ml-service
```

코드 변경사항은 `--reload` 옵션으로 자동 반영됩니다.

### 추가 최적화 팁

#### 1. 로컬에서 pip 캐시 활용
```dockerfile
# Dockerfile에 추가할 수 있는 옵션
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

#### 2. Pre-built Wheel 사용
sentence-transformers 같은 큰 패키지는 미리 빌드된 wheel을 사용:
```bash
pip download -r requirements.txt -d wheels/
# wheels/ 폴더를 git에 추가하고 Dockerfile에서 사용
```

#### 3. 개발 의존성 분리
```
requirements.txt       # 프로덕션 의존성
requirements-dev.txt   # 개발 의존성
```

### 빌드 시간 비교

| 시나리오 | 기존 | 최적화 후 |
|---------|------|----------|
| 첫 빌드 | ~5-7분 | ~3-5분 |
| 코드만 변경 | ~5-7분 | ~10-30초 |
| requirements.txt 변경 | ~5-7분 | ~2-4분 |
| 이미지 크기 | ~1.5GB | ~800MB-1GB |

### 문제 해결

#### 캐시가 작동하지 않는 경우
```bash
# Docker BuildKit이 활성화되어 있는지 확인
docker buildx version

# Windows
set DOCKER_BUILDKIT=1

# Linux/Mac
export DOCKER_BUILDKIT=1
```

#### 디스크 공간 정리
```bash
# 사용하지 않는 이미지 제거
docker image prune -a

# 빌드 캐시 정리
docker builder prune
```
