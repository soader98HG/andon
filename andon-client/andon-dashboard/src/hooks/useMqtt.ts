// useMqtt.ts
import { useEffect } from 'react';
import mqtt from 'mqtt';

export const useMqtt = (
  topic: string,
  cb: (msg: { topic: string; payload: any }) => void
) => {
  useEffect(() => {
    const client = mqtt.connect('ws://' + location.hostname + ':9001');
    client.on('connect', () => client.subscribe(topic));
    client.on('message', (tp, buf) => {
      try {
        cb({ topic: tp, payload: JSON.parse(buf.toString()) });
      } catch { /* ignore */ }
    });
    return () => {
      client.end();
    };
  }, [topic, cb]);
};
