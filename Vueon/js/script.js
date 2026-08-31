// ============================================================
// VUEON + TMDB API
// 1) 아래 TMDB_API_KEY 값에 본인의 TMDB v3 API Key를 넣으세요.
// 2) 예: const TMDB_API_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
// ============================================================

const TMDB_API_KEY = "7fdf04e63e092d53b19ccbd9e7fe065c";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_URL = "https://image.tmdb.org/t/p";
const LANGUAGE = "ko-KR";
const REGION = "KR";

const contentRows = document.getElementById("contentRows");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalVisual = document.getElementById("modalVisual");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");
const toast = document.getElementById("toast");

let activeItem = null;
let saved = new Set(JSON.parse(localStorage.getItem("vueonSavedMovies") || "[]"));
let homeSections = [];
let genreMap = {};
let heroMovie = null;

function hasApiKey(){
  return TMDB_API_KEY && !TMDB_API_KEY.includes("YOUR_TMDB");
}

function apiUrl(path, params={}){
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", LANGUAGE);

  Object.entries(params).forEach(([key,value])=>{
    if(value !== undefined && value !== null && value !== ""){
      url.searchParams.set(key,value);
    }
  });

  return url.toString();
}

async function tmdbFetch(path, params={}){
  if(!hasApiKey()){
    throw new Error("TMDB_API_KEY_MISSING");
  }

  const response = await fetch(apiUrl(path, params));

  if(!response.ok){
    if(response.status === 401){
      throw new Error("TMDB_API_KEY_INVALID");
    }
    throw new Error(`TMDB_HTTP_${response.status}`);
  }

  return response.json();
}

function imageUrl(path, size="w500"){
  if(!path) return "";
  return `${TMDB_IMAGE_URL}/${size}${path}`;
}

function formatDate(date){
  if(!date) return "개봉일 미정";
  const year = date.split("-")[0];
  return `${year}`;
}

function genreText(movie){
  if(movie.genre_ids?.length){
    return movie.genre_ids
      .slice(0,2)
      .map(id=>genreMap[id])
      .filter(Boolean)
      .join(" · ");
  }

  if(movie.genres?.length){
    return movie.genres.slice(0,2).map(g=>g.name).join(" · ");
  }

  return "영화";
}

function normalizeMovie(movie){
  return {
    id: movie.id,
    title: movie.title || movie.name || movie.original_title || "제목 없음",
    year: formatDate(movie.release_date || movie.first_air_date),
    releaseDate: movie.release_date || movie.first_air_date || "",
    genre: genreText(movie),
    overview: movie.overview || "등록된 줄거리가 없습니다.",
    rating: typeof movie.vote_average === "number" ? movie.vote_average : 0,
    voteCount: movie.vote_count || 0,
    popularity: movie.popularity || 0,
    posterPath: movie.poster_path,
    backdropPath: movie.backdrop_path,
    poster: imageUrl(movie.poster_path,"w500"),
    backdrop: imageUrl(movie.backdrop_path,"original"),
    age: "15+"
  };
}

function placeholderStyle(movie){
  const hue = movie?.id ? movie.id % 360 : 220;
  return `linear-gradient(135deg,hsl(${hue} 35% 16%),hsl(${(hue+45)%360} 45% 26%),#111)`;
}

function artStyle(movie, type="poster"){
  const url = type === "backdrop" ? movie.backdrop : movie.poster;

  if(url){
    return `linear-gradient(0deg,rgba(0,0,0,.15),rgba(0,0,0,.15)),url('${url}')`;
  }

  return placeholderStyle(movie);
}

async function loadGenres(){
  const data = await tmdbFetch("/genre/movie/list");
  genreMap = Object.fromEntries((data.genres || []).map(g=>[g.id,g.name]));
}

async function fetchList(path, params={}){
  const data = await tmdbFetch(path, {region:REGION, ...params});
  return (data.results || []).map(normalizeMovie);
}

