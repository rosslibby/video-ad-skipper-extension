const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (['childList', 'subtree'].includes(mutation.type)) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeName === 'AUDIO') {
          const audio = addedNode;
          console.log(`New audio node:`, audio, audio.duration, audio.muted);

          if (audio.src.includes('.adswizz.com')) {
            audio.muted = true;
            audio.playbackRate = 16;
            audio.currentTime = audio.duration - 1;
            audio.onplay = () => {
              if (Math.floor(audio.currentTime) === 0) {
                audio.currentTime = audio.duration - 1;
              }
            };
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
