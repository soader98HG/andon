import { useIncidents, useIncidentAction } from '../../hooks/useIncidents';
import { useStation } from '../../contexts/StationContext';
import { useState } from 'react';

export default function IncidentTable({ status }: { status: string }) {
  const { station } = useStation();
  const { data } = useIncidents(status, station);
  const [query, setQuery] = useState('');
  const action = useIncidentAction();

  if (!data) return <p>Cargando...</p>;

  const filtered = query
    ? data.filter((i: any) => i.vehicle_id?.includes(query))
    : data;

  return (
    <div className="w-full mt-2">
      {status !== 'open' && (
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar ID Veh\u00edculo"
          className="border p-1 mb-2 w-full"
        />
      )}
      <table className="w-full border">
      <thead>
        <tr>
          <th>Estaci\u00f3n</th>
          <th>C\u00f3digo</th>
          <th>Descripci\u00f3n</th>
          <th>ID Veh\u00edculo</th>
          <th>Reporte</th>
          <th>Recibido</th>
          <th>Reproceso</th>
          <th>Finalizado</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((i: any) => (
          <tr key={i.id} className="text-center">
            <td>{i.station_id}</td>
            <td>{i.defect_code}</td>
            <td>{i.problem}</td>
            <td>{i.vehicle_id}</td>
            <td>{i.opened_at && new Date(i.opened_at).toLocaleString()}</td>
            <td>{i.received_at && new Date(i.received_at).toLocaleString()}</td>
            <td>{i.reprocess_at && new Date(i.reprocess_at).toLocaleString()}</td>
            <td>{i.closed_at && new Date(i.closed_at).toLocaleString()}</td>
            <td>
              {i.status === 'open' ? (
                <select
                  defaultValue=""
                  onChange={e => {
                    const val = e.target.value;
                    if (val) action.mutate({ id: i.id, action: val });
                  }}
                  className="border p-1"
                >
                  <option value="">Acci\u00f3n</option>
                  <option value="recibido">Recibido</option>
                  <option value="reproceso">Reproceso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              ) : (
                i.status
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {filtered.length === 0 && (
      <p className="text-center">No hay registros</p>
    )}
    </div>
  );
}