async function loadHome(){
  showLoadingState();

  try{
    await loadGenres();

const [
  trendingData,
  popular,
  nowPlaying,
  topRated,
  upcoming,
  comedy,
  romance,
  horror,
  documentary
] = await Promise.all([
  tmdbFetch("/trending/movie/week"),
  fetchList("/movie/popular"),
  fetchList("/movie/now_playing"),
  fetchList("/movie/top_rated"),
  fetchList("/movie/upcoming"),

  fetchList("/discover/movie", {
    with_genres: 35,
    sort_by: "popularity.desc"
  }),

  fetchList("/discover/movie", {
    with_genres: 10749,
    sort_by: "popularity.desc"
  }),

  fetchList("/discover/movie", {
    with_genres: 27,
    sort_by: "popularity.desc"
  }),

  fetchList("/discover/movie", {
    with_genres: 99,
    sort_by: "popularity.desc"
  })
]);

    const trending = (trendingData.results || []).map(normalizeMovie);

const heroCandidates = [
  ...trending,
  ...popular,
  ...nowPlaying
].filter(movie => movie.backdropPath);

heroMovie =
  heroCandidates[
    Math.floor(Math.random() * heroCandidates.length)
  ];

homeSections = [
  {
    title:"오늘의 TOP 10",
    type:"rank",
    movies:trending.slice(0,10)
  },

  {
    title:"지금 인기 있는 영화",
    id:"movies",
    movies:popular.slice(0,18)
  },

  {
    title:"현재 상영 중",
    id:"new",
    movies:nowPlaying.slice(0,18)
  },

  {
    title:"평점 높은 영화",
    movies:topRated.slice(0,18)
  },

  {
    title:"곧 공개되는 영화",
    movies:upcoming.slice(0,18)
  },

  {
    title:"웃고 싶을 때 보는 코미디",
    movies:comedy.slice(0,18)
  },

  {
    title:"설레는 로맨스 영화",
    movies:romance.slice(0,18)
  },

  {
    title:"등골 서늘한 공포 영화",
    movies:horror.slice(0,18)
  },

  {
    title:"흥미로운 다큐멘터리",
    movies:documentary.slice(0,18)
  }
];

renderHero(heroMovie);
renderRows();

setTimeout(() => {
  loadHeroPreview(heroMovie);
}, 2500);

  }catch(error){
    console.error(error);
    showApiError(error);
  }
}

function renderHero(movie){
  if(!movie) return;

  const hero = document.querySelector(".hero");
  const heroBg = document.querySelector(".hero-bg");
  const title = document.querySelector(".hero h1");
  const meta = document.querySelector(".hero-meta");
  const copy = document.querySelector(".hero-copy");

  heroBg.style.backgroundImage = movie.backdrop
    ? `url("${movie.backdrop}")`
    : placeholderStyle(movie);
  heroBg.style.backgroundSize = "cover";
  heroBg.style.backgroundPosition = "center";

title.textContent = movie.title;
  meta.innerHTML = `
    <span class="match">${Math.max(70,Math.round(movie.rating*10))}% 일치</span>
    <span>${movie.year}</span>
    <span class="age">${movie.age}</span>
    <span>★ ${movie.rating.toFixed(1)}</span>
  `;
  copy.textContent = movie.overview;
}

function showLoadingState(){
  contentRows.innerHTML = Array.from({length:4}).map(()=>`
    <section class="row-section">
      <div class="section-heading"><div class="skeleton skeleton-title"></div></div>
      <div class="card-row">
        ${Array.from({length:6}).map(()=>`<div class="skeleton skeleton-card"></div>`).join("")}
      </div>
    </section>
  `).join("");
}

function showApiError(error){
  let title = "영화 정보를 불러오지 못했습니다.";
  let description = "TMDB API 설정을 확인해주세요.";

  if(error.message === "TMDB_API_KEY_MISSING"){
    title = "TMDB API 키를 입력해주세요.";
    description = 'script.js 상단의 TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE" 부분에 본인의 API 키를 넣으면 영화 데이터가 자동으로 표시됩니다.';
  }else if(error.message === "TMDB_API_KEY_INVALID"){
    title = "TMDB API 키가 올바르지 않습니다.";
    description = "입력한 TMDB v3 API 키를 다시 확인해주세요.";
  }

  contentRows.innerHTML = `
    <section class="api-error">
      <div class="api-error-icon">!</div>
      <h2>${title}</h2>
      <p>${description}</p>
      <code>const TMDB_API_KEY = "여기에_API_KEY";</code>
    </section>
  `;
}

function cardTemplate(movie, rank=null){
  return `
    <article class="card ${rank ? "rank-card" : ""}" data-id="${movie.id}" tabindex="0" aria-label="${movie.title} 상세 정보">
      ${rank ? `<div class="rank-number">${rank}</div>` : ""}

      <div class="card-art tmdb-art" style="background-image:${artStyle(movie,"backdrop")}">

        <div class="card-info">
          <strong>${movie.title}</strong>

          <div class="card-meta">
            <span>★ ${movie.rating.toFixed(1)}</span>
            <span>${movie.year}</span>
            <span>${movie.genre || "영화"}</span>
          </div>

          <p class="card-description">
            ${movie.overview || "등록된 줄거리가 없습니다."}
          </p>
        </div>

      </div>
    </article>`;
}

