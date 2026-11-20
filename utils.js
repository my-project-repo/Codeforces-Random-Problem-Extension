'use strict';

/**
 * Filter problems by tags (all tags must be present) and rating range.
 * @param {Array} problems
 * @param {string[]} tags
 * @param {number|null} minRating
 * @param {number|null} maxRating
 * @returns {Array}
 */
function secureRandomIndex(n) {
  if (n <= 0) return -1;
  const maxUint = 0xFFFFFFFF;
  const limit = maxUint - (maxUint % n);
  const buf = new Uint32Array(1);
  let r;
  do {
    crypto.getRandomValues(buf);
    r = buf[0];
  } while (r >= limit);
  return r % n;
}

function filterProblems(problems, tags, minRating, maxRating) {
  const tagSet = (tags || []).map((t) => t.toLowerCase().trim()).filter(Boolean);
  return (problems || []).filter((p) => {
    const pTags = (p.tags || []).map((t) => t.toLowerCase());
    if (!tagSet.every((t) => pTags.includes(t))) return false;
    const r = p.rating;
    if (minRating != null && (r == null || r < minRating)) return false;
    if (maxRating != null && (r == null || r > maxRating)) return false;
    return true;
  });
}

/**
 * Pick a random element from an array.
 * @param {Array} arr
 * @param {Function} [rng] Math.random by default
 * @returns {*} or null
 */
function pickRandom(arr, rng) {
  if (!arr || arr.length === 0) return null;
  const r = typeof rng === 'function' ? rng() : Math.random();
  const idx = Math.floor(r * arr.length);
  return arr[Math.min(idx, arr.length - 1)];
}

/**
 * Build problem URL.
 */
function problemUrl(p) {
  if (!p) return '';
  return `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { filterProblems, pickRandom, problemUrl, secureRandomIndex };
}
if (typeof window !== 'undefined') {
  window.utils = { filterProblems, pickRandom, problemUrl, secureRandomIndex };
}