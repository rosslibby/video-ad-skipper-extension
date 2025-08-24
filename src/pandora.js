const state = {
  playing: null,
  audioNodes: {},
  history: [],
};
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (['childList'].includes(mutation.type)) {
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
  node.addEventListener('playing', handleAudioStarted);
  return audioId;
}

function handleAudioStarted(e) {
  const audio = e.target;
  const audioId = audio.dataset.audioId;
  audio.removeEventListener('playing', handleAudioStarted);
  setTimeout(() => {
    const albumArt = document.querySelector('.nowPlayingTopInfo__artContainer > .nowPlayingTopInfo__artContainer__art img').src;
    const songName = document.querySelector('[data-qa="playing_track_title"]')?.textContent;
    const artistName = document.querySelector('[data-qa="playing_artist_name"]')?.textContent;
    const albumName = document.querySelector('[data-qa="playing_album_name"]')?.textContent;
    const details = {
      art: albumArt,
      name: songName,
      artist: artistName,
      album: albumName,
    };
    const node = state.audioNodes[audioId] || {};
    state.audioNodes[audioId] = { ...node, ...details };
  }, 150);
}

function removeAudioNode(audioId) {
  const node = state.audioNodes[audioId];
  if (!node) return;
  const { ad, src } = node;
  const prefix = ad ? 'ad:' : '';
  state.history.push(`${prefix} ${src}`);
  delete state.audioNodes[audioId];
}

function handleAudioTimeUpdate(audio) {
  if (audio.paused && audio.dataset.skipped) {
    audio.play();
  }
}

function handleAdEnded(e) {
  console.log(`😈 ad zapped`);
  chrome.runtime.sendMessage({ action: 'unmuteTab' });
}

function handleAdPlaying(e) {
  console.log(`⚡️ zapping an ad`);
  const ad = e.target;
  ad.src = 'blob:nodedata:b5ed410e-b385-4bc4-b1ab-deadbcf050a8';
  ad.load();
  // ad.volume = 0.01;
  // ad.addEventListener('ended', handleAdEnded);
  // chrome.runtime.sendMessage({ action: 'muteTab' });

  // ad.pause();
  // ad.currentTime = ad.duration - 0.15;
  // ad.playbackRate = 16;
  // ad.removeEventListener('playing', handleAdPlaying);
  // ad.play();
}

function initialRun() {
  Array.from(document.querySelectorAll('audio'))
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
