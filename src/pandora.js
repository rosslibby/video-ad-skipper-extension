const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (['childList', 'subtree'].includes(mutation.type)) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeName === 'AUDIO') {
          const audio = addedNode;
          console.log(`New audio node:`, audio, audio.duration, audio.muted);

          if (audio.src.includes('.adswizz.com')) {
            audio.playbackRate = 16;
            audio.addEventListener('loadedmetadata', () => {
              console.log(`[AU.META]`, audio.currentTime, audio.duration, audio.muted)
              audio.currentTime = audio.duration - 1;
            });
            audio.addEventListener('playing', () => {
                console.log(`[AU.PLAYING]`, audio.muted, audio.duration, audio.currentTime)
              audio.pause();
              setTimeout(() => {
                audio.currentTime = audio.duration - 1;
              });
            });
          }
        }
      }
    }
  });
});
observer.observe(document.body, {
  childList: true,
  subtree: true,
});
