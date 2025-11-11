function handleKeyDown(e) {
  const video = document.querySelector('video[src]');
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

  if (
    state.keyboard &&
    ['ArrowLeft', 'ArrowRight', ' ', 'f'].includes(e.key)
  ) {
    e.preventDefault();

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
