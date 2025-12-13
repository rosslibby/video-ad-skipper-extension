/**
 * Track video duration
 * 
 * Prime Video does not bake ads into the video files. Instead,
 * it streams the content and, when a designated ad-break is imminent
 * (assumption 10-15 seconds before current scene ends), the stream
 * is updated with additional packet(s), resulting in an increased
 * overall duration.
 * 
 * Track:
 * 
 * - video.duration
 * - video.currentTime
 * - Date.now()
 * 
 * Tracking should occur at key points:
 * - Video starts playing
 * - Duration updated
 * - Ad starts
 * - Ad ends (or ad is skipped)
 * - Video resumes featured content playback
 * 
 * Duration:
 * - video.duration
 * - Timestamp when duration updated
 * - Timestamp when ad begins playing
 */

const initialDurationPayload = {
  duration: 0,
  currentTime: 0,
  elapsed: 0,
  remaining: 0,
  total: 0,
  timestamp: Date.now(),
  label: 'initial',
}

function latestDuration() {
  if (state.durations.length) {
    return state.durations[state.durations.length - 1]
  } else {
    return initialDurationPayload
  }
}
function previousDuration() {
  const latest = latestDuration()
  const previous = state.durations.find((d) => {
    return d.duration < latest.duration
  })
  return previous || initialDurationPayload
}

function trackVideoDurationUpdate(video, label = '') {
  const duration = video.duration
  const currentTime = video.currentTime
  const actualTime = getSeconds()
  const timestamp = Date.now()
  const payload = {
    duration,
    currentTime,
    ...actualTime,
    timestamp,
    label,
  }
  state.durations.push(payload)
  console.debug(`⏱ [duration/current time]`, state.durations)
}

function trackDuration(e, label) {
  const video = e.target
  trackVideoDurationUpdate(video, label)
}

function durationChange(e) {
  const video = e.target
  const latest = latestDuration().duration
  console.debug(durationChangedOutput(latest, video.duration))
  const [prevDiff, currDiff] = [latest, video.duration]
    .map(parseDuration)
  console.debug(`🎬 duration diff: ${prevDiff} --> ${currDiff}`)
  trackDuration(e, 'duration-changed')
  scheduleNextAd(video)
}

function parseDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function getSeconds() {
  const { elapsed, remaining } = getActualTime()

  const [emin, esec] = elapsed
  const [rmin, rsec] = remaining

  const tmin = emin + rmin
  const tsec = esec + rsec
  const rtotal = rmin * 60 + rsec
  const etotal = emin * 60 + esec
  const total = tmin * 60 + tsec

  console.debug(durationSecondsOutput(total, etotal, rtotal))

  return { elapsed: etotal, remaining: rtotal, total }
}

function getActualTime() {
  const actualTimes = {
    elapsed: [0, 0],
    remaining: [0, 0],
  }

  const infoEl = document.querySelector(
    '.atvwebplayersdk-timeindicator-text'
  )
  const info = infoEl?.textContent

  if (!infoEl || !info) {
    console.debug(
      `⚠️ Failed to get actual times: ` +
      `Time indicator element does not exist`,
      infoEl, info
    )

    return actualTimes
  } else {
    const times = (info.match(/(\d+:\d+)/g) || [])
      .map((time) => time.split(':').map(Number))

    actualTimes.elapsed = times[0] || actualTimes.elapsed
    actualTimes.remaining = times[1] || actualTimes.remaining

    return actualTimes
  }
}

function getTickWidth(ticks) {
  const [tickWidth] = Array.from(ticks)
    .map((tick) => tick.offsetWidth)
    .sort((a, b) => a - b)
  return tickWidth
}

function getTicks() {
  const ticks = document.querySelectorAll('[class*="tick-mark"]')
  const width = getTickWidth(ticks)

  return { ticks, width }
}

function getSeekbarWidth() {
  // subtract cumulative widths of ticks to get the playback width of
  // the seekbar
  const { ticks, width: tickWidth } = getTicks()
  const bar = document.querySelector('.atvwebplayersdk-seekbar-container')
  const seekWidth = bar.offsetWidth - ticks.length * tickWidth
  return seekWidth
}

function scheduleNextAd(video) {
  const seekbarWidth = getSeekbarWidth()
  const nextTick = document.querySelector('.atvwebplayersdk-tick-mark')

  if (nextTick) {
    const adPlaysAtTime = video.duration * (nextTick.offsetLeft / seekbarWidth)
    const remaining = (adPlaysAtTime - video.currentTime) * 1000
    console.log(`🎬 ⏱ Set timer for ${remaining}ms in the future`)
    // setTimeout(() => {
    //   alert('Ad commencing!')
    // }, remaining)
  }
}
