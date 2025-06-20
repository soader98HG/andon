// ChartsPage.tsx
// vista de graficas con filtros por fecha, estacion y codigo
import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useStations } from '../hooks/useStations';
import { DEFECT_CODES } from '../data/defects';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export default function ChartsPage() {
  const { data, isLoading } = useIncidents('all');
  const { data: stations } = useStations();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [st, setSt] = useState('all');
  const [def, setDef] = useState('all');
  const [type, setType] = useState<'bar' | 'line'>('bar');

  if (isLoading || !stations) return <p>Cargando...</p>;
  if (!data?.length) return <p>No hay datos.</p>;

  const filtered = data.filter((i: any) => {
    const d = new Date(i.opened_at);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to + 'T23:59:59')) return false;
    if (st !== 'all' && String(i.station_id) !== st) return false;
    if (def !== 'all' && i.defect_code !== def) return false;
    return true;
  });

  const counts: Record<string, number> = {};
  filtered.forEach((i: any) => {
    const day = String(i.opened_at).slice(0, 10);
    counts[day] = (counts[day] || 0) + 1;
  });
  const chartData = Object.entries(counts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="border p-1"
        />
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="border p-1"
        />
        <select
          value={st}
          onChange={e => setSt(e.target.value)}
          className="border p-1"
        >
          <option value="all">Todas</option>
          {stations.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={def}
          onChange={e => setDef(e.target.value)}
          className="border p-1"
        >
          <option value="all">Todos</option>
          {DEFECT_CODES.map(d => (
            <option key={d.code} value={d.code}>
              {d.code}-{d.description}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={e => setType(e.target.value as 'bar' | 'line')}
          className="border p-1 ml-auto"
        >
          <option value="bar">Barras</option>
          <option value="line">Líneas</option>
        </select>
      </div>
      <div className="border-2 border-dashed p-4 bg-white">
        <ResponsiveContainer width="100%" height={300}>
          {type === 'bar' ? (
            <BarChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
