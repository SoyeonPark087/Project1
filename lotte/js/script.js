/* =========================================================
   LOTTE EATZ HEADER / MEGA MENU
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* 메인 헤더 */
    const header = document.querySelector(".main-header");

    /* 메인 GNB */
    const gnb = document.querySelector(".main-gnb");

    /* 1단 메뉴 */
    const gnbItems = document.querySelectorAll(".main-gnb__item");

    /* 1단 메뉴 링크 */
    const gnbLinks = document.querySelectorAll(".main-gnb__link");

    /* 2단 메가메뉴 */
    const megaMenu = document.querySelector(".mega-menu");

    /* 2단 메뉴 각 컬럼 */
    const megaColumns = document.querySelectorAll(".mega-menu__column");


    /* 필요한 요소가 없으면 실행하지 않음 */
    if (!header || !gnb || !megaMenu) {
        return;
    }


    /* =====================================================
       메가메뉴 열기
    ===================================================== */
    function openMegaMenu() {
        header.classList.add("is-open");
    }


    /* =====================================================
       모든 주메뉴 활성 상태 제거
    ===================================================== */
    function clearActiveMenu() {

        gnbItems.forEach(function (item) {
            item.classList.remove("is-active");
        });

    }


    /* =====================================================
       해당 index의 주메뉴 활성화

       0 = 브랜드
       1 = 쿠폰
       2 = 쇼핑
       3 = 이벤트
       4 = 고객지원
    ===================================================== */
    function setActiveMenu(index) {

        /* 기존 활성 메뉴 제거 */
        clearActiveMenu();

        /* 해당 주메뉴 활성화 */
        if (gnbItems[index]) {
            gnbItems[index].classList.add("is-active");
        }

    }


    /* =====================================================
       메가메뉴 닫기
    ===================================================== */
    function closeMegaMenu() {

        /* 메뉴 닫기 */
        header.classList.remove("is-open");

        /* 활성 컬러 초기화 */
        clearActiveMenu();

    }


    /* =====================================================
       1단 메뉴 Hover
       → 전체 2단 메뉴 OPEN
       → 현재 주메뉴 활성화
    ===================================================== */
    gnbItems.forEach(function (item, index) {

        item.addEventListener("mouseenter", function () {

            openMegaMenu();

            setActiveMenu(index);

        });

    });


    /* =====================================================
       2단 메뉴 각 컬럼 처리
    ===================================================== */
    megaColumns.forEach(function (column, columnIndex) {

        /* 해당 컬럼 내부의 모든 링크 */
        const subLinks = column.querySelectorAll("a");


        /* -------------------------------------------------
           2단 메뉴 컬럼 안으로 들어왔을 때

           브랜드 2단 영역 → 브랜드 활성
           쿠폰 2단 영역 → 쿠폰 활성
           ...
        ------------------------------------------------- */
        column.addEventListener("mouseenter", function () {

            openMegaMenu();

            setActiveMenu(columnIndex);

        });


        /* -------------------------------------------------
           2단 메뉴 개별 항목 Hover

           ex)
           엔제리너스 hover
           → 엔제리너스 #00A1B4
           → 브랜드도 #00A1B4 상태 유지
        ------------------------------------------------- */
        subLinks.forEach(function (link) {

            link.addEventListener("mouseenter", function () {

                openMegaMenu();

                setActiveMenu(columnIndex);

            });


            /* 키보드 Tab 접근 시에도 동일하게 처리 */
            link.addEventListener("focus", function () {

                openMegaMenu();

                setActiveMenu(columnIndex);

            });

        });

    });


    /* =====================================================
       1단 메뉴 키보드 Focus 처리
    ===================================================== */
    gnbLinks.forEach(function (link, index) {

        link.addEventListener("focus", function () {

            openMegaMenu();

            setActiveMenu(index);

        });

    });


    /* =====================================================
       Header 전체에서 마우스가 벗어나면 메뉴 닫기

       중요:
       1단 메뉴 → 2단 메뉴로 이동하는 동안에는
       Header 내부에 마우스가 있으므로 닫히지 않음
    ===================================================== */
    header.addEventListener("mouseleave", function () {

        closeMegaMenu();

    });


    /* =====================================================
       키보드 Focus가 Header 밖으로 나가면 닫기
    ===================================================== */
    header.addEventListener("focusout", function (event) {

        if (!header.contains(event.relatedTarget)) {

            closeMegaMenu();

        }

    });


    /* =====================================================
       ESC 키 입력 시 메뉴 닫기
    ===================================================== */
    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeMegaMenu();

        }

    });

});