function renderRows(){
  contentRows.innerHTML = homeSections.map(section=>{
    const cards = section.movies.map((movie,i)=>
      cardTemplate(movie,section.type === "rank" ? i+1 : null)
    ).join("");

    return `
      <section class="row-section" ${section.id ? `id="${section.id}"` : ""}>
        <div class="section-heading"><h2>${section.title}</h2></div>
        <div class="row-shell">
          <button class="row-arrow prev" aria-label="이전 콘텐츠"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></button>
          <div class="card-row">${cards}</div>
          <button class="row-arrow next" aria-label="다음 콘텐츠"><svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></button>
        </div>
      </section>
    `;
  }).join("");

  bindCards();

  document.querySelectorAll(".row-shell").forEach(shell=>{
    const row = shell.querySelector(".card-row");
    shell.querySelector(".next").onclick = ()=>row.scrollBy({left:row.clientWidth*.85,behavior:"smooth"});
    shell.querySelector(".prev").onclick = ()=>row.scrollBy({left:-row.clientWidth*.85,behavior:"smooth"});
  });
}

function findMovieById(id){
  for(const section of homeSections){
    const found = section.movies.find(m=>m.id === Number(id));
    if(found) return found;
  }
  return null;
}

function bindCards(){
  document.querySelectorAll("[data-id]").forEach(card=>{
    const open = ()=>openMovieById(Number(card.dataset.id));
    card.addEventListener("click",open);
    card.addEventListener("keydown",e=>{
      if(e.key==="Enter" || e.key===" "){
        e.preventDefault();
        open();
      }
    });
  });
}

async function openMovieById(id){
  const cached = findMovieById(id);

  if(cached){
    openModal(cached);
  }

  try{
    const details = await tmdbFetch(`/movie/${id}`, {
      append_to_response:"videos,credits"
    });

    const movie = normalizeMovie(details);

    if(details.runtime){
      movie.runtime = `${Math.floor(details.runtime/60)}시간 ${details.runtime%60}분`;
    }

    if(details.genres){
      movie.genre = details.genres.slice(0,3).map(g=>g.name).join(" · ");
    }

    openModal(movie);
  }catch(error){
    console.error(error);
    if(!cached) showToast("상세 정보를 불러오지 못했습니다.");
  }
}

function openModal(movie){
  activeItem = movie;

  modalVisual.style.backgroundImage = artStyle(movie,"backdrop");
  modalVisual.style.backgroundSize = "cover";
  modalVisual.style.backgroundPosition = "center";

  modalTitle.textContent = movie.title;
  modalMeta.innerHTML = `
    <span style="color:#46d369;font-weight:700">${Math.max(70,Math.round(movie.rating*10))}% 일치</span>
    <span>${movie.year}</span>
    <span>${movie.age}</span>
    <span>★ ${movie.rating.toFixed(1)}</span>
    ${movie.runtime ? `<span>${movie.runtime}</span>` : ""}
    <span>${movie.genre || "영화"}</span>
  `;
  modalDesc.textContent = movie.overview || "등록된 줄거리가 없습니다.";

  const likeBtn = document.getElementById("modalLike");
  likeBtn.classList.toggle("saved",saved.has(movie.id));
  likeBtn.textContent = saved.has(movie.id) ? "✓" : "＋";

  modalBackdrop.classList.add("open");
  modalBackdrop.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
}

function closeModal(){
  modalBackdrop.classList.remove("open");
  modalBackdrop.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}

function showToast(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.remove("show"),1800);
}

window.addEventListener("scroll",()=>{
  document.getElementById("header").classList.toggle("scrolled",window.scrollY>30);
});

document.getElementById("modalClose").onclick=closeModal;

modalBackdrop.addEventListener("click",e=>{
  if(e.target===modalBackdrop) closeModal();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && modalBackdrop.classList.contains("open")){
    closeModal();
  }
});

document.getElementById("modalLike").onclick=()=>{
  if(!activeItem) return;

  if(saved.has(activeItem.id)){
    saved.delete(activeItem.id);
    showToast("찜 목록에서 삭제했습니다.");
  }else{
    saved.add(activeItem.id);
    showToast("내가 찜한 콘텐츠에 저장했습니다.");
  }

  localStorage.setItem("vueonSavedMovies",JSON.stringify([...saved]));

  const btn=document.getElementById("modalLike");
  btn.classList.toggle("saved",saved.has(activeItem.id));
  btn.textContent=saved.has(activeItem.id) ? "✓" : "＋";
};

