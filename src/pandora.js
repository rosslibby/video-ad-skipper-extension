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

          if (audio.src.includes('.adswizz.com')) {
            audio.addEventListener('playing', handleAdPlaying);
          } else {
            const audioId = addAudioNode(audio);
            audio.addEventListener('ended', () => removeAudioNode(audioId));
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
    updateMetadata(details);
    const node = state.audioNodes[audioId] || {};
    state.audioNodes[audioId] = { ...node, ...details };
  }, 150);
}

function updateMetadata({
  album, art, artist, name,
}) {
  const mediaSizes = [96, 128, 256, 512];
  navigator.mediaSession.metadata = new MediaMetadata({
    title: name,
    artist: artist,
    album: album,
    artwork: Array.from(
      { length: 4 },
      (_, i) => ({
        src: art,
        sizes: [mediaSizes[i], mediaSizes[i]].join('x'),
        type: `image/${art.split('.').pop()}`,
      }),
    ),
  });
}

/** skip song */
function getCurrentlyPlayingTrack() {
  const playing = Array.from(document.querySelectorAll('audio')).find((a) => !a.paused)
  return playing
}
function skipSong() {
  const playing = getCurrentlyPlayingTrack();
  playing.currentTime = playing.duration;
}
function restartSong() {
  const playing = getCurrentlyPlayingTrack();
  playing.currentTime = 0;
}

navigator.mediaSession.setActionHandler('seekforward', (e) => {
  e.preventDefault();
  skipSong();
});
navigator.mediaSession.setActionHandler('seekbackward', (e) => {
  e.preventDefault();
  restartSong();
});

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

function handleAdPlaying(e) {
  console.log(`⚡️ zapping an ad`);
  const ad = e.target;
  ad.src = 'blob:nodedata:b5ed410e-b385-4bc4-b1ab-deadbcf050a8';
  ad.load();
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
