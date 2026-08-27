const API = {
  baseUrl: "https://apis.data.go.kr/6260000/FoodService",
  koEndpoint: "getFoodKr",
  enEndpoint: "getFoodEn"
};

const I18N = {
  ko: {
    brand: "부산 공식 맛집 가이드",
    hero: "부산에서 뭐 먹지?",
    searchPlaceholder: "맛집, 메뉴, 지역 검색",
    nearby: "📍 내 주변 맛집",
    openMap: "🗺 지도에서 보기",
    districtTitle: "지역별 맛집",
    viewAll: "전체보기",
    officialPicks: "부산 공식 맛집",
    home: "홈",
    search: "검색",
    map: "지도",
    favoritesShort: "찜",
    favorites: "찜한 맛집",
    noFavorites: "아직 찜한 맛집이 없어요",
    noFavoritesDesc: "마음에 드는 맛집의 하트를 눌러 저장해보세요.",
    settings: "설정",
    language: "언어",
    languageDesc: "한국어 또는 영어로 변경합니다.",
    location: "위치 권한",
    locationDesc: "내 주변 맛집 탐색에 사용합니다.",
    reloadData: "공공데이터 다시 불러오기",
    reloadDataDesc: "국문/영문 OpenAPI를 다시 호출합니다.",
    dataSource: "데이터 출처",
    dataSourceDesc: "공공데이터포털 부산맛집정보 서비스",
    practiceWarning: "연습과제용 프론트엔드 직접 호출 버전입니다. 실제 서비스에서는 공공데이터 ServiceKey를 서버에서 관리하세요.",
    recentlyViewed: "최근 본 맛집",
    selectLanguage: "언어 선택",
    sortRecommended: "추천순",
    sortDistance: "거리순",
    sortName: "이름순",
    myLocation: "◎ 내 위치",
    list: "☰ 목록",
    result: "개 맛집",
    all: "전체",
    call: "전화",
    directions: "길찾기",
    save: "찜",
    share: "공유",
    menu: "대표메뉴",
    hours: "영업시간",
    address: "주소",
    homepage: "홈페이지",
    copied: "공유 정보를 복사했어요.",
    locationDenied: "위치 권한이 필요합니다.",
    locating: "현재 위치를 확인했어요.",
    favoriteAdded: "찜에 저장했어요.",
    favoriteRemoved: "찜에서 삭제했어요.",
    loading: "공공데이터를 불러오는 중...",
    loaded: "데이터 로드 완료",
    apiKeyMissing: "공공데이터 API 키가 없습니다.",
    apiKeyHint: "config.js의 PUBLIC_DATA_SERVICE_KEY에 발급받은 인증키를 입력하세요.",
    apiError: "공공데이터 호출에 실패했습니다.",
    corsHint: "브라우저 콘솔에 CORS 오류가 보이면 해당 API가 브라우저 직접 호출을 허용하지 않는 경우입니다.",
    kakaoKeyMissing: "카카오맵 JavaScript 키가 없습니다.",
    kakaoKeyHint: "config.js에 Kakao JavaScript 키를 입력하고 Kakao Developers에 Live Server 주소를 등록하세요.",
    noData: "표시할 맛집 데이터가 없습니다."
  },
  en: {
    brand: "Busan Official Food Guide",
    hero: "What should we eat in Busan?",
    searchPlaceholder: "Search restaurant, menu, district",
    nearby: "📍 Nearby",
    openMap: "🗺 View map",
    districtTitle: "Browse by district",
    viewAll: "View all",
    officialPicks: "Official Busan picks",
    home: "Home",
    search: "Search",
    map: "Map",
    favoritesShort: "Saved",
    favorites: "Saved places",
    noFavorites: "No saved places yet",
    noFavoritesDesc: "Tap the heart on a restaurant to save it.",
    settings: "Settings",
    language: "Language",
    languageDesc: "Switch between Korean and English.",
    location: "Location",
    locationDesc: "Used to find restaurants near you.",
    reloadData: "Reload public data",
    reloadDataDesc: "Calls the Korean and English APIs again.",
    dataSource: "Data source",
    dataSourceDesc: "Public Data Portal · Busan FoodService",
    practiceWarning: "This practice version calls the public API directly from the browser. Store the ServiceKey on a server for a real service.",
    recentlyViewed: "Recently viewed",
    selectLanguage: "Select language",
    sortRecommended: "Recommended",
    sortDistance: "Distance",
    sortName: "Name",
    myLocation: "◎ My location",
    list: "☰ List",
    result: " places",
    all: "All",
    call: "Call",
    directions: "Directions",
    save: "Save",
    share: "Share",
    menu: "Menu",
    hours: "Hours",
    address: "Address",
    homepage: "Homepage",
    copied: "Share information copied.",
    locationDenied: "Location permission is required.",
    locating: "Location updated.",
    favoriteAdded: "Saved.",
    favoriteRemoved: "Removed from saved.",
    loading: "Loading public data...",
    loaded: "Data loaded",
    apiKeyMissing: "Public data API key is missing.",
    apiKeyHint: "Enter your ServiceKey in PUBLIC_DATA_SERVICE_KEY inside config.js.",
    apiError: "Failed to load public data.",
    corsHint: "If the console shows a CORS error, the API does not allow direct browser requests.",
    kakaoKeyMissing: "Kakao Maps JavaScript key is missing.",
    kakaoKeyHint: "Enter the Kakao JavaScript key in config.js and register the Live Server origin in Kakao Developers.",
    noData: "No restaurant data to display."
  }
};

