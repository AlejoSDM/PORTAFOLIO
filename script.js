// ===== NAV SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, {passive:true});

// ===== HAMBURGER =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMobile);
});

// ===== SCROLL REVEAL =====
const reveals = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, {threshold:0.1});
reveals.forEach(el => revealObs.observe(el));

// ===== ACTIVE NAV =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 130) cur = s.id;
  });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
}, {passive:true});

// ===== INTERACTIVE PARTICLE CANVAS =====
(function() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, mouse = {x:-9999, y:-9999};
  const COUNT = 90;
  const particles = [];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  window.addEventListener('resize', resize, {passive:true});
  resize();

  document.getElementById('hero').addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, {passive:true});

  document.getElementById('hero').addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.ox = this.x;
      this.oy = this.y;
      this.vx = (Math.random() - .5) * .4;
      this.vy = (Math.random() - .5) * .4;
      this.r = Math.random() * 1.5 + .5;
      this.alpha = Math.random() * .5 + .2;
    }
    update() {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const radius = 140;
      if (dist < radius) {
        const force = (radius - dist) / radius;
        this.vx += dx / dist * force * .6;
        this.vy += dy / dist * force * .6;
      }
      this.vx += (this.ox - this.x) * .004;
      this.vy += (this.oy - this.y) * .004;
      this.vx *= .94;
      this.vy *= .94;
      this.x += this.vx;
      this.y += this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(108,99,255,${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  function drawLines() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          const a = (1 - d / maxDist) * .18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(108,99,255,${a})`;
          ctx.lineWidth = .8;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(loop);
  }
  loop();
})();

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  let valid = true;
  const fields = [
    {id:'fname', grp:'grp-name', rx: v => v.trim().length > 0},
    {id:'femail', grp:'grp-email', rx: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())},
    {id:'fmsg', grp:'grp-msg', rx: v => v.trim().length > 0}
  ];

  fields.forEach(f => {
    const el = document.getElementById(f.id);
    const grp = document.getElementById(f.grp);
    grp.classList.remove('error');
    if (!f.rx(el.value)) {
      grp.classList.add('error');
      valid = false;
    }
  });

  if (valid) {
    const btn = this.querySelector('.btn-submit');
    btn.textContent = 'Enviando…';
    btn.disabled = true;
    setTimeout(() => {
      this.reset();
      btn.textContent = 'Enviar mensaje';
      btn.disabled = false;
      const suc = document.getElementById('formSuccess');
      suc.style.display = 'block';
      setTimeout(() => suc.style.display = 'none', 5000);
    }, 900);
  }
});
