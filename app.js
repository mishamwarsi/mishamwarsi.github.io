/* ===========================
   app.js — Blog Engine
   Loads posts from posts.json
   =========================== */

const POSTS_URL = findPostsPath();

function findPostsPath() {
  const depth = window.location.pathname.split('/').length - 2;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  return prefix + 'posts/posts.json';
}

let allPosts = [];

async function loadPosts() {
  try {
    const res = await fetch(POSTS_URL + '?v=' + Date.now());
    allPosts = await res.json();
    return allPosts;
  } catch (e) {
    console.error('Could not load posts:', e);
    return [];
  }
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getCatTag(cat) {
  const map = {
    sap: `<span class="tag tag-sap">SAP</span>`,
    travel: `<span class="tag tag-travel">Travel</span>`,
    tech: `<span class="tag tag-tech">Tech</span>`
  };
  return map[cat] || '';
}

function getPostPath(id) {
  const depth = window.location.pathname.split('/').length - 2;
  const prefix = depth > 1 ? '../'.repeat(depth - 1) : '';
  return prefix + 'posts/post.html?id=' + id;
}

// Render homepage grid (latest 6)
async function renderHomePosts() {
  const grid = document.getElementById('posts-grid');
  if (!grid) return;
  const posts = await loadPosts();
  const latest = posts.slice(0, 6);
  if (!latest.length) {
    grid.innerHTML = '<p class="loading-state">No posts yet. Check back soon!</p>';
    return;
  }
  grid.innerHTML = latest.map(post => `
    <a class="post-card" href="${getPostPath(post.id)}">
      <div class="post-card-meta">
        ${getCatTag(post.category)}
        <span class="post-card-date">${formatDate(post.date)}</span>
      </div>
      <h3>${post.title}</h3>
      <p>${post.excerpt}</p>
    </a>
  `).join('');
}

// Render blog list page
async function renderPostsList(filterCat) {
  const list = document.getElementById('posts-list');
  if (!list) return;
  const posts = filterCat ? allPosts.filter(p => p.category === filterCat) : allPosts;
  if (!posts.length) {
    list.innerHTML = '<p class="loading-state">No posts in this category yet.</p>';
    return;
  }
  list.innerHTML = posts.map(post => `
    <a class="post-list-item" href="${getPostPath(post.id)}">
      <span class="post-list-date">${formatDate(post.date)}</span>
      <div class="post-list-body">
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
      </div>
      ${getCatTag(post.category)}
    </a>
  `).join('');
}

// Render individual post
async function loadPost(id) {
  const article = document.getElementById('post-article');
  if (!article) return;
  const posts = await loadPosts();
  const post = posts.find(p => p.id === id);
  if (!post) {
    article.innerHTML = '<p>Post not found.</p>';
    return;
  }
  document.title = post.title + ' — Misham Warsi';
  const html = markdownToHTML(post.content);
  article.innerHTML = `
    <div class="post-hero-tag">${getCatTag(post.category)}</div>
    <h1 class="post-title">${post.title}</h1>
    <div class="post-meta">
      <span>${formatDate(post.date)}</span>
    </div>
    <div class="post-content">${html}</div>
  `;
}

// Simple Markdown parser
function markdownToHTML(md) {
  let html = md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
      `<pre><code>${code.replace(/&lt;/g,'<').replace(/&gt;/g,'>')}</code></pre>`)
    // headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // unordered list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // ordered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // horizontal rule
    .replace(/^---$/gm, '<hr>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]+?<\/li>)(\n<li>[\s\S]+?<\/li>)*/g, match => `<ul>${match}</ul>`);

  // Tables
  html = html.replace(/\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g, (_, header, rows) => {
    const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const trs = rows.trim().split('\n').map(row => {
      const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:0.9rem">${ths ? `<thead><tr>${ths}</tr></thead>` : ''}<tbody>${trs}</tbody></table>`;
  });

  // Paragraphs: wrap lines not already in HTML tags
  html = html.split('\n\n').map(block => {
    block = block.trim();
    if (!block) return '';
    if (/^<(h[1-6]|ul|ol|pre|blockquote|table|hr)/.test(block)) return block;
    return `<p>${block.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  return html;
}

// Init on page load
document.addEventListener('DOMContentLoaded', async () => {
  if (document.getElementById('posts-grid')) {
    renderHomePosts();
  }
  if (document.getElementById('posts-list')) {
    await loadPosts();
    const urlCat = new URLSearchParams(window.location.search).get('cat');
    renderPostsList(urlCat || null);
  }
});
