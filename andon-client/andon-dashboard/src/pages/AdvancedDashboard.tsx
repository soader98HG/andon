import React, { useState, useEffect } from 'react';
import {
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
  CartesianGrid,
  Legend
} from 'recharts';

// estaciones fijas
const stations = [
  { id: 'estA', name: 'Estaci\u00f3n A' },
  { id: 'estB', name: 'Estaci\u00f3n B' },
  { id: 'estC', name: 'Estaci\u00f3n C' }
];

// defectos clasificados por origen
const defects = [
  { code: 'AMD', label: 'A. MET\u00c1LICO DEFICIENTE', origin: 'estA' },
  { code: 'HOL', label: 'HOLGURA', origin: 'estA' },
  { code: 'ENR', label: 'ENRASE DEFECTUOSO', origin: 'estB' },
  { code: 'MJD', label: 'MARCAS DE LIJADO', origin: 'estB' },
  { code: 'ESQ', label: 'ESQUIRLAS', origin: 'estC' },
  { code: 'MSD', label: 'MAL SOLDADO', origin: 'estC' }
];

const statusOptions = ['Notificado', 'Aceptado', 'Finalizado'];
const chartTypes = ['Barras', 'L\u00edneas', 'Pastel'];
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#a4de6c'];

type Report = {
  reporter: string;
  origin: string;
  code: string;
  label: string;
  vehicleId: string;
  date: string;
  status: string;
  finalDate?: string;
};