/* =========================================================
   LOTTE EATZ MAIN BANNER
   - Swiper 사용
   - 총 3개 배너
   - 3초마다 자동 슬라이드
   - 무한 반복
   - 이전 / 다음
   - 자동재생 정지 / 재생
   - 현재 페이지 표시
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       필요한 DOM
    ===================================================== */
    const currentNumber = document.querySelector(
        ".main-banner__current"
    );

    const totalNumber = document.querySelector(
        ".main-banner__total"
    );

    const prevButton = document.querySelector(
        ".main-banner__prev"
    );

    const nextButton = document.querySelector(
        ".main-banner__next"
    );

    const playButton = document.querySelector(
        ".main-banner__play"
    );


    /* =====================================================
       슬라이드 총 개수
       현재 요청사항 : 3개
    ===================================================== */
    const totalSlides = document.querySelectorAll(
        ".main-banner-swiper .swiper-slide"
    ).length;


    /* 전체 슬라이드 숫자 표시 */
    if (totalNumber) {
        totalNumber.textContent = totalSlides;
    }


    /* =====================================================
       Swiper 생성
    ===================================================== */
    const mainBannerSwiper = new Swiper(
        ".main-banner-swiper",
        {

            /* -------------------------------------------------
               무한 반복
            ------------------------------------------------- */
            loop: true,


            /* -------------------------------------------------
               슬라이드 전환 속도
            ------------------------------------------------- */
            speed: 700,


            /* -------------------------------------------------
               한 화면에 하나만 노출
            ------------------------------------------------- */
            slidesPerView: 1,


            /* -------------------------------------------------
               자동재생

               delay : 3000
               → 3초마다 다음 배너

               reverseDirection : true
               → 시각적으로 좌측에서 우측 방향으로 전환

               일반적인 오른쪽 → 왼쪽 전환을 원한다면
               reverseDirection: false 로 변경
            ------------------------------------------------- */
            autoplay: {
                delay: 3000,

                disableOnInteraction: false,

                pauseOnMouseEnter: false,

                reverseDirection: false
            },


            /* -------------------------------------------------
               이전 / 다음 버튼
            ------------------------------------------------- */
            navigation: {
                prevEl: ".main-banner__prev",
                nextEl: ".main-banner__next"
            },


            /* -------------------------------------------------
               초기화 완료 시 페이지 표시
            ------------------------------------------------- */
            on: {

                init: function () {

                    updateBannerNumber(this);

                },


                /* ---------------------------------------------
                   슬라이드가 변경될 때마다 현재 번호 갱신
                --------------------------------------------- */
                slideChange: function () {

                    updateBannerNumber(this);

                }

            }

        }
    );


    /* =====================================================
       현재 슬라이드 번호 변경

       Swiper loop를 사용하면
       activeIndex가 복제 슬라이드까지 포함하기 때문에
       realIndex를 사용해야 실제 번호가 정확함

       realIndex
       0 → 화면에는 1
       1 → 화면에는 2
       2 → 화면에는 3
    ===================================================== */
    function updateBannerNumber(swiper) {

        if (!currentNumber) {
            return;
        }

        currentNumber.textContent =
            swiper.realIndex + 1;

    }


    /* =====================================================
       자동재생 상태

       false = 재생 중
       true  = 일시정지 상태
    ===================================================== */
    let isPaused = false;


    /* =====================================================
       재생 / 일시정지 버튼
    ===================================================== */
    if (playButton) {

        playButton.addEventListener(
            "click",
            function () {

                /* -----------------------------------------
                   현재 재생 중이라면 정지
                ----------------------------------------- */
                if (!isPaused) {

                    mainBannerSwiper.autoplay.stop();

                    isPaused = true;

                    /* 재생 삼각형 아이콘으로 변경 */
                    playButton.classList.add(
                        "is-paused"
                    );

                    playButton.setAttribute(
                        "aria-label",
                        "배너 자동재생 시작"
                    );

                }

                /* -----------------------------------------
                   현재 정지 중이라면 다시 재생
                ----------------------------------------- */
                else {

                    mainBannerSwiper.autoplay.start();

                    isPaused = false;

                    /* Pause 아이콘으로 변경 */
                    playButton.classList.remove(
                        "is-paused"
                    );

                    playButton.setAttribute(
                        "aria-label",
                        "배너 자동재생 일시정지"
                    );

                }

            }
        );

    }

});

