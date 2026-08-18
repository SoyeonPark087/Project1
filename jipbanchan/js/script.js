const moreButtons = document.querySelectorAll(".mobile-more-btn");

moreButtons.forEach((button) => {
    button.addEventListener("click", () => {

        const section = button.closest("section");
        const target = section.querySelector(button.dataset.target);

        target.classList.toggle("is-open");

        const isOpen = target.classList.contains("is-open");

        button.classList.toggle("is-open", isOpen);
        button.setAttribute("aria-expanded", isOpen);

        button.textContent = isOpen ? "접기" : "더보기";
    });
});