 Mini GitHub Blog (static)

A tiny static blog site that reads posts from `posts.json`. Perfect for hosting on GitHub Pages.

## Files
- `index.html` — list view + search
- `post.html` — single-post view (reads `?slug=...`)
- `styles.css` — styling
- `script.js` — client logic to load `posts.json`
- `posts.json` — the local "database" with 2 dummy posts

## Local testing
Because browsers block `fetch` on `file://`, run a simple local server:

### Python 3
```bash
python -m http.server 8000
# then open http://localhost:8000 in a browser
