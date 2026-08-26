const WEDDING_DATA = {
  weddingAt: '2026-09-01T12:00:00+09:00',

  groom: {
    name: '김민혁',
    phone: '전화번호'
  },

  bride: {
    name: '이서영',
    phone: '전화번호'
  },

  venue: {
    name: '서울신라호텔 영빈관',
    address: '서울특별시 중구 동호로 249',

    coordinates: {
      lat: 37.55645,
      lng: 127.00608
    }
  },

  gallery: [
    './images/2.png',
    './images/3.png',
    './images/4.png',
    './images/5.png'
  ]
};


const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let toastTimer;

function formatWeddingDate() {
  const date = new Date(WEDDING_DATA.weddingAt);
  const formatted = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  }).format(date);
  const heroDate = document.getElementById('hero-date');
  const weddingDateText = document.getElementById('wedding-date-text');
  if (heroDate) heroDate.textContent = formatted;
  if (weddingDateText) weddingDateText.textContent = `${formatted} · 낮 12시`;
}

function setKakaoMapMessage(message, isError = false) {
  const container = document.getElementById('kakao-map');
  if (!container) return;
  container.innerHTML = `
    <div class="kakao-map__placeholder${isError ? ' is-error' : ''}">
      <span class="kakao-map__pin" aria-hidden="true">⌖</span>
      <strong>${isError ? '지도를 표시하지 못했습니다' : '카카오맵 설정이 필요합니다'}</strong>
      <p>${message}</p>
    </div>`;
}

function mountKakaoMap(latitude, longitude) {
  const container = document.getElementById('kakao-map');
  if (!container || !window.kakao?.maps) return;

  container.innerHTML = '';
  const position = new kakao.maps.LatLng(latitude, longitude);
  const map = new kakao.maps.Map(container, {
    center: position,
    level: 3,
    draggable: true,
    scrollwheel: false
  });

  const marker = new kakao.maps.Marker({
    position,
    map,
    title: WEDDING_DATA.venue.name
  });

  kakao.maps.event.addListener(marker, 'click', () => {
    window.open(`https://map.kakao.com/link/search/${encodeURIComponent(WEDDING_DATA.venue.name)}`, '_blank', 'noopener');
  });

  // 화면 회전/리사이즈 후 지도 중심이 어긋나지 않도록 보정합니다.
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      map.relayout();
      map.setCenter(position);
    }, 120);
  });
}


function initKakaoMap() {
  const container =
    document.getElementById('kakao-map');

  if (!container) {
    return;
  }

  const key =
    window.WEDDING_CONFIG
      ?.KAKAO_MAP_JAVASCRIPT_KEY
      ?.trim();

  if (!key) {
    setKakaoMapMessage(
      '카카오 JavaScript 키가 입력되지 않았습니다.',
      true
    );
    return;
  }

  const sdk =
    document.createElement('script');

  sdk.src =
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;

  sdk.onload = () => {

    kakao.maps.load(() => {

      const {
        lat,
        lng
      } = WEDDING_DATA.venue.coordinates;

      mountKakaoMap(lat, lng);

    });

  };

  sdk.onerror = () => {

    setKakaoMapMessage(
      '카카오맵 연결에 실패했습니다.',
      true
    );

  };

  document.head.appendChild(sdk);
}

function initCountdown() {
  const target = new Date(WEDDING_DATA.weddingAt).getTime();
  const refs = {
    days: document.getElementById('count-days'),
    hours: document.getElementById('count-hours'),
    minutes: document.getElementById('count-minutes'),
    seconds: document.getElementById('count-seconds')
  };
  const message = document.getElementById('countdown-message');
  const previous = {};

  const setValue = (key, value) => {
    const el = refs[key];
    const text = String(value).padStart(2, '0');
    if (!el || previous[key] === text) return;
    el.textContent = text;
    previous[key] = text;
    if (!prefersReducedMotion) {
      el.classList.remove('is-ticking');
      void el.offsetWidth;
      el.classList.add('is-ticking');
    }
  };

  const update = () => {
    const remainingMs = Math.max(0, target - Date.now());
    const days = Math.floor(remainingMs / 86400000);
    const hours = Math.floor((remainingMs % 86400000) / 3600000);
    const minutes = Math.floor((remainingMs % 3600000) / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    setValue('days', days);
    setValue('hours', hours);
    setValue('minutes', minutes);
    setValue('seconds', seconds);
    if (remainingMs <= 0 && message) message.textContent = '오늘, 저희 결혼합니다.';
  };

  update();
  const intervalId = window.setInterval(update, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) update(); });
  window.addEventListener('beforeunload', () => clearInterval(intervalId), { once: true });
}

