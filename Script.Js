/* =======================================================
   Misham Warsi — assets/script.js
   Hash-based SPA router for GitHub Pages
   Markdown loader + page renderers
   ======================================================= */

// ── POSTS MANIFEST ──────────────────────────────────────
// TO ADD A NEW ARTICLE:
//   1. Upload your new .md file to the /posts folder on GitHub
//   2. Copy one entry below and fill in your article details
//   3. Commit — done!
const POSTS_MANIFEST = [
  {
    id: 'sap-s4hana-migration-guide-2025',
    title: 'SAP S/4HANA Migration: A Complete Step-by-Step Guide for 2025',
    excerpt: 'Everything you need to know about planning, executing, and validating your SAP S/4HANA migration. Covers Greenfield, Brownfield, and Selective Data Transition approaches.',
    category: 'SAP', date: '2025-03-10', dateLabel: 'March 10, 2025',
    read: '12 min read', icon: '⚙️', thumb: 'thumb-blue',
    tags: ['S/4HANA', 'Migration', 'SAP', 'ERP'],
  },
  {
    id: 'understanding-sap-btp',
    title: 'Understanding SAP BTP: Business Technology Platform Explained',
    excerpt: "SAP BTP is the foundation of SAP's cloud strategy. Learn about its key services, use cases, and how it connects your SAP and non-SAP landscape.",
    category: 'Tech', date: '2025-02-28', dateLabel: 'February 28, 2025',
    read: '8 min read', icon: '☁️', thumb: 'thumb-navy',
    tags: ['SAP BTP', 'Cloud', 'Integration', 'Technology'],
  },
  {
    id: 'sap-abap-beginners-roadmap',
    title: "Getting Started with SAP ABAP Programming — A Beginner's Roadmap",
    excerpt: 'ABAP is the backbone of SAP customization. This guide walks you through the fundamentals, syntax, and your first real ABAP program.',
    category: 'Tutorial', date: '2025-02-14', dateLabel: 'February 14, 2025',
    read: '10 min read', icon: '🎓', thumb: 'thumb-orange',
    tags: ['ABAP', 'Programming', 'Tutorial', 'SAP Dev'],
  },
  {
    id: 'sap-fiori-vs-sap-gui',
    title: 'SAP Fiori vs. SAP GUI: Which Interface Is Right for You?',
    excerpt: "Comparing SAP's traditional GUI with the modern Fiori interface. Learn the differences, pros, cons, and when to use each.",
    category: 'SAP', date: '2025-01-30', dateLabel: 'January 30, 2025',
    read: '6 min read', icon: '📊', thumb: 'thumb-navy',
    tags: ['SAP Fiori', 'SAP GUI', 'UX', 'Interface'],
  },
  {
    id: 'cybersecurity-sap-environments',
    title: 'Cybersecurity Best Practices for SAP Environments',
    excerpt: 'Protecting your SAP landscape from modern threats with role-based access, encryption, network security, and continuous monitoring.',
    category: 'Tech', date: '2025-03-01', dateLabel: 'March 1, 2025',
    read: '7 min read', icon: '🔐', thumb: 'thumb-green',
    tags: ['Security', 'SAP', 'Cybersecurity', 'GRC'],
  },
  {
    id: 'how-to-become-sap-consultant-2025',
    title: 'How to Become a Certified SAP Consultant in 2025',
    excerpt: 'A practical roadmap to building an SAP career — from choosing your module to earning certification and landing your first role.',
    category: 'Career', date: '2025-02-20', dateLabel: 'February 20, 2025',
    read: '9 min read', icon: '🚀', thumb: 'thumb-purple',
    tags: ['Career', 'SAP Certification', 'Consulting', 'Jobs'],
  },
  {
    id: 'sap-hana-studio-setup-first-queries',
    title: 'SAP HANA Studio: Setup, Configuration & First Queries',
    excerpt: 'A hands-on guide to installing SAP HANA Studio, connecting to your HANA instance, and writing your first SQL and Calculation Views.',
    category: 'Tutorial', date: '2025-02-05', dateLabel: 'February 5, 2025',
    read: '11 min read', icon: '⚡', thumb: 'thumb-teal',
    tags: ['SAP HANA', 'HANA Studio', 'SQL', 'Tutorial'],
  },
];

