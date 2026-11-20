# Codeforces Random Problem

![Manifest V3](https://img.shields.io/badge/manifest-v3-blue)
![Platform](https://img.shields.io/badge/platform-Chromium-lightgrey)
![Tests](https://img.shields.io/badge/tests-jest-green)

A lightweight Chrome extension that picks a random Codeforces problem matching the tags and rating range you choose, so you can practise instead of browsing the problemset.

Stop scrolling. Hit the dice. Solve.

## Table of contents

- [Features](#features)
- [Quick start](#quick-start)
- [Guide](#guide)
  - [Picking from the page](#1-picking-from-the-page)
  - [Picking from the toolbar popup](#2-picking-from-the-toolbar-popup)
  - [Writing filters](#writing-filters)
  - [Fine-tuning your practice](#fine-tuning-your-practice)
- [How it works](#how-it-works)
- [Permissions and privacy](#permissions-and-privacy)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Project structure](#project-structure)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)

## Features

- **One-click random pick** from a floating dice button on any `codeforces.com` page.
- **Toolbar popup** with a preview of the problem name, rating, and tags before you open it.
- **Tag and rating filters** — combine any number of tags with a minimum and/or maximum rating.
- **Uniform random selection** — the in-page dice uses `crypto.getRandomValues` with rejection sampling, so no problem is favoured by modulo bias.
- **Remembers your filters**, so your usual practice setup is one click away.
- **24-hour cache** of the Codeforces problemset for near-instant picks and fewer API calls.
- **No build step, no tracking, no third-party services.** Just the Codeforces public API.
- **Dark UI** that blends into Codeforces.

## Quick start

The extension is installed the same way on Chrome, Edge, Brave, Opera, and other Chromium browsers.

1. Download or clone this repository.
2. Open your browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Turn on **Developer mode** (top-right corner).
4. Click **Load unpacked** and select the project folder — the one containing `manifest.json`, not its parent and not the `.zip`.
5. Pin the extension to the toolbar (optional, but handy).

The dice button now appears in the bottom-right corner of every Codeforces page, and the extension icon opens the popup.

## Guide

### 1. Picking from the page

1. Open any page on `codeforces.com` — the problemset, a contest, a blog post, anywhere.
2. Click the floating **🎲** button in the bottom-right corner.
3. Enter your tags and rating range (details below).
4. Click **Pick**.

The extension chooses a matching problem and navigates the current tab straight to it. Your filters are saved, so the next time you open the dialog they are already filled in.

Click outside the dialog to close it without picking anything.

### 2. Picking from the toolbar popup

1. Click the extension icon in the toolbar.
2. Fill in the same filters.
3. Click **Pick Random Problem**.

Instead of navigating immediately, the popup shows the result first:

- problem name
- rating (or `unrated`)
- tags
- an **Open problem** link that opens in a new tab
- how many problems matched your filters

This flow is useful when you want a quick look before committing to a problem.

### 3. Writing filters

**Tags** are comma-separated and case-insensitive. A problem must have **all** the tags you enter.

| You type | You get |
| --- | --- |
| `dp` | Problems tagged `dp` |
| `dp, graphs` | Problems tagged **both** `dp` and `graphs` |
| `dp, graphs,` | Same as above — empty entries are ignored |
| *(empty)* | No tag filtering at all |

**Rating** uses a minimum and/or maximum, both inclusive. Codeforces ratings typically run from `800` to `3500`.

| Min | Max | You get |
| --- | --- | --- |
| `800` | `1600` | Problems rated 800–1600 |
| `1400` | *(empty)* | Problems rated 1400 and above |
| *(empty)* | `1200` | Problems rated 1200 and below |
| *(empty)* | *(empty)* | Any rated problem |

Leaving both bounds empty still excludes **unrated** problems. This is intentional: the picker is for rated practice, where difficulty is predictable.

### 4. Fine-tuning your practice

- **Narrow the range for a specific training block.** `dp` + `1500–1700` gives you a focused ladder instead of a random difficulty.
- **Combine complementary tags.** `implementation, math` is a very different session from `dp, graphs`.
- **Use the maximum only** when you want a confidence-building session: cap at `1200` and every pick is comfortable.
- **Clear the dialog to go broad again.** Empty tags with empty ratings select from the whole rated problemset.
- **If a pick looks off, pick again.** Every click is an independent uniform draw — there is no "seen" list, so repeats are possible and expected.

## How it works

1. The first time you pick a problem, the extension fetches the full problemset once from the public Codeforces API:
   `https://codeforces.com/api/problemset.problems`
2. The response is stored in `chrome.storage.local` with a timestamp and reused for **24 hours**. After that it is fetched again on the next pick.
3. Filters are applied locally in memory — no per-pick network requests, no server, no analytics.
4. A random index is chosen from the filtered list and turned into a problem URL:
   `https://codeforces.com/problemset/problem/<contestId>/<index>`
5. The in-page dice moves your current tab to that URL. The popup renders a preview card instead.

Filtering and randomisation live in `utils.js` and are unit-tested in `tests/utils.test.js`.

## Permissions and privacy

The extension asks for the minimum it needs:

| Permission | Why |
| --- | --- |
| `storage` | Cache the problemset and remember your filters locally. |
| `host_permissions: https://codeforces.com/*` | Read the problemset API and place the dice button in Codeforces pages. |

- No data is sent anywhere except the Codeforces API request for the public problemset.
- No accounts, cookies, or personal data are read.
- No analytics, telemetry, or remote code.
- Everything you type stays in your browser's local extension storage.

## Troubleshooting

**The dice button does not appear.**
Reload the Codeforces tab after installing or updating the extension. Content scripts are only injected into pages loaded after installation. Also confirm the extension is enabled and has site access to `codeforces.com`.

**"No matching problems."**
Your filter combination is too narrow. Verify the tag spelling (`graphs`, not `graph`), widen the rating range, or clear the tags and try again.

**"Error: API error" or a failed fetch.**
The Codeforces API is unreachable or rate-limited. Wait a few seconds and retry. If you have picked a problem successfully before, cached data keeps working for up to 24 hours.

**The problem list looks out of date.**
The cache is 24 hours by design. To force a refresh, remove the extension and load it again, or clear the extension's storage from the extensions page.

**The popup is blank.**
Close and reopen it, then reload the extension from the extensions page if the problem persists.

**Picking the same problem twice.**
Expected. Selection is uniform and independent each time, so popular filters with few matches will repeat sooner.

## Development

Requirements: Node.js 18+ and npm.

```bash
npm install     # install Jest
npm test        # run the unit tests
```

To develop against a live browser:

1. Load the folder as an unpacked extension.
2. Make your changes.
3. Click the reload icon for the extension on `chrome://extensions`.
4. Reload the Codeforces tab.

### Packaging for distribution

Zip the files that the extension actually needs — not the whole repository:

```bash
zip -r cf-random-problem.zip \
  manifest.json background.js content.js utils.js popup.html popup.js icon.png
```

The repository already includes a packaged `cf-random-problem.zip`. Rebuild it after changing any of the files above.

## Project structure

```
.
├── manifest.json          # MV3 manifest: permissions, popup, content script
├── background.js          # Minimal service worker (install hook)
├── content.js             # Floating dice button + in-page filter dialog
├── popup.html             # Toolbar popup markup and styles
├── popup.js               # Toolbar popup logic and result card
├── utils.js               # Shared filtering and random-selection helpers
├── icon.png               # Extension icon
├── src/
│   └── utils.js           # Copy used by the Jest test suite
├── tests/
│   └── utils.test.js      # Unit tests for filtering, picking, URL building
├── package.json           # Test script and dev dependency
└── cf-random-problem.zip  # Packaged build
```

## Contributing

Issues and pull requests are welcome. A good contribution includes:

- a clear description of the behaviour you changed and why
- unit tests for any change to filtering or random selection
- `npm test` passing locally
- no new permissions unless strictly necessary

## Disclaimer

This is an unofficial project and is not affiliated with, endorsed by, or sponsored by Codeforces. All problem data comes from the public Codeforces API and remains the property of its respective owners.