/* =========================================================
   COUPON SWIPER
   - 쿠폰 총 8개
   - 한 화면 4개
   - 자동재생 없음
   - 무한반복 없음
   - 최초 PREV 버튼 숨김
   - 이동 후 PREV 버튼 자동 표시
   - 마지막 도달 시 NEXT 버튼 자동 숨김
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       쿠폰 Swiper 요소가 존재하는지 확인
    ===================================================== */
    const couponSwiperElement =
        document.querySelector(".coupon-swiper");


    /* 쿠폰 섹션이 없는 페이지에서는 실행하지 않음 */
    if (!couponSwiperElement) {
        return;
    }


    /* =====================================================
       Coupon Swiper 생성
    ===================================================== */
    const couponSwiper = new Swiper(
        ".coupon-swiper",
        {

            /* -------------------------------------------------
               한 화면에 쿠폰 4개 표시
            ------------------------------------------------- */
            slidesPerView: 4,


            /* -------------------------------------------------
               쿠폰 카드 사이 간격
               첨부 시안 기준 약 14px
            ------------------------------------------------- */
            spaceBetween: 14,


            /* -------------------------------------------------
               한 번 클릭할 때 1개씩 이동
            ------------------------------------------------- */
            slidesPerGroup: 1,


            /* -------------------------------------------------
               무한 반복 사용하지 않음

               처음에는 왼쪽 버튼 없음
               마지막에는 오른쪽 버튼 없음
            ------------------------------------------------- */
            loop: false,


            /* -------------------------------------------------
               자동 슬라이드 없음
            ------------------------------------------------- */
            autoplay: false,


            /* -------------------------------------------------
               슬라이드 이동 속도
            ------------------------------------------------- */
            speed: 450,


            /* -------------------------------------------------
               마우스로 드래그해서도 이동 가능
            ------------------------------------------------- */
            allowTouchMove: true,


            /* -------------------------------------------------
               좌우 네비게이션
            ------------------------------------------------- */
            navigation: {

                nextEl: ".coupon-slider__next",

                prevEl: ".coupon-slider__prev"

            }

        }
    );

});

/* =========================================================
   이달의 핫메뉴 TAB
   - 클릭한 브랜드에 따라 콘텐츠 변경
   - 선택된 탭 활성화
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       모든 탭 버튼
    ===================================================== */
    const hotMenuTabs =
        document.querySelectorAll("[data-hot-tab]");


    /* =====================================================
       모든 브랜드 콘텐츠 패널
    ===================================================== */
    const hotMenuPanels =
        document.querySelectorAll("[data-hot-panel]");


    /* 섹션이 존재하지 않는 페이지에서는 실행 중지 */
    if (!hotMenuTabs.length || !hotMenuPanels.length) {
        return;
    }


    /* =====================================================
       탭 클릭 이벤트
    ===================================================== */
    hotMenuTabs.forEach(function (tab) {

        tab.addEventListener("click", function () {

            /* 클릭한 브랜드 이름 가져오기 */
            const target =
                tab.dataset.hotTab;


            /* =================================================
               모든 탭 비활성화
            ================================================= */
            hotMenuTabs.forEach(function (item) {

                item.classList.remove("is-active");

                item.setAttribute(
                    "aria-selected",
                    "false"
                );

            });


            /* =================================================
               클릭한 탭 활성화
            ================================================= */
            tab.classList.add("is-active");

            tab.setAttribute(
                "aria-selected",
                "true"
            );


            /* =================================================
               모든 콘텐츠 패널 숨기기
            ================================================= */
            hotMenuPanels.forEach(function (panel) {

                panel.classList.remove("is-active");

                panel.hidden = true;

            });


            /* =================================================
               클릭한 브랜드와 같은 패널 찾기
            ================================================= */
            const targetPanel =
                document.querySelector(
                    '[data-hot-panel="' + target + '"]'
                );


            /* =================================================
               해당 콘텐츠 표시
            ================================================= */
            if (targetPanel) {

                targetPanel.hidden = false;

                targetPanel.classList.add(
                    "is-active"
                );

            }

        });

    });

});