// Sort newest-first
const posts = [...POSTS_MANIFEST].sort((a, b) => b.date.localeCompare(a.date));
const CAT_COLORS = { SAP: '#1565c0', Tech: '#2e7d32', Tutorial: '#e65100', Career: '#7b1fa2' };

// ── MARKDOWN PARSER ─────────────────────────────────────
const mdCache = {};

async function loadPost(id) {
  if (mdCache[id]) return mdCache[id];
  try {
    // Support both root-relative and relative paths for GitHub Pages subdirectory
    const base = document.querySelector('base')?.href || window.location.href.replace(/#.*$/, '');
    const url = new URL(`posts/${id}.md`, base).href;
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    mdCache[id] = parseMd(text);
    return mdCache[id];
  } catch { return null; }
}

function parseMd(md) {
  // Strip YAML frontmatter
  md = md.replace(/^---[\s\S]*?---\n?/, '');
  const lines = md.split('\n');
  let html = '', i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Fenced code block
    if (line.startsWith('```')) {
      let code = ''; i++;
      while (i < lines.length && !lines[i].startsWith('```')) { code += esc(lines[i]) + '\n'; i++; }
      html += `<pre><code>${code.trimEnd()}</code></pre>\n`; i++; continue;
    }
    if (line.startsWith('### ')) { html += `<h3>${inline(line.slice(4))}</h3>\n`; i++; continue; }
    if (line.startsWith('## '))  { html += `<h2>${inline(line.slice(3))}</h2>\n`; i++; continue; }
    if (line.startsWith('# '))   { html += `<h1>${inline(line.slice(2))}</h1>\n`; i++; continue; }
    if (line.startsWith('> ')) {
      let bq = '';
      while (i < lines.length && lines[i].startsWith('> ')) { bq += inline(lines[i].slice(2)) + ' '; i++; }
      html += `<blockquote><p>${bq.trim()}</p></blockquote>\n`; continue;
    }
    if (/^[-*] /.test(line)) {
      html += '<ul>\n';
      while (i < lines.length && /^[-*] /.test(lines[i])) { html += `<li>${inline(lines[i].slice(2))}</li>\n`; i++; }
      html += '</ul>\n'; continue;
    }
    if (/^\d+\. /.test(line)) {
      html += '<ol>\n';
      while (i < lines.length && /^\d+\. /.test(lines[i])) { html += `<li>${inline(lines[i].replace(/^\d+\. /,''))}</li>\n`; i++; }
      html += '</ol>\n'; continue;
    }
    if (line.trim() === '') { i++; continue; }
    let para = '';
    while (i < lines.length && lines[i].trim() !== '' && !/^[#>`\-*]/.test(lines[i]) && !/^\d+\. /.test(lines[i]) && !lines[i].startsWith('```')) {
      para += lines[i] + ' '; i++;
    }
    if (para.trim()) html += `<p>${inline(para.trim())}</p>\n`;
  }
  return html;
}

function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function inline(s) {
  return esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
}

// ── HASH ROUTER ─────────────────────────────────────────
function getRoute() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart] = hash.split('?');
  const params = new URLSearchParams(queryPart || '');

  if (pathPart === '/' || pathPart === '') return { page: 'home' };
  if (pathPart === '/blog') return { page: 'blog', params };
  if (pathPart === '/about') return { page: 'about' };
  const m = pathPart.match(/^\/blog\/(.+)$/);
  if (m) return { page: 'post', id: m[1] };
  return { page: '404' };
}

function navigate(hash) {
  window.location.hash = hash;
  document.getElementById('nav-links')?.classList.remove('open');
}

window.addEventListener('hashchange', render);

// ── NAV HIGHLIGHT ────────────────────────────────────────
function updateNav(page) {
  document.querySelectorAll('.nav-links a[data-route]').forEach(a => {
    a.classList.toggle('active', a.dataset.route === page);
  });
}

// ── RENDER ───────────────────────────────────────────────
async function render() {
  const route = getRoute();
  const app = document.getElementById('app');
  updateNav(route.page === 'post' ? 'blog' : route.page);
  window.scrollTo(0, 0);

  switch (route.page) {
    case 'home':  renderHome(app); break;
    case 'blog':  renderBlog(app, route.params); break;
    case 'post':  await renderPost(app, route.id); break;
    case 'about': renderAbout(app); break;
    default:      render404(app);
  }
}

