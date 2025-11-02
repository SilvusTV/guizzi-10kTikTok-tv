import { getParams, getWsUrl, DEFAULT_PING_INTERVAL, DEFAULT_SCRAPE_INTERVAL } from './config.js';
import { getElements, show as uiShow, setStatus as uiSetStatus, triggerWhiteout, showSpeakerIcon, showYouTubePreview } from './ui.js';
import { createWsConnection } from './ws.js';
import { handleWsMessage } from './handlers.js';

(function () {
  const { base, username } = getParams();
  const { elValue, elStatus } = getElements();

  function show(text) { uiShow(elValue, text); }
  function setStatus(text) { uiSetStatus(elStatus, text); }

  let lastGood = '';
  const getLastGood = () => lastGood;
  const setLastGood = (txt) => { lastGood = txt || ''; };

  const wsUrl = getWsUrl(base);
  const conn = createWsConnection(wsUrl);

  // Timers
  let keepAliveTimerId = 0;
  let periodicTimerId = 0;

  function stopWsTimers() {
    if (keepAliveTimerId) { try { clearInterval(keepAliveTimerId); } catch {} keepAliveTimerId = 0; }
    if (periodicTimerId) { try { clearInterval(periodicTimerId); } catch {} periodicTimerId = 0; }
  }

  function startWsTimers() {
    stopWsTimers();
    // ping every 30s
    keepAliveTimerId = setInterval(() => {
      try { if (conn.isOpen()) conn.send({ type: 'ping', ts: Date.now() }); } catch {}
    }, DEFAULT_PING_INTERVAL);
    // periodic scrape every 120s
    periodicTimerId = setInterval(() => {
      requestScrape();
    }, DEFAULT_SCRAPE_INTERVAL);
  }

  function requestScrape() {
    try {
      if (conn.isOpen()) {
        conn.send({ type: 'tiktok:scrape', payload: { username } });
        setStatus(`Commande WS envoyée pour @${username}…`);
        if (!lastGood) show('…');
      }
    } catch {}
  }

  // Handlers
  conn.setHandlers({
    onOpen: () => {
      setStatus(`WS connecté à ${wsUrl} — envoi de la commande…`);
      startWsTimers();
      requestScrape();
    },
    onMessage: (ev) => {
      handleWsMessage(ev, { username, show, setStatus, triggerWhiteout, showSpeakerIcon, showYouTubePreview, getLastGood, setLastGood });
    },
    onClose: () => {
      setStatus('WS déconnecté');
      stopWsTimers();
    },
    onError: () => {
      // erreur silencieuse, la reconnexion est gérée par ws.js via onClose
    }
  });

  // Start
  setStatus(`Connexion WS ${wsUrl}…`);
  conn.connect();

  window.addEventListener('beforeunload', () => {
    conn.setShouldReconnect(false);
    stopWsTimers();
    try { conn.close(); } catch {}
  });
})();
