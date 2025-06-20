// ChartsPage.tsx
// vista de graficas con filtros por fecha, estacion y agrupacion
import { useState } from 'react';
import { useIncidents } from '../hooks/useIncidents';
import { useStations } from '../hooks/useStations';
// lista de defectos ya no se usa en esta vista
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = [
  '#8884d8',
  '#82ca9d',
  '#ffc658',
  '#8dd1e1',
  '#ff8042',
  '#a4de6c',
  '#d0ed57'
];

export default function ChartsPage() {
  const { data, isLoading } = useIncidents('all');
  const { data: stations } = useStations();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [st, setSt] = useState('all');
  const [group, setGroup] = useState<'day' | 'station'>('day');
  const [type, setType] = useState<'bar' | 'line' | 'pie'>('bar');

  if (isLoading || !stations) return <p>Cargando...</p>;
  if (!data?.length) return <p>No hay datos.</p>;

  const filtered = data.filter((i: any) => {
    const d = new Date(i.opened_at);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to + 'T23:59:59')) return false;
    if (st !== 'all' && String(i.station_id) !== st) return false;
    return true;
  });

  const counts: Record<string, number> = {};
  filtered.forEach((i: any) => {
    const key =
      group === 'day'
        ? String(i.opened_at).slice(0, 10)
        : stations.find((s: any) => String(s.id) === String(i.station_id))?.name ||
          String(i.station_id);
    counts[key] = (counts[key] || 0) + 1;
  });
  const chartData = Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

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
          value={group}
          onChange={e => setGroup(e.target.value as 'day' | 'station')}
          className="border p-1"
        >
          <option value="day">Por día</option>
          <option value="station">Por estación</option>
        </select>
        <select
          value={type}
          onChange={e => setType(e.target.value as 'bar' | 'line' | 'pie')}
          className="border p-1 ml-auto"
        >
          <option value="bar">Barras</option>
          <option value="line">Líneas</option>
          <option value="pie">Pastel</option>
        </select>
      </div>
      <div className="border-2 border-dashed p-4 bg-white">
        <ResponsiveContainer width="100%" height={300}>
          {type === 'bar' ? (
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          ) : type === 'line' ? (
            <LineChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          ) : (
            <PieChart>
              <Pie data={chartData} dataKey="count" nameKey="name" outerRadius={100} label>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