function initReveal() {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
  const elements = [...document.querySelectorAll('.reveal')];
  try {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });

    elements.forEach((element) => {
      const delay = Number(element.dataset.revealDelay || 0);
      element.style.setProperty('--reveal-delay', `${Math.min(delay, 400)}ms`);
    });
    document.documentElement.classList.add('reveal-enhanced');
    elements.forEach((element) => observer.observe(element));
  } catch (error) {
    console.warn('Reveal enhancement disabled:', error);
    document.documentElement.classList.remove('reveal-enhanced');
  }
}

function initContacts() {
  const sheet = document.getElementById('contact-sheet');
  const openButton = document.getElementById('contact-open');
  const closeButton = document.getElementById('contact-close');
  const groomLink = document.getElementById('groom-phone');
  const brideLink = document.getElementById('bride-phone');

  const applyPhone = (link, person) => {
    if (!link || !person.phone) return;
    link.href = `tel:${person.phone.replace(/[^+\d]/g, '')}`;
    link.classList.remove('is-disabled');
    link.removeAttribute('aria-disabled');
    const strong = link.querySelector('strong');
    if (strong) strong.textContent = '전화 걸기';
  };
  applyPhone(groomLink, WEDDING_DATA.groom);
  applyPhone(brideLink, WEDDING_DATA.bride);

  [groomLink, brideLink].forEach((link) => link?.addEventListener('click', (event) => {
    if (link.classList.contains('is-disabled')) event.preventDefault();
  }));
  openButton?.addEventListener('click', () => sheet?.showModal());
  closeButton?.addEventListener('click', () => sheet?.close());
  sheet?.addEventListener('click', (event) => {
    const rect = sheet.getBoundingClientRect();
    const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
    if (!inside) sheet.close();
  });
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) throw new Error('copy failed');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

function initCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const target = document.getElementById(button.dataset.copyTarget);
      const text = target?.textContent?.trim();
      if (!text) return;
      try {
        await copyText(text);
        showToast('계좌번호가 복사되었습니다.');
      } catch {
        showToast('복사하지 못했습니다. 계좌번호를 길게 눌러 복사해주세요.');
      }
    });
  });
}

