# 한국투자증권 주식 모니터링 Functions

이 프로젝트는 Google Cloud Functions를 사용하여 한국투자증권 Open API로 보유 종목의 시세를 모니터링하고, 고점 대비 하락률이 10% 이상일 때 슬랙으로 알림을 보내는 시스템입니다.

## 기능

- 매일 오전 9시 자동 실행
- 보유 종목 조회
- 고점 대비 하락률 계산 (최근 30일 기준)
- 10% 이상 하락 시 슬랙 알림
- 일일 요약 리포트 전송

## 설정 방법

### 1. 한국투자증권 Open API 설정

1. [한국투자증권 Open API](https://securities.koreainvestment.com/main/index.jsp)에서 계정 생성
2. 모의투자 또는 실제 계좌 설정
3. App Key와 App Secret 발급
4. 계좌번호 확인

### 2. Slack 봇 설정

1. [Slack API](https://api.slack.com/)에서 새 앱 생성
2. Bot Token 발급 (`xoxb-`로 시작)
3. 봇을 원하는 채널에 초대
4. 채널 ID 확인

### 3. 환경 변수 설정

`env.example` 파일을 참고하여 환경 변수를 설정하세요:

```bash
# Firebase 설정
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# 한국투자증권 Open API 설정
KIS_APP_KEY=your_kis_app_key
KIS_APP_SECRET=your_kis_app_secret
KIS_ACCOUNT_NO=your_account_number
KIS_ACCOUNT_CODE=your_account_code

# Slack 설정
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_CHANNEL_ID=#stock-alerts

# 앱 설정
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 4. OAuth 인증

1. 웹 앱에서 `/api/kis/auth` 엔드포인트 호출
2. 한국투자증권 로그인 페이지로 리다이렉트
3. 인증 완료 후 토큰이 Firestore에 저장됨

## 배포

### 1. 의존성 설치

```bash
npm install
```

### 2. Firebase Functions 배포

```bash
firebase deploy --only functions
```

### 3. 환경 변수 설정 (Firebase Console)

Firebase Console > Functions > Configuration에서 환경 변수를 설정하세요.

## 스케줄 설정

- `dailyStockCheck`: 매일 오전 9시 실행 (10% 하락 기준)
- `manualStockCheck`: 1시간마다 실행 (5% 하락 기준, 테스트용)

## API 엔드포인트

### OAuth 콜백

- `GET /api/kis/callback`: 한국투자증권 OAuth 콜백 처리

## 모니터링

Firebase Console > Functions > Logs에서 실행 로그를 확인할 수 있습니다.

## 문제 해결

### 토큰 만료

- 토큰은 자동으로 갱신됩니다
- 수동 갱신이 필요한 경우 OAuth 인증을 다시 진행하세요

### API 호출 제한

- 한국투자증권 API는 호출 제한이 있습니다
- 모의투자 환경에서는 제한이 더 엄격할 수 있습니다

### 슬랙 알림 실패

- 봇 토큰이 유효한지 확인
- 봇이 채널에 초대되었는지 확인
- 채널 ID가 올바른지 확인
