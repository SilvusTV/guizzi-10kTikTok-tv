// UI helpers
let whiteoutTimer = 0;
let speakerTimer = 0;
let ytTimer = 0;

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

// Show a YouTube video overlay for a limited duration (default 10s), autoplay muted
export function showYouTubePreview(videoId, durationMs = 10000) {
  if (!videoId) return;
  // remove previous timer/overlay
  try { if (ytTimer) clearTimeout(ytTimer); } catch {}
  const prev = document.getElementById('yt-overlay');
  if (prev && prev.parentElement) {
    try { prev.parentElement.removeChild(prev); } catch {}
  }
  const overlay = document.createElement('div');
  overlay.id = 'yt-overlay';
  overlay.className = 'yt-overlay visible';
  overlay.setAttribute('aria-hidden', 'true');
  const frame = document.createElement('div');
  frame.className = 'yt-frame';
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    start: '0',
    end: '10',
    playsinline: '1',
    modestbranding: '1',
    rel: '0'
  });
  iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.appendChild(iframe);
  overlay.appendChild(frame);
  document.body.appendChild(overlay);

  ytTimer = setTimeout(() => {
    try {
      if (overlay && overlay.parentElement) overlay.parentElement.removeChild(overlay);
    } catch {}
    ytTimer = 0;
  }, Math.max(0, Number(durationMs) || 10000));
}