// ── HELPERS ──────────────────────────────────────────────
const footerFull    = () => document.getElementById('tpl-footer-full').innerHTML;
const footerMinimal = () => document.getElementById('tpl-footer-minimal').innerHTML;

function blogCardHtml(p) {
  const color = CAT_COLORS[p.category] || '#555';
  return `
    <a class="blog-card animate-in" href="#/blog/${p.id}">
      <div class="thumb ${p.thumb}" style="position:relative;">
        <span style="font-size:3.5rem;opacity:0.18;">${p.icon}</span>
        <span style="position:absolute;top:12px;left:12px;background:${color};color:white;font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 10px;border-radius:20px;">${p.category}</span>
      </div>
      <div class="body">
        <div class="card-cat cat-${p.category}">${p.category}</div>
        <h3>${p.title}</h3>
        <p>${p.excerpt}</p>
        <div class="card-footer">
          <span class="card-footer-date">${p.dateLabel}</span>
          <span class="card-footer-read">${p.read} →</span>
        </div>
      </div>
    </a>`;
}

// ── HOME PAGE ────────────────────────────────────────────
function renderHome(app) {
  document.title = 'Misham Warsi — SAP Learning & Tech Insights';
  const featured  = posts[0];
  const sideCards = posts.slice(1, 4);
  const recent    = posts.slice(0, 3);

  app.innerHTML = `
    <div class="hero animate-in">
      <div class="hero-tag">📘 SAP Learning · Tech Insights · Tutorials by Misham Warsi</div>
      <h1>Master <em>SAP</em> &amp;<br>Modern Technology</h1>
      <p>In-depth articles, step-by-step tutorials, and industry insights for SAP professionals and tech enthusiasts.</p>
      <div class="hero-btns">
        <a class="btn-primary"  href="#/blog">Read the Blog</a>
        <a class="btn-outline"  href="#/about">About the Author</a>
      </div>
      <div class="hero-stats">
        <div class="stat-item"><div class="stat-num">24+</div><div class="stat-label">Articles Published</div></div>
        <div class="stat-item"><div class="stat-num">6</div><div class="stat-label">SAP Modules Covered</div></div>
        <div class="stat-item"><div class="stat-num">5K+</div><div class="stat-label">Monthly Readers</div></div>
      </div>
    </div>

    <div class="categories-strip">
      <div class="categories-inner">
        <span class="cat-label">Explore:</span>
        <a class="cat-btn" href="#/blog?cat=SAP">SAP Basics</a>
        <a class="cat-btn" href="#/blog?cat=SAP">SAP HANA</a>
        <a class="cat-btn" href="#/blog?cat=SAP">SAP Fiori</a>
        <a class="cat-btn" href="#/blog?cat=Tech">Cloud &amp; DevOps</a>
        <a class="cat-btn" href="#/blog?cat=Tutorial">Tutorials</a>
        <a class="cat-btn" href="#/blog?cat=Career">Career Guide</a>
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Featured <span>Articles</span></h2>
        <a class="section-link" href="#/blog">View All Posts →</a>
      </div>
      <div class="featured-grid">
        <a class="card-featured animate-in" href="#/blog/${featured.id}">
          <div class="thumb ${featured.thumb}">
            <span class="thumb-icon">${featured.icon}</span>
            <span class="thumb-cat">${featured.category}</span>
          </div>
          <div class="body">
            <h2>${featured.title}</h2>
            <p>${featured.excerpt}</p>
            <div class="card-meta">
              <span class="meta-author">● By Misham Warsi</span>
              <span class="meta-date">${featured.dateLabel}</span>
              <span class="meta-read">${featured.read}</span>
            </div>
          </div>
        </a>
        <div class="side-cards">
          ${sideCards.map(p => `
            <a class="card-small animate-in" href="#/blog/${p.id}">
              <div class="card-small-icon">${p.icon}</div>
              <div class="card-small-body">
                <div class="card-small-cat">${p.category}</div>
                <h3>${p.title}</h3>
                <div class="card-small-meta">${p.dateLabel} · ${p.read}</div>
              </div>
            </a>`).join('')}
        </div>
      </div>
    </div>

    <div style="background:var(--gray-100);border-top:1px solid var(--gray-200);padding:8px 0;">
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Latest <span>Posts</span></h2>
          <a class="section-link" href="#/blog">Browse All →</a>
        </div>
        <div class="blog-grid" style="padding:0 0 16px;">${recent.map(blogCardHtml).join('')}</div>
      </div>
    </div>

    ${footerFull()}`;
}

