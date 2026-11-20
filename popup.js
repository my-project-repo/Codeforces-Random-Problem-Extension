// popup.js
const API_URL = 'https://codeforces.com/api/problemset.problems';
const CACHE_KEY = 'cf_problems_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

async function loadProblems() {
  const stored = await chrome.storage.local.get(CACHE_KEY);
  const entry = stored[CACHE_KEY];
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    return entry.data;
  }
  const res = await fetch(API_URL);
  const json = await res.json();
  if (json.status !== 'OK') throw new Error('API error');
  const problems = json.result.problems;
  await chrome.storage.local.set({ [CACHE_KEY]: { ts: Date.now(), data: problems } });
  return problems;
}

document.getElementById('pick').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const result = document.getElementById('result');
  status.textContent = 'Loading...';
  result.style.display = 'none';
  try {
    const tags = document.getElementById('tags').value.split(',').map(s => s.trim()).filter(Boolean);
    const minRating = document.getElementById('minRating').value ? Number(document.getElementById('minRating').value) : null;
    const maxRating = document.getElementById('maxRating').value ? Number(document.getElementById('maxRating').value) : null;
    const problems = await loadProblems();
    const filtered = (window.utils || {}).filterProblems
      ? window.utils.filterProblems(problems, tags, minRating, maxRating)
      : problems.filter(p => {
          const pTags = (p.tags || []).map(t => t.toLowerCase());
          if (!tags.every(t => pTags.includes(t.toLowerCase()))) return false;
          if (minRating != null && (p.rating == null || p.rating < minRating)) return false;
          if (maxRating != null && (p.rating == null || p.rating > maxRating)) return false;
          return true;
        });
    const pick = (window.utils || {}).pickRandom ? window.utils.pickRandom(filtered) : (filtered.length ? filtered[Math.floor(Math.random() * filtered.length)] : null);
    if (!pick) {
      status.textContent = 'No matching problems.';
      return;
    }
    const url = `https://codeforces.com/problemset/problem/${pick.contestId}/${pick.index}`;
    result.textContent = '';
    const name = document.createElement('div');
    const strong = document.createElement('strong');
    strong.textContent = pick.name;
    name.appendChild(strong);
    const rating = document.createElement('div');
    rating.textContent = 'Rating: ' + (pick.rating || 'unrated');
    const tagsDiv = document.createElement('div');
    tagsDiv.textContent = 'Tags: ' + (pick.tags || []).join(', ');
    const linkWrap = document.createElement('div');
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.textContent = 'Open problem';
    linkWrap.appendChild(link);
    result.append(name, rating, tagsDiv, linkWrap);
    result.style.display = 'block';
    status.textContent = `Found ${filtered.length} matching problems.`;
  } catch (e) {
    status.textContent = 'Error: ' + e.message;
  }
});