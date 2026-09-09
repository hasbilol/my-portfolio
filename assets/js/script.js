(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const nav = $("#site-nav");
  const toggle = $(".nav-toggle");
  const navLinks = $$("#site-nav a");

  const closeNav = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    if (!nav || !toggle) return;
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      if (isOpen) closeNav();
      else openNav();
    });

    navLinks.forEach((a) => a.addEventListener("click", closeNav));

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (nav.contains(target) || toggle.contains(target)) return;
      closeNav();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Active link highlight
  const sectionIds = ["about", "skills", "projects", "experience", "awards", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el);

  let isNavClickScrolling = false;
  let navClickTimer = null;

  const setActiveLink = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const active = href === `#${id}`;
      a.classList.toggle("is-active", active);
    });
  };

  if (navLinks.length) {
    navLinks.forEach((a) => {
      a.addEventListener("click", () => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const targetId = href.slice(1);
        if (targetId) setActiveLink(targetId);

        isNavClickScrolling = true;
        clearTimeout(navClickTimer);
        navClickTimer = setTimeout(() => {
          isNavClickScrolling = false;
        }, 1200);
      });
    });
  }

  const headerEl = $(".site-header");
  const headerOffset = () => (headerEl ? headerEl.getBoundingClientRect().height : 0);

  const computeActiveSection = () => {
    if (!sections.length) return null;
    const offset = headerOffset() + 18;
    const scrollPos = window.scrollY + offset;
    let activeId = sections[0]?.id || null;
    for (const s of sections) {
      if (!s) continue;
      if (s.offsetTop <= scrollPos) activeId = s.id;
    }
    return activeId;
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking || isNavClickScrolling) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      if (isNavClickScrolling) return;
      const id = computeActiveSection();
      if (id) setActiveLink(id);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        if (isNavClickScrolling) return;
        const anyVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (anyVisible?.target?.id) setActiveLink(anyVisible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.01, 0.1, 0.2] }
    );
    sections.forEach((s) => io.observe(s));
  }

  // Reveal-on-scroll
  const revealEls = $$(".reveal");
  const show = (el) => el.classList.add("is-visible");

  if (revealEls.length) {
    const reducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(show);
    } else {
      const rio = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            show(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
      );
      revealEls.forEach((el) => rio.observe(el));
    }
  }

  // Project modal
  const modal = $("#project-modal");
  const modalTitle = $("#modal-title");
  const modalDesc = $("#modal-desc");
  const modalStack = $("#modal-stack");
  const modalLive = $("#modal-live");
  const modalCode = $("#modal-code");
  const closeEls = $$("[data-modal-close]");

  let lastFocus = null;

  const openModal = ({ title, desc, stack, liveHref, codeHref }) => {
    if (!modal) return;
    if (modalTitle) modalTitle.textContent = title || "Project";
    if (modalDesc) modalDesc.textContent = desc || "";
    if (modalStack) modalStack.textContent = stack || "";
    if (modalLive) modalLive.href = liveHref || "#";
    if (modalCode) modalCode.href = codeHref || "#";
    lastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    const focusTarget = $(".modal__close", modal) || $(".modal__dialog", modal);
    if (focusTarget instanceof HTMLElement) focusTarget.focus();
  };

  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (lastFocus) lastFocus.focus();
  };

  if (modal) {
    closeEls.forEach((el) => el.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });
  }

  // Contact form
  const form = $("#contact-form");
  const note = $("#form-note");

  if (form && note) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const email = String(fd.get("email") || "").trim();
      const message = String(fd.get("message") || "").trim();

      if (!name || !email || !message) {
        note.textContent = "Please fill in all fields.";
        return;
      }

      note.textContent = "Thanks! Your message is ready to be sent (demo only).";
      form.reset();
    });
  }

  // Theme toggle
  const themeToggle = $("#theme-toggle");
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-theme");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("light-theme");
      const isLight = document.body.classList.contains("light-theme");
      localStorage.setItem("theme", isLight ? "light" : "dark");
    });
  }

  // Back to top
  const backToTop = $("#back-to-top");
  if (backToTop) {
    const toggleBackToTop = () => {
      if (window.scrollY > 400) {
        backToTop.classList.add("is-visible");
      } else {
        backToTop.classList.remove("is-visible");
      }
    };
    window.addEventListener("scroll", toggleBackToTop, { passive: true });
    toggleBackToTop();
  }
})();