document.getElementById("modalPlay").onclick=()=>{
  showToast("영상 스트리밍 기능은 다음 단계에서 연결할 수 있습니다.");
};

document.getElementById("playHero").onclick=()=>{
  if(heroMovie) openMovieById(heroMovie.id);
};

document.getElementById("infoHero").onclick=()=>{
  if(heroMovie) openMovieById(heroMovie.id);
};


// ---------- SEARCH ----------
const searchPanel=document.getElementById("searchPanel");
const searchInput=document.getElementById("searchInput");
const searchResults=document.getElementById("searchResults");
const resultGrid=document.getElementById("resultGrid");
const resultCount=document.getElementById("resultCount");

function openSearch(){
  searchPanel.classList.add("open");
  searchPanel.setAttribute("aria-hidden","false");
  setTimeout(()=>searchInput.focus(),50);
}

function closeSearch(){
  searchPanel.classList.remove("open");
  searchPanel.setAttribute("aria-hidden","true");
}

document.getElementById("searchToggle").onclick=openSearch;
document.getElementById("mobileSearch").onclick=openSearch;
document.getElementById("searchClose").onclick=closeSearch;

let searchTimer;

searchInput.addEventListener("input",e=>{
  const query=e.target.value.trim();

  clearTimeout(searchTimer);

  if(!query){
    searchResults.classList.add("hidden");
    contentRows.classList.remove("hidden");
    return;
  }

  searchTimer=setTimeout(()=>searchMovies(query),350);
});

async function searchMovies(query){
  try{
    const data=await tmdbFetch("/search/movie",{
      query,
      include_adult:"false",
      region:REGION
    });

    const results=(data.results || []).map(normalizeMovie);

    resultCount.textContent=`${results.length}개`;

    resultGrid.innerHTML=results.length
      ? results.map(movie=>`
        <article class="poster" data-id="${movie.id}" tabindex="0">
          <div class="poster-art tmdb-art" style="background-image:${artStyle(movie,"poster")}"></div>
          <div class="poster-info">
            <strong>${movie.title}</strong>
            <span>${movie.year} · ★ ${movie.rating.toFixed(1)}</span>
          </div>
        </article>
      `).join("")
      : `<p style="color:#888;grid-column:1/-1;padding:30px 0">검색 결과가 없습니다.</p>`;

    searchResults.classList.remove("hidden");
    contentRows.classList.add("hidden");

    document.querySelectorAll("#resultGrid [data-id]").forEach(card=>{
      card.addEventListener("click",()=>openMovieById(Number(card.dataset.id)));
    });
  }catch(error){
    console.error(error);
    showToast("검색 중 오류가 발생했습니다.");
  }
}

loadHome();


// ---------- AUTH ----------
const authScreen = document.getElementById("authScreen");
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const authSuccess = document.getElementById("authSuccess");
const openLoginBtn = document.getElementById("openLogin");
const profileBtn = document.getElementById("profileBtn");
const profileInitial = document.getElementById("profileInitial");
const profileMenuWrap = document.getElementById("profileMenuWrap");
const profileMenu = document.getElementById("profileMenu");
const profileMenuInitial = document.getElementById("profileMenuInitial");
const profileMenuName = document.getElementById("profileMenuName");
const profileMenuEmail = document.getElementById("profileMenuEmail");

function openAuth(mode="login"){
  authScreen.classList.add("open");
  authScreen.setAttribute("aria-hidden","false");
  document.body.style.overflow="hidden";
  switchAuth(mode);
}
function closeAuth(){
  authScreen.classList.remove("open");
  authScreen.setAttribute("aria-hidden","true");
  document.body.style.overflow="";
}
function switchAuth(mode){
  authSuccess.classList.add("hidden");
  const login = mode === "login";
  loginTab.classList.toggle("active",login);
  signupTab.classList.toggle("active",!login);
  loginTab.setAttribute("aria-selected",String(login));
  signupTab.setAttribute("aria-selected",String(!login));
  loginForm.classList.toggle("hidden",!login);
  signupForm.classList.toggle("hidden",login);
}

