# Global Weather - HTML 버전

이 프로젝트는 별도 앱 설치 없이 실행 가능한 순수 HTML/CSS/JavaScript 버전입니다.

## 실행 방법

1. `index.html`을 메모장 또는 VS Code로 엽니다.
2. 아래 코드를 찾습니다.

```js
const OPENWEATHER_API_KEY = "YOUR_OPENWEATHER_API_KEY";
```

3. `YOUR_OPENWEATHER_API_KEY`를 본인의 OpenWeather API Key로 교체합니다.
4. `index.html`을 더블클릭해 브라우저에서 엽니다.

## 현재 위치 기능

도시 검색은 일반적으로 파일을 직접 열어도 사용할 수 있습니다.

다만 Chrome 등 일부 브라우저는 `file://` 환경에서 현재 위치 접근을 막을 수 있습니다.
현재 위치 기능까지 사용하려면 VS Code Live Server 또는 아래와 같이 간단한 로컬 서버를 권장합니다.

```bash
python -m http.server 8000
```

이후 브라우저에서:

```text
http://localhost:8000
```

으로 접속합니다.

## Console 확인

브라우저에서 F12 → Console을 열면 아래 원본 데이터가 출력됩니다.

- GEOCODING RAW DATA
- CURRENT WEATHER RAW DATA
- 5 DAY FORECAST RAW DATA
- AIR POLLUTION RAW DATA
- FINAL WEATHER BUNDLE

## 구현 기능

- 한글/영문 전세계 도시 검색
- 한글 주요 도시 Alias fallback
- 현재 날씨
- 체감온도 / 습도 / 바람 / 기압 / 가시거리
- 현지시간 / 일출 / 일몰
- 시간별 예보
- 5일 예보
- 대기질
- 현재 위치
- 즐겨찾기
- 최근 검색
- 섭씨/화씨 전환


## UI / 테마

- 우측 상단 🌙/☀️ 버튼으로 라이트/다크모드 전환
- 테마 선택은 localStorage에 저장되어 새로 열어도 유지
- 모바일 반응형 카드 UI
- 파스텔/글래스모피즘 스타일
