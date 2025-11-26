// initialize state
const state = {
  debug: true,
  skipCount: 0,
  video: null,
  timer: false,
  video: null,
  container: null,
  adContainer: null,
  durations: [],
};

// initialize mutation tracking
const tracker = {
  video: [],
  container: [],
  timer: [],
};

// initialize flag-based debug console
const _consoleDebug = console.log;
const debugLogger = (...args) => state.debug && _consoleDebug(`🐞 `, ...args);
console.debug = debugLogger;
