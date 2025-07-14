const state = {
  container: null,
  video: null,
  skipCount: 0,
};

function findActiveElements() {
  state.container = state.video.closest(`div[id*=dv-web-player]`);
  state.video = state.container?.querySelector(`video[src*=blob]`);
}

function updateActiveElements(video) {
  if (video.nodeName !== 'VIDEO' || !video.src) return;
  state.video = video;
  state.container = video.closest(`div[id*=dv-web-player]`);
  state.skipCount = 0;
}

const mutationCallback = (mutations) => {
  for (const mutation of mutations) {
    if (['childList', 'subtree'].includes(mutation.type)) {
      for (const node of mutation.addedNodes) {
        updateActiveElements(node);
      }
    } else if (mutation.type === 'attributes') {
      const { target } = mutation;
      updateActiveElements(target);
    }
  }
};

function skipAd(seconds) {
  /**
   * Skip by the specified seconds + 1 to ensure the ad's
   * playback is over
   */
  console.log(`[${state.skipCount}] Skipping ahead by ${seconds} seconds`);
  state.video.currentTime += seconds + 1;
  showToast();
}

function setupToast() {
  const styling = `.toast{animation: hidetoast 2.2s ease-in-out;backdrop-filter: blur(4px);background-color: #ffffff1c;border: 1px solid #ffffff1c;border-radius: 4px;box-shadow: 0 0 0 1px #0000000a, 0 0 8px 0 #0000000a inset;box-sizing: border-box;color: #ffffff;font-family: system-ui;font-weight: 200;height: max-content !important;left: 2rem;opacity: 0;padding: 8px 12px;position: absolute;top: 2rem;width: max-content !important;z-index: 9999}
  @keyframes hidetoast {0%{opacity: 0}25%{opacity: 1}50%{opacity: 1}75%{opacity: 1}99%{opacity: 0}100%{opacity: 0}}`;
  const styletag = document.createElement('style');
  styletag.setAttribute('type', 'text/css');
  styletag.innerHTML = styling;
  document.head.appendChild(styletag);
}

function makeToast() {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = 'Skipped ad';
  const label = `Skipped ad #${state.skipCount}`;
  toast.innerText = label;
  return toast;
}

function showToast() {
  const toast = makeToast();
  state.video.parentElement.appendChild(toast);
  setTimeout(() => toast.remove(), 2201);
}

setupToast();

const observer = new MutationObserver(mutationCallback);

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: false,
});
