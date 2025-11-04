import requests
import json

token = 'PLACEHOLDER_BOT_TOKEN'
chat_id = '1195212155'
url = f'https://api.telegram.org/bot{token}/sendMessage'

message = """# 📋 Telegram Bot MCP 작업 완료 보고서

## ✅ 프로젝트 완료
**프로젝트명**: telegram-chat-bot-mcp
**최종 버전**: 0.1.4  
**상태**:  완료 및 npm 배포

##  주요 성과

### 패키지 배포
 npm 레지스트리 등록  
 최신 버전: 0.1.4  
 설치: npm install -g telegram-chat-bot-mcp

### 문서화
 한영문 이중 언어 README  
 설치 및 사용 가이드  
 MCP 클라이언트 설정 예시

### 버그 수정
 v0.1.1: 패키지 이름 수정  
 v0.1.2: README 오타 수정  
 v0.1.3: bin 명령어 수정  
 v0.1.4: ES 모듈 import 경로 수정

##  최종 상태
**빌드**:  PASS  
**테스트**:  PASS  
**배포**:  npm 완료

작업 완료: 2025-11-04"""

payload = {
    'chat_id': chat_id,
    'text': message,
    'parse_mode': 'HTML'
}

response = requests.post(url, json=payload)
print('상태:', response.status_code)
print('응답:', response.json())
