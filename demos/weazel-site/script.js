const canvas = document.querySelector("#neural-canvas");
const ctx = canvas.getContext("2d");
const pointer = { x: 0, y: 0, active: false };
let width = 0;
let height = 0;
let particles = [];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createParticles();
}

function createParticles() {
  const count = Math.min(120, Math.floor((width * height) / 11500));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    size: Math.random() * 1.8 + 0.7,
  }));
}

function drawParticles() {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;

    if (pointer.active) {
      const dx = pointer.x - p.x;
      const dy = pointer.y - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 170) {
        p.x -= dx * 0.0025;
        p.y -= dy * 0.0025;
      }
    }

    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < particles.length; i += 1) {
    for (let j = i + 1; j < particles.length; j += 1) {
      const a = particles[i];
      const b = particles[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 126) {
        const alpha = 1 - distance / 126;
        ctx.strokeStyle = `rgba(239, 0, 0, ${alpha * 0.24})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(drawParticles);
}

function setupReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((item) => observer.observe(item));
}

function setupTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -10}deg) rotateY(${x * 12}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-counter]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.target.dataset.done) return;
        entry.target.dataset.done = "true";
        const target = Number(entry.target.dataset.counter);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 58));
        const tick = () => {
          current = Math.min(target, current + step);
          entry.target.textContent = current;
          if (current < target) requestAnimationFrame(tick);
        };
        tick();
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupPointer() {
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    document.documentElement.style.setProperty("--mx", `${event.clientX}px`);
    document.documentElement.style.setProperty("--my", `${event.clientY}px`);
  });

  window.addEventListener("pointerleave", () => {
    pointer.active = false;
  });
}

function duplicateTicker() {
  const track = document.querySelector(".ticker-track");
  if (!track) return;
  track.innerHTML += track.innerHTML;
}

function setupFxButton() {
  const button = document.querySelector(".sound-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    document.body.animate(
      [
        { filter: "saturate(1)" },
        { filter: "saturate(1.8) contrast(1.12)" },
        { filter: "saturate(1)" },
      ],
      { duration: 620, easing: "ease-out" }
    );
  });
}

function setupDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const trigger = document.querySelector(".nav-trigger");
  if (!dropdown || !trigger) return;

  trigger.addEventListener("click", () => {
    const isOpen = dropdown.classList.toggle("open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (dropdown.contains(event.target)) return;
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  });
}

function setupMobileMenu() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (!header || !toggle || !nav) return;

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });
}

function setupAdBuilder() {
  const titleInput = document.querySelector("#ad-title");
  const textInput = document.querySelector("#ad-text");
  const imageUrlInput = document.querySelector("#ad-image-url");
  const imageFileInput = document.querySelector("#ad-image-file");
  const titlePreview = document.querySelector("#ad-preview-title");
  const textPreview = document.querySelector("#ad-preview-text");
  const imagePreview = document.querySelector("#ad-preview-image");
  const preview = document.querySelector("#ad-preview");
  const titleCount = document.querySelector("#ad-title-count");
  const textCount = document.querySelector("#ad-text-count");

  if (!titleInput || !textInput || !imageUrlInput || !imageFileInput || !preview) return;

  const syncText = () => {
    const title = titleInput.value.trim();
    const text = textInput.value.trim();
    titlePreview.textContent = title;
    textPreview.textContent = text;
    titleCount.textContent = String(titleInput.value.length);
    textCount.textContent = String(textInput.value.length);
  };

  titleInput.addEventListener("input", syncText);
  textInput.addEventListener("input", syncText);

  imageUrlInput.addEventListener("input", () => {
    const url = imageUrlInput.value.trim();
    if (url) {
      imageFileInput.value = "";
      preview.classList.add("has-image");
      imagePreview.hidden = false;
      imagePreview.src = url;
    } else {
      preview.classList.remove("has-image");
      imagePreview.hidden = true;
      imagePreview.removeAttribute("src");
    }
  });

  imageFileInput.addEventListener("change", () => {
    const [file] = imageFileInput.files;
    if (!file) {
      preview.classList.remove("has-image");
      imagePreview.hidden = true;
      imagePreview.removeAttribute("src");
      return;
    }
    preview.classList.add("has-image");
    imagePreview.hidden = false;
    imageUrlInput.value = "";
    imagePreview.src = URL.createObjectURL(file);
  });

  imagePreview.addEventListener("error", () => {
    preview.classList.remove("has-image");
    imagePreview.hidden = true;
    imagePreview.removeAttribute("src");
  });

  syncText();
}

function setupRecruitmentForm() {
  const form = document.querySelector("#recruitment-form");
  const status = document.querySelector("#discord-status");
  const loginLink = document.querySelector("#discord-login-link");
  const output = document.querySelector("#recruitment-output");
  const steps = Array.from(document.querySelectorAll(".form-step"));
  const dots = Array.from(document.querySelectorAll("[data-step-dot]"));
  const previousButton = document.querySelector("#recruitment-prev");
  const nextButton = document.querySelector("#recruitment-next");
  const submitButton = document.querySelector("#recruitment-submit");
  if (!form || !status || !loginLink || !output || !steps.length) return;

  const productionOrigin = "https://station-interne-weazel-news.onrender.com";
  const apiOrigin = window.location.protocol === "file:" ? productionOrigin : "";

  let currentStep = 0;

  const getStepFields = (step = steps[currentStep]) =>
    Array.from(step.querySelectorAll("input, textarea, select"));

  const isStepComplete = (step = steps[currentStep]) =>
    getStepFields(step).every((field) => field.checkValidity());

  const updateActionState = () => {
    const complete = isStepComplete();
    nextButton.disabled = currentStep < steps.length - 1 && !complete;
    submitButton.disabled = currentStep === steps.length - 1 && !complete;
  };

  const showStep = (index) => {
    currentStep = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((step, stepIndex) => {
      step.classList.toggle("active", stepIndex === currentStep);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === currentStep);
    });
    previousButton.hidden = currentStep === 0;
    nextButton.hidden = currentStep === steps.length - 1;
    submitButton.hidden = currentStep !== steps.length - 1;
    updateActionState();
  };

  const validateCurrentStep = () => {
    const fields = getStepFields();
    return fields.every((field) => {
      if (field.checkValidity()) return true;
      field.reportValidity();
      return false;
    });
  };

  const loadDiscordUser = async () => {
    loginLink.href = `${apiOrigin}/api/discord/auth`;

    if (window.location.protocol === "file:") {
      status.textContent = "Tu as ouvert la page en fichier local. Clique sur le bouton Discord pour ouvrir la version en ligne et continuer.";
      loginLink.hidden = false;
      form.hidden = true;
      return;
    }

    try {
      const response = await fetch(`${apiOrigin}/api/discord/me`, { credentials: "same-origin" });
      const data = await response.json();
      if (!response.ok || !data.authenticated) throw new Error(data.error || "Connexion requise.");

      const label = data.discordTag || data.username || "compte Discord";
      status.textContent = `Connecte avec ${label}. Tu peux remplir le formulaire.`;
      loginLink.hidden = true;
      form.hidden = false;
      showStep(0);
    } catch (error) {
      status.textContent = "Connecte-toi avec Discord et verifie que tu es bien sur le serveur Weazel News avant de commencer.";
      loginLink.hidden = false;
      form.hidden = true;
    }
  };

  previousButton.addEventListener("click", () => {
    output.textContent = "";
    showStep(currentStep - 1);
  });

  nextButton.addEventListener("click", () => {
    output.textContent = "";
    if (validateCurrentStep()) showStep(currentStep + 1);
  });

  getStepFields(form).forEach((field) => {
    field.addEventListener("input", updateActionState);
    field.addEventListener("change", updateActionState);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    output.textContent = "";
    if (!validateCurrentStep()) return;

    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours...";

    const payload = Object.fromEntries(new FormData(form).entries());
    payload.rp_confirm = form.elements.rp_confirm.checked ? "Oui" : "Non";

    try {
      const response = await fetch(`${apiOrigin}/api/recruitment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible d'envoyer la candidature.");

      output.textContent = data.channelUrl
        ? `Candidature envoyee. Ton ticket est ouvert ici: ${data.channelUrl}`
        : "Candidature envoyee. Un ticket de recrutement vient d'etre cree sur Discord.";
      form.reset();
      showStep(0);
    } catch (error) {
      output.textContent = error.message;
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer la candidature";
    }
  });

  loadDiscordUser();
}

