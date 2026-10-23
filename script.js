function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(12px)";
    toast.style.transition = "opacity 220ms ease, transform 220ms ease";
    window.setTimeout(() => toast.remove(), 240);
  }, 2600);
}

function openWhatsApp(message) {
  const phone = "233507410361";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener");
}

function toggleModal(modal, shouldOpen) {
  if (!modal) return;
  if (shouldOpen) modal.returnFocus = document.activeElement;
  modal.classList.toggle("hidden", !shouldOpen);
  document.body.classList.toggle("modal-open", Boolean(document.querySelector('.modal:not(.hidden)')));
  if (shouldOpen) modal.querySelector('button, a, input')?.focus();
  else if (modal.returnFocus) {
    modal.returnFocus.focus();
    modal.returnFocus = null;
  }
}

function wireModal(modalId, closeId) {
  const modal = document.getElementById(modalId);
  const close = document.getElementById(closeId);
  if (!modal) return null;

  if (close) {
    close.addEventListener("click", () => toggleModal(modal, false));
  }

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      toggleModal(modal, false);
    }
  });

  return modal;
}

const contactModal = wireModal("contact-modal", "close-contact-modal");

const menuToggle = document.getElementById("menu-toggle");
const drawer = document.getElementById("mobile-drawer");
const drawerBackdrop = document.getElementById("drawer-backdrop");
const drawerClose = document.getElementById("drawer-close");

function toggleDrawer(shouldOpen) {
  if (!drawer || !drawerBackdrop || !menuToggle) return;
  drawer.classList.toggle("is-open", shouldOpen);
  drawerBackdrop.classList.toggle("is-open", shouldOpen);
  document.body.classList.toggle("drawer-open", shouldOpen);
  drawer.setAttribute("aria-hidden", String(!shouldOpen));
  drawer.inert = !shouldOpen;
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
  if (shouldOpen) drawerClose?.focus();
  else if (drawer.contains(document.activeElement)) menuToggle.focus();
}

if (drawer) drawer.inert = true;

function closeDrawer() {
  toggleDrawer(false);
}

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = drawer ? drawer.classList.contains("is-open") : false;
    toggleDrawer(!isOpen);
  });
}

[drawerBackdrop, drawerClose].forEach((control) => {
  if (control) control.addEventListener("click", closeDrawer);
});

document.querySelectorAll(".drawer-links a, .drawer-brand").forEach((link) => {
  link.addEventListener("click", closeDrawer);
});

document.querySelectorAll("#nav-cta-btn, [data-open-contact]").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    closeDrawer();
    toggleModal(contactModal, true);
  });
});

const copyEmailBtn = document.getElementById("copy-email-btn");
if (copyEmailBtn) {
  let feedbackTimer;
  const status = document.createElement('span');
  status.className = 'copy-email-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  copyEmailBtn.insertAdjacentElement('afterend', status);
  copyEmailBtn.addEventListener('click', async () => {
    const email = copyEmailBtn.dataset.email || 'teambytant@gmail.com';
    clearTimeout(feedbackTimer);
    copyEmailBtn.disabled = true;
    copyEmailBtn.textContent = 'Copying...';
    status.textContent = '';
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const input = document.createElement('input');
        input.value = email;
        input.setAttribute('readonly', '');
        input.style.position = 'fixed';
        input.style.opacity = '0';
        copyEmailBtn.parentElement.appendChild(input);
        try {
          input.select();
          if (!document.execCommand('copy')) throw new Error('Copy failed');
        } finally {
          input.remove();
          copyEmailBtn.focus();
        }
      }
      copyEmailBtn.textContent = 'Copied!';
      copyEmailBtn.classList.add('is-copied');
      status.textContent = 'Email copied to clipboard.';
    } catch (error) {
      copyEmailBtn.textContent = 'Try again';
      copyEmailBtn.classList.remove('is-copied');
      status.textContent = `Could not copy. Please select ${email} and copy it manually.`;
    } finally {
      copyEmailBtn.disabled = false;
      feedbackTimer = window.setTimeout(() => {
        copyEmailBtn.textContent = 'Copy email';
        copyEmailBtn.classList.remove('is-copied');
        status.textContent = '';
      }, 4000);
    }
  });
}

