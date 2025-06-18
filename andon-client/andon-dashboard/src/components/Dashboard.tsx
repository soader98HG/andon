import { useStations } from '../hooks/useStations';
import { useIncidents } from '../hooks/useIncidents';
import { useMqtt } from '../hooks/useMqtt';
import { useEffect, useState } from 'react';

type Station = { id: string; name: string; color: string };

export default function Dashboard() {
  const { data: stations } = useStations();
  const { data: incidents } = useIncidents('open');
  const [view, setView] = useState<Station[]>([]);

  useEffect(() => {
    if (!stations) return;
    const mapped = stations.map((s: any) => {
      const inc = incidents?.find((i: any) => String(i.station_id) === String(s.id));
      const color = inc ? (inc.reprocess_at ? 'amarillo' : 'rojo') : 'verde';
      return { ...s, color };
    });
    setView(mapped);
  }, [stations, incidents]);

  useMqtt('andon/station/+/state', ({ topic, payload }) => {
    const station = topic.split('/')[2];
    setView(v =>
      v.map(st => (st.id === station ? { ...st, color: payload.color } : st))
    );
  });

  if (!view.length) return <p>Cargando...</p>;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {view.map(st => (
        <div
          key={st.id}
          className={`border p-4 rounded
            ${st.color === 'rojo' ? 'bg-red-300' :
              st.color === 'amarillo' ? 'bg-yellow-200' : 'bg-green-200'}`}
        >
          <h2 className="font-bold text-lg">{st.name}</h2>
          <p>{st.color}</p>
        </div>
      ))}
    </div>
  );
}