const state = {
  language: localStorage.getItem("busan.language") || ((navigator.language || "ko").toLowerCase().startsWith("en") ? "en" : "ko"),
  restaurants: [],
  favorites: JSON.parse(localStorage.getItem("busan.favorites") || "[]"),
  recent: JSON.parse(localStorage.getItem("busan.recent") || "[]"),
  selectedDistrict: "all",
  query: "",
  sort: "recommended",
  position: null,
  loading: false,
  lastLoadedAt: null,

  map: null,
  mapReady: false,
  kakaoPromise: null,
  markers: [],
  infoWindow: null,
  userMarker: null,
  userCircle: null
};

function t(key) {
  return I18N[state.language]?.[key] || I18N.ko[key] || key;
}

function localized(obj) {
  if (!obj) return "";
  return obj[state.language] || obj.ko || obj.en || "";
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function showNotice(title, body) {
  const element = document.getElementById("apiNotice");
  element.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(body)}`;
  element.classList.remove("hidden");
}

function hideNotice() {
  document.getElementById("apiNotice").classList.add("hidden");
}

function setLoading(isLoading) {
  state.loading = isLoading;
  if (isLoading) {
    document.getElementById("homeRestaurantList").innerHTML =
      '<div class="loading-card"></div><div class="loading-card"></div><div class="loading-card"></div>';
    document.getElementById("syncBadge").textContent = t("loading");
  }
}

function normalizeServiceKey(key) {
  const value = String(key || "").trim();

  // 공공데이터포털 "Encoding" 키(% 포함)도 그대로 사용할 수 있게 처리
  if (value.includes("%")) return value;

  return encodeURIComponent(value);
}

function buildPublicDataUrl(endpoint, pageNo) {
  const rawKey = window.APP_CONFIG?.PUBLIC_DATA_SERVICE_KEY;
  const rows = Number(window.APP_CONFIG?.PUBLIC_DATA_ROWS_PER_PAGE || 100);

  const key = normalizeServiceKey(rawKey);

  return `${API.baseUrl}/${endpoint}` +
    `?serviceKey=${key}` +
    `&numOfRows=${rows}` +
    `&pageNo=${pageNo}` +
    `&resultType=json`;
}

function xmlToObject(text) {
  const xml = new DOMParser().parseFromString(text, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("Invalid XML response");
  }

  const resultCode = xml.querySelector("resultCode")?.textContent?.trim() || "";
  const resultMsg = xml.querySelector("resultMsg")?.textContent?.trim() || "";

  if (resultCode && resultCode !== "00") {
    throw new Error(`${resultCode} ${resultMsg}`.trim());
  }

  const items = [...xml.querySelectorAll("item")].map(item => {
    const obj = {};
    [...item.children].forEach(child => {
      obj[child.tagName] = child.textContent?.trim() || "";
    });
    return obj;
  });

  const totalCount = Number(xml.querySelector("totalCount")?.textContent || items.length);

  return { items, totalCount };
}

function extractJsonPayload(data) {
  // 부산 맛집 API는 시점/게이트웨이에 따라 JSON 래핑 구조가 달라질 수 있어
  // 특정 response.body.items.item 구조에만 의존하지 않고 재귀적으로 찾습니다.

  function findErrorInfo(node) {
    if (!node || typeof node !== "object") return null;

    const code =
      node.resultCode ??
      node.returnReasonCode ??
      node.returnAuthMsgCode ??
      node.cmmMsgHeader?.returnReasonCode;

    const message =
      node.resultMsg ??
      node.errMsg ??
      node.returnAuthMsg ??
      node.cmmMsgHeader?.returnAuthMsg;

    if (code !== undefined && code !== null && String(code) !== "" && String(code) !== "00") {
      return { code: String(code), message: String(message || "") };
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") {
        const found = findErrorInfo(value);
        if (found) return found;
      }
    }

    return null;
  }

  function looksLikeRestaurant(item) {
    return item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      (
        "UC_SEQ" in item ||
        "MAIN_TITLE" in item ||
        "GUGUN_NM" in item ||
        "ADDR1" in item ||
        "LAT" in item ||
        "LNG" in item
      );
  }

  function findRestaurantArray(node) {
    if (!node) return null;

    if (Array.isArray(node)) {
      if (node.some(looksLikeRestaurant)) {
        return node;
      }

      for (const child of node) {
        const found = findRestaurantArray(child);
        if (found) return found;
      }

      return null;
    }

    if (typeof node === "object") {
      // 흔한 공공데이터 응답 구조를 먼저 확인
      const candidates = [
        node?.response?.body?.items?.item,
        node?.response?.body?.items,
        node?.body?.items?.item,
        node?.body?.items,
        node?.items?.item,
        node?.items,
        node?.item,
        node?.getFoodKr?.item,
        node?.getFoodKr?.items,
        node?.getFoodEn?.item,
        node?.getFoodEn?.items
      ];

      for (const candidate of candidates) {
        if (Array.isArray(candidate) && candidate.some(looksLikeRestaurant)) {
          return candidate;
        }

        if (looksLikeRestaurant(candidate)) {
          return [candidate];
        }
      }

      for (const value of Object.values(node)) {
        const found = findRestaurantArray(value);
        if (found) return found;
      }
    }

    return null;
  }

  function findTotalCount(node) {
    if (!node || typeof node !== "object") return null;

    for (const key of ["totalCount", "TOTAL_COUNT", "total_count"]) {
      if (key in node && node[key] !== "" && node[key] != null) {
        const value = Number(node[key]);
        if (Number.isFinite(value)) return value;
      }
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") {
        const found = findTotalCount(value);
        if (found != null) return found;
      }
    }

    return null;
  }

  const error = findErrorInfo(data);
  if (error) {
    throw new Error(`${error.code} ${error.message}`.trim());
  }

  const items = findRestaurantArray(data) || [];
  const totalCount = findTotalCount(data) ?? items.length;

  return { items, totalCount };
}

async function fetchPage(endpoint, pageNo) {
  const url = buildPublicDataUrl(endpoint, pageNo);
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) {
    return { items: [], totalCount: 0 };
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    const json = JSON.parse(trimmed);
    const result = extractJsonPayload(json);

    // 키는 출력하지 않고 파싱 결과만 확인할 수 있게 로그
    console.log(`[PublicData] ${endpoint} page=${pageNo}`, {
      itemCount: result.items.length,
      totalCount: result.totalCount,
      topLevelType: Array.isArray(json) ? "array" : "object",
      topLevelKeys: Array.isArray(json) ? [] : Object.keys(json)
    });

    return result;
  }

  const result = xmlToObject(trimmed);
  console.log(`[PublicData] ${endpoint} page=${pageNo} XML`, {
    itemCount: result.items.length,
    totalCount: result.totalCount
  });
  return result;
}

async function fetchAllLanguage(endpoint) {
  const rows = Number(window.APP_CONFIG?.PUBLIC_DATA_ROWS_PER_PAGE || 100);
  const maxPages = Number(window.APP_CONFIG?.PUBLIC_DATA_MAX_PAGES || 10);

  let allItems = [];
  let totalCount = null;

  for (let page = 1; page <= maxPages; page += 1) {
    const result = await fetchPage(endpoint, page);

    allItems.push(...result.items);

    if (totalCount == null) {
      totalCount = result.totalCount;
    }

    if (!result.items.length) break;
    if (allItems.length >= totalCount) break;
    if (result.items.length < rows) break;
  }

  return allItems;
}

function firstValue(item, keys) {
  for (const key of keys) {
    const value = item?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value).trim();
    }
  }
  return "";
}

function normalizeImageUrl(value) {
  const url = String(value || "").trim();
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  // 첨부 가이드의 예시는 /uploadImgs/... 같은 상대경로입니다.
  // 문서에 이미지 호스트가 명시되어 있지 않아 임의의 도메인을 붙이지 않습니다.
  return "";
}

function mergeRestaurants(koItems, enItems) {
  const enMap = new Map(
    enItems.map(item => [String(firstValue(item, ["UC_SEQ", "ucSeq", "uc_seq"])), item])
  );

  return koItems
    .map(ko => {
      const id = String(firstValue(ko, ["UC_SEQ", "ucSeq", "uc_seq"]));
      if (!id) return null;

      const en = enMap.get(id) || {};

      const lat = Number(firstValue(ko, ["LAT", "lat"]));
      const lng = Number(firstValue(ko, ["LNG", "lng"]));

      return {
        id,
        name: {
          ko: firstValue(ko, ["MAIN_TITLE", "PLACE", "TITLE"]),
          en: firstValue(en, ["PLACE", "MAIN_TITLE", "TITLE"])
        },
        district: {
          ko: firstValue(ko, ["GUGUN_NM"]),
          en: firstValue(en, ["GUGUN_NM"])
        },
        title: {
          ko: firstValue(ko, ["TITLE", "SUBTITLE"]),
          en: firstValue(en, ["TITLE", "SUBTITLE"])
        },
        address: {
          ko: [firstValue(ko, ["ADDR1"]), firstValue(ko, ["ADDR2"])].filter(Boolean).join(" "),
          en: [firstValue(en, ["ADDR1"]), firstValue(en, ["ADDR2"])].filter(Boolean).join(" ")
        },
        menu: {
          ko: firstValue(ko, ["RPRSNTV_MENU"]),
          en: firstValue(en, ["RPRSNTV_MENU"])
        },
        description: {
          ko: firstValue(ko, ["ITEMCNTNTS"]),
          en: firstValue(en, ["ITEMCNTNTS"])
        },
        phone: firstValue(ko, ["CNTCT_TEL"]) || firstValue(en, ["CNTCT_TEL"]),
        hours: {
          ko: firstValue(ko, ["USAGE_DAY_WEEK_AND_TIME"]),
          en: firstValue(en, ["USAGE_DAY_WEEK_AND_TIME"])
        },
        homepage: firstValue(ko, ["HOMEPAGE_URL"]) || firstValue(en, ["HOMEPAGE_URL"]),
        image: normalizeImageUrl(firstValue(ko, ["MAIN_IMG_NORMAL"])),
        thumbnail: normalizeImageUrl(firstValue(ko, ["MAIN_IMG_THUMB"])),
        rawImagePath: firstValue(ko, ["MAIN_IMG_NORMAL"]),
        lat: Number.isFinite(lat) ? lat : null,
        lng: Number.isFinite(lng) ? lng : null
      };
    })
    .filter(Boolean);
}

async function loadPublicData() {
  const key = window.APP_CONFIG?.PUBLIC_DATA_SERVICE_KEY;

  if (!key || key === "YOUR_PUBLIC_DATA_SERVICE_KEY") {
    showNotice(t("apiKeyMissing"), t("apiKeyHint"));
    state.restaurants = [];
    renderAll();
    return;
  }

  setLoading(true);
  hideNotice();

  try {
    const koItems = await fetchAllLanguage(API.koEndpoint);

    // 영문 API가 일시적으로 실패해도 국문 데이터는 화면에 표시합니다.
    let enItems = [];
    try {
      enItems = await fetchAllLanguage(API.enEndpoint);
    } catch (englishError) {
      console.warn("English public data load failed. Korean data will still be shown.", englishError);
    }

    state.restaurants = mergeRestaurants(koItems, enItems);
    state.lastLoadedAt = new Date();

    document.getElementById("syncBadge").textContent =
      `${t("loaded")} · ${state.restaurants.length}`;

    if (!state.restaurants.length) {
      showNotice(t("noData"), t("apiError"));
    } else {
      hideNotice();
    }

    renderAll();
  } catch (error) {
    console.error("Public Data API Error:", error);

    state.restaurants = [];
    showNotice(
      t("apiError"),
      `${error.message || ""} ${t("corsHint")}`.trim()
    );
    document.getElementById("syncBadge").textContent = t("apiError");
    renderAll();
  } finally {
    state.loading = false;
  }
}

function distanceKm(lat, lng) {
  if (!state.position || lat == null || lng == null) return null;

  const toRad = degree => degree * Math.PI / 180;
  const R = 6371;
  const dLat = toRad(lat - state.position.lat);
  const dLon = toRad(lng - state.position.lng);
  const lat1 = toRad(state.position.lat);
  const lat2 = toRad(lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(restaurant) {
  const distance = distanceKm(restaurant.lat, restaurant.lng);
  if (distance == null) return "";

  return distance < 1
    ? `${Math.round(distance * 1000)}m`
    : `${distance.toFixed(1)}km`;
}

function getDistricts() {
  return [...new Set(
    state.restaurants
      .map(restaurant => localized(restaurant.district))
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b));
}

function restaurantMatches(restaurant) {
  const district = localized(restaurant.district);

  if (state.selectedDistrict !== "all" && district !== state.selectedDistrict) {
    return false;
  }

  const query = state.query.trim().toLocaleLowerCase();

  if (!query) return true;

  const haystack = [
    localized(restaurant.name),
    localized(restaurant.title),
    localized(restaurant.address),
    localized(restaurant.menu),
    localized(restaurant.description),
    district
  ].join(" ").toLocaleLowerCase();

  return haystack.includes(query);
}

function getFilteredRestaurants() {
  const list = state.restaurants.filter(restaurantMatches);

  return [...list].sort((a, b) => {
    if (state.sort === "distance" && state.position) {
      return (distanceKm(a.lat, a.lng) ?? Infinity) - (distanceKm(b.lat, b.lng) ?? Infinity);
    }

    if (state.sort === "name") {
      return localized(a.name).localeCompare(localized(b.name));
    }

    return 0;
  });
}

function thumbHtml(restaurant) {
  if (restaurant.thumbnail || restaurant.image) {
    const src = restaurant.thumbnail || restaurant.image;
    return `<img src="${escapeHtml(src)}" alt="" onerror="this.parentElement.innerHTML='<div class=&quot;thumb-fallback&quot;>${escapeHtml(localized(restaurant.district))}</div>'">`;
  }

  return `<div class="thumb-fallback">${escapeHtml(localized(restaurant.district) || "BUSAN")}</div>`;
}

function restaurantCard(restaurant) {
  const favorite = state.favorites.includes(restaurant.id);
  const distance = formatDistance(restaurant);

  return `
    <article class="restaurant-card" data-id="${restaurant.id}" role="button" tabindex="0">
      <div class="thumb">${thumbHtml(restaurant)}</div>

      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${escapeHtml(localized(restaurant.name) || "-")}</h3>
            <p>${escapeHtml(localized(restaurant.title))}</p>
          </div>

          <button class="favorite-button ${favorite ? "active" : ""}" data-favorite="${restaurant.id}">
            ${favorite ? "♥" : "♡"}
          </button>
        </div>

        <p class="menu">${escapeHtml(localized(restaurant.menu))}</p>

        <div class="meta">
          <span>${escapeHtml(localized(restaurant.district))}</span>
          ${distance ? `<span>· ${distance}</span>` : ""}
        </div>
      </div>
    </article>
  `;
}

function bindCardEvents(container) {
  container.querySelectorAll(".restaurant-card").forEach(card => {
    card.addEventListener("click", event => {
      if (event.target.closest("[data-favorite]")) return;
      openDetail(card.dataset.id);
    });

    card.addEventListener("keydown", event => {
      if (event.key === "Enter") openDetail(card.dataset.id);
    });
  });

  container.querySelectorAll("[data-favorite]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      toggleFavorite(button.dataset.favorite);
    });
  });
}

function renderHome() {
  const element = document.getElementById("homeRestaurantList");

  if (state.loading) return;

  const list = state.restaurants.slice(0, 8);

  element.innerHTML = list.length
    ? list.map(restaurantCard).join("")
    : `<div class="empty-state"><p>${escapeHtml(t("noData"))}</p></div>`;

  bindCardEvents(element);
}

function renderDistricts() {
  const districts = getDistricts();

  const renderInto = (id, includeAll) => {
    const element = document.getElementById(id);

    const values = includeAll ? ["all", ...districts] : districts;

    element.innerHTML = values.map(value => {
      const label = value === "all" ? t("all") : value;
      return `
        <button
          class="chip ${state.selectedDistrict === value ? "active" : ""}"
          data-district="${escapeHtml(value)}"
        >
          ${escapeHtml(label)}
        </button>
      `;
    }).join("");

    element.querySelectorAll("[data-district]").forEach(button => {
      button.addEventListener("click", () => {
        state.selectedDistrict = button.dataset.district;
        renderAll();
        switchView("searchView");
      });
    });
  };

  renderInto("districtChips", false);
  renderInto("searchDistrictChips", true);
}

function renderSearch() {
  const list = getFilteredRestaurants();
  const element = document.getElementById("searchRestaurantList");

  document.getElementById("searchResultCount").textContent =
    `${list.length}${t("result")}`;

  element.innerHTML = list.map(restaurantCard).join("");
  bindCardEvents(element);
}

function renderFavorites() {
  const favorites = state.restaurants.filter(restaurant =>
    state.favorites.includes(restaurant.id)
  );

  const element = document.getElementById("favoriteRestaurantList");
  const empty = document.getElementById("favoriteEmpty");

  element.innerHTML = favorites.map(restaurantCard).join("");
  bindCardEvents(element);

  empty.classList.toggle("hidden", favorites.length > 0);
}

function renderRecent() {
  const items = state.recent
    .map(id => state.restaurants.find(restaurant => restaurant.id === id))
    .filter(Boolean)
    .slice(0, 20);

  const element = document.getElementById("recentRestaurantList");
  element.innerHTML = items.map(restaurantCard).join("");
  bindCardEvents(element);
}

function renderMapCards(restaurants = getFilteredRestaurants()) {
  const element = document.getElementById("mapRestaurantList");
  element.innerHTML = restaurants.map(restaurantCard).join("");
  bindCardEvents(element);
}

function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(item => item !== id);
    showToast(t("favoriteRemoved"));
  } else {
    state.favorites = [id, ...state.favorites];
    showToast(t("favoriteAdded"));
  }

  localStorage.setItem("busan.favorites", JSON.stringify(state.favorites));
  renderAll();
}

function addRecent(id) {
  state.recent = [id, ...state.recent.filter(item => item !== id)].slice(0, 20);
  localStorage.setItem("busan.recent", JSON.stringify(state.recent));
  renderRecent();
}

function openDetail(id) {
  const restaurant = state.restaurants.find(item => item.id === id);
  if (!restaurant) return;

  addRecent(id);

  const favorite = state.favorites.includes(id);
  const distance = formatDistance(restaurant);

  const background =
    restaurant.image
      ? `linear-gradient(180deg,transparent 20%,rgba(0,0,0,.65)),url("${restaurant.image}")`
      : "linear-gradient(145deg,#668dbb,#244b7d)";

  document.getElementById("detailContent").innerHTML = `
    <div class="detail-hero" style='background-image:${background}'>
      <div>
        <p>${escapeHtml(localized(restaurant.district))}${distance ? ` · ${distance}` : ""}</p>
        <h2>${escapeHtml(localized(restaurant.name))}</h2>
      </div>
    </div>

    <div class="detail-body">
      <div class="detail-actions">
        <button class="detail-action" id="detailCall">☎<br>${t("call")}</button>
        <button class="detail-action" id="detailDirections">⌖<br>${t("directions")}</button>
        <button class="detail-action" id="detailFavorite">${favorite ? "♥" : "♡"}<br>${t("save")}</button>
        <button class="detail-action" id="detailShare">⇧<br>${t("share")}</button>
      </div>

      <div class="info-grid">
        <div class="info-row"><strong>${t("menu")}</strong><span>${escapeHtml(localized(restaurant.menu))}</span></div>
        <div class="info-row"><strong>${t("hours")}</strong><span>${escapeHtml(localized(restaurant.hours))}</span></div>
        <div class="info-row"><strong>${t("address")}</strong><span>${escapeHtml(localized(restaurant.address))}</span></div>
        ${restaurant.homepage ? `<div class="info-row"><strong>${t("homepage")}</strong><span>${escapeHtml(restaurant.homepage)}</span></div>` : ""}
      </div>

      <h3>${escapeHtml(localized(restaurant.title))}</h3>
      <p class="detail-description">${escapeHtml(localized(restaurant.description))}</p>
    </div>
  `;

  document.getElementById("detailCall").onclick = () => {
    if (restaurant.phone) location.href = `tel:${restaurant.phone}`;
  };

  document.getElementById("detailDirections").onclick = () => {
    if (restaurant.lat == null || restaurant.lng == null) return;

    const name = encodeURIComponent(localized(restaurant.name));
    window.open(
      `https://map.kakao.com/link/to/${name},${restaurant.lat},${restaurant.lng}`,
      "_blank",
      "noopener"
    );
  };

  document.getElementById("detailFavorite").onclick = () => {
    toggleFavorite(restaurant.id);
    openDetail(restaurant.id);
  };

  document.getElementById("detailShare").onclick = async () => {
    const text =
      `${localized(restaurant.name)}\n` +
      `${localized(restaurant.menu)}\n` +
      `${localized(restaurant.address)}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: localized(restaurant.name), text });
      } catch {}
    } else {
      await navigator.clipboard?.writeText(text);
      showToast(t("copied"));
    }
  };

  document.getElementById("detailDialog").showModal();
}

/* Kakao Maps --------------------------------------------------------------- */

function showMapStatus(title, description) {
  document.getElementById("map").innerHTML = `
    <div class="map-status">
      <div>
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(description)}</span>
      </div>
    </div>
  `;
}

function loadKakaoSdk() {
  if (window.kakao?.maps) return Promise.resolve();
  if (state.kakaoPromise) return state.kakaoPromise;

  const key = String(window.APP_CONFIG?.KAKAO_JAVASCRIPT_KEY || "").trim();

  if (!key || key === "YOUR_KAKAO_JAVASCRIPT_KEY") {
    showMapStatus(t("kakaoKeyMissing"), t("kakaoKeyHint"));
    return Promise.reject(new Error("Kakao JavaScript key missing"));
  }

  state.kakaoPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(key)}&autoload=false`;
    script.async = true;

    script.onload = () => {
      if (!window.kakao?.maps) {
        reject(new Error("Kakao Maps SDK unavailable"));
        return;
      }

      window.kakao.maps.load(resolve);
    };

    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK"));

    document.head.appendChild(script);
  });

  return state.kakaoPromise;
}

