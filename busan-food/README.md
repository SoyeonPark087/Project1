# 부산 공식 맛집 가이드 — 연습과제용 순수 HTML/CSS/JavaScript 버전

이 프로젝트는 **Backend 없이** 브라우저 JavaScript에서 직접:

- 부산맛집 국문 API `getFoodKr`
- 부산맛집 영문 API `getFoodEn`
- Kakao Maps JavaScript API

를 호출하도록 만든 연습과제용 버전입니다.

> 실제 서비스에서는 공공데이터 ServiceKey를 프론트엔드 코드에 넣지 않는 것이 맞습니다.
> 이 프로젝트는 사용자가 "연습과제용"이라고 명시한 상황을 전제로 합니다.

---

## 1. 키 넣는 곳

`config.js` 하나만 수정하세요.

```javascript
window.APP_CONFIG = {
  KAKAO_JAVASCRIPT_KEY: "여기에_카카오_JavaScript_키",
  PUBLIC_DATA_SERVICE_KEY: "여기에_공공데이터_ServiceKey",

  PUBLIC_DATA_ROWS_PER_PAGE: 100,
  PUBLIC_DATA_MAX_PAGES: 10
};
```

### 카카오 키

반드시 **JavaScript 키**를 사용합니다.

### 공공데이터 키

공공데이터포털에서 발급받은 `ServiceKey`를 넣습니다.

국문/영문 Endpoint가 달라도 같은 ServiceKey를 사용합니다.

---

## 2. 실행 — Python 필요 없음

VS Code를 사용하는 경우:

1. VS Code 실행
2. 프로젝트 폴더 열기
3. Extensions에서 `Live Server` 설치
4. `index.html` 우클릭
5. `Open with Live Server`

보통 다음 주소가 열립니다.

```text
http://127.0.0.1:5500
```

또는

```text
http://localhost:5500
```

**index.html을 더블클릭해서 `file:///C:/...`로 열지 마세요.**

---

## 3. Kakao Developers 도메인 등록

브라우저에 Live Server 주소가:

```text
http://127.0.0.1:5500
```

이라면 Kakao Developers의 JavaScript SDK 도메인에도 동일하게:

```text
http://127.0.0.1:5500
```

을 등록하세요.

`localhost`로 실행한다면:

```text
http://localhost:5500
```

을 등록합니다.

---

## 4. 실제 공공데이터 호출

앱 시작 시 자동으로 다음 두 API를 호출합니다.

```text
https://apis.data.go.kr/6260000/FoodService/getFoodKr
https://apis.data.go.kr/6260000/FoodService/getFoodEn
```

파라미터:

```text
serviceKey
numOfRows
pageNo
resultType=json
```

그리고 국문/영문 데이터를 `UC_SEQ` 기준으로 합칩니다.

---

## 5. 구현 기능

- 실제 공공데이터 국문 + 영문 API 호출
- 전체 페이지 자동 수집
- `UC_SEQ` 기준 KO/EN 병합
- 한국어 / English UI
- 맛집명 / 메뉴 / 주소 / 상세 설명 통합 검색
- 구·군 필터
- 현재 위치 기반 거리순
- Kakao Maps 마커
- 마커 InfoWindow
- 카카오맵 길찾기
- 전화
- 찜
- 공유
- 최근 본 맛집
- localStorage 저장
- JSON 응답 파싱
- `resultType=json`인데 XML 응답이 오는 경우 XML fallback 파싱
- 공공데이터 오류 메시지 표시

---

## 6. CORS 오류가 발생할 수 있음

이 프로젝트는 브라우저에서 공공데이터 API를 직접 호출합니다.

따라서 해당 API 서버의 CORS 정책에 따라 브라우저 콘솔에 다음과 비슷한 오류가 날 수 있습니다.

```text
blocked by CORS policy
```

이 경우 **키 문제나 JavaScript 코드 문제가 아니라 브라우저 직접 호출이 서버에서 허용되지 않는 것**일 수 있습니다.

연습과제에서 CORS가 발생한다면 다음 단계에서는 Backend/Proxy 방식으로 바꿔야 합니다.

---

## 7. 이미지

첨부 API 가이드의 이미지 예시는:

```text
/uploadImgs/...
```

처럼 상대경로로 제공되어 있습니다.

가이드에는 이미지 호스트 도메인이 명시되어 있지 않으므로 이 프로젝트는 임의의 사이트 주소를 붙이지 않습니다.

따라서 API가 절대 URL을 내려주면 이미지를 표시하고, 상대경로만 내려주면 기본 화면을 표시합니다.

---

## 8. 파일 구조

```text
busan-food-guide-practice-frontend/
├─ index.html
├─ styles.css
├─ config.js
├─ app.js
└─ README.md
```

---

## 9. 과제 설명할 때 핵심

발표/보고서에서는 다음처럼 설명하면 됩니다.

```text
부산시 공공데이터의 국문/영문 음식점 정보를 각각 호출한 뒤,
콘텐츠 고유 ID인 UC_SEQ를 기준으로 병합하였다.

LAT/LNG 좌표를 Kakao Maps의 Marker에 사용하였고,
브라우저 Geolocation API를 이용해 사용자 현재 위치와 음식점의 거리를 계산하였다.

검색 기능은 공공데이터 API의 검색 파라미터가 아니라,
가져온 데이터를 JavaScript에서 맛집명/대표메뉴/주소/상세설명 기준으로 필터링하도록 구현하였다.
```


## 이번 수정사항

- API 호출은 성공했지만 맛집이 0건으로 보이는 경우를 수정했습니다.
- JSON 응답 구조가 `response.body.items.item`이 아니어도 `UC_SEQ`, `MAIN_TITLE`, `LAT`, `LNG` 등을 기준으로 실제 맛집 배열을 재귀 탐색합니다.
- 영문 API 호출이 실패하더라도 국문 맛집은 표시합니다.
- 개발자 콘솔에 `[PublicData] ... itemCount / totalCount` 로그를 출력합니다.
- `favicon.ico 404`는 앱 기능과 무관하므로 무시해도 됩니다.
