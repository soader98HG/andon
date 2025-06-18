// useMqtt.ts
import { useEffect } from "react";

type Listener = {
  topic: string;
  cb: (msg: { topic: string; payload: any }) => void;
};

let ws: WebSocket | null = null;
const listeners: Listener[] = [];

const matches = (filter: string, topic: string) => {
  const fs = filter.split("/");
  const ts = topic.split("/");
  for (let i = 0; i < fs.length; i++) {
    const f = fs[i];
    const t = ts[i];
    if (f === "#") return true;
    if (f === "+") continue;
    if (f !== t) return false;
  }
  return fs.length === ts.length;
};

export const useMqtt = (
  topic: string,
  cb: (msg: { topic: string; payload: any }) => void,
) => {
  useEffect(() => {
    const url = import.meta.env.VITE_WS_URL || `ws://${location.hostname}:8080`;

    if (!ws || ws.readyState === WebSocket.CLOSED) {
      ws = new WebSocket(url);
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          listeners.forEach((l) => {
            if (matches(l.topic, msg.topic)) l.cb(msg);
          });
        } catch {
          /* ignore */
        }
      };
    }

    const listener: Listener = { topic, cb };
    listeners.push(listener);

    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
      if (ws && listeners.length === 0) {
        ws.close();
        ws = null;
      }
    };
  }, [topic, cb]);
};