if (window.matchMedia) {
  window.matchMedia("(min-width: 861px)").addEventListener("change", (event) => {
    if (event.matches) closeDrawer();
  });
}

const projectInquiryForm = document.getElementById("project-inquiry-form");
if (projectInquiryForm) {
  projectInquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(projectInquiryForm);
    const field = name => String(data.get(name) || '').replace(/\r\n?/g, '\n').trim();
    const message = [
      "*BYTANT | SERVICE INQUIRY*",
      "",
      "Hello Bytant, I'd like to hire your team.",
      "",
      "*CONTACT DETAILS*",
      `*Person / Organization:* ${field("name")}`,
      `*Email / Phone:* ${field("contact")}`,
      `*WhatsApp:* ${field("whatsapp")}`,
      "",
      "*REQUIRED SERVICE*",
      field("projectType"),
      "",
      "*SERVICE REQUIREMENTS*",
      field("summary"),
      ...(field("additionalNotes") ? ["", "*ADDITIONAL INFORMATION*", field("additionalNotes")] : []),
      "",
      "Thank you. I look forward to hearing from your team.",
    ].join("\n");
    openWhatsApp(message);
  });
}

function setupActiveNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .drawer-links a[href^="#"]'));
  if (!navLinks.length) return;

  const aboutIds = new Set([
    "mission",
    "who-we-are",
  ]);

  const trackedIds = ["home", "what-we-do", "products", "services", "open-source", ...aboutIds];
  const sections = trackedIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);
  if (!sections.length) return;

  function navKeyForSection(sectionId) {
    if (!sectionId || sectionId === "home") return sectionId === "home" ? "home" : null;
    if (aboutIds.has(sectionId)) return "about";
    return sectionId;
  }

  function setActiveLink(activeKey) {
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      const key = link.dataset.nav || (href ? href.slice(1) : "");
      const isActive = Boolean(activeKey) && key === activeKey;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveFromScroll() {
    const offset = window.innerHeight * 0.38;
    let current = null;

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) {
        current = section;
      }
    });

    // Near the very top, force Home even though #home wraps the page
    if (window.scrollY < 80) {
      current = document.getElementById("home");
    }

    setActiveLink(navKeyForSection(current ? current.id : null));
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const href = link.getAttribute("href");
      if (!href || href.length <= 1) return;
      const sectionId = href.slice(1);
      setActiveLink(navKeyForSection(sectionId));
    });
  });

  updateActiveFromScroll();
  window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
  window.addEventListener("resize", updateActiveFromScroll);
  window.addEventListener("hashchange", updateActiveFromScroll);
}

