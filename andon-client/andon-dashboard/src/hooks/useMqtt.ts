// useMqtt.ts
import { useEffect } from "react";

type Listener = {
  topic: string;
  cb: (msg: { topic: string; payload: any }) => void;
};

let ws: WebSocket | null = null;
const listeners: Listener[] = [];
let connectionPromise: Promise<void> | null = null;

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

const connect = () => {
  if (!connectionPromise) {
    connectionPromise = new Promise((resolve, reject) => {
      const url = import.meta.env.VITE_WS_URL || `ws://${location.hostname}:8080`;
      ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("WebSocket connected");
        resolve();
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          console.log("WebSocket message received:", msg);
          listeners.forEach((l) => {
            if (matches(l.topic, msg.topic)) {
              console.log(`Dispatching to listener for topic: ${l.topic}`);
              l.cb(msg);
            }
          });
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      ws.onerror = (err) => {
        console.error("WebSocket error", err);
        reject(err);
        connectionPromise = null; // Allow reconnection attempts
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        ws = null;
        connectionPromise = null; // Allow reconnection attempts
      };
    });
  }
  return connectionPromise;
};

export const useMqtt = (
  topic: string,
  cb: (msg: { topic: string; payload: any }) => void,
) => {
  useEffect(() => {
    connect();

    const listener: Listener = { topic, cb };
    listeners.push(listener);

    return () => {
      const idx = listeners.indexOf(listener);
      if (idx !== -1) listeners.splice(idx, 1);
      // Note: We are not closing the WebSocket here to maintain a persistent connection
    };
  }, [topic, cb]);
};