openLoginBtn.addEventListener("click",()=>openAuth("login"));
document.getElementById("authClose").addEventListener("click",closeAuth);
document.getElementById("authHome").addEventListener("click",closeAuth);
loginTab.addEventListener("click",()=>switchAuth("login"));
signupTab.addEventListener("click",()=>switchAuth("signup"));
document.getElementById("goSignup").addEventListener("click",()=>switchAuth("signup"));
document.getElementById("goLogin").addEventListener("click",()=>switchAuth("login"));

document.querySelectorAll(".password-toggle").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const input=document.getElementById(btn.dataset.target);
    const show=input.type==="password";
    input.type=show?"text":"password";
    btn.textContent=show?"숨기기":"보기";
  });
});

function fieldError(input,message){
  const field=input.closest(".field");
  if(!field) return;
  field.classList.toggle("invalid",Boolean(message));
  const error=field.querySelector(".field-error");
  if(error) error.textContent=message || "";
}
function validEmail(value){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function passwordScore(value){
  let score=0;
  if(value.length>=8) score++;
  if(/[A-Za-z]/.test(value) && /\d/.test(value)) score++;
  if(/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(value) && value.length>=10) score++;
  return score;
}
document.getElementById("signupPassword").addEventListener("input",e=>{
  document.getElementById("passwordStrength").dataset.level=String(passwordScore(e.target.value));
});

function getUsers(){
  try{return JSON.parse(localStorage.getItem("vueonUsers")||"[]")}catch{return []}
}
function saveUsers(users){
  localStorage.setItem("vueonUsers",JSON.stringify(users));
}
function setLoggedIn(user,remember=true){
  const payload={name:user.name||"VUEON",email:user.email};
  if(remember){
    localStorage.setItem("vueonSession",JSON.stringify(payload));
    sessionStorage.removeItem("vueonSession");
  }else{
    sessionStorage.setItem("vueonSession",JSON.stringify(payload));
    localStorage.removeItem("vueonSession");
  }
  updateAuthHeader();
}
function getSession(){
  try{
    return JSON.parse(localStorage.getItem("vueonSession")||sessionStorage.getItem("vueonSession")||"null");
  }catch{return null}
}
function updateAuthHeader(){
  const session=getSession();
  openLoginBtn.classList.toggle("hidden",Boolean(session));
  profileMenuWrap.classList.toggle("hidden",!session);

  if(session){
    const initial=(session.name||session.email||"V").trim().charAt(0).toUpperCase();
    profileInitial.textContent=initial;
    profileMenuInitial.textContent=initial;
    profileMenuName.textContent=session.name||"VUEON 사용자";
    profileMenuEmail.textContent=session.email||"";
  }else{
    profileMenu.classList.remove("open");
    profileBtn.setAttribute("aria-expanded","false");
    profileMenu.setAttribute("aria-hidden","true");
  }
}

signupForm.addEventListener("submit",e=>{
  e.preventDefault();
  const name=document.getElementById("signupName");
  const email=document.getElementById("signupEmail");
  const password=document.getElementById("signupPassword");
  const confirm=document.getElementById("signupPasswordConfirm");
  const terms=document.getElementById("agreeTerms");

  let ok=true;
  fieldError(name,name.value.trim().length<2?"이름을 2자 이상 입력해주세요.":"");
  if(name.value.trim().length<2) ok=false;

  fieldError(email,!validEmail(email.value.trim())?"올바른 이메일 주소를 입력해주세요.":"");
  if(!validEmail(email.value.trim())) ok=false;

  fieldError(password,password.value.length<8?"비밀번호는 8자 이상이어야 합니다.":"");
  if(password.value.length<8) ok=false;

  fieldError(confirm,confirm.value!==password.value?"비밀번호가 일치하지 않습니다.":"");
  if(confirm.value!==password.value) ok=false;

  document.getElementById("termsError").textContent=terms.checked?"":"약관 동의가 필요합니다.";
  if(!terms.checked) ok=false;

  const users=getUsers();
  if(users.some(u=>u.email.toLowerCase()===email.value.trim().toLowerCase())){
    fieldError(email,"이미 가입된 이메일입니다.");
    ok=false;
  }
  if(!ok) return;

  const user={name:name.value.trim(),email:email.value.trim(),password:password.value};
  users.push(user);
  saveUsers(users);
  setLoggedIn(user,true);

  signupForm.classList.add("hidden");
  loginForm.classList.add("hidden");
  authSuccess.classList.remove("hidden");
  document.getElementById("successTitle").textContent=`${user.name}님, 환영합니다.`;
  document.getElementById("successMessage").textContent="회원가입이 완료되었습니다. 이제 VUEON 콘텐츠를 즐겨보세요.";
});

loginForm.addEventListener("submit",e=>{
  e.preventDefault();
  const email=document.getElementById("loginEmail");
  const password=document.getElementById("loginPassword");
  const remember=document.getElementById("rememberMe").checked;
  let ok=true;

  fieldError(email,!validEmail(email.value.trim())?"이메일 주소를 확인해주세요.":"");
  if(!validEmail(email.value.trim())) ok=false;
  fieldError(password,password.value.length<1?"비밀번호를 입력해주세요.":"");
  if(!password.value) ok=false;
  if(!ok) return;

  const users=getUsers();
  const user=users.find(u=>u.email.toLowerCase()===email.value.trim().toLowerCase() && u.password===password.value);

  if(!user){
    fieldError(password,"이메일 또는 비밀번호가 올바르지 않습니다.");
    return;
  }

  setLoggedIn(user,remember);
  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  authSuccess.classList.remove("hidden");
  document.getElementById("successTitle").textContent=`${user.name}님, 반가워요.`;
  document.getElementById("successMessage").textContent="로그인이 완료되었습니다. 이어서 감상해보세요.";
});

document.getElementById("successContinue").addEventListener("click",closeAuth);
document.getElementById("forgotPassword").addEventListener("click",()=>{
  showToast("데모에서는 비밀번호 재설정을 지원하지 않습니다.");
});

profileBtn.addEventListener("click",()=>{
  const isOpen=profileMenu.classList.toggle("open");
  profileBtn.setAttribute("aria-expanded",String(isOpen));
  profileMenu.setAttribute("aria-hidden",String(!isOpen));
});

document.getElementById("logoutBtn").addEventListener("click",()=>{
  localStorage.removeItem("vueonSession");
  sessionStorage.removeItem("vueonSession");
  profileMenu.classList.remove("open");
  updateAuthHeader();
  showToast("로그아웃되었습니다.");
});

document.getElementById("accountBtn").addEventListener("click",()=>{
  const session=getSession();
  if(!session) return;
  showToast(`${session.name || "사용자"} · ${session.email}`);
});

document.addEventListener("click",e=>{
  if(!profileMenuWrap.contains(e.target)){
    profileMenu.classList.remove("open");
    profileBtn.setAttribute("aria-expanded","false");
    profileMenu.setAttribute("aria-hidden","true");
  }
});

authScreen.addEventListener("click",e=>{
  if(e.target===authScreen) closeAuth();
});

document.addEventListener("keydown",e=>{
  if(e.key==="Escape" && authScreen.classList.contains("open")) closeAuth();
});


// 이전 데모 버전에서 남은 자동 로그인 세션을 한 번만 초기화합니다.
// 이후부터는 사용자가 직접 로그인한 세션만 유지됩니다.
if(!localStorage.getItem("vueonAuthV2Migrated")){
  localStorage.removeItem("vueonSession");
  sessionStorage.removeItem("vueonSession");
  localStorage.setItem("vueonAuthV2Migrated","1");
}

updateAuthHeader();

async function loadHeroPreview(movie) {

  const videoContainer =
    document.getElementById("heroVideo");

  if (!videoContainer || !movie) return;

  try {

    // 먼저 한국어 영상 검색
    let data = await tmdbFetch(
      `/movie/${movie.id}/videos`
    );

    let videos = data.results || [];

    // 한국어 영상이 없으면 영어 영상 검색
    if (videos.length === 0) {

      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movie.id}/videos` +
        `?api_key=${TMDB_API_KEY}` +
        `&language=en-US`
      );

      data = await response.json();

      videos = data.results || [];
    }

    console.log(
      "예고편 검색 결과:",
      movie.title,
      videos
    );

    const trailer =
      videos.find(video =>
        video.site === "YouTube" &&
        video.type === "Trailer" &&
        video.official
      )
      ||
      videos.find(video =>
        video.site === "YouTube" &&
        video.type === "Trailer"
      )
      ||
      videos.find(video =>
        video.site === "YouTube" &&
        video.type === "Teaser"
      );

    if (!trailer) {

      console.log(
        "예고편이 없는 영화입니다:",
        movie.title
      );

      return;
    }

    videoContainer.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1"
        title="${movie.title} 미리보기"
        allow="autoplay; encrypted-media"
      ></iframe>
    `;

    setTimeout(() => {
      videoContainer.classList.add("active");
    }, 900);

  } catch (error) {

    console.error(
      "영상 미리보기 오류:",
      error
    );

  }

}