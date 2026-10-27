"use strict";

const motionPreference = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);

const mobileBreakpoint = window.matchMedia("(max-width: 820px)");

/* ==================================================
   NAVEGACIÓN MÓVIL
================================================== */

const navbar = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.setAttribute("aria-controls", "mobileMenu");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-label", "Abrir menú");

  function setMenu(open, restoreFocus = false) {
    mobileMenu.classList.toggle("open", open);
    hamburger.classList.toggle("open", open);

    hamburger.setAttribute("aria-expanded", String(open));
    hamburger.setAttribute(
      "aria-label",
      open ? "Cerrar menú" : "Abrir menú"
    );

    if (restoreFocus) hamburger.focus();
  }

  hamburger.addEventListener("click", () => {
    const open = hamburger.getAttribute("aria-expanded") === "true";
    setMenu(!open);
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenu(false);

      // Lleva también el foco al destino para usuarios de teclado.
      const target = document.querySelector(link.getAttribute("href"));

      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });

        target.addEventListener(
          "blur",
          () => target.removeAttribute("tabindex"),
          { once: true }
        );
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      mobileMenu.classList.contains("open")
    ) {
      setMenu(false, true);
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !mobileMenu.contains(event.target) &&
      !hamburger.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  // Es un menú desplegable, no un modal:
  // el usuario puede salir de él con Tab.
  document.addEventListener("focusin", (event) => {
    if (
      !mobileMenu.contains(event.target) &&
      !hamburger.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  mobileBreakpoint.addEventListener("change", () => {
    setMenu(false);
  });
}

/* ==================================================
   ESTADO DEL NAVBAR Y SECCIÓN ACTIVA
================================================== */

const sections = [...document.querySelectorAll("section[id]")];
const navLinks = [...document.querySelectorAll(".nav-links a")];

let scrollScheduled = false;

function updateNavigation() {
  navbar?.classList.toggle("scrolled", window.scrollY > 24);

  const offset = (navbar?.offsetHeight || 80) + 100;
  let currentId = sections[0]?.id;

  for (const section of sections) {
    if (section.getBoundingClientRect().top <= offset) {
      currentId = section.id;
    }
  }

  for (const link of navLinks) {
    const active = link.getAttribute("href") === `#${currentId}`;

    link.classList.toggle("active", active);

    if (active) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  }

  scrollScheduled = false;
}

function scheduleNavigationUpdate() {
  if (scrollScheduled) return;

  scrollScheduled = true;
  requestAnimationFrame(updateNavigation);
}

window.addEventListener("scroll", scheduleNavigationUpdate, {
  passive: true
});

window.addEventListener("resize", scheduleNavigationUpdate, {
  passive: true
});

updateNavigation();

/* ==================================================
   ANIMACIONES DE ENTRADA
   Web Animations API + IntersectionObserver
================================================== */

const runningAnimations = new Set();

function animateEntrance(element, delay = 0) {
  if (motionPreference.matches || !element.animate) return;

  const isCard = element.matches(
    ".skill-category, .project-item, .direct-contact-card"
  );
  const siblingIndex = [...(element.parentElement?.children || [])]
    .indexOf(element);
  const direction = siblingIndex % 2 === 0 ? -1 : 1;
  const startTransform = isCard
    ? `translate(${direction * 18}px, 38px) scale(.94)`
    : "translateY(22px)";

  const animation = element.animate(
    [
      {
        opacity: 0,
        transform: startTransform
      },
      {
        opacity: 1,
        transform: isCard
          ? "translate(0, -5px) scale(1.015)"
          : "translateY(-2px)",
        offset: .78
      },
      {
        opacity: 1,
        transform: "translate(0, 0) scale(1)"
      }
    ],
    {
      duration: isCard ? 850 : 700,
      delay,
      easing: "cubic-bezier(.22, 1, .36, 1)",
      fill: "backwards"
    }
  );

  runningAnimations.add(animation);

  const cleanup = () => runningAnimations.delete(animation);

  animation.addEventListener("finish", cleanup, { once: true });
  animation.addEventListener("cancel", cleanup, { once: true });
}

document
  .querySelectorAll(
    ".hero-greeting, .hero-name, .hero-title, " +
    ".hero-description, .hero-btns, .hero-meta, .hero-visual"
  )
  .forEach((element, index) => {
    animateEntrance(element, index * 65);
  });

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateEntrance(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px -25px 0px"
    }
  );

  document.querySelectorAll(".reveal").forEach((element) => {
    revealObserver.observe(element);
  });
}

motionPreference.addEventListener("change", (event) => {
  if (!event.matches) return;

  runningAnimations.forEach((animation) => animation.cancel());
  runningAnimations.clear();
});

/* ==================================================
   VOLVER ARRIBA
================================================== */

document.querySelector(".back-top")?.addEventListener("click", () => {
  const heading = document.getElementById("hero-heading");

  window.scrollTo({
    top: 0,
    behavior: motionPreference.matches ? "instant" : "smooth"
  });

  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });

    heading.addEventListener(
      "blur",
      () => heading.removeAttribute("tabindex"),
      { once: true }
    );
  }
});

