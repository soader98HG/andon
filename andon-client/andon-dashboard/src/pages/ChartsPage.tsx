// ChartsPage.tsx
// grafica simple de incidencias por estacion usando Recharts
import { useIncidents } from '../hooks/useIncidents';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { useStation } from '../contexts/StationContext';
import { useState } from 'react';

export default function ChartsPage() {
  const { station } = useStation();
  const { data, isLoading } = useIncidents('all', station);
  const [range, setRange] = useState<'all' | '24h' | '7d'>('all');
  const [type, setType]   = useState<'pie' | 'bar'>('pie');

  if (isLoading) return <p>Cargando...</p>;
  if (!data?.length) return <p>No hay datos.</p>;

  const now = Date.now();
  const filtered = data.filter((i: any) => {
    const t = new Date(i.opened_at).getTime();
    if(range === '24h') return now - t <= 86400000;
    if(range === '7d')  return now - t <= 604800000;
    return true;
  });

  // cuenta incidencias por estacion
  const counts: Record<string, number> = {};
  filtered.forEach((i: any) =>
    counts[i.station_id] = (counts[i.station_id] || 0) + 1
  );

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Incidencias por ESTACION</h1>
      <div className="flex gap-2 mb-4">
        <select value={range} onChange={e => setRange(e.target.value as any)} className="border p-1">
          <option value="all">Todas</option>
          <option value="24h">\u00dAltimas 24h</option>
          <option value="7d">\u00dAltima semana</option>
        </select>
        <select value={type} onChange={e => setType(e.target.value as any)} className="border p-1">
          <option value="pie">Pastel</option>
          <option value="bar">Barras</option>
        </select>
      </div>
      {type === 'pie' ? (
        <PieChart width={400} height={300}>
          <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={120}>
            {chartData.map((_, idx) => <Cell key={idx} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      ) : (
        <BarChart width={400} height={300} data={chartData}>
          <XAxis dataKey="name" /><YAxis />
          <Tooltip />
          <Bar dataKey="value" />
        </BarChart>
      )}
    </div>
  );
}
