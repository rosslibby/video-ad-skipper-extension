/**
 * url: *://*.peacocktv.com/watch/playback/*
 */

let skipCount = 0;
const video = document.querySelector('video');
const timer = document.querySelector('.playback-ad-countdown__container');
const timeRemaining = Number(timer.textContent);
video.currentTime += timeRemaining;

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains('playback-ad-countdown__container')) {
          const timeRemaining = Number(node.textContent);
          video.currentTime += timeRemaining;
          showToast();
          observer.disconnect();
          setTimeout(() => {
            observer.observe(document.body, {
              attributes: false,
              childList: true,
              subtree: true,
              characterData: false,
            });
          }, 1000);
          break;
        }
      }
    }
  }
});

observer.observe(document.body, {
  attributes: false,
  childList: true,
  subtree: true,
  characterData: false,
});

function setupToast() {
  const styling = `.toast{animation: hidetoast 2.2s ease-in-out;backdrop-filter: blur(4px);background-color: #ffffff1c;border: 1px solid #ffffff1c;border-radius: 4px;box-shadow: 0 0 0 1px #0000000a, 0 0 8px 0 #0000000a inset;box-sizing: border-box;color: #ffffff;font-family: system-ui;font-weight: 200;height: max-content !important;left: 2rem;opacity: 0;padding: 8px 12px;position: absolute;top: 2rem;width: max-content !important;z-index: 9999}
  @keyframes hidetoast {0%{opacity: 0}25%{opacity: 1}50%{opacity: 1}75%{opacity: 1}99%{opacity: 0}100%{opacity: 0}}`;
  const styletag = document.createElement('style');
  styletag.setAttribute('type', 'text/css');
  styletag.innerHTML = styling;
  document.head.appendChild(styletag);
}

setupToast();

function makeToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = 'Skipped ad';
  const label = `Skipped ad #${skipCount}`;
  toast.innerText = label;
  return toast;
}

function showToast() {
  const toast = makeToast();
  video.parentElement.appendChild(toast);
  setTimeout(() => toast.remove(), 2201);
}
