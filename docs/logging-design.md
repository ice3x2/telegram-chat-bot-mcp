# Phase 3.3: 로깅 및 모니터링 설계

## 개요
간단하고 효율적인 로깅 시스템으로 30일 보관 정책 적용

## 로깅 전략

### 1. 로그 레벨
- **INFO**: 정상 동작 (메시지 전송 성공)
- **WARN**: 경고 (폴백 사용, 이미지 검증 실패)
- **ERROR**: 오류 (전송 실패, 변환 실패)

### 2. 로그 파일 구조
```
logs/
├── app-2025-10-29.log          # 일별 로그
├── app-2025-10-28.log
├── errors-2025-10-29.log       # 에러 전용 로그
└── archive/                     # 30일 이후 자동 삭제
```

### 3. 로그 포맷
```
[2025-10-29T12:34:56.789Z] [INFO] [sendMarkdown] Message sent successfully (messageId: xxx, elapsed: 123ms)
[2025-10-29T12:35:01.234Z] [WARN] [imageValidator] Image validation failed (url: https://..., error: 404)
[2025-10-29T12:35:05.678Z] [ERROR] [markdownToCards] Conversion failed (error: Invalid markdown)
```

### 4. 로그 내용

#### 메시지 전송 성공
```typescript
{
  timestamp: "2025-10-29T12:34:56.789Z",
  level: "INFO",
  module: "sendMarkdownMessage",
  event: "message_sent",
  messageId: "spaces/xxx/messages/yyy",
  elapsed: 123,
  usedFallback: false,
  cardTitle: "Test Card"
}
```

#### 폴백 사용
```typescript
{
  timestamp: "2025-10-29T12:34:56.789Z",
  level: "WARN",
  module: "sendMarkdownMessage",
  event: "fallback_used",
  messageId: "spaces/xxx/messages/yyy",
  reason: "Cards V2 validation failed",
  elapsed: 145
}
```

#### 이미지 검증 실패
```typescript
{
  timestamp: "2025-10-29T12:34:56.789Z",
  level: "WARN",
  module: "imageValidator",
  event: "image_validation_failed",
  url: "https://example.com/image.jpg",
  error: "HTTP 404: Not Found"
}
```

#### 전송 실패
```typescript
{
  timestamp: "2025-10-29T12:34:56.789Z",
  level: "ERROR",
  module: "sendMarkdownMessage",
  event: "send_failed",
  error: "AxiosError: Network error",
  cardTitle: "Test Card"
}
```

## 구현 계획

### 1. Logger 클래스
```typescript
class Logger {
  - log(level, module, event, data)
  - info(module, event, data)
  - warn(module, event, data)
  - error(module, event, data)
  - cleanOldLogs(daysToKeep = 30)
}
```

### 2. 로그 로테이션
- 매일 자정에 새 로그 파일 생성
- 30일 이상 된 로그 파일 자동 삭제
- 에러 로그는 별도 파일로 보관

### 3. 통합 포인트
- `sendMarkdownMessage`: 전송 성공/실패, 폴백 사용
- `imageValidator`: 이미지 검증 결과
- `markdownToCardsV2`: 변환 에러
- `sendCardsV2Message`: 전송 에러

### 4. 모니터링 메트릭 (선택적)
```typescript
{
  total_requests: 0,
  successful_requests: 0,
  failed_requests: 0,
  fallback_requests: 0,
  image_validation_failures: 0,
  avg_response_time: 0
}
```

## 환경 변수
```env
LOG_LEVEL=INFO              # 로그 레벨 (DEBUG, INFO, WARN, ERROR)
LOG_DIR=./logs              # 로그 디렉토리
LOG_RETENTION_DAYS=30       # 로그 보관 일수
LOG_ENABLE_CONSOLE=true     # 콘솔 출력 여부
```

## 파일 구조
```
src/
├── utils/
│   ├── logger.ts           # Logger 클래스
│   └── logCleaner.ts       # 로그 정리 유틸리티
└── types/
    └── log.ts              # 로그 타입 정의
```

## 장점
- ✅ 간단하고 가벼움 (외부 의존성 없음)
- ✅ 파일 기반으로 영속성 보장
- ✅ 30일 자동 정리로 디스크 관리
- ✅ JSON 형식으로 파싱 용이
- ✅ 에러 로그 별도 관리

## 제한사항
- 단일 서버 환경에 적합
- 대용량 트래픽에는 부적합 (로그 서버 별도 필요)
- 실시간 모니터링 없음 (별도 도구 필요)

## 확장 가능성
- Winston/Pino 등 로깅 라이브러리 통합
- ELK Stack 연동
- Slack/Discord 알림 통합
- Prometheus 메트릭 Export