/* =========================================================
   EATZ SHOPPING
   - MD / 원두 TAB
   - Swiper
   - 자동재생 없음
   - 좌우 버튼 이동
   - 마우스 드래그 이동
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       탭 요소
    ===================================================== */
    const shoppingTabs =
        document.querySelectorAll("[data-shopping-tab]");


    /* 탭 패널 */
    const shoppingPanels =
        document.querySelectorAll("[data-shopping-panel]");


    /* 섹션이 없는 페이지에서는 실행하지 않음 */
    if (!shoppingTabs.length || !shoppingPanels.length) {
        return;
    }


    /* =====================================================
       MD Swiper

       한 화면에 5개
       총 10개
    ===================================================== */
    const mdShoppingSwiper = new Swiper(
        ".shopping-swiper--md",
        {

            /* 한 화면 상품 수 */
            slidesPerView: 5,

            /* 상품 간격 */
            spaceBetween: 12,

            /* 한 번에 하나씩 이동 */
            slidesPerGroup: 1,

            /* 무한 반복 없음 */
            loop: false,

            /* 자동재생 없음 */
            autoplay: false,

            /* 이동 속도 */
            speed: 450,

            /* =================================================
               마우스 / 터치 드래그 활성화
            ================================================= */
            allowTouchMove: true,

            /*
                PC에서 마우스로 클릭 후 좌우로 움직여도
                Swiper를 드래그할 수 있도록 설정
            */
            simulateTouch: true,

            /* 드래그 중 손 모양 커서 */
            grabCursor: true,

            /* 이미지 위에서 드래그 선택 방지 */
            preventClicks: true,
            preventClicksPropagation: true,

            /* =================================================
               좌우 버튼
            ================================================= */
            navigation: {

                prevEl:
                    ".shopping-slider__prev--md",

                nextEl:
                    ".shopping-slider__next--md"

            }

        }
    );


    /* =====================================================
       원두 Swiper

       한 화면에 5개
       총 7개
    ===================================================== */
    const beanShoppingSwiper = new Swiper(
        ".shopping-swiper--bean",
        {

            slidesPerView: 5,

            spaceBetween: 12,

            slidesPerGroup: 1,

            loop: false,

            autoplay: false,

            speed: 450,

            /* 마우스 드래그 */
            allowTouchMove: true,

            simulateTouch: true,

            grabCursor: true,

            preventClicks: true,
            preventClicksPropagation: true,

            /* 좌우 버튼 */
            navigation: {

                prevEl:
                    ".shopping-slider__prev--bean",

                nextEl:
                    ".shopping-slider__next--bean"

            }

        }
    );


    /* =====================================================
       탭 클릭
    ===================================================== */
    shoppingTabs.forEach(function (tab) {

        tab.addEventListener("click", function () {

            /* 클릭한 탭 이름 */
            const target =
                tab.dataset.shoppingTab;


            /* =================================================
               모든 탭 비활성
            ================================================= */
            shoppingTabs.forEach(function (item) {

                item.classList.remove("is-active");

                item.setAttribute(
                    "aria-selected",
                    "false"
                );

            });


            /* 클릭한 탭 활성 */
            tab.classList.add("is-active");

            tab.setAttribute(
                "aria-selected",
                "true"
            );


            /* =================================================
               모든 패널 숨김
            ================================================= */
            shoppingPanels.forEach(function (panel) {

                panel.hidden = true;

                panel.classList.remove("is-active");

            });


            /* =================================================
               선택한 패널 찾기
            ================================================= */
            const targetPanel =
                document.querySelector(
                    '[data-shopping-panel="' +
                    target +
                    '"]'
                );


            /* 선택 패널 표시 */
            if (targetPanel) {

                targetPanel.hidden = false;

                targetPanel.classList.add(
                    "is-active"
                );

            }


            /* =================================================
               hidden 상태였던 Swiper는
               탭이 열린 후 사이즈 재계산 필요
            ================================================= */
            if (target === "md") {

                mdShoppingSwiper.update();

            }


            if (target === "bean") {

                beanShoppingSwiper.update();

            }

        });

    });

});

