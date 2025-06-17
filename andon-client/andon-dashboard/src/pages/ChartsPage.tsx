// ChartsPage.tsx
// grafica simple de incidencias por estacion usando Recharts
import { useIncidents } from '../hooks/useIncidents';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function ChartsPage() {
  const { data, isLoading } = useIncidents('all');

  if (isLoading) return <p>Cargando...</p>;
  if (!data?.length) return <p>No hay datos.</p>;

  // cuenta incidencias por estacion
  const counts: Record<string, number> = {};
  data.forEach((i: any) =>
    counts[i.station_id] = (counts[i.station_id] || 0) + 1
  );

  const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Incidencias por estacion</h1>
      <PieChart width={400} height={300}>
        <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={120}>
          {chartData.map((_, idx) => <Cell key={idx} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
