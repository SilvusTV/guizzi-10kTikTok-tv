// Message handlers: parse and route incoming WS events
// ctx: { username, show(text), setStatus(text), triggerWhiteout(), getLastGood(), setLastGood(text) }
export function handleWsMessage(ev, ctx) {
  const { username, show, setStatus, triggerWhiteout, getLastGood, setLastGood } = ctx;
  try {
    let rawPayload = ev.data;
    let obj;
    if (typeof rawPayload === 'string') {
      try { obj = JSON.parse(rawPayload); } catch {}
      if (!obj) {
        // Fallback: formats simples, ex: "tiktok:don:2"
        const s = rawPayload.trim();
        const parts = s.split(/[: ,]+/);
        if (parts.length >= 3 && parts[0] === 'tiktok' && parts[1] === 'don') {
          obj = { type: 'tiktok:don', data: Number(parts[2]) };
        }
      }
    } else if (rawPayload instanceof Blob) {
      // Lire Blob comme texte puis reparser
      const reader = new FileReader();
      reader.onload = () => handleWsMessage({ data: String(reader.result || '') }, ctx);
      reader.readAsText(rawPayload);
      return;
    }

    const type = obj && (obj.type || (obj.event && obj.event.type));
    const msgPayload = obj && (obj.payload || obj.data || {});

    // 1) Followers update
    if (type === 'tiktok:followers') {
      const u = (msgPayload && (msgPayload.username || msgPayload.user)) || '';
      const sameUser = !u || u.toLowerCase() === username.toLowerCase();
      if (sameUser) {
        const followers = msgPayload && (msgPayload.followers ?? msgPayload.value ?? msgPayload.count);
        if (followers != null) {
          const text = String(followers);
          show(text);
          setLastGood(text);
          const dur = msgPayload && typeof msgPayload.durationMs === 'number' ? ` en ${msgPayload.durationMs} ms` : '';
          setStatus(`Reçu via WS${dur}`);
        }
      }
      return;
    }

    // 2) Errors
    if (type === 'tiktok:followers:error' || type === 'tiktok:scrape:error') {
      const u = (msgPayload && (msgPayload.username || msgPayload.user)) || '';
      const sameUser = !u || u.toLowerCase() === username.toLowerCase();
      if (sameUser) {
        const message = (msgPayload && msgPayload.message) || 'Erreur inconnue';
        if (!getLastGood()) show('—');
        setStatus(`Erreur scraping: ${message}`);
      }
      return;
    }

    // 3) ACK / done
    if (type === 'ack' && msgPayload && msgPayload.cmd === 'tiktok:scrape') {
      const u = (msgPayload && msgPayload.username) || '';
      const sameUser = !u || u.toLowerCase() === username.toLowerCase();
      if (sameUser) setStatus(`Job TikTok lancé pour @${u || username}…`);
      return;
    }
    if (type === 'tiktok:scrape:done') {
      const u = (msgPayload && msgPayload.username) || '';
      const sameUser = !u || u.toLowerCase() === username.toLowerCase();
      if (sameUser && msgPayload && msgPayload.followers != null) {
        const text = String(msgPayload.followers);
        show(text);
        setLastGood(text);
        setStatus('Terminé (via WS)');
      }
      return;
    }

    // 4) Don / trigger
    if (type === 'tiktok:don') {
      if (msgPayload && typeof msgPayload === 'object' && ('amount' in msgPayload)) {
        const amount = Number(msgPayload.amount);
        // Placeholder: votre logique custom ici
        if (!Number.isNaN(amount) && amount === 2) {
          triggerWhiteout();
        }
        return;
      }
      const val = (msgPayload != null ? Number(msgPayload) : Number(obj && obj.data));
      if (!Number.isNaN(val) && val === 2) {
        triggerWhiteout();
      }
      return;
    }
  } catch (e) {
    console.warn('WS message parse error:', e);
  }
}