/* =========================================================
   FAMILY SITE
   - 버튼 클릭 시 위쪽으로 목록 OPEN
   - 다시 클릭하면 CLOSE
   - 바깥 클릭 시 CLOSE
   - ESC 입력 시 CLOSE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* Family Site 전체 영역 */
    const familySite =
        document.querySelector(".family-site");


    /* Family Site 버튼 */
    const familySiteButton =
        document.querySelector(".family-site__button");


    /* Family Site 목록 */
    const familySiteMenu =
        document.querySelector(".family-site__menu");


    /* 요소가 없으면 실행하지 않음 */
    if (
        !familySite ||
        !familySiteButton ||
        !familySiteMenu
    ) {
        return;
    }


    /* =====================================================
       Family Site OPEN
    ===================================================== */
    function openFamilySite() {

        /* OPEN 클래스 추가 */
        familySite.classList.add("is-open");


        /* 접근성 상태 변경 */
        familySiteButton.setAttribute(
            "aria-expanded",
            "true"
        );


        familySiteMenu.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /* =====================================================
       Family Site CLOSE
    ===================================================== */
    function closeFamilySite() {

        /* OPEN 클래스 제거 */
        familySite.classList.remove("is-open");


        /* 접근성 상태 변경 */
        familySiteButton.setAttribute(
            "aria-expanded",
            "false"
        );


        familySiteMenu.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /* =====================================================
       Family Site 버튼 클릭
    ===================================================== */
    familySiteButton.addEventListener(
        "click",
        function (event) {

            /* 부모로 이벤트 전달 방지 */
            event.stopPropagation();


            /* 현재 OPEN 상태 확인 */
            const isOpen =
                familySite.classList.contains(
                    "is-open"
                );


            /* 열려 있으면 닫기 */
            if (isOpen) {

                closeFamilySite();

            }

            /* 닫혀 있으면 열기 */
            else {

                openFamilySite();

            }

        }
    );


    /* =====================================================
       Family Site 내부 클릭은 닫히지 않도록 처리
    ===================================================== */
    familySiteMenu.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

        }
    );


    /* =====================================================
       Family Site 바깥 클릭 시 CLOSE
    ===================================================== */
    document.addEventListener(
        "click",
        function (event) {

            if (!familySite.contains(event.target)) {

                closeFamilySite();

            }

        }
    );


    /* =====================================================
       ESC 입력 시 CLOSE
    ===================================================== */
    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape" &&
                familySite.classList.contains("is-open")
            ) {

                closeFamilySite();


                /* 닫은 뒤 버튼으로 Focus 복귀 */
                familySiteButton.focus();

            }

        }
    );

});

/* =========================================================
   TOP BUTTON
   - 400px 이상 스크롤 시 표시
   - 클릭 시 최상단으로 부드럽게 이동
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* TOP 버튼 */
    const topButton =
        document.querySelector(".top-button");


    /* 버튼이 없는 경우 실행 중지 */
    if (!topButton) {
        return;
    }


    /* =====================================================
       TOP 버튼 표시 기준
       - 400px 이상 내려가면 보이도록 설정
    ===================================================== */
    const showPoint = 400;


    /* =====================================================
       스크롤 위치에 따라 버튼 표시 / 숨김
    ===================================================== */
    function toggleTopButton() {

        if (window.scrollY >= showPoint) {

            topButton.classList.add(
                "is-visible"
            );

        } else {

            topButton.classList.remove(
                "is-visible"
            );

        }

    }


    /* =====================================================
       스크롤 이벤트
    ===================================================== */
    window.addEventListener(
        "scroll",
        toggleTopButton,
        {
            passive: true
        }
    );


    /* =====================================================
       페이지 로딩 직후에도 현재 위치 체크
       새로고침 위치가 중간일 경우 대응
    ===================================================== */
    toggleTopButton();


    /* =====================================================
       버튼 클릭
       → 페이지 최상단으로 부드럽게 이동
    ===================================================== */
    topButton.addEventListener(
        "click",
        function () {

            window.scrollTo({

                top: 0,

                left: 0,

                behavior: "smooth"

            });

        }
    );

});