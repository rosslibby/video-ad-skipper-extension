let skipCount = 0;

function findActiveVideo() {
  const videos = Array.from(document.querySelectorAll('video[src]'));
  const video = videos.find(
    (video) => !video.closest('#video-preview-container')
  );
  return video;
}

function isActiveVideo(video) {
  return !Boolean(video.closest('#video-preview-container'));
}

function getAdOverlay() {
  const overlay = document.querySelector('[class*=-overlay][class*=-ad-]');
  return overlay;
}

function clickSkipButton() {
  const button = document.querySelector(
    '[class*=-overlay][class*=-ad-] button:last-child'
  );
  button?.click();
}

function isAdvertisement(div) {
  if (
    !(
      div.closest('[class*=-overlay][class*=-ad-]') ||
      div.querySelector('[class*=-overlay][class*=-ad-]') ||
      div.getAttribute('class')?.includes('-ad-')
    )
  ) {
    return false;
  }
  return true;
}

function skipAd(video) {
  const overlay = getAdOverlay();

  if (overlay) {
    if (isNaN(video.currentTime)) {
      const button = overlay.querySelector('button:last-child');
      button?.click();
    } else {
      ++skipCount;
      console.log(`🔥 Skipping ad ${skipCount} from ${video.currentTime} to ${video.duration}`);
      video.currentTime = video.duration;
    }
  }
}

function initializeSkipUtil(video) {
  const ultraSkipMaster6000 = (e) => skipAd(video);
  /**
   * make sure the util is not already running
   */
  video.addEventListener('timeupdate', ultraSkipMaster6000);
  video.addEventListener('durationchange', ultraSkipMaster6000);
}

/**
 * set up for youtube only at this point
 */
const observer = new MutationObserver((mutations) => {
  const hostname = window.location.hostname;
  const video = findActiveVideo();

  if (!hostname.includes('youtube.com')) {
    /**
     * Not on YouTube; nothing to do
     */
    return;
  }

  for (const mutation of mutations) {
    let initialized = false;

    for (const addedNode of mutation.addedNodes) {
      /**
       * Check if the added node is our new
       * active video
       */
      if (addedNode.nodeName === 'VIDEO') {
        if (isActiveVideo(addedNode)) {
          initializeSkipUtil(addedNode);
          initialized = true;
          break;
        }
      } else if (addedNode.nodeName === 'DIV') {
        if (isAdvertisement(addedNode)) {
          clickSkipButton();
          break;
        }
      } else if (addedNode.nodeName === 'BUTTON') {
        if (
          addedNode.closest('[class*=-ad-]') &&
          addedNode.textContent.includes('Skip')
        ) {
          addedNode.click();
          break;
        }
      }
    }

    if (
      !initialized &&
      mutation.type === 'attributes' &&
      mutation.target.nodeName === 'VIDEO' &&
      mutation.attributeName === 'src'
    ) {
      /**
       * Check if the video source has changed
       * and if the new video is active
       */
      if (isActiveVideo(mutation.target)) {
        initializeSkipUtil(mutation.target);
        initialized = true;
        break;
      }
    }

    if (initialized) {
      break;
    }
  }
});

observer.observe(document.body, {
  attributes: true,
  childList: true,
  subtree: true,
});