async function initMap() {
  if (state.mapReady && state.map) {
    state.map.relayout();
    return;
  }

  try {
    await loadKakaoSdk();

    const container = document.getElementById("map");
    container.innerHTML = "";

    state.map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(35.1379, 129.0556),
      level: 8
    });

    state.infoWindow = new kakao.maps.InfoWindow({ removable: true });
    state.mapReady = true;

    renderMapMarkers();
    renderUserPosition();
  } catch (error) {
    console.error("Kakao Maps Error:", error);
  }
}

function clearMarkers() {
  state.markers.forEach(marker => marker.setMap(null));
  state.markers = [];
  state.infoWindow?.close();
}

function renderMapMarkers() {
  if (!state.mapReady || !state.map || !window.kakao?.maps) return;

  clearMarkers();

  const restaurants = getFilteredRestaurants()
    .filter(restaurant => restaurant.lat != null && restaurant.lng != null);

  restaurants.forEach(restaurant => {
    const marker = new kakao.maps.Marker({
      map: state.map,
      position: new kakao.maps.LatLng(restaurant.lat, restaurant.lng)
    });

    kakao.maps.event.addListener(marker, "click", () => {
      state.infoWindow.setContent(`
        <div class="kakao-info">
          <strong>${escapeHtml(localized(restaurant.name))}</strong>
          <span>${escapeHtml(localized(restaurant.menu))}</span>
        </div>
      `);

      state.infoWindow.open(state.map, marker);

      document.querySelector(`#mapRestaurantList [data-id="${restaurant.id}"]`)
        ?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });

    state.markers.push(marker);
  });

  renderMapCards(restaurants);
}

