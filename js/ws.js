// WebSocket connection with auto-reconnect and simple API
export function createWsConnection(url) {
  let ws = null;
  let connecting = false;
  let shouldReconnect = true;
  let backoff = 1000; // 1s → 10s cap

  let handlers = {
    onOpen: () => {},
    onMessage: (_ev) => {},
    onClose: () => {},
    onError: (_ev) => {},
  };

  function connect() {
    if (connecting || (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING))) return;
    connecting = true;
    try {
      ws = new WebSocket(url);
      ws.onopen = () => {
        connecting = false;
        backoff = 1000;
        handlers.onOpen();
      };
      ws.onmessage = (ev) => handlers.onMessage(ev);
      ws.onerror = (ev) => handlers.onError(ev);
      ws.onclose = () => {
        handlers.onClose();
        connecting = false;
        if (!shouldReconnect) return;
        const delay = Math.min(backoff, 10000);
        backoff = Math.min(backoff * 2, 10000);
        setTimeout(connect, delay);
      };
    } catch (e) {
      connecting = false;
      if (!shouldReconnect) return;
      const delay = Math.min(backoff, 10000);
      backoff = Math.min(backoff * 2, 10000);
      setTimeout(connect, delay);
    }
  }

  function send(obj) {
    try {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(typeof obj === 'string' ? obj : JSON.stringify(obj));
      }
    } catch {}
  }

  function isOpen() {
    return !!ws && ws.readyState === WebSocket.OPEN;
  }

  function close() {
    try { if (ws) ws.close(); } catch {}
  }

  function setHandlers(nextHandlers) {
    handlers = { ...handlers, ...nextHandlers };
  }

  function setShouldReconnect(v) { shouldReconnect = !!v; }

  return { connect, send, isOpen, close, setHandlers, setShouldReconnect };
}
