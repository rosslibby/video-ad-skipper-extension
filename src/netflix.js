function handleKeydown(e) {
  if (e.key === 'p') {
    if (!document.pictureInPictureElement) {
      document.querySelector('video')?.requestPictureInPicture();
    } else {
      document.exitPictureInPicture();
    }
  }
}
document.addEventListener('keydown', handleKeydown);