function renderUserPosition() {
  if (!state.mapReady || !state.map || !state.position) return;

  const position = new kakao.maps.LatLng(state.position.lat, state.position.lng);

  state.userMarker?.setMap(null);
  state.userCircle?.setMap(null);

  state.userMarker = new kakao.maps.Marker({
    map: state.map,
    position,
    zIndex: 10
  });

  state.userCircle = new kakao.maps.Circle({
    center: position,
    radius: 120,
    strokeWeight: 2,
    strokeColor: "#1769e0",
    strokeOpacity: 0.8,
    fillColor: "#1769e0",
    fillOpacity: 0.12
  });

  state.userCircle.setMap(state.map);
}

/* UI ---------------------------------------------------------------------- */

function requestLocation(centerMap = false) {
  if (!navigator.geolocation) {
    showToast(t("locationDenied"));
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async position => {
      state.position = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      state.sort = "distance";
      document.getElementById("sortSelect").value = "distance";

      renderAll();
      showToast(t("locating"));

      if (centerMap) {
        switchView("mapView");
        await initMap();

        if (state.mapReady) {
          const point = new kakao.maps.LatLng(state.position.lat, state.position.lng);
          renderUserPosition();
          state.map.setCenter(point);
          state.map.setLevel(5);
        }
      }
    },
    () => showToast(t("locationDenied")),
    { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
  );
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach(view => {
    view.classList.toggle("active", view.id === viewId);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });

  if (viewId === "mapView") {
    requestAnimationFrame(async () => {
      await initMap();

      if (state.mapReady) {
        state.map.relayout();
        renderMapMarkers();
        renderUserPosition();
      }
    });
  }
}

function applyI18n() {
  document.documentElement.lang = state.language;

  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
    element.placeholder = t(element.dataset.i18nPlaceholder);
  });

  document.getElementById("languageButton").textContent = state.language.toUpperCase();
  document.getElementById("currentLanguageLabel").textContent =
    `${state.language === "ko" ? "한국어" : "English"} ›`;

  const options = document.querySelectorAll("#sortSelect option");
  options[0].textContent = t("sortRecommended");
  options[1].textContent = t("sortDistance");
  options[2].textContent = t("sortName");
}

