async function skipSegment(seconds, startTime) {
  const currentTime = Date.now()
  const elapsed = currentTime - startTime

  state.skipCount++;
  console.debug(skippingAdOutput(seconds, elapsed));

  adSkipToast(`Skipped ad #${state.skipCount}`);

  const video = document.querySelector('video[src]');

  if (video) {
    trackVideoDurationUpdate(video, 'pre-skip');
    video.currentTime += seconds;
    return new Promise((resolve) => {
      setTimeout(() => resolve(video), 140);
    })
  }
}

async function skip(timer) {
  if (!timer?.textContent) return;

  const startTime = Date.now()
  const duration = timer.querySelector(
    '.atvwebplayersdk-ad-timer-remaining-time'
  )?.textContent || '0'

  console.debug(totalDurationOutput(duration))

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
    await skipSegment(t, startTime)
      .then((video) => trackVideoDurationUpdate(video, 'post-skip'));
    if (state.timer && t < 30) {
      toggleTimer();
    }
  }
}

const adContainerObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      console.debug(`⏰ Ad timer detected:`, mutation.target);
      skip(mutation.target);
    } else if (mutation.type === 'characterData') {
      console.debug(mutation.type, mutation.target.textContent)
    }
  })
});

const setContainers = (video) => {
  if (!state.container && !state.adContainer) {
    const container = video.closest('[id*=dv-web-player]');
    const adContainer = document.querySelector(
      '.atvwebplayersdk-ad-timer-countdown'
    );
    console.debug(`Initializing containers:`, container, adContainer)
    state.container = container;
    state.adContainer = adContainer;
    adContainerObserver.observe(adContainer, {
      childList: true,
      attributes: true,
      characterData: true,
    });
    createToast(`⚡️ Ad zap initialized`, container)
    skip(adContainer);
  } else {
    createToast(`⚡️ Ad zap already initialized`, state.container)
    console.info('Containers already set!', state)
  }
}

function videoPlaying(e) {
  // track-duration
  trackDuration(e, 'video-playing');

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
        video.addEventListener('durationchange', durationChange);
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
          video.addEventListener('durationchange', durationChange);
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
