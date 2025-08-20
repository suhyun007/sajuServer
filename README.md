# 사주 API 서버

사주 계산을 위한 RESTful API 서버입니다. Next.js 14와 TypeScript를 사용하여 구축되었으며, Vercel에 배포할 수 있습니다.

## 🚀 기능

- 사주 계산 API (`POST /api/saju`)
- OpenAI GPT-3.5-turbo를 활용한 개인화된 운세 생성
- 출생 정보 기반 사주 분석
- 오늘의 운세 (전체, 재물, 건강, 연애, 조언)
- TypeScript로 타입 안전성 보장
- Vercel 자동 배포 지원

## 🛠️ 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-3.5-turbo
- **Deployment**: Vercel
- **Package Manager**: npm

## 📦 설치 및 실행

### 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

### Vercel 배포

1. [Vercel](https://vercel.com)에 가입하고 로그인
2. GitHub/GitLab/Bitbucket에서 프로젝트 import
3. 자동으로 배포됩니다

또는 Vercel CLI 사용:

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

## 📡 API 사용법

### 사주 계산 API

**엔드포인트**: `POST /api/saju`

**요청 예시**:
```json
{
  "birthYear": 1990,
  "birthMonth": 5,
  "birthDay": 15,
  "birthHour": 14,
  "birthMinute": 30,
  "gender": "male"
}
```

**응답 예시**:
```json
{
  "success": true,
  "data": {
    "saju": "庚午甲申",
    "elements": {
      "year": "庚",
      "month": "午",
      "day": "甲",
      "hour": "申"
    },
    "today_fortune": {
      "overall": "오늘은 새로운 기회가 찾아올 수 있는 날입니다.",
      "wealth": "재정적으로 안정적인 하루가 될 것입니다.",
      "health": "건강에 특별한 문제는 없을 것입니다.",
      "love": "연애운이 좋은 하루입니다.",
      "advice": "긍정적인 마음가짐으로 하루를 보내시기 바랍니다."
    }
  }
}
```

### 서버 상태 확인

**엔드포인트**: `GET /api/saju`

**응답 예시**:
```json
{
  "success": true,
  "message": "사주 API 서버가 정상적으로 작동 중입니다.",
  "endpoints": {
    "POST": "/api/saju - 사주 계산 및 오늘의 운세"
  },
  "note": "OpenAI API 키가 필요합니다. 환경 변수 OPENAI_API_KEY를 설정해주세요."
}
```

## 🔧 환경 변수

### OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 API 키를 발급받으세요.
2. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```bash
OPENAI_API_KEY=your_openai_api_key_here
```

3. Vercel에 배포할 때는 Vercel 대시보드의 환경 변수 설정에서 `OPENAI_API_KEY`를 추가하세요.

## 📁 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   └── saju/
│   │       └── route.ts          # 사주 API 엔드포인트
│   ├── globals.css               # 전역 스타일
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/                   # 재사용 가능한 컴포넌트
├── lib/                         # 유틸리티 함수
└── types/                       # TypeScript 타입 정의
```

## 🧪 테스트

```bash
# 테스트 실행
npm test

# 테스트 커버리지 확인
npm run test:coverage
```

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.