// ── BLOG LISTING ─────────────────────────────────────────
function renderBlog(app, params) {
  document.title = 'Blog — Misham Warsi';
  const initCat = params?.get('cat') || 'All';

  app.innerHTML = `
    <div class="blog-header">
      <h1>All Articles</h1>
      <p>Explore SAP tutorials, tech deep-dives, and career guides</p>
    </div>
    <div class="blog-toolbar">
      <div class="search-wrap">
        <span class="search-icon">🔍</span>
        <input type="text" id="search-input" placeholder="Search articles…">
      </div>
      <div class="filter-wrap">
        ${['All','SAP','Tech','Tutorial','Career'].map(cat =>
          `<button class="filter-btn${initCat===cat?' active':''}" data-cat="${cat}">${cat}</button>`
        ).join('')}
      </div>
    </div>
    <div class="blog-grid" id="blog-grid"></div>
    ${footerMinimal()}`;

  let currentCat = initCat, currentQ = '';

  function applyFilters() {
    const grid = document.getElementById('blog-grid');
    const q = currentQ.toLowerCase();
    const filtered = posts.filter(p => {
      const catOk = currentCat === 'All' || p.category === currentCat;
      const searchOk = !q || p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
      return catOk && searchOk;
    });
    grid.innerHTML = filtered.length
      ? filtered.map(blogCardHtml).join('')
      : '<div class="no-results"><h3>No articles found</h3><p>Try a different search or category.</p></div>';
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentCat = btn.dataset.cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === currentCat));
      // Update hash without full re-render
      const newHash = currentCat === 'All' ? '#/blog' : `#/blog?cat=${currentCat}`;
      history.replaceState(null, '', newHash);
      applyFilters();
    });
  });

  document.getElementById('search-input').addEventListener('input', e => { currentQ = e.target.value; applyFilters(); });
  applyFilters();
}

