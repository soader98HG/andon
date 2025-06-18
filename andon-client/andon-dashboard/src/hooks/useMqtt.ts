// useMqtt.ts
import { useEffect } from 'react';

const matches = (filter: string, topic: string) => {
  const fs = filter.split('/');
  const ts = topic.split('/');
  for (let i = 0; i < fs.length; i++) {
    const f = fs[i];
    const t = ts[i];
    if (f === '#') return true;
    if (f === '+') continue;
    if (f !== t) return false;
  }
  return fs.length === ts.length;
};

export const useMqtt = (
  topic: string,
  cb: (msg: { topic: string; payload: any }) => void
) => {
  useEffect(() => {
    const url =
      import.meta.env.VITE_WS_URL || `ws://${location.hostname}:8080`;
    const ws = new WebSocket(url);
    ws.onmessage = ev => {
      try {
        const msg = JSON.parse(ev.data);
        if (matches(topic, msg.topic)) cb(msg);
      } catch { /* ignore */ }
    };
    return () => {
      ws.close();
    };
  }, [topic, cb]);
};
