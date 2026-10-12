/**
 * Progressive Web App integration: registers the service worker and shows
 * an "Install" button when the browser offers installation.
 */

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Relative URL: the worker's scope is this app's folder, not the shared origin root.
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('Service worker registration failed:', err));
  });
}

const isStandalone = () =>
  matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

/**
 * Shows `button` while the app can be installed.
 * @returns {() => Promise<void>} call it to open the browser's install prompt
 */
export function setupInstall(button) {
  let deferredPrompt = null;
  button.hidden = true;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // use our own button instead of the mini-infobar
    deferredPrompt = e;
    button.hidden = isStandalone();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    button.hidden = true;
  });

  return async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    button.hidden = true;
  };
}