function setupPublicLoto() {
  const currentPrize = document.querySelector("#public-current-prize");
  const popup = document.querySelector("#loto-prize-popup");
  if (!currentPrize || !popup) return;

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value || "—";
  };
  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  };

  fetch("/api/loto", { cache: "no-store" })
    .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
    .then(({ ok, data }) => {
      if (!ok) throw new Error(data.error || "Grand Loto indisponible.");
      const prize = data.currentPrize || "Lot annonce prochainement";
      const lastPrize = data.lastPrize || data.currentPrize || "—";
      const winningNumber = data.winningNumber || data.lastWinningNumber || "—";
      setText("#public-current-prize", prize);
      setText("#popup-current-prize", prize);
      setText("#public-last-prize", lastPrize);
      setText("#public-winning-number", winningNumber);
      setText("#public-ticket-deadline", formatDate(data.ticketDeadline));
      setText("#public-draw-date", data.resultDate ? `Resultat le ${formatDate(data.resultDate)}` : "Resultat a venir");
      setText("#popup-current-date", data.ticketDeadline ? `Tickets disponibles jusqu'au ${formatDate(data.ticketDeadline)}.` : "Les tickets seront annonces par Weazel News.");
      setText("#public-winning-note", data.published ? "Resultat officiel publie par Weazel News." : "Le prochain resultat sera affiche apres publication par Weazel News.");
    })
    .catch((error) => {
      setText("#public-current-prize", "Grand Loto indisponible");
      setText("#popup-current-prize", "Grand Loto indisponible");
      setText("#popup-current-date", error.message);
    })
    .finally(() => {
      if (typeof popup.showModal === "function" && !sessionStorage.getItem("weazel-loto-popup-seen")) {
        popup.showModal();
        sessionStorage.setItem("weazel-loto-popup-seen", "1");
      }
    });

  document.querySelector("#close-loto-popup")?.addEventListener("click", () => popup.close());
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
drawParticles();
setupReveal();
setupTilt();
setupCounters();
setupPointer();
duplicateTicker();
setupFxButton();
setupDropdown();
setupMobileMenu();
setupAdBuilder();
setupRecruitmentForm();
setupPublicLoto();
