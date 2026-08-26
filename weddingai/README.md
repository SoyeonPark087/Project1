# 김민혁 · 이서영 모바일 청첩장

PRD v1.1을 기준으로 제작한 모바일 우선 단일 페이지 청첩장입니다.

## 포함 기능

- 360~430px 스마트폰 우선 반응형 UI
- Hero / 초대 문구 / 가족 관계 / 예식 안내
- 카카오맵 Web(JavaScript) SDK 지도 + 장소 검색/주소 fallback + 외부 지도 링크
- `2026-09-01T12:00:00+09:00` 기준 실시간 DAYS/HOURS/MINUTES/SECONDS 카운트다운
- 탭 백그라운드 복귀 시 `Date.now()` 기준 자동 보정
- 스크롤 진입 시 아래→위 `fade + translateY(24px)` 리빌 애니메이션
- `IntersectionObserver`, 1회 실행, 갤러리 stagger, `prefers-reduced-motion` 대응
- 이미지 경로 `./images/이미지파일명` 규칙
- 갤러리 4장 + 전체 화면 라이트박스 + 좌우 스와이프
- 신랑/신부 연락 Bottom Sheet (전화번호 입력 전 비활성)
- 신랑측/신부측 계좌번호 복사 + Clipboard fallback + Toast
- Google Sheets 기반 방명록 조회/등록 API
- PWA manifest + 정적 자산 서비스 워커

## 폴더 구조

```text
mobile_wedding_invitation/
├─ index.html
├─ styles.css
├─ script.js
├─ config.js              # 카카오 JavaScript 키 입력
├─ manifest.webmanifest
├─ sw.js
├─ package.json
├─ vercel.json
├─ .env.example
├─ api/
│  └─ guestbook.js
├─ docs/
│  └─ GOOGLE_SHEETS_SETUP.md
└─ images/
   ├─ cover.jpg
   ├─ couple-main.jpg
   ├─ gallery-01.jpg ... gallery-04.jpg
   ├─ share-thumbnail.jpg
   └─ icon-192.png / icon-512.png
```

## 바로 수정할 값

### 1. 신랑 / 신부 전화번호

`script.js` 상단의 아래 값을 실제 번호로 바꾸세요.

```js
const WEDDING_DATA = {
  weddingAt: '2026-09-01T12:00:00+09:00',
  groom: { name: '김민혁', phone: '01012345678' },
  bride: { name: '이서영', phone: '01098765432' }
};
```

전화번호가 비어 있으면 연락 Bottom Sheet에서 해당 버튼이 자동 비활성 처리됩니다.

### 2. 실제 웨딩 이미지

`images` 폴더의 파일을 같은 파일명으로 교체하면 코드 수정 없이 반영됩니다.

- `./images/cover.jpg`
- `./images/couple-main.jpg`
- `./images/gallery-01.jpg` ~ `./images/gallery-04.jpg`
- `./images/share-thumbnail.jpg`

권장: 커버 3:4 또는 4:5, 갤러리 원본은 긴 변 1600px 안팎의 WebP/JPEG 최적화 이미지.

## 카카오맵 설정

`config.js`에 **JavaScript 키**만 입력합니다.

```js
window.WEDDING_CONFIG = Object.freeze({
  KAKAO_MAP_JAVASCRIPT_KEY: '여기에_발급받은_JAVASCRIPT_KEY'
});
```

Kakao Developers에서 앱의 카카오맵 사용 설정을 ON으로 켜고, 해당 JavaScript 키에 개발/운영 도메인을 등록해야 합니다. 예: `http://localhost:3000`, `https://your-domain.com`. REST API 키나 Admin 키는 지도 Web SDK에 사용하지 않습니다.

상세 절차는 `docs/KAKAO_MAP_SETUP.md`를 참고하세요.

## 로컬 실행

방명록 API까지 확인하려면 Node.js 설치 후 이 폴더에서 실행합니다.

```bash
npm install
cp .env.example .env
npm run dev
```

Vercel CLI가 로컬 정적 파일과 `/api/guestbook` 함수를 함께 실행합니다.

단순 화면 확인만 필요하면 `index.html`을 브라우저로 열 수 있지만, `/api/guestbook`은 로컬 파일 모드에서 동작하지 않습니다.

## Google Sheets 방명록

`docs/GOOGLE_SHEETS_SETUP.md`의 순서대로 Google Sheet와 서비스 계정을 설정한 뒤 환경변수를 입력하세요.

중요: Google Sheet를 "링크가 있는 모든 사용자 편집 가능"으로 공개하지 않습니다. 브라우저에는 Sheet ID와 서비스 계정 비밀키를 직접 넣지 않습니다.

## 날짜 / 요일

PRD의 결정에 따라 Single Source of Truth는 `2026-09-01T12:00:00+09:00`입니다. 따라서 화면 요일은 브라우저에서 KST 기준으로 자동 산출되어 **화요일**로 표시됩니다. 원문에 적힌 "토요일"과 달라 최종 오픈 전 실제 예식 날짜를 다시 확인하세요.

## 배포

Vercel 프로젝트에 폴더를 연결하고 `.env`의 4개 값을 프로젝트 Environment Variables에 입력하면 됩니다. 배포 후 실제 도메인이 결정되면 `index.html`의 `og:image`는 SNS 공유 호환성을 위해 절대 URL로 바꾸는 것을 권장합니다.
