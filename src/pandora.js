const state = {
  audioNodes: {},
  history: [],
};
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (['childList', 'subtree'].includes(mutation.type)) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeName === 'AUDIO') {
          const audio = addedNode;
          const audioId = addAudioNode(audio);
          audio.addEventListener('ended', () => removeAudioNode(audioId))

          if (audio.src.includes('.adswizz.com')) {
            audio.addEventListener('playing', handleAdPlaying);
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

function addAudioNode(node) {
  const audioId = crypto.randomUUID();
  node.setAttribute('data-audio-id', audioId);
  state.audioNodes[audioId] = {
    id: audioId,
    src: node.src,
    ad: node.src.includes('.adswizz.com'),
  };
  console.log(`New audio node ${audioId}:`, node);
  return audioId;
}

function removeAudioNode(audioId) {
  const { ad, src } = state.audioNodes[audioId];
  const prefix = ad ? 'ad:' : '';
  state.history.push(`${prefix} ${src}`);
  delete state.audioNodes[audioId];
}

function handleAudioTimeUpdate(audio) {
  if (audio.paused && audio.dataset.skipped) {
    audio.play();
  }
}

function handleAdPlaying(e) {
  console.log(`⏰ time to skip an ad`);
  const ad = e.target;
  ad.volume = 0.01;
  ad.pause();
  ad.currentTime = ad.duration - 1;
  ad.playbackRate = 16;
  ad.removeEventListener('playing', handleAdPlaying);
  ad.play();
}

function initialRun() {
  const audios = Array.from(document.querySelectorAll('audio'))
    .forEach((audio) => {
      const isAdvertisement = audio.src.includes('.adswizz.com');
      if (isAdvertisement) {
        audio.addEventListener('playing', handleAdPlaying);
      } else {
        addAudioNode(audio);
      }
    });
}
initialRun();
