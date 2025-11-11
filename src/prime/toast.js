const toastStyling = `.toast{animation: hidetoast 2.2s ease-in-out;backdrop-filter: blur(4px);background-color: #ffffff1c;border: 1px solid #ffffff1c;border-radius: 4px;box-shadow: 0 0 0 1px #0000000a, 0 0 8px 0 #0000000a inset;box-sizing: border-box;color: #ffffff;font-family: system-ui;font-weight: 200;height: max-content !important;left: 2rem;opacity: 0;padding: 8px 12px;position: absolute;top: 2rem;width: max-content !important;z-index: 9999}
@keyframes hidetoast {0%{opacity: 0}25%{opacity: 1}50%{opacity: 1}75%{opacity: 1}99%{opacity: 0}100%{opacity: 0}}`;

function initToast() {
  addStyling(toastStyling);
}

function createToast(text, parent) {
  if (parent) {
    const toastEl = document.createElement('div');
    toastEl.classList.add('toast');
    toastEl.innerText = text;

    parent.appendChild(toastEl);
    setTimeout(toastEl.remove, 2201);
  }
}

function adSkipToast(text) {
  const videoParent = document.querySelector('video[src]')?.parentElement;
  createToast(text, videoParent);
}
