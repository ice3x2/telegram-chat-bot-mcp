# CI/CD 설정 가이드

## GitHub Actions 워크플로우

이 프로젝트는 GitHub Actions를 사용하여 자동화된 CI/CD 파이프라인을 구성합니다.

## 워크플로우 구성

### 1. Build and Test Job

**트리거**: Push 및 Pull Request (master/main 브랜치)

**실행 환경**: 
- Node.js 18.x, 20.x (매트릭스 빌드)
- Ubuntu Latest

**단계**:
1. ✅ 코드 체크아웃
2. ✅ Node.js 설정
3. ✅ 의존성 설치 (`npm ci`)
4. ✅ Lint 검사 (`npm run lint`)
5. ✅ 빌드 (`npm run build`)
6. ✅ 스냅샷 테스트 (`npm run test:snapshot`)
7. ✅ 로깅 테스트 (`npm run test:logging`)
8. ✅ 아티팩트 업로드 (빌드 결과, 테스트 결과)

### 2. Integration Test Job

**트리거**: Master 브랜치 Push

**환경 변수**:
- `GOOGLE_CHAT_WEBHOOK_URL` (시크릿)

**단계**:
1. ✅ 코드 체크아웃
2. ✅ Node.js 20.x 설정
3. ✅ 의존성 설치
4. ✅ 빌드
5. ✅ 통합 테스트 (웹훅 URL이 설정된 경우)
6. ✅ 로그 업로드

## GitHub Secrets 설정

### 필수 시크릿

1. **GOOGLE_CHAT_WEBHOOK_URL**
   - Google Chat 웹훅 URL
   - 통합 테스트에 사용

### 시크릿 설정 방법

#### 방법 1: GitHub Web UI

1. 리포지토리로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. Name: `GOOGLE_CHAT_WEBHOOK_URL`
5. Value: 웹훅 URL 입력
6. "Add secret" 클릭

#### 방법 2: GitHub CLI

```bash
# WSL에서 실행
gh secret set GOOGLE_CHAT_WEBHOOK_URL

# 입력 프롬프트에서 웹훅 URL 붙여넣기
```

## 로컬 테스트

GitHub Actions 워크플로우를 푸시하기 전에 로컬에서 테스트:

```bash
# 의존성 설치
npm ci

# Lint
npm run lint

# 빌드
npm run build

# 스냅샷 테스트
npm run test:snapshot

# 로깅 테스트
npm run test:logging

# 통합 테스트 (웹훅 URL 필요)
export GOOGLE_CHAT_WEBHOOK_URL="https://chat.googleapis.com/..."
npx ts-node scripts/test-logging-integration.ts
```

## 워크플로우 파일

- `.github/workflows/ci.yml`: 메인 CI/CD 파이프라인

## ESLint 설정

- `eslint.config.mjs`: ESLint 9.x 플랫 구성
- TypeScript 지원
- 경고만 출력 (빌드 차단 안함)

## 아티팩트

각 빌드에서 다음 아티팩트가 생성됩니다:

1. **dist-{node-version}**: 컴파일된 JavaScript 파일
2. **test-results-{node-version}**: 테스트 결과 JSON
3. **integration-logs**: 통합 테스트 로그

보관 기간: 7일

## 트러블슈팅

### "no git remotes found"

```bash
# 원격 리포지토리 추가
git remote add origin https://github.com/USERNAME/REPO.git
```

### "GOOGLE_CHAT_WEBHOOK_URL not set"

통합 테스트는 웹훅 URL이 없으면 자동으로 건너뜁니다.

### ESLint 경고

ESLint 경고는 빌드를 차단하지 않습니다. 경고를 수정하려면:

```bash
npm run lint:fix
```

## 다음 단계

1. ✅ GitHub 리포지토리 생성
2. ✅ 원격 리포지토리 연결
3. ✅ 시크릿 설정
4. ✅ 워크플로우 푸시 및 확인