function initLightbox() {
  const dialog = document.getElementById('lightbox');
  const image = document.getElementById('lightbox-image');
  const count = document.getElementById('lightbox-count');
  let current = 0;

  const show = (index) => {
    current = (index + WEDDING_DATA.gallery.length) % WEDDING_DATA.gallery.length;
    if (image) image.src = WEDDING_DATA.gallery[current];
    if (image) image.alt = `확대된 웨딩 사진 ${current + 1}`;
    if (count) count.textContent = `${current + 1} / ${WEDDING_DATA.gallery.length}`;
  };
  document.querySelectorAll('.gallery__item').forEach((item) => item.addEventListener('click', () => {
    show(Number(item.dataset.index || 0));
    dialog?.showModal();
  }));
  document.getElementById('lightbox-close')?.addEventListener('click', () => dialog?.close());
  document.getElementById('lightbox-prev')?.addEventListener('click', () => show(current - 1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => show(current + 1));
  document.addEventListener('keydown', (event) => {
    if (!dialog?.open) return;
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });

  let touchX = null;
  dialog?.addEventListener('touchstart', (event) => { touchX = event.changedTouches[0]?.clientX ?? null; }, { passive: true });
  dialog?.addEventListener('touchend', (event) => {
    if (touchX == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchX;
    const delta = endX - touchX;
    if (Math.abs(delta) > 45) show(current + (delta < 0 ? 1 : -1));
    touchX = null;
  }, { passive: true });
}

function formatGuestbookDate(value) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
}


function renderGuestbook(items) {
  const list = document.getElementById('guestbook-list');

  if (!list) return;

  list.innerHTML = '';

  if (!items.length) {
    list.innerHTML =
      '<p class="guestbook-empty">첫 번째 축하 메시지를 남겨주세요.</p>';
    return;
  }

  items.forEach((item) => {
    const article = document.createElement('article');

    article.className = 'guestbook-item';

    article.innerHTML = `
      <div class="guestbook-item__head">
        <span class="guestbook-item__name"></span>
        <time class="guestbook-item__date"></time>
      </div>

      <p class="guestbook-item__message"></p>
    `;

    article.querySelector(
      '.guestbook-item__name'
    ).textContent = item.name || '';

    article.querySelector(
      '.guestbook-item__date'
    ).textContent =
      formatGuestbookDate(item.createdAt);

    article.querySelector(
      '.guestbook-item__message'
    ).textContent = item.message || '';

    list.appendChild(article);
  });
}


async function loadGuestbook() {
  const list =
    document.getElementById('guestbook-list');

  const retry =
    document.getElementById('guestbook-retry');

  const api =
    window.WEDDING_CONFIG
      ?.GUESTBOOK_API_URL
      ?.trim();

  if (!api) {
    if (list) {
      list.innerHTML =
        '<p class="guestbook-failed">방명록 API가 설정되지 않았습니다.</p>';
    }

    return;
  }

  if (list) {
    list.innerHTML =
      '<p class="guestbook-loading">방명록을 불러오는 중입니다.</p>';
  }

  if (retry) {
    retry.hidden = true;
  }

  try {
    const response = await fetch(api, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data = await response.json();

    console.log(
      '방명록 조회 성공:',
      data
    );

    renderGuestbook(
      Array.isArray(data.items)
        ? data.items
        : []
    );

  } catch (error) {
    console.error(
      '방명록 조회 실패:',
      error
    );

    if (list) {
      list.innerHTML = `
        <p class="guestbook-failed">
          방명록을 불러오지 못했습니다.<br>
          잠시 후 다시 시도해주세요.
        </p>
      `;
    }

    if (retry) {
      retry.hidden = false;
    }
  }
}


function initGuestbook() {
  const form =
    document.getElementById(
      'guestbook-form'
    );

  const nameInput =
    document.getElementById(
      'guest-name'
    );

  const messageInput =
    document.getElementById(
      'guest-message'
    );

  const count =
    document.getElementById(
      'message-count'
    );

  const submit =
    document.getElementById(
      'guestbook-submit'
    );

  const error =
    document.getElementById(
      'guestbook-error'
    );

  if (!form) {
    console.error(
      'guestbook-form을 찾지 못했습니다.'
    );
    return;
  }

  messageInput?.addEventListener(
    'input',
    () => {
      if (count) {
        count.textContent =
          `${messageInput.value.length} / 300`;
      }
    }
  );

  document
    .getElementById('guestbook-retry')
    ?.addEventListener(
      'click',
      loadGuestbook
    );

  form.addEventListener(
    'submit',
    async (event) => {
      event.preventDefault();

      console.log(
        '방명록 submit 이벤트 실행'
      );

      const name =
        nameInput?.value.trim() || '';

      const message =
        messageInput?.value.trim() || '';

      if (error) {
        error.hidden = true;
        error.textContent = '';
      }

      if (
        name.length < 2 ||
        name.length > 20
      ) {
        if (error) {
          error.textContent =
            '이름은 2~20자로 입력해주세요.';
          error.hidden = false;
        }

        nameInput?.focus();
        return;
      }

      if (
        !message ||
        message.length > 300
      ) {
        if (error) {
          error.textContent =
            '축하 메시지는 1~300자로 입력해주세요.';
          error.hidden = false;
        }

        messageInput?.focus();
        return;
      }

      const api =
        window.WEDDING_CONFIG
          ?.GUESTBOOK_API_URL
          ?.trim();

      if (!api) {
        if (error) {
          error.textContent =
            '방명록 API 주소가 없습니다.';
          error.hidden = false;
        }

        return;
      }

      submit.disabled = true;
      submit.textContent = '등록 중...';

      try {
        const response =
          await fetch(api, {
            method: 'POST',

            headers: {
              'Content-Type':
                'text/plain;charset=utf-8'
            },

            body: JSON.stringify({
              name,
              message
            })
          });

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        console.log(
          '방명록 등록 결과:',
          data
        );

        if (!data.success) {
          throw new Error(
            data.error ||
            '등록에 실패했습니다.'
          );
        }

        form.reset();

        if (count) {
          count.textContent =
            '0 / 300';
        }

        if (
          typeof showToast ===
          'function'
        ) {
          showToast(
            '따뜻한 마음이 등록되었습니다.'
          );
        }

        await loadGuestbook();

      } catch (requestError) {
        console.error(
          '방명록 등록 실패:',
          requestError
        );

        if (error) {
          error.textContent =
            requestError.message ||
            '등록에 실패했습니다.';

          error.hidden = false;
        }

      } finally {
        submit.disabled = false;
        submit.textContent =
          '방명록 남기기';
      }
    }
  );

  loadGuestbook();
}

function initServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('./sw.js').catch((error) => console.warn('Service worker:', error));
  }
}

formatWeddingDate();
initKakaoMap();
initCountdown();
initReveal();
initContacts();
initCopyButtons();
initLightbox();
initGuestbook();
initServiceWorker();
