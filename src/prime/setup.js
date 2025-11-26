console.clear();

// initialize toasts
initToast();

// initialize keyboard controls
document.addEventListener('keydown', handleKeyDown);

/**
 * Utils
 */

// toggle timer
const toggleTimer = () => {
  const nextTimerState = !state.timer
  console.debug(`Toggling timer from ${state.timer} to ${nextTimerState}`)
  state.timer = !state.timer;
}

// mutation tracking
const trackItem = (key, mutation) => {
  const payload = {
    type: mutation.type,
    prev: mutation.oldValue,
    current: mutation.target.outerHTML,
    time: Date.now(),
  };
  tracker[key].push(payload);
};

// add <style> to <head>
function addStyling(styles) {
  const tag = document.createElement('style');
  tag.setAttribute('type', 'text/css');
  tag.innerHTML = styles;
  document.head.appendChild(tag);
}

// formatted debug outputs
const durationChangedOutput = (prev, next) =>`⌚️ [duration:changed]
    Video duration has been updated:
      --> From ${prev}
      --> To ${next}
  `;

const durationSecondsOutput = (total, elapsed, remaining) =>
  `📺 [seconds:total] ${total}
      -->   current seconds: ${elapsed}
      --> remaining seconds: ${remaining}
  `

const totalDurationOutput = (duration) => `⏱ [duration:total] ${duration}`;

const skippingAdOutput = (seconds, elapsed) => [
  `⏭️ [skipping:${state.skipCount}]`,
  `Skipping ahead by ${seconds} seconds
    --> ${elapsed}ms elapsed`,
].join(' ');
