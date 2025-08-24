chrome.runtime.onMessage.addListener((msg, sender) => {
  if (['muteTab', 'unmuteTab'].includes(msg.action) && sender.tab) {
    const muted = msg.action === 'muteTab';
    chrome.tabs.update(sender.tab.id, { muted });
  }
});
