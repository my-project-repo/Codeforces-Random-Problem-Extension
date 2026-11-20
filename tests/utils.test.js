const { filterProblems, pickRandom, problemUrl } = require('../src/utils');

describe('filterProblems', () => {
  const problems = [
    { contestId: 1, index: 'A', rating: 800, tags: ['greedy', 'math'] },
    { contestId: 2, index: 'B', rating: 1200, tags: ['dp', 'graphs'] },
    { contestId: 3, index: 'C', rating: 1600, tags: ['dp'] },
  ];
  test('filters by tag', () => {
    expect(filterProblems(problems, ['dp'], null, null)).toHaveLength(2);
  });
  test('filters by all tags', () => {
    expect(filterProblems(problems, ['dp', 'graphs'], null, null)).toHaveLength(1);
  });
  test('filters by rating range', () => {
    expect(filterProblems(problems, [], 1000, 1500)).toHaveLength(1);
  });
  test('combined', () => {
    expect(filterProblems(problems, ['dp'], 1000, 2000)).toHaveLength(2);
  });
});

describe('pickRandom', () => {
  test('returns null for empty', () => {
    expect(pickRandom([])).toBeNull();
  });
  test('picks deterministically with rng', () => {
    const arr = [1, 2, 3];
    expect(pickRandom(arr, () => 0)).toBe(1);
    expect(pickRandom(arr, () => 0.99)).toBe(3);
  });
});

describe('problemUrl', () => {
  test('builds url', () => {
    expect(problemUrl({ contestId: 5, index: 'C' })).toBe('https://codeforces.com/problemset/problem/5/C');
  });
});