// ── POST PAGE ────────────────────────────────────────────
async function renderPost(app, id) {
  const meta = posts.find(p => p.id === id);
  if (!meta) { render404(app); return; }
  document.title = `${meta.title} — Misham Warsi`;

  app.innerHTML = '<div class="loading">Loading article…</div>';

  const html = await loadPost(id);
  if (!html) { render404(app); return; }

  const idx  = posts.indexOf(meta);
  const prev = posts[idx + 1];   // older
  const next = posts[idx - 1];   // newer

  app.innerHTML = `
    <div class="post-hero animate-in">
      <div class="post-hero-inner">
        <div class="post-breadcrumb">
          <a href="#/">Home</a><span class="sep">›</span>
          <a href="#/blog">Blog</a><span class="sep">›</span>
          <a href="#/blog?cat=${meta.category}">${meta.category}</a>
        </div>
        <div class="post-cat-badge">${meta.category}</div>
        <h1>${meta.title}</h1>
        <div class="post-hero-meta">
          <div class="post-author">
            <div class="post-avatar">MW</div>
            <div>
              <div class="post-author-name">Misham Warsi</div>
              <div class="post-author-role">SAP Consultant &amp; Tech Writer</div>
            </div>
          </div>
          <span class="post-meta-item">📅 ${meta.dateLabel}</span>
          <span class="post-meta-item">⏱ ${meta.read}</span>
        </div>
      </div>
    </div>

    <div class="post-body-wrap animate-in">
      <div class="post-content">${html}</div>
      <div class="post-tag-row">${meta.tags.map(t => `<span class="tag"># ${t}</span>`).join('')}</div>
      <div class="post-nav">
        ${prev ? `<a class="post-nav-btn"       href="#/blog/${prev.id}"><div class="nav-dir">← Previous</div><div class="nav-title">${prev.title}</div></a>` : '<div></div>'}
        ${next ? `<a class="post-nav-btn right" href="#/blog/${next.id}"><div class="nav-dir">Next →</div><div class="nav-title">${next.title}</div></a>` : '<div></div>'}
      </div>
    </div>

    ${footerMinimal()}`;
}

// ── ABOUT PAGE ───────────────────────────────────────────
function renderAbout(app) {
  document.title = 'About — Misham Warsi';
  app.innerHTML = `
    <div class="about-hero animate-in">
      <div class="about-avatar">MW</div>
      <h1>About Me</h1>
      <p>SAP Consultant · Tech Writer · Lifelong Learner</p>
      <div class="about-badges">
        <span class="about-badge">SAP Certified</span>
        <span class="about-badge">S/4HANA Specialist</span>
        <span class="about-badge">ABAP Developer</span>
        <span class="about-badge">BTP Enthusiast</span>
      </div>
    </div>
    <div class="about-body animate-in">
      <div class="about-grid">
        <div class="about-section">
          <h2>My Story</h2>
          <p>Hello! I'm an SAP Consultant with over 6 years of hands-on experience implementing and supporting SAP solutions across Finance, Logistics, and HR modules.</p>
          <p>I started this blog to document my own learning journey and to share practical, real-world knowledge that I couldn't find in official documentation.</p>
          <p>When I'm not writing about SAP, I'm exploring the latest trends in cloud computing, DevOps, and enterprise technology.</p>
        </div>
        <div class="about-section">
          <h2>Skills &amp; Expertise</h2>
          <ul class="skill-list">
            <li><span class="skill-dot"></span> SAP S/4HANA (Finance &amp; Logistics)</li>
            <li><span class="skill-dot"></span> SAP HANA &amp; HANA Studio</li>
            <li><span class="skill-dot"></span> ABAP Programming &amp; Debugging</li>
            <li><span class="skill-dot"></span> SAP Fiori &amp; UI5 Development</li>
            <li><span class="skill-dot"></span> SAP BTP (Business Technology Platform)</li>
            <li><span class="skill-dot"></span> SAP Integration Suite &amp; APIs</li>
            <li><span class="skill-dot"></span> Cloud Architecture &amp; DevOps</li>
            <li><span class="skill-dot"></span> Python &amp; Data Analytics</li>
          </ul>
        </div>
      </div>
      <div class="about-section" style="margin-bottom:48px;">
        <h2>Certifications</h2>
        <div class="cert-card"><span class="cert-icon">🏅</span><div><div class="cert-name">SAP Certified Application Associate – SAP S/4HANA</div><div class="cert-body">SAP Global Certification · 2023</div></div></div>
        <div class="cert-card"><span class="cert-icon">🏅</span><div><div class="cert-name">SAP Certified Development Associate – ABAP with SAP NetWeaver</div><div class="cert-body">SAP Global Certification · 2022</div></div></div>
        <div class="cert-card"><span class="cert-icon">🏅</span><div><div class="cert-name">SAP Certified Technology Associate – SAP HANA 2.0</div><div class="cert-body">SAP Global Certification · 2021</div></div></div>
      </div>
      <div class="contact-section">
        <h2>Let's Connect</h2>
        <p>Have a question about SAP? Want to collaborate on a project? I'd love to hear from you.</p>
        <div class="contact-links">
          <a class="contact-link" href="mailto:your@email.com">✉️ Email Me</a>
          <a class="contact-link" href="https://linkedin.com"  target="_blank" rel="noopener">💼 LinkedIn</a>
          <a class="contact-link" href="https://twitter.com"   target="_blank" rel="noopener">🐦 Twitter / X</a>
          <a class="contact-link" href="https://github.com"    target="_blank" rel="noopener">💻 GitHub</a>
        </div>
      </div>
    </div>
    ${footerFull()}`;
}

// ── 404 ──────────────────────────────────────────────────
function render404(app) {
  document.title = '404 — Misham Warsi';
  app.innerHTML = `
    <div class="page-404">
      <h1>404</h1>
      <p>Oops — this page doesn't exist.</p>
      <a class="btn-primary" href="#/">← Back to Home</a>
    </div>
    ${footerMinimal()}`;
}

// ── MOBILE NAV ───────────────────────────────────────────
document.querySelector('.nav-hamburger')?.addEventListener('click', () => {
  document.getElementById('nav-links')?.classList.toggle('open');
});

// ── BOOT ─────────────────────────────────────────────────
render();
