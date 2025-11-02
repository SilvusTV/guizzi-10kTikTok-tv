// UI helpers
export function getElements() {
  const elValue = document.getElementById('value');
  const elStatus = document.getElementById('status');
  if (!elValue || !elStatus) throw new Error('UI elements not found');
  return { elValue, elStatus };
}

export function show(elValue, text) {
  elValue.textContent = text;
}

export function setStatus(elStatus, msg) {
  elStatus.textContent = msg || '';
}

export function triggerWhiteout() {
  document.body.classList.add('whiteout');
}
