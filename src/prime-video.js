const setupObserver = new MutationObserver(() => {
  const container = document.querySelector('[id*=dv-web-player]');
  const video = container?.querySelector('video[src*=blob]');

  if (video) {
    primeSetup();
    setupObserver.disconnect();
  }
});
setupObserver.observe(document.body, {
  childList: true,
  subtree: true,
});
function primeSetup() {
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
    video.muted = true;
    console.log(`[${skipCount}] Skipping ahead by ${seconds} seconds`);
    video.currentTime += seconds + 1;
    video.muted = false;
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
        video.requestPictureInPicture();
      }
    }
  });
}
