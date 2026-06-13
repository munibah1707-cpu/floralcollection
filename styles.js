(() => {
  // ====== AUTO HOOK ADD TO CART BUTTONS ======
  function autoHookAddToCart() {
    const buttons = document.querySelectorAll(".add-to-cart");
    buttons.forEach(btn => {
      if (btn._hooked) return;
      btn._hooked = true;
      btn.addEventListener("click", () => {
        const name = btn.dataset.name || "Product";
        const price = btn.dataset.price || 0;
        const id = btn.dataset.id || null;
        if (typeof addToCart === "function") {
          addToCart(name, price, id);
        }
      });
    });
  }

  // ========== SEARCH HANDLING ==========
  function wireSearch() {
    const container = document.querySelector(".search-container");
    const input = document.getElementById("searchInput");

    window.toggleSearch = function () {
      if (!container) return;
      container.classList.toggle("active");
      if (container.classList.contains("active") && input) input.focus();
      else if (input) input.value = "";
    };

    document.addEventListener("click", function (e) {
      if (!container) return;
      if (!container.contains(e.target)) {
        container.classList.remove("active");
        if (input) input.value = "";
      }
    });

    if (input) {
      input.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
          const term = this.value.toLowerCase().trim();
          if (!term) return;
          const sectionMap = {
            chiffon: "chiffon category.html",
            silk: "silk.html",
            jersey: "jersey.html",
            georgette: "georgette.html",
            viscose: "viscose.html",
            deals: "Hijab.html",
            "hijab deals": "Hijab.html",
            accessories: "Accessories.html",
          };
          for (const key in sectionMap) {
            if (term.includes(key)) {
              window.location.href = sectionMap[key];
              return;
            }
          }
          alert("No matching category found.");
        }
      });
    }
  }

  // ========== SLIDESHOW ==========
  let slideIndex = 0;
  let slideTimer;

  function showSlides(n) {
    const slides = document.getElementsByClassName("mySlides");
    const dots = document.getElementsByClassName("dot");

    if (!slides.length) return; // ✅ skip if no slides

    if (n > slides.length) slideIndex = 1;
    if (n < 1) slideIndex = slides.length;

    for (let i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("active");
    }

    slides[slideIndex - 1].style.display = "block";
    if (dots[slideIndex - 1]) dots[slideIndex - 1].classList.add("active");
  }

  function nextSlide() {
    slideIndex++;
    showSlides(slideIndex);
  }

  function currentSlide(n) {
    slideIndex = n;
    showSlides(slideIndex);
  }

  function startSlideshow() {
    const slides = document.getElementsByClassName("mySlides");
    if (!slides.length) return; // ✅ only run if slides exist

    slideIndex = 0;
    clearInterval(slideTimer);
    slideTimer = setInterval(nextSlide, 3000);
    nextSlide();
  }

  // ========== MISC UI ==========
  function wireMiscUI() {
    window.toggleMenu = function () {
      const menu = document.getElementById("mobileMenu");
      if (menu) menu.classList.toggle("show");
    };

    window.openContact = function () {
      const popup = document.getElementById("contact-popup");
      if (popup) popup.style.display = "block";
      const menu = document.getElementById("mobileMenu");
      if (menu && menu.classList.contains("show")) menu.classList.remove("show");
    };

    window.closeContact = function () {
      const popup = document.getElementById("contact-popup");
      if (popup) popup.style.display = "none";
    };

    window.toggleCart = function () {
      const box = document.getElementById("cartBox");
      if (box) {
        box.style.display = box.style.display === "block" ? "none" : "block";
      } else if (typeof window.openCart === "function") {
        window.openCart();
      }
    };

    window.showCollection = function (id) {
      document
        .querySelectorAll(".collection-section")
        .forEach(sec => (sec.style.display = "none"));
      const sel = document.getElementById(id);
      if (sel) {
        sel.style.display = "block";
        window.scrollTo({ top: sel.offsetTop - 100, behavior: "smooth" });
      }
    };
  }

  // ========== HIDE HEADER ON SCROLL ==========
  let lastScroll = 0;
  const header = document.querySelector(".header");
  const nav = document.querySelector("nav");

  if (header && nav) {
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > 50) {
        header.style.top = `-${header.offsetHeight + nav.offsetHeight}px`;
        nav.style.top = `-${header.offsetHeight + nav.offsetHeight}px`;
      } else {
        header.style.top = "0";
        nav.style.top = header.offsetHeight + "px";
      }
      lastScroll = currentScroll;
    });
  }

  // ========== INIT ==========
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof renderCart === "function") renderCart();
    if (typeof updateCartCount === "function") updateCartCount();
    autoHookAddToCart();
    wireSearch();
    startSlideshow();
    wireMiscUI();

    const menuBtn = document.getElementById("menuButton");
    if (menuBtn) menuBtn.addEventListener("click", toggleMenu);
  });

  window.addEventListener("load", () => {
    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    if (header && nav) {
      const totalHeight = header.offsetHeight + nav.offsetHeight;
      document.body.style.paddingTop = totalHeight + "px";
    }
  });

  // ========== CARD FLIP ==========
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => {
      card.classList.toggle("flipped");
    });
  });
})();
