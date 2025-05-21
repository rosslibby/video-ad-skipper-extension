let skipCount = 0;
const videos = Array.from(document.querySelectorAll('video[src]'));
const video = videos.find((video) => !video.closest('#video-preview-container'));
video.addEventListener('timeupdate', (e) => {
  skipAd();
});
video.addEventListener('durationchange', (e) => {
  skipAd();
});

function skipAd() {
  const advertisement = document.querySelector('.video-ads.ytp-ad-module *');

  if (advertisement) {
    if (isNaN(video.currentTime)) {
      const skipButton = advertisement.querySelector('.ytp-skip-ad-button');
      skipButton?.click();
    } else {
      ++skipCount;
      console.log(`🔥 Skipping ad ${skipCount} from ${video.currentTime} to ${video.duration}`);
      video.currentTime = video.duration;
    }
  }
}
