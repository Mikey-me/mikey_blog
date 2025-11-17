// script.js - loads posts.json and renders index and post pages.
// No frameworks. Works with GitHub Pages (static files).

const DB = 'posts.json';

async function loadDB() {
  try {
    const r = await fetch(DB, {cache: "no-cache"});
    if (!r.ok) throw new Error('Failed to fetch posts.json: ' + r.status);
    return await r.json();
  } catch (e) {
    console.error(e);
    return {posts: []};
  }
}

/* Utilities */
function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
  } catch {
    return iso;
  }
}

function slugToUrl(slug) {
  return `post.html?slug=${encodeURIComponent(slug)}`;
}

/* Index page rendering */
async function renderIndex() {
  const db = await loadDB();
  const postsContainer = document.getElementById('posts');
  if (!postsContainer) return;

  const tmpl = document.getElementById('post-card-template');

  const searchInput = document.getElementById('search');
  const sortSelect = document.getElementById('sort');

  function getFiltered() {
    const q = searchInput.value.trim().toLowerCase();
    let list = db.posts.slice();
    if (q) {
      list = list.filter(p =>
        (p.title + ' ' + p.excerpt + ' ' + (p.tags||[]).join(' ')).toLowerCase().includes(q)
      );
    }
    if (sortSelect.value === 'newest') {
      list.sort((a,b)=> new Date(b.date) - new Date(a.date));
    } else {
      list.sort((a,b)=> new Date(a.date) - new Date(b.date));
    }
    return list;
  }

  function draw() {
    postsContainer.innerHTML = '';
    const list = getFiltered();
    if (list.length === 0) {
      postsContainer.innerHTML = '<p>No posts found.</p>';
      return;
    }
    list.forEach(post => {
      const node = tmpl.content.cloneNode(true);
      const article = node.querySelector('.card');
      const a = article.querySelector('.post-title a');
      a.textContent = post.title;
      a.href = slugToUrl(post.slug);
      const timeEl = article.querySelector('.post-date');
      timeEl.textContent = formatDate(post.date);
      timeEl.setAttribute('datetime', post.date);
      article.querySelector('.post-excerpt').textContent = post.excerpt;
      article.querySelector('.read-more').href = slugToUrl(post.slug);
      postsContainer.appendChild(node);
    });
  }

  // wire events
  searchInput.addEventListener('input', draw);
  sortSelect.addEventListener('change', draw);

  // initial draw
  draw();
}

/* Post page rendering */
async function renderPost(slug) {
  if (!slug) {
    document.getElementById('post-article').innerHTML = '<p>No post specified.</p>';
    return;
  }
  const db = await loadDB();
  const post = db.posts.find(p => p.slug === slug);
  if (!post) {
    document.getElementById('post-article').innerHTML = '<p>Post not found.</p>';
    return;
  }

  document.title = post.title + ' — Mini GitHub Blog';
  const titleEl = document.getElementById('post-title');
  const dateEl = document.getElementById('post-date');
  const bodyEl = document.getElementById('post-body');

  titleEl.textContent = post.title;
  dateEl.textContent = formatDate(post.date);
  dateEl.setAttribute('datetime', post.date);

  // We store body as HTML-safe string in posts.json (no external links or scripts).
  bodyEl.innerHTML = post.content_html;
}

/* Boot */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('posts')) {
    renderIndex();
  } else if (document.getElementById('post-article')) {
    const slug = window.__postSlug || new URLSearchParams(location.search).get('slug');
    renderPost(slug);
  }
});
