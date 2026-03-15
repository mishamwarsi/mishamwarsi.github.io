/* ══════════════════════════════════════════════════
   SAPulse — SCRIPT
   Interactions, animations, filtering
══════════════════════════════════════════════════ */
'use strict';

/* ─── CUSTOM CURSOR ─── */
const ring = document.getElementById('cursor-ring');
const core = document.getElementById('cursor-core');
let mx = 0, my = 0, cx = 0, cy = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  core.style.left = mx + 'px';
  core.style.top  = my + 'px';
});
(function animCursor() {
  cx += (mx - cx) * 0.1;
  cy += (my - cy) * 0.1;
  ring.style.left = cx + 'px';
  ring.style.top  = cy + 'px';
  requestAnimationFrame(animCursor);
})();

/* ─── HEADER SCROLL ─── */
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 30);
}, { passive: true });

/* ─── MOBILE BURGER ─── */
const burger  = document.getElementById('burger');
const mobNav  = document.getElementById('mob-nav');

burger.addEventListener('click', () => {
  const open = mobNav.classList.toggle('open');
  burger.setAttribute('aria-expanded', String(open));
  mobNav.setAttribute('aria-hidden', String(!open));
  const [s1, , s3] = burger.querySelectorAll('span');
  if (open) {
    burger.querySelectorAll('span')[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    burger.querySelectorAll('span')[1].style.opacity = '0';
    burger.querySelectorAll('span')[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
mobNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobNav.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ─── SCROLL REVEAL ─── */
const revEls = document.querySelectorAll('.reveal-up, .reveal-right');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revEls.forEach(el => revObs.observe(el));

// Hero fires on load
window.addEventListener('load', () => {
  document.querySelectorAll('.hero .reveal-up, .hero .reveal-right').forEach(el => {
    setTimeout(() => el.classList.add('in'), 80);
  });
});

/* ─── MARQUEE DUPLICATE ─── */
const mTrack = document.getElementById('marquee-track');
if (mTrack) {
  mTrack.innerHTML += mTrack.innerHTML; // seamless loop
}

/* ─── COUNTER ANIMATION ─── */
function animCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const dur = 1800, start = performance.now();
  const tick = now => {
    const p = Math.min((now - start) / dur, 1);
    const ease = 1 - Math.pow(2, -10 * p);
    el.textContent = Math.floor(ease * target);
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target >= 1000 ? target.toLocaleString() + '+' : target + (target > 20 ? '+' : '');
  };
  requestAnimationFrame(tick);
}

const cntObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animCount(e.target); cntObs.unobserve(e.target); }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.hstat-n, .avs-n').forEach(el => cntObs.observe(el));

/* ─── FILTER + SEARCH ─── */
const pills    = document.querySelectorAll('.pill');
const artCards = document.querySelectorAll('.art-card');
const searchEl = document.getElementById('search');
const noRes    = document.getElementById('no-res');

let activeF = 'all';
let query   = '';

function filter() {
  let visible = 0;
  artCards.forEach(card => {
    const cf = card.dataset.f;
    const title = card.querySelector('h3').textContent.toLowerCase();
    const desc  = card.querySelector('p').textContent.toLowerCase();
    const okF = activeF === 'all' || cf === activeF;
    const okQ = !query || title.includes(query) || desc.includes(query);
    const show = okF && okQ;
    card.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  noRes.classList.toggle('hidden', visible > 0);
}

pills.forEach(p => p.addEventListener('click', () => {
  pills.forEach(x => x.classList.remove('active'));
  p.classList.add('active');
  activeF = p.dataset.f;
  filter();
}));

searchEl && searchEl.addEventListener('input', () => {
  query = searchEl.value.trim().toLowerCase();
  filter();
});

/* ─── LOAD MORE ─── */
const loadBtn = document.getElementById('load-more');
const grid    = document.getElementById('articles-grid');
let loaded = 0;

const morePosts = [
  {
    f: 'learning', top: 'art-top--learning', emoji: '🎯', cat: 'art-cat--learning', catLabel: 'Learning',
    chip: 'feat-chip--learning',
    title: 'SAP C_TS410 Certification: Study Strategy That Actually Works',
    desc: 'Exam breakdown, mock test resources, and a 6-week prep plan from someone who passed on the first attempt.',
    tags: ['C_TS410', 'Exam'], date: 'Oct 28', time: '6 min'
  },
  {
    f: 'integration', top: 'art-top--integration', emoji: '🌐', cat: 'art-cat--integration', catLabel: 'Integration',
    title: 'SAP OData Services: Creating Custom Services with SEGW',
    desc: 'Building OData services using the Gateway Service Builder — entity types, associations, and CRUD methods.',
    tags: ['OData', 'SEGW'], date: 'Oct 15', time: '9 min'
  },
  {
    f: 'abap', top: 'art-top--abap', emoji: '🧩', cat: 'art-cat--abap', catLabel: 'ABAP',
    title: 'ABAP Unit Testing: Writing Testable Code from Day One',
    desc: 'Test-driven development in ABAP — mock objects, test doubles, and the ABAP Unit framework.',
    tags: ['Unit Test', 'TDD'], date: 'Oct 3', time: '8 min'
  }
];

loadBtn && loadBtn.addEventListener('click', () => {
  if (loaded >= morePosts.length) {
    loadBtn.textContent = 'All caught up ✓';
    loadBtn.disabled = true;
    return;
  }
  const post = morePosts[loaded++];
  const art = document.createElement('article');
  art.className = 'art-card reveal-up';
  art.dataset.f = post.f;
  art.innerHTML = `
    <div class="art-top ${post.top}">
      <span class="art-emoji">${post.emoji}</span>
      <span class="art-cat ${post.cat}">${post.catLabel}</span>
    </div>
    <div class="art-body">
      <h3>${post.title}</h3>
      <p>${post.desc}</p>
      <div class="art-foot">
        <div class="art-tags">${post.tags.map(t => `<span>${t}</span>`).join('')}</div>
        <div class="art-info"><span>${post.date}</span><span>·</span><span>${post.time}</span></div>
      </div>
    </div>
  `;
  grid.appendChild(art);
  setTimeout(() => art.classList.add('in'), 60);
  filter();
  if (loaded >= morePosts.length) {
    loadBtn.textContent = 'All caught up ✓';
    loadBtn.disabled = true;
  }
});

/* ─── NEWSLETTER ─── */
function handleSub(e) {
  e.preventDefault();
  const form    = document.getElementById('sub-form');
  const confirm = document.getElementById('sub-confirm');
  const email   = document.getElementById('sub-email');
  if (!email.value) return;
  form.classList.add('hidden');
  confirm.classList.remove('hidden');
}
window.handleSub = handleSub;

/* ─── SMOOTH ANCHORS ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

/* ─── PANEL CARD TILT ─── */
document.querySelectorAll('.panel-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 4}deg) translateY(-2px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ─── FEATURED CARD TILT ─── */
const featMain = document.querySelector('.feat-main');
if (featMain) {
  featMain.addEventListener('mousemove', e => {
    const r = featMain.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width  / 2) / r.width;
    const dy = (e.clientY - r.top  - r.height / 2) / r.height;
    featMain.style.transform = `perspective(900px) rotateY(${dx * 3}deg) rotateX(${-dy * 2}deg) translateY(-4px)`;
  });
  featMain.addEventListener('mouseleave', () => { featMain.style.transform = ''; });
}

/* ─── GLOW ORBS FOLLOW MOUSE (subtle) ─── */
const orb1 = document.querySelector('.orb-1');
let orbT;
document.addEventListener('mousemove', e => {
  clearTimeout(orbT);
  orbT = setTimeout(() => {
    if (orb1) {
      const tx = (e.clientX / window.innerWidth  - 0.5) * 80;
      const ty = (e.clientY / window.innerHeight - 0.5) * 60;
      orb1.style.transform = `translate(${tx}px, ${ty}px)`;
    }
  }, 30);
}, { passive: true });

console.log('%c◈ SAPulse', 'font-size:1.5rem;font-family:serif;color:#0070ff;font-weight:bold;');
console.log('%cWelcome, SAP explorer. Happy reading.', 'color:#8896b0;');
