(function () {
  if (document.getElementById('cf-random-btn')) return;

  const API_URL = 'https://codeforces.com/api/problemset.problems';
  const CACHE_KEY = 'cf_problems_cache';
  const STATE_KEY = 'cf_random_state';
  const U = () => window.utils || {};

  async function loadProblems() {
    const storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;
    const stored = await storage.get(CACHE_KEY);
    const entry = stored[CACHE_KEY];
    if (entry && Date.now() - entry.ts < 24 * 60 * 60 * 1000) return entry.data;
    const res = await fetch(API_URL);
    const json = await res.json();
    if (json.status !== 'OK') throw new Error('API error');
    const problems = json.result.problems;
    await storage.set({ [CACHE_KEY]: { ts: Date.now(), data: problems } });
    return problems;
  }

  async function loadState() {
    const storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;
    const stored = await storage.get(STATE_KEY);
    return stored[STATE_KEY] || { tags: [], min: '', max: '' };
  }

  async function saveState(state) {
    const storage = (typeof browser !== 'undefined' ? browser : chrome).storage.local;
    await storage.set({ [STATE_KEY]: state });
  }

  const btn = document.createElement('button');
  btn.id = 'cf-random-btn';
  btn.innerHTML = '🎲';
  btn.title = 'Random Problem';
  btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;width:48px;height:48px;border-radius:50%;background:#007acc;color:#fff;border:none;cursor:pointer;font-size:22px;box-shadow:0 2px 10px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;';
  document.body.appendChild(btn);

  const modal = document.createElement('div');
  modal.id = 'cf-random-modal';
  modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:10000;align-items:center;justify-content:center;';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'background:#252526;color:#cccccc;padding:18px;border-radius:8px;width:320px;font-family:sans-serif;max-height:80vh;overflow:auto;';
  const h3 = document.createElement('h3');
  h3.style.cssText = 'margin:0 0 10px;color:#007acc;';
  h3.textContent = 'Random Problem';
  wrap.appendChild(h3);

  function field(labelText, id, type) {
    const lab = document.createElement('label');
    lab.style.cssText = 'display:block;margin:8px 0 4px;color:#9d9d9d;';
    lab.textContent = labelText;
    wrap.appendChild(lab);
    const inp = document.createElement('input');
    inp.id = id;
    inp.type = type || 'text';
    inp.style.cssText = 'width:100%;padding:6px;background:#1f1f1f;color:#cccccc;border:1px solid #3c3c3c;border-radius:4px;';
    wrap.appendChild(inp);
    return inp;
  }
  const tagsInput = field('Tags (comma separated)', 'cf-tags');
  tagsInput.placeholder = 'dp, graphs';
  const minInput = field('Min rating', 'cf-min', 'number');
  minInput.placeholder = '800';
  const maxInput = field('Max rating', 'cf-max', 'number');
  maxInput.placeholder = '1600';

  const goBtn = document.createElement('button');
  goBtn.id = 'cf-go';
  goBtn.textContent = 'Pick';
  goBtn.style.cssText = 'margin-top:12px;width:100%;padding:8px;background:#007acc;color:#fff;border:none;border-radius:4px;cursor:pointer;';
  wrap.appendChild(goBtn);

  const status = document.createElement('div');
  status.id = 'cf-status';
  status.style.cssText = 'margin-top:8px;font-size:12px;color:#9d9d9d;';
  wrap.appendChild(status);

  modal.appendChild(wrap);
  document.body.appendChild(modal);

  btn.addEventListener('click', async () => {
    modal.style.display = 'flex';
    const status = document.getElementById('cf-status');
    status.textContent = '';
    try {
      const state = await loadState();
      if (state.tags && state.tags.length) {
        document.getElementById('cf-tags').value = state.tags.join(', ');
      }
      if (state.min) document.getElementById('cf-min').value = state.min;
      if (state.max) document.getElementById('cf-max').value = state.max;
    } catch (e) {
      status.textContent = 'Error: ' + e.message;
    }
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

  document.getElementById('cf-go').addEventListener('click', async () => {
    const status = document.getElementById('cf-status');
    status.textContent = 'Loading...';
    try {
      const tags = document.getElementById('cf-tags').value.split(',').map(s => s.trim()).filter(Boolean);
      const minRating = document.getElementById('cf-min').value ? Number(document.getElementById('cf-min').value) : null;
      const maxRating = document.getElementById('cf-max').value ? Number(document.getElementById('cf-max').value) : null;
      await saveState({ tags, min: document.getElementById('cf-min').value, max: document.getElementById('cf-max').value });
      const problems = await loadProblems();
      const filtered = (U().filterProblems ? U().filterProblems(problems, tags, minRating, maxRating) : problems);
      if (!filtered || filtered.length === 0) { status.textContent = 'No matching problems.'; return; }
      const idx = U().secureRandomIndex ? U().secureRandomIndex(filtered.length) : Math.floor(Math.random() * filtered.length);
      const pick = filtered[idx];
      window.location.href = `https://codeforces.com/problemset/problem/${pick.contestId}/${pick.index}`;
    } catch (e) {
      status.textContent = 'Error: ' + e.message;
    }
  });
})();