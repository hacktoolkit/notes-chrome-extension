chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
  let url = tabs[0].url;
  console.log('This is the url', url);
});
alert('Content Script is being running');
console.log('Why will this not work.');
