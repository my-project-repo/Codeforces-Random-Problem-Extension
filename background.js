// Service worker: keep-alive minimal. Caching handled in popup.
chrome.runtime.onInstalled.addListener(() => {
  console.log('CF Random Problem extension installed');
});