function renderAll() {
  applyI18n();
  renderDistricts();
  renderHome();
  renderSearch();
  renderFavorites();
  renderRecent();

  if (state.mapReady) {
    renderMapMarkers();
    renderUserPosition();
  }
}

function syncSearch(value) {
  state.query = value;
  document.getElementById("homeSearchInput").value = value;
  document.getElementById("searchInput").value = value;
  renderSearch();

  if (state.mapReady) renderMapMarkers();
}

let toastTimer;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  loadPublicData();

  document.querySelectorAll(".nav-item").forEach(button => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.getElementById("homeSearchInput").addEventListener("input", event => syncSearch(event.target.value));
  document.getElementById("searchInput").addEventListener("input", event => syncSearch(event.target.value));

  document.getElementById("homeSearchInput").addEventListener("keydown", event => {
    if (event.key === "Enter") switchView("searchView");
  });

  document.getElementById("sortSelect").addEventListener("change", event => {
    state.sort = event.target.value;

    if (state.sort === "distance" && !state.position) {
      requestLocation(false);
    } else {
      renderSearch();
    }
  });

  document.getElementById("nearbyButton").addEventListener("click", () => {
    requestLocation(false);
    switchView("searchView");
  });

  document.getElementById("openMapButton").addEventListener("click", () => switchView("mapView"));
  document.getElementById("locateButton").addEventListener("click", () => requestLocation(true));
  document.getElementById("mapListToggle").addEventListener("click", () => switchView("searchView"));

  document.getElementById("allDistrictButton").addEventListener("click", () => {
    state.selectedDistrict = "all";
    renderAll();
    switchView("searchView");
  });

  document.getElementById("languageButton").addEventListener("click", () => document.getElementById("languageDialog").showModal());
  document.getElementById("languageSetting").addEventListener("click", () => document.getElementById("languageDialog").showModal());
  document.getElementById("languageCloseButton").addEventListener("click", () => document.getElementById("languageDialog").close());

  document.querySelectorAll("[data-language]").forEach(button => {
    button.addEventListener("click", () => {
      state.language = button.dataset.language;
      localStorage.setItem("busan.language", state.language);
      document.getElementById("languageDialog").close();
      renderAll();
    });
  });

  document.getElementById("locationSetting").addEventListener("click", () => requestLocation(false));
  document.getElementById("reloadDataButton").addEventListener("click", loadPublicData);
  document.getElementById("detailCloseButton").addEventListener("click", () => document.getElementById("detailDialog").close());
});