export default function AdvancedDashboard() {
  const [currentStation, setCurrentStation] = useState(stations[0].id);
  const [selectedDefect, setSelectedDefect] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [tab, setTab] = useState<'active' | 'history' | 'analytics'>('active');

  const [searchVehicle, setSearchVehicle] = useState('');

  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');
  const [filterStation, setFilterStation] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [selectedChart, setSelectedChart] = useState(chartTypes[0]);

  useEffect(() => {
    const avail = defects.find(d => d.origin !== currentStation);
    setSelectedDefect(avail?.code || '');
  }, [currentStation]);

  const availableDefects = defects.filter(d => d.origin !== currentStation);

  const handleAddReport = () => {
    if (!selectedDefect || !vehicleId) return;
    const defect = defects.find(d => d.code === selectedDefect)!;
    const newRep: Report = {
      reporter: currentStation,
      origin: defect.origin,
      code: defect.code,
      label: defect.label,
      vehicleId,
      date: new Date().toISOString(),
      status: 'Notificado'
    };
    setReports(prev => [...prev, newRep]);
    setVehicleId('');
  };

  const handleStatusChange = (index: number, newStatus: string) => {
    setReports(prev => {
      const up = [...prev];
      up[index].status = newStatus;
      if (newStatus === 'Finalizado')
        up[index].finalDate = new Date().toISOString();
      else delete up[index].finalDate;
      return up;
    });
  };

  const filteredReports = reports.filter(rep => {
    const rel = rep.reporter === currentStation || rep.origin === currentStation;
    if (!rel) return false;
    if (tab === 'active') return rep.status !== 'Finalizado';
    if (tab === 'history')
      return (
        rep.status === 'Finalizado' &&
        (!searchVehicle || rep.vehicleId.includes(searchVehicle))
      );
    return true;
  });

  const analyticsData = reports.filter(rep => {
    let ok = true;
    if (filterStart) ok = ok && rep.date >= filterStart;
    if (filterEnd) ok = ok && rep.date <= filterEnd;
    if (filterStation) ok = ok && (rep.reporter === filterStation || rep.origin === filterStation);
    if (filterCode) ok = ok && rep.code === filterCode;
    return ok;
  });

  const barData = Object.entries(
    analyticsData.reduce((acc, r) => {
      acc[r.code] = (acc[r.code] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([code, count]) => ({ code, count }));

  const lineData = analyticsData
    .map(r => ({ date: new Date(r.date).toLocaleDateString(), count: 1 }))
    .reduce((acc, r) => {
      const item = acc.find(i => i.date === r.date);
      if (item) item.count += 1;
      else acc.push({ ...r });
      return acc;
    }, [] as { date: string; count: number }[]);

  const pieData = barData;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard de Incidencias Andon</h1>
      <div className="mb-4">
        <label className="block mb-2 font-medium">Estaci\u00f3n Actual</label>
        <select
          value={currentStation}
          onChange={e => setCurrentStation(e.target.value)}
          className="w-64 border rounded p-2"
        >
          {stations.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4 mb-4">
        {['active', 'history', 'analytics'].map(t => (
          <button
            key={t}
            className={`px-4 py-2 rounded ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setTab(t as any)}
          >
            {t === 'active' ? 'Incidencias Activas' : t === 'history' ? 'Historial' : 'Gr\u00e1ficas'}
          </button>
        ))}
      </div>
      {tab === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block mb-2 font-medium">C\u00f3digo de Defecto</label>
            <select
              value={selectedDefect}
              onChange={e => setSelectedDefect(e.target.value)}
              className="w-full border rounded p-2"
            >
              {availableDefects.map(d => (
                <option key={d.code} value={d.code}>
                  {d.code + ' - ' + d.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 font-medium">ID Veh\u00edculo</label>
            <input
              type="text"
              value={vehicleId}
              onChange={e => setVehicleId(e.target.value)}
              placeholder="ID veh\u00edculo"
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex items-end lg:col-span-2">
            <button
              disabled={!selectedDefect || !vehicleId}
              onClick={handleAddReport}
              className="bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reportar
            </button>
          </div>
        </div>
      )}
      {(tab === 'active' || tab === 'history') && (
        <div>
          {tab === 'history' && (
            <div className="mb-4">
              <label className="block mb-2">Buscar ID Veh\u00edculo</label>
              <input
                type="text"
                value={searchVehicle}
                onChange={e => setSearchVehicle(e.target.value)}
                placeholder="Filtrar por ID"
                className="border rounded p-2 w-64"
              />
            </div>
          )}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr>
                <th className="border p-2">Quien</th>
                <th className="border p-2">Origen</th>
                <th className="border p-2">C\u00f3digo</th>
                <th className="border p-2">Descripci\u00f3n</th>
                <th className="border p-2">ID Veh\u00edculo</th>
                <th className="border p-2">Fecha</th>
                <th className="border p-2">Estado</th>
                <th className="border p-2">Finalizado</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No hay registros
                  </td>
                </tr>
              ) : (
                filteredReports.map((r, i) => {
                  const idx = reports.findIndex(rr => rr === r);
                  const rec = r.origin === currentStation;
                  return (
                    <tr key={i} className="odd:bg-gray-50">
                      <td className="border p-2">
                        {stations.find(s => s.id === r.reporter)?.name}
                      </td>
                      <td className="border p-2">
                        {stations.find(s => s.id === r.origin)?.name}
                      </td>
                      <td className="border p-2">{r.code}</td>
                      <td className="border p-2">{r.label}</td>
                      <td className="border p-2">{r.vehicleId}</td>
                      <td className="border p-2">
                        {new Date(r.date).toLocaleString()}
                      </td>
                      <td className="border p-2">
                        {tab === 'active' && rec ? (
                          <select
                            value={r.status}
                            onChange={e => handleStatusChange(idx, e.target.value)}
                            className="border rounded p-1"
                          >
                            {statusOptions.map(o => (
                              <option key={o} value={o}>
                                {o}
                              </option>
                            ))}
                          </select>
                        ) : (
                          r.status
                        )}
                      </td>
                      <td className="border p-2">
                        {r.finalDate ? new Date(r.finalDate).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'analytics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label>Desde</label>
              <input
                type="date"
                value={filterStart}
                onChange={e => setFilterStart(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label>Hasta</label>
              <input
                type="date"
                value={filterEnd}
                onChange={e => setFilterEnd(e.target.value)}
                className="border rounded p-2"
              />
            </div>
            <div>
              <label>Estaci\u00f3n</label>
              <select
                value={filterStation}
                onChange={e => setFilterStation(e.target.value)}
                className="border rounded p-2"
              >
                <option value="">Todas</option>
                {stations.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>C\u00f3digo de Error</label>
              <select
                value={filterCode}
                onChange={e => setFilterCode(e.target.value)}
                className="border rounded p-2"
              >
                <option value="">Todos</option>
                {defects.map(d => (
                  <option key={d.code} value={d.code}>
                    {d.code}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Tipo Gr\u00e1fica</label>
              <select
                value={selectedChart}
                onChange={e => setSelectedChart(e.target.value)}
                className="border rounded p-2"
              >
                {chartTypes.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedChart === 'Barras' && (
            <BarChart width={600} height={300} data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="code" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          )}
          {selectedChart === 'L\u00edneas' && (
            <LineChart width={600} height={300} data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" />
            </LineChart>
          )}
          {selectedChart === 'Pastel' && (
            <PieChart width={400} height={400}>
              <Pie
                data={pieData}
                dataKey="count"
                nameKey="code"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </div>
      )}
    </div>
  );
}
