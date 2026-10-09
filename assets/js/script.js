(() => {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle (CSS checkbox + JS fallback for iframe environments)
  const nav = $("#site-nav");
  const navCheck = $("#nav-check");
  const navToggle = $(".nav-toggle");
  const navLinks = $$("#site-nav a");

  const closeNav = () => {
    if (navCheck) navCheck.checked = false;
    if (nav) nav.classList.remove("is-open");
  };

  const toggleNav = () => {
    const isOpen = navCheck ? navCheck.checked : nav.classList.contains("is-open");
    if (isOpen) closeNav();
    else {
      if (navCheck) navCheck.checked = true;
      if (nav) nav.classList.add("is-open");
    }
  };

  if (navToggle) navToggle.addEventListener("click", (e) => { e.preventDefault(); toggleNav(); });

  if (nav) {
    navLinks.forEach((a) => a.addEventListener("click", closeNav));
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

  // Contact form (EmailJS)
  const form = $("#contact-form");
  const note = $("#form-note");

  if (form && note) {
    emailjs.init({ publicKey: "4yGcJWivKXgLVsATi" });

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

      note.textContent = "Sending...";

      emailjs.send("service_wpgwxko", "template_p6lq5aj", {
        name: name,
        email: email,
        message: message,
      }).then(() => {
        note.textContent = "Message sent! I'll get back to you soon.";
        form.reset();
      }).catch((err) => {
        console.error("EmailJS error:", err);
        note.textContent = "Failed to send. Please try again or email me directly.";
      });
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

  // Terminal typing animation
  const terminal = $("#terminal");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (terminal && !prefersReducedMotion) {
    const script = [
      { type: "cmd", text: "whoami" },
      { type: "out", text: "Hafiz Aiman — AI Developer & Researcher" },
      { type: "cmd", text: "cat stack.txt" },
      { type: "out", text: "Agentic AI · RAG · Tool Calling · Proxmox" },
      { type: "cmd", text: "cat education.txt" },
      { type: "out", text: "B.CompSc (AI), Universiti Malaya" },
      { type: "cmd", text: "./availability.sh" },
      { type: "out", text: "status: Open to full-time roles ✓", success: true },
    ];

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    const runTerminal = async () => {
      terminal.innerHTML = "";
      const cursor = document.createElement("span");
      cursor.className = "term-cursor";
      cursor.setAttribute("aria-hidden", "true");

      for (const line of script) {
        const lineEl = document.createElement("div");
        lineEl.className = "term-line";

        if (line.type === "cmd") {
          const prompt = document.createElement("span");
          prompt.className = "term-prompt";
          prompt.textContent = "$";
          const cmd = document.createElement("span");
          cmd.className = "term-cmd";
          lineEl.append(prompt, document.createTextNode(" "), cmd, cursor);
          terminal.appendChild(lineEl);
          for (const ch of line.text) {
            cmd.textContent += ch;
            await sleep(35 + Math.random() * 55);
          }
          await sleep(350);
        } else {
          lineEl.className = "term-line term-out" + (line.success ? " term-success" : "");
          lineEl.textContent = line.text;
          terminal.appendChild(lineEl);
          await sleep(500);
        }
      }

      const lastLine = document.createElement("div");
      lastLine.className = "term-line";
      const prompt = document.createElement("span");
      prompt.className = "term-prompt";
      prompt.textContent = "$";
      lastLine.append(prompt, document.createTextNode(" "), cursor);
      terminal.appendChild(lastLine);
    };

    runTerminal();
  }

  // Command palette (Ctrl/Cmd + K)
  const cmdk = $("#cmdk");
  const cmdkInput = $("#cmdk-input");
  const cmdkList = $("#cmdk-list");
  const cmdkOpenBtn = $("#cmdk-open");
  const cmdkBackdrop = $("#cmdk-backdrop");
  const cmdkEmpty = $("#cmdk-empty");
  const cmdkMod = $("#cmdk-mod");

  if (cmdkMod && /Mac|iPhone|iPad/.test(navigator.platform)) {
    cmdkMod.textContent = "⌘K";
  } else {
    const mobileMod = $(".nav-cmdk__mod");
    if (mobileMod) mobileMod.textContent = "Ctrl K";
  }

  const icons = {
    navigate: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    action: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    link: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  };

  const commands = [
    { group: "Navigate", icon: "navigate", label: "About", hint: "#top", keywords: "home hero intro", action: () => document.getElementById("top").scrollIntoView({ behavior: "smooth" }) },
    { group: "Navigate", icon: "navigate", label: "Skills", hint: "#skills", keywords: "technologies stack tools", action: () => document.getElementById("skills").scrollIntoView({ behavior: "smooth" }) },
    { group: "Navigate", icon: "navigate", label: "Projects", hint: "#projects", keywords: "work portfolio", action: () => document.getElementById("projects").scrollIntoView({ behavior: "smooth" }) },
    { group: "Navigate", icon: "navigate", label: "Experience", hint: "#experience", keywords: "work education timeline", action: () => document.getElementById("experience").scrollIntoView({ behavior: "smooth" }) },
    { group: "Navigate", icon: "navigate", label: "Awards", hint: "#awards", keywords: "achievements competition", action: () => document.getElementById("awards").scrollIntoView({ behavior: "smooth" }) },
    { group: "Navigate", icon: "navigate", label: "Contact", hint: "#contact", keywords: "email form phone", action: () => document.getElementById("contact").scrollIntoView({ behavior: "smooth" }) },
    { group: "Actions", icon: "action", label: "Toggle theme", hint: "dark / light", keywords: "dark light mode appearance", action: () => { themeToggle && themeToggle.click(); } },
    { group: "Actions", icon: "action", label: "Chat with Bo", hint: "AI assistant", keywords: "chatbot assistant bo ask", action: () => { const b = $("#chatbot-button"); if (b) b.click(); } },
    { group: "Actions", icon: "action", label: "Copy email", hint: "hfz.aiman0307@gmail.com", keywords: "copy mail address", action: () => { if (navigator.clipboard) navigator.clipboard.writeText("hfz.aiman0307@gmail.com"); } },
    { group: "Links", icon: "link", label: "GitHub profile", hint: "github.com/hasbilol", keywords: "github code repos", action: () => window.open("https://github.com/hasbilol", "_blank", "noopener") },
    { group: "Links", icon: "link", label: "LinkedIn profile", hint: "linkedin.com/in/hafiz-aiman", keywords: "linkedin social", action: () => window.open("https://www.linkedin.com/in/hafiz-aiman", "_blank", "noopener") },
  ];

  const fuzzyMatch = (query, text) => {
    const q = query.toLowerCase();
    const t = text.toLowerCase();
    const idx = t.indexOf(q);
    if (idx !== -1) return { matched: true, score: idx };
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return { matched: qi === q.length, score: 999 };
  };

  let filtered = [];
  let activeIndex = 0;

  const renderList = () => {
    if (!cmdkList) return;
    cmdkList.innerHTML = "";
    if (filtered.length === 0) {
      if (cmdkEmpty) cmdkEmpty.hidden = false;
      return;
    }
    if (cmdkEmpty) cmdkEmpty.hidden = true;

    let lastGroup = "";
    filtered.forEach((cmd, i) => {
      if (cmd.group !== lastGroup) {
        lastGroup = cmd.group;
        const groupEl = document.createElement("li");
        groupEl.className = "cmdk__group-label";
        groupEl.textContent = cmd.group;
        cmdkList.appendChild(groupEl);
      }
      const li = document.createElement("li");
      li.className = "cmdk__item" + (i === activeIndex ? " is-active" : "");
      li.setAttribute("role", "option");
      li.innerHTML =
        '<span class="cmdk__item-icon">' + icons[cmd.icon] + "</span>" +
        '<span class="cmdk__item-label"></span>' +
        '<span class="cmdk__item-hint"></span>';
      li.querySelector(".cmdk__item-label").textContent = cmd.label;
      li.querySelector(".cmdk__item-hint").textContent = cmd.hint;
      li.addEventListener("click", () => runCommand(i));
      li.addEventListener("mouseenter", () => {
        activeIndex = i;
        cmdkList.querySelectorAll(".cmdk__item").forEach((el, j) => el.classList.toggle("is-active", j === i));
      });
      cmdkList.appendChild(li);
    });
  };

  const filterCommands = (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      filtered = commands.slice();
    } else {
      filtered = commands
        .map((cmd) => {
          const inLabel = fuzzyMatch(trimmed, cmd.label);
          const inKeywords = fuzzyMatch(trimmed, cmd.keywords);
          const best = Math.min(inLabel.score, inKeywords.score);
          return inLabel.matched || inKeywords.matched ? { cmd, best } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.best - b.best)
        .map((x) => x.cmd);
    }
    activeIndex = 0;
    renderList();
  };

  const openCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.add("is-open");
    cmdk.setAttribute("aria-hidden", "false");
    if (cmdkInput) {
      cmdkInput.value = "";
      cmdkInput.focus();
    }
    filterCommands("");
  };

  const closeCmdk = () => {
    if (!cmdk) return;
    cmdk.classList.remove("is-open");
    cmdk.setAttribute("aria-hidden", "true");
  };

  const runCommand = (i) => {
    const cmd = filtered[i];
    if (!cmd) return;
    closeCmdk();
    setTimeout(cmd.action, 100);
  };

  if (cmdk) {
    if (cmdkOpenBtn) cmdkOpenBtn.addEventListener("click", openCmdk);
    if (cmdkBackdrop) cmdkBackdrop.addEventListener("click", closeCmdk);
    if (cmdkInput) cmdkInput.addEventListener("input", () => filterCommands(cmdkInput.value));

    // Mobile: open from nav dropdown, close dropdown first
    const cmdkOpenMobile = $("#cmdk-open-mobile");
    if (cmdkOpenMobile) {
      cmdkOpenMobile.addEventListener("click", () => {
        const navCheck = $("#nav-check");
        if (navCheck) navCheck.checked = false;
        const nav = $("#site-nav");
        if (nav) nav.classList.remove("is-open");
        openCmdk();
      });
    }

    document.addEventListener("keydown", (e) => {
      const isOpen = cmdk.classList.contains("is-open");

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        isOpen ? closeCmdk() : openCmdk();
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        closeCmdk();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % Math.max(filtered.length, 1);
        renderList();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + filtered.length) % Math.max(filtered.length, 1);
        renderList();
      } else if (e.key === "Enter") {
        e.preventDefault();
        runCommand(activeIndex);
      }
    });
  }
})();
