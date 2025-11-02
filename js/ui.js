// UI helpers
let whiteoutTimer = 0;
let speakerTimer = 0;

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

// Trigger a whiteout effect for a given duration (ms). Default 7000ms.
export function triggerWhiteout(durationMs = 7000) {
  try { if (whiteoutTimer) clearTimeout(whiteoutTimer); } catch {}
  document.body.classList.add('whiteout');
  whiteoutTimer = setTimeout(() => {
    document.body.classList.remove('whiteout');
    whiteoutTimer = 0;
  }, Math.max(0, Number(durationMs) || 7000));
}

// Show a big speaker icon at the top-center for a given duration (ms). Default 5000ms.
export function showSpeakerIcon(durationMs = 5000) {
  let el = document.getElementById('speaker-overlay');
  if (!el) {
    el = document.createElement('div');
    el.id = 'speaker-overlay';
    el.className = 'speaker-overlay';
    el.setAttribute('aria-hidden', 'true');
    el.textContent = '🔊';
    document.body.appendChild(el);
  }
  // Reset any previous timer and (re)show
  try { if (speakerTimer) clearTimeout(speakerTimer); } catch {}
  el.classList.add('visible');
  speakerTimer = setTimeout(() => {
    el.classList.remove('visible');
    speakerTimer = 0;
  }, Math.max(0, Number(durationMs) || 5000));
}
