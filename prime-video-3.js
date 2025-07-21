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

function setupPictureInPictureButton() {
  const topButtonsCaptions = document.querySelector('[class*=-hideabletopbuttons-container] > div:first-child > div:first-child');
  const pipButtonWrapper = document.createElement('div');
  pipButtonWrapper.style.width = '32px';
  pipButtonWrapper.style.marginRight = '10px';
  const pipButton = document.createElement('button');
  pipButton.style.width = 'fit-content';
  pipButton.style.height = '32px';
  pipButton.addEventListener('click', () => {
    const video = container.querySelector('video[src*=blob]');
    video.requestPictureInPicture();
  });
  pipButton.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 251 192" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white"><path d="M95.1281 184H19C12.3726 184 7 178.627 7 172V19C7 12.3726 12.3726 7 19 7H125.5H232C238.627 7 244 12.3726 244 19V65.386" stroke-width="14" stroke-linecap="round"></path><path d="M184.5 96H236C240.418 96 244 99.5817 244 104V176.717C244 181.118 240.445 184.692 236.044 184.717L184.5 185L132.956 184.717C128.555 184.692 125 181.118 125 176.717V104C125 99.5817 128.582 96 133 96H184.5Z" stroke-width="14"></path><line x1="66" y1="77" x2="107" y2="77" stroke-width="14" stroke-linecap="round"></line><line x1="107" y1="36" x2="107" y2="77" stroke-width="14" stroke-linecap="round"></line><line x1="95.5269" y1="65.4264" x2="63" y2="32.8995" stroke-width="14" stroke-linecap="round"></line></svg>`;
  pipButtonWrapper.innerHTML = '';
  insertAdjacentElement(topButtonsCaptions, pipButtonWrapper);
}

let skipCount = 0;
const container = document.querySelector('[id*=dv-web-player]');
const video = container.querySelector('video[src*=blob]');
const renderer = video.parentElement;
video.controls = true;
renderer.style.pointerEvents = 'initial';

function skipAd(seconds) {
  /**
   * Skip by the specified seconds + 1 to ensure the ad's
   * playback is over
   */
  console.log(`[${skipCount}] Skipping ahead by ${seconds} seconds`);
  video.currentTime += seconds + 1;
  showToast();
}

const observer = new MutationObserver(() => {
  const timeRemaining = document.querySelector(
    'span[class*=-ad-timer-remaining-time]'
  );

  if (timeRemaining) {
    skipCount++;
    const [min = 0, sec = 0] = timeRemaining.textContent.split(':');
    const secondsRemaining = parseInt(min) * 60 + parseInt(sec);
    skipAd(secondsRemaining);
    observer.disconnect();
    setTimeout(() => {
      observer.observe(container, {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: false,
      });
    }, 1000);
  }
});

observer.observe(container, {
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

document.addEventListener('keypress', (e) => {
  if (e.key === 'p') {
    e.preventDefault();
    if (!document.pictureInPictureElement) {
      document.querySelector('video').requestPictureInPicture();
    }
  }
});