/* ==================================================
   DETALLES VISUALES
================================================== */

const starfield = document.createElement("div");
starfield.className = "site-starfield";
starfield.setAttribute("aria-hidden", "true");
document.body.appendChild(starfield);

const starColors = ["#c0a4ff", "#7ff5d2", "#ff9da9", "#ffe39a", "#ffffff"];
const starSymbols = ["\u2726", "\u2727", "\u00b7", "\u002b"];

for (let index = 0; index < 48; index += 1) {
  const star = document.createElement("span");
  star.className = "site-star";
  star.textContent = starSymbols[index % starSymbols.length];
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  star.style.setProperty("--star-color", starColors[index % starColors.length]);
  star.style.setProperty("--star-size", `${6 + Math.random() * 10}px`);
  star.style.setProperty("--star-duration", `${3 + Math.random() * 4}s`);
  star.style.setProperty("--star-delay", `${-Math.random() * 7}s`);
  starfield.appendChild(star);
}

if (!motionPreference.matches) {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  document.querySelectorAll(
    ".skill-category, .project-item, .direct-contact-card:not(.direct-contact-card--static)"
  ).forEach((card) => {
    let frame = 0;
    let pointerX = 0;
    let pointerY = 0;

    card.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || motionPreference.matches) return;
      const bounds = card.getBoundingClientRect();
      pointerX = event.clientX - bounds.left;
      pointerY = event.clientY - bounds.top;
      if (frame) return;

      frame = requestAnimationFrame(() => {
        card.style.setProperty("--pointer-x", `${pointerX}px`);
        card.style.setProperty("--pointer-y", `${pointerY}px`);
        frame = 0;
      });
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty("--pointer-x");
      card.style.removeProperty("--pointer-y");
    });
  });

  let lastParticleBurst = 0;
  document.addEventListener("click", (event) => {
    if (motionPreference.matches || event.detail === 0 || !(event.target instanceof Element)) return;
    const trigger = event.target.closest(
      ".btn-primary, .btn-secondary, .btn-sm, .social-btn"
    );
    if (!trigger || performance.now() - lastParticleBurst < 350) return;
    lastParticleBurst = performance.now();

    const colors = ["#c0a4ff", "#7ff5d2", "#ff9da9", "#ffe39a"];
    for (let index = 0; index < 10; index += 1) {
      const particle = document.createElement("span");
      const angle = (Math.PI * 2 * index) / 10;
      const distance = 35 + Math.random() * 40;
      particle.className = "click-particle";
      particle.setAttribute("aria-hidden", "true");
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.setProperty("--particle-color", colors[index % colors.length]);
      document.body.appendChild(particle);

      const animation = particle.animate(
        [
          { opacity: 1, transform: "translate(-50%, -50%) scale(1)" },
          {
            opacity: 0,
            transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${index * 55}deg) scale(0)`
          }
        ],
        { duration: 650, easing: "cubic-bezier(.1,.7,.3,1)" }
      );
      animation.addEventListener("finish", () => particle.remove(), { once: true });
    }
  });
}
