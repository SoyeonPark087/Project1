/**
 * 연습과제용 설정 파일
 *
 * 1) KAKAO_JAVASCRIPT_KEY
 *    Kakao Developers > 앱 키 > JavaScript 키
 *
 * 2) PUBLIC_DATA_SERVICE_KEY
 *    공공데이터포털에서 발급받은 일반 인증키
 *
 * 주의:
 * 이 프로젝트는 연습과제용이라 브라우저 JavaScript에서 공공데이터 API를 직접 호출합니다.
 * 실제 서비스에서는 PUBLIC_DATA_SERVICE_KEY를 프론트엔드에 노출하지 마세요.
 */
window.APP_CONFIG = {
  KAKAO_JAVASCRIPT_KEY: "18c8508b256818bfd7519b07216214dc",
  PUBLIC_DATA_SERVICE_KEY: "b869a72262b1f2fffe13762f7a3800c662cce0a104309a9d5274da7bf2bb002b",

  // 한 페이지 조회 건수. 문서 예시는 10이지만 과제에서는 호출 횟수를 줄이기 위해 100 사용.
  PUBLIC_DATA_ROWS_PER_PAGE: 100,

  // 안전장치: 최대 페이지 수
  PUBLIC_DATA_MAX_PAGES: 10
};