setupActiveNavigation();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function setupProductCarousel() {
  const track = document.getElementById("product-track");
  const prev = document.getElementById("product-prev");
  const next = document.getElementById("product-next");
  const dotsContainer = document.getElementById("product-dots");
  if (!track || !dotsContainer) return;

  const allSlides = Array.from(track.querySelectorAll(".product-card"));
  if (!allSlides.length) return;
  let slides = allSlides;

  let index = 0;

  let dots = [];
  function rebuildDots() {
    dotsContainer.replaceChildren();
    dots = slides.map((slide, slideIndex) => {
      const dot = document.createElement('button');
      dot.className = 'product-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show ${slide.querySelector('h3').textContent}`);
      dot.addEventListener('click', () => { index = slideIndex; update(); });
      dotsContainer.appendChild(dot);
      return dot;
    });
  }
  rebuildDots();

  function update() {
    track.style.transform = `translateX(-${index * 100}%)`;
    allSlides.forEach(slide => {
      const active = slide === slides[index];
      slide.inert = !active;
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
      dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
    });
  }

  function move(direction) {
    if (slides.length < 2) return;
    index = (index + direction + slides.length) % slides.length;
    update();
  }

  if (prev) prev.addEventListener("click", () => move(-1));
  if (next) next.addEventListener("click", () => move(1));

  const viewport = track.closest('.product-viewport');
  setupTouchSwipe(viewport, dx => {
    viewport.classList.add('is-dragging');
    track.style.translate = `${Math.max(-200, Math.min(200, dx))}px 0`;
  }, direction => {
    viewport.classList.remove('is-dragging');
    track.style.removeProperty('translate');
    if (direction) move(direction);
  });
  let drag;
  let suppressClick = false;
  const resetDrag = () => {
    drag = null;
    viewport.classList.remove('is-dragging');
    track.style.removeProperty('translate');
  };
  viewport.addEventListener('dragstart', event => event.preventDefault());
  viewport.addEventListener('pointerdown', event => {
    if (event.pointerType === 'touch' || event.button !== 0 || event.target.closest('button')) return;
    suppressClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0 };
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!viewport.classList.contains('is-dragging') && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 10) { resetDrag(); return; }
    if (Math.abs(dx) > 8) {
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(event.pointerId);
      suppressClick = true;
      drag.dx = dx;
      track.style.translate = `${Math.max(-200, Math.min(200, dx))}px 0`;
    }
  });
  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = drag.dx;
    resetDrag();
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    if (event.type !== 'pointercancel' && Math.abs(dx) > 45) move(dx < 0 ? 1 : -1);
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);
  viewport.addEventListener('click', event => {
    if (!suppressClick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick = false;
  }, true);
  let wheelDistance = 0;
  let wheelUsed = false;
  let wheelTimer;
  viewport.addEventListener('wheel', event => {
    if (event.ctrlKey) return;
    const delta = event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX;
    if (!delta || (!event.shiftKey && Math.abs(event.deltaY) >= Math.abs(delta))) return;
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => { wheelDistance = 0; wheelUsed = false; }, 180);
    if (wheelUsed) return;
    wheelDistance += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientWidth : 1);
    if (Math.abs(wheelDistance) >= 45) {
      move(wheelDistance > 0 ? 1 : -1);
      wheelUsed = true;
    }
  }, { passive: false });

  const filterGroup = document.querySelector('.project-filters');
  const filters = [...document.querySelectorAll('[data-project-filter]')];
  const empty = document.querySelector('.project-empty');
  const carousel = track.closest('.product-carousel');
  function filterProjects(category) {
    resetDrag();
    wheelDistance = 0;
    wheelUsed = false;
    clearTimeout(wheelTimer);
    slides = allSlides.filter(slide => category === 'all' || (slide.dataset.services || '').split(' ').includes(category));
    allSlides.forEach(slide => { slide.hidden = !slides.includes(slide); });
    index = 0;
    rebuildDots();
    carousel.hidden = slides.length === 0;
    if (empty) empty.hidden = slides.length !== 0;
    if (prev) prev.hidden = slides.length < 2;
    if (next) next.hidden = slides.length < 2;
    dotsContainer.hidden = slides.length < 2;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.projectFilter === category)));
    update();
  }
  filters.forEach(button => button.addEventListener('click', () => filterProjects(button.dataset.projectFilter)));
  if (filterGroup) filterGroup.hidden = false;
  filterProjects('all');
}

setupProductCarousel();

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const activeDialog = document.querySelector('.modal:not(.hidden)') || document.querySelector('.mobile-drawer.is-open');
  if (!activeDialog) return;
  const focusable = Array.from(activeDialog.querySelectorAll('button, a[href], input, textarea, [tabindex="0"]')).filter(el => !el.disabled && el.getClientRects().length);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
    event.preventDefault(); last?.focus();
  } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
    event.preventDefault(); first?.focus();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeDrawer();
  toggleModal(contactModal, false);
});

// Keep only the mobile menu control visible once the visitor leaves the top.
(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const mobile = window.matchMedia('(max-width: 860px)');
  let scheduled = false;
  function update() {
    header.classList.toggle('is-mobile-scrolled', mobile.matches && window.scrollY > 48);
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  mobile.addEventListener('change', update);
  update();
})();

// Keep keyboard navigation inside the open mobile menu.
if (drawer) drawer.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !drawer.classList.contains('is-open')) return;
  const focusable = [...drawer.querySelectorAll('a[href], button:not([disabled])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
