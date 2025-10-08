const state = {
  ads: {},
  adTimes: {},
  showTime: 0,
};

function preemptSetup() {
  getShowTime();
  getTickMarks();
  observeTime();
}

function getShowTime() {
  const el = document.querySelector('.atvwebplayersdk-timeindicator-text');
  const elapsedRemains = el.textContent.split(' / ');
  const playtime = elapsedRemains.reduce(
    (acc, time) => {
      const [minutes, seconds] = time.split(':').map(Number);
      return acc + minutes * 60 + seconds;
    }, 0
  );
  state.showTime = playtime;
  return playtime;
}

function tickToShowTime(tick, i) {
  const { showTime } = state;
  const percent = parseFloat(tick.style.left) / 100;
  const total = showTime * percent;
  const minutes = Math.floor(total / 60);
  const seconds = Math.floor(total % 60).toString().padStart(2, '0');
  const triggerTime = `${minutes}:${seconds}`;
  console.log(`Ad #${i + 1} will run at ${triggerTime}`);
  tick.setAttribute('data-trigger-time', `${triggerTime}`);
  state.ads[triggerTime] = {
    idx: i + 1,
    el: tick,
    alerted: false,
    passed: false,
  };
  observeTick(tick);
  return [minutes, seconds];
}

function getTickMarks() {
  document.querySelectorAll('.atvwebplayersdk-tick-mark')
    .forEach(tickToShowTime);
}

function adTriggered(key) {
  const ad = state.ads[key];
  const video = document.querySelector('video[src*=blob]');
  video.pause();
  alert(`📀 Ad ${ad.idx} incoming ${key}`);
  state.ads[key].alerted = true;
}

function observeTime() {
  const target = document.querySelector('.atvwebplayersdk-timeindicator-text').childNodes[0];
  const timeObserver = new MutationObserver(
  (mutations) => mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        const time = mutation.target;
        const [minute, second] = time.textContent.split(':').map(Number);
        const timeMark = `${minute}:${second}`;
        const ad = state.ads[timeMark];
        if (ad && !ad.alerted) {
          adTriggered(timeMark);
        }
      }
    }),
  );
  timeObserver.observe(target, { characterData: true });
}

function observeTick(tick) {
  const tickObserverCallback = (mutations, observer) => mutations.forEach(
    (mutation) => {
      if (mutation.type === 'childList') {
        for (const removed of mutation.removedNodes) {
          if (removed === tick) {
            observer.disconnect();
          }
          if (
            removed.classList.contains('atvwebplayersdk-tick-mark') ||
            removed.querySelector('.atvwebplayersdk-tick-mark')
          ) {
            const triggerTime = removed.dataset.triggerTime;
            if (triggerTime) {
              delete state.ads[triggerTime];
            }
          }
        }
      }
    }
  );
  const observer = new MutationObserver(tickObserverCallback);
  observer.observe(tick, { childList: true });
}