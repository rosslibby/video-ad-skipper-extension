class PrimeVideo {
  constructor() {
    this.container = document.querySelector('[id*=dv-web-player]');
    this.history = [window.location.href];
    this.pictureInPicture = false;
    this.skips = 0;
    this.video = this.container.querySelector('video[src*=blob]');
    this._setupToast();
    this.adObserver = null;
    this.containerObserver = new MutationObserver(this.containerMutationCallback, {
      attributes: true,
      childList: true,
      subtree: true,
    });
  }

  init() {}

  findActiveElements() {
    this.container = this.video.closest('div[id*=dv-web-player]');
    this.video = this.container?.querySelector('video[src*=blob]');
  }

  findVideoContainer() {
    this.container = this.video.closest('div[id*=dv-web-player]');

    if (this.container) {
      this.adObserver = new MutationObserver(this.adMutationObserverCallback);
      this.adObserver.observe(this.container, {
        attributes: false,
        childList: true,
        subtree: true,
        characterData: false,
      });
    }
  }

  updateVideoElement(el) {
    if (el.nodeName !== 'VIDEO' || !el.src) return false;
    this.video = el;
    return true;
  }

  updateSkipCount() {
    const currentUrl = window.location.href;
    if (currentUrl !== this.history[this.history.length - 1]) {
      this.history.push(currentUrl);
      this.skips = 0;
    }
  }

  updateActiveElements(el) {
    const updated = this.updateVideoElement(el);
    if (updated) {
      this.findVideoContainer();
      this.updateSkipCount();
      return true;
    }
    return false;
  }

  containerMutationCallback(mutations) {
    let updated = false;
    for (const mutation of mutations) {
      if (['childList', 'subtree'].includes(mutation.type)) {
        for (const node of mutation.addedNodes) {
          updated = this.updateActiveElements(node);
          if (updated) break;
        }
      } else if (mutation.type === 'attributes') {
        const { target } = mutation;
        updated = this.updateActiveElements(target);
        if (updated) break;
      }

      if (updated) break;
    }
  }

  adMutationObserverCallback() {
    const timeRemaining = document.querySelector(
      'span[class*=-ad-timer-remaining-time]'
    );

    if (timeRemaining) {
      skipCount++;
      const [min = 0, sec = 0] = timeRemaining.textContent.split(':');
      const secondsRemaining = parseInt(min) * 60 + parseInt(sec);
      skipAd(secondsRemaining);
      this.adObserver.disconnect();
      setTimeout(() => {
        this.adObserver.observe(container, {
          attributes: false,
          childList: true,
          subtree: true,
          characterData: false,
        });
      }, 1000);
    }
  }

  togglePictureInPicture() {
    this.pictureInPicture = !this.pictureInPicture;
    if (this.pictureInPicture) {
      this.video.requestPictureInPicture();
    } else {
      this.video.exitPictureInPicture();
    }
  }

  _setupPictureInPictureButton() {
    const topButtonsCaptions = document.querySelector('[class*=-hideabletopbuttons-container] > div:first-child > div:first-child');
    const pipButtonWrapper = document.createElement('div');
    pipButtonWrapper.style.width = '32px';
    pipButtonWrapper.style.marginRight = '10px';
    const pipButton = document.createElement('button');
    pipButton.style.width = 'fit-content';
    pipButton.style.height = '32px';
    pipButton.addEventListener('click', () => {
      this.togglePictureInPicture();
    });
    pipButton.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 251 192" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="white"><path d="M95.1281 184H19C12.3726 184 7 178.627 7 172V19C7 12.3726 12.3726 7 19 7H125.5H232C238.627 7 244 12.3726 244 19V65.386" stroke-width="14" stroke-linecap="round"></path><path d="M184.5 96H236C240.418 96 244 99.5817 244 104V176.717C244 181.118 240.445 184.692 236.044 184.717L184.5 185L132.956 184.717C128.555 184.692 125 181.118 125 176.717V104C125 99.5817 128.582 96 133 96H184.5Z" stroke-width="14"></path><line x1="66" y1="77" x2="107" y2="77" stroke-width="14" stroke-linecap="round"></line><line x1="107" y1="36" x2="107" y2="77" stroke-width="14" stroke-linecap="round"></line><line x1="95.5269" y1="65.4264" x2="63" y2="32.8995" stroke-width="14" stroke-linecap="round"></line></svg>`;
    pipButtonWrapper.innerHTML = '';
    insertAdjacentElement(topButtonsCaptions, pipButtonWrapper);
  }

  _setupToast() {
    const styling = `.toast{animation: hidetoast 2.2s ease-in-out;backdrop-filter: blur(4px);background-color: #ffffff1c;border: 1px solid #ffffff1c;border-radius: 4px;box-shadow: 0 0 0 1px #0000000a, 0 0 8px 0 #0000000a inset;box-sizing: border-box;color: #ffffff;font-family: system-ui;font-weight: 200;height: max-content !important;left: 2rem;opacity: 0;padding: 8px 12px;position: absolute;top: 2rem;width: max-content !important;z-index: 9999}
    @keyframes hidetoast {0%{opacity: 0}25%{opacity: 1}50%{opacity: 1}75%{opacity: 1}99%{opacity: 0}100%{opacity: 0}}`;
    const styletag = document.createElement('style');
    styletag.setAttribute('type', 'text/css');
    styletag.innerHTML = styling;
    document.head.appendChild(styletag);
  }

  _makeToast() {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = 'Skipped ad';
    const label = `Skipped ad #${skipCount}`;
    toast.innerText = label;
    return toast;
  }

  _showToast() {
    const toast = this._makeToast();
    this.video.parentElement.appendChild(toast);
    setTimeout(() => toast.remove(), 2201);
  }

  skipAd(seconds) {
    /**
     * Skip by the specified seconds + 1 to ensure the ad's
     * playback is over
     */
    console.log(`[${this.skips}] Skipping ahead by ${seconds} seconds`);
    this.video.currentTime += seconds + 1;
    this.skips += 1;
    this._showToast();
  }

  _handleKeyPress(e) {
    if (e.key === 'p' && e.altKey) {
      e.preventDefault();
      this.togglePictureInPicture();
    }
  }
}
