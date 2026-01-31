(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Header scroll progress
  const progressBar = $("#scroll-progress-bar");
  const updateProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    progressBar.style.width = `${pct}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

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

    // Close nav when a link is clicked (mobile)
    navLinks.forEach((a) => a.addEventListener("click", closeNav));

    // Close nav when clicking outside
    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (nav.contains(target) || toggle.contains(target)) return;
      closeNav();
    });

    // Close nav on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });
  }

  // Active link highlight based on scroll position
  const sectionIds = ["about", "skills", "projects", "experience", "contact"];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el);

  const setActiveLink = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const active = href === `#${id}`;
      a.classList.toggle("is-active", active);
    });
  };

  // Immediate highlight on click (before scroll observer kicks in)
  if (navLinks.length) {
    navLinks.forEach((a) => {
      a.addEventListener("click", () => {
        const href = a.getAttribute("href") || "";
        if (!href.startsWith("#")) return;
        const targetId = href.slice(1);
        if (targetId) setActiveLink(targetId);
      });
    });
  }

  // Active section tracking
  const headerEl = $(".site-header");
  const headerOffset = () => (headerEl ? headerEl.getBoundingClientRect().height : 0);

  const computeActiveSection = () => {
    if (!sections.length) return null;

    const offset = headerOffset() + 18; // small breathing room under sticky header
    const scrollPos = window.scrollY + offset;

    // Pick the last section whose top is above the "reading line"
    let activeId = sections[0]?.id || null;
    for (const s of sections) {
      if (!s) continue;
      if (s.offsetTop <= scrollPos) activeId = s.id;
    }
    return activeId;
  };

  // Lightweight scroll handler (rAF throttled)
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      ticking = false;
      const id = computeActiveSection();
      if (id) setActiveLink(id);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Keep IntersectionObserver as a helper when available (nice-to-have, not required)
  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        const anyVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (anyVisible?.target?.id) setActiveLink(anyVisible.target.id);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0.01, 0.1, 0.2] }
    );

    sections.forEach((s) => io.observe(s));
  }

  // Reveal-on-scroll animations
  const revealEls = $$(".reveal");
  const show = (el) => el.classList.add("is-visible");

  if (!revealEls.length) return;

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Hero role rotator (typewriter-ish)
  const roleEl = $("#role-rotator");
  const roles = ["frontend developer", "UI-focused builder", "problem solver", "web developer"];
  let roleIdx = 0;

  const setRole = (text) => {
    if (!roleEl) return;
    roleEl.textContent = text;
  };

  const cycleRole = () => {
    if (!roleEl) return;
    roleIdx = (roleIdx + 1) % roles.length;
    roleEl.style.opacity = "0";
    window.setTimeout(() => {
      setRole(roles[roleIdx]);
      roleEl.style.opacity = "1";
    }, 180);
  };

  if (roleEl && !reducedMotion) {
    setRole(roles[0]);
    window.setInterval(cycleRole, 2400);
  }

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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    revealEls.forEach((el) => rio.observe(el));
  }

  // Project modal
  const modal = $("#project-modal");
  const modalTitle = $("#modal-title");
  const modalDesc = $("#modal-desc");
  const modalStack = $("#modal-stack");
  const modalLive = $("#modal-live");
  const modalCode = $("#modal-code");
  const closeEls = $$("[data-modal-close]");
  const projects = $$(".project[role='button']");

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

  const projectHandler = (card) => {
    const title = card.getAttribute("data-title") || "";
    const desc = card.getAttribute("data-desc") || "";
    const stack = card.getAttribute("data-stack") || "";
    const liveHref = $("a[aria-label*='live']", card)?.getAttribute("href") || "#";
    const codeHref = $("a[aria-label*='source']", card)?.getAttribute("href") || "#";
    openModal({ title, desc, stack, liveHref, codeHref });
  };

  projects.forEach((card) => {
    card.addEventListener("click", (e) => {
      const target = e.target;
      if (target instanceof Element && target.closest("a")) return; // let links work normally
      projectHandler(card);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        projectHandler(card);
      }
    });
  });

  // Demo contact form handling (no backend)
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
})();


