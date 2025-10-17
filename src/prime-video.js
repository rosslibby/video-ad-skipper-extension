console.clear();

const state = {
  skipCount: 0,
  video: null,
  timer: false,
  video: null,
  container: null,
  adContainer: null,
};

const toggleTimer = () => {
  const nextTimerState = !state.timer
  console.log(`Toggling timer from ${state.timer} to ${nextTimerState}`)
  state.timer = !state.timer;
}

const tracker = {
  video: [],
  container: [],
  timer: [],
};

const trackItem = (key, mutation) => {
  const payload = {
    type: mutation.type,
    prev: mutation.oldValue,
    current: mutation.target.outerHTML,
    time: Date.now(),
  };
  tracker[key].push(payload);
};

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
  const label = `Skipped ad #${state.skipCount}`;
  toast.innerText = label;
  return toast;
}

function makeInitToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const label = message;
  toast.innerText = label;
  return toast;
}

function showToast() {
  const video = document.querySelector('video[src*=blob]');
  if (video) {
    const toast = makeToast();
    video.parentElement.appendChild(toast);
    setTimeout(() => toast.remove(), 2201);
  } else {
    console.log(`❌ video not found:`, video)
  }
}

async function skipSegment(seconds, startTime) {
  const currentTime = Date.now()
  const elapsed = currentTime - startTime

  state.skipCount++;
  console.log(`[${state.skipCount}] Skipping ahead by ${seconds} seconds\n --> ${elapsed}ms elapsed`);
  showToast();
  document.querySelector('video[src*=blob]').currentTime += seconds;
  return new Promise((resolve) => {
    setTimeout(() => resolve(), 140);
  })
}

async function skip(timer) {
  if (!timer.textContent) return;

  const startTime = Date.now()

  console.log(`⏱️ total duration: ${timer.querySelector('.atvwebplayersdk-ad-timer-remaining-time')?.textContent}`)
  const seconds = timer.textContent
    .match(/(\d+):(\d+)/g)[0]
    .split(':').map(Number)
    .reduce((acc, n, i) => {
      if (i === 0) return acc + n * 60;
      return acc + n;
    }, 0);
  const increments = Math.ceil(seconds / 30);
  const remainder = seconds % 30;
  const times = Array.from({ length: increments }, (_, i) => {
    if (i < increments - 1) return 30;
    return remainder;
  });
  for (const t of times) {
    await skipSegment(t, startTime);
    if (state.timer && t < 30) {
      toggleTimer();
    }
  }
}

const adContainerObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      console.log(`⏰ Ad timer detected:`, mutation.target);
      skip(mutation.target);
    } else if (mutation.type === 'characterData') {
      console.log(mutation.type, mutation.target.textContent)
    }
  })
});

const setContainers = (video) => {
  if (!state.container && !state.adContainer) {
    const container = video.closest('[id*=dv-web-player]');
    const adContainer = document.querySelector('.atvwebplayersdk-ad-timer-countdown');
    console.log(`Initializing containers:`, container, adContainer)
    state.container = container;
    state.adContainer = adContainer;
    adContainerObserver.observe(adContainer, {
      childList: true,
      attributes: true,
      characterData: true,
    });
    const toast = makeInitToast(`⚡️ Ad zap initialized`)
    container.appendChild(toast)
    skip(adContainer);
    setTimeout(() => toast.remove(), 2201);
  } else {
    const toast = makeInitToast(`⚡️ Ad zap already initialized`)
    state.container?.appendChild(toast)
    console.log('Containers already set!', state)
    setTimeout(() => toast.remove(), 2201);
  }
}

function videoPlaying(e) {
  const video = e.target;
  setContainers(video);
}

const initobserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' || mutation.type == 'characterData') {
      if (mutation.target.nodeName === 'VIDEO') {
        const video = mutation.target;
        trackItem('video', mutation);
        video.setAttribute('data-video-id', mutation.type)
        video.addEventListener('play', videoPlaying);
        video.addEventListener('timeupdate', timeUpdate);
        state.video = video;
      }
    } else if (mutation.type === 'childList') {
      const video = mutation.target.querySelector('video');
      if (video && !state.video) {
        const vid = video.dataset.videoId;
        if (vid) {
          return;
        } else {
          video.setAttribute('data-video-id', mutation.type)
          video.addEventListener('play', videoPlaying);
          video.addEventListener('timeupdate', timeUpdate);
          state.video = video;
          initobserver.disconnect();
        }
      }
    }
  });
});
initobserver.observe(document.body, {
  attributes: true,
  characterData: true,
  childList: true,
  subtree: true,
});

function timeUpdate(e) {
  const video = e.target;
  if (state.skipCount && video.currentTime < 60) {
    state.skipCount = 0;
  }
}

// keys
function handleKeyDown(e) {
  const video = document.querySelector('video[src*=blob]');
  if (!video) return;

  if (e.key === 'k') {
    state.keyboard = !state.keyboard;
  } else if (e.key === 'p') {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      video.requestPictureInPicture();
    }
  }

  if (state.keyboard && ['ArrowLeft', 'ArrowRight', ' ', 'f'].includes(e.key)) {
    e.preventDefault();

    const video = document.querySelector('video[src*=blob]');

    if (e.key === 'ArrowLeft') {
      video.currentTime -= 10;
    } else if (e.key === 'ArrowRight') {
      video.currentTime += 10;
    } else if (e.key === ' ') {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    } else if (e.key === 'f') {
      if (!document.fullscreenElement) {
        video.requestFullscreen();
      }
    }
  }
}
document.addEventListener('keydown', handleKeyDown);
