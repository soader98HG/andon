import { useIncidents, useIncidentAction } from '../../hooks/useIncidents';
import { useStation } from '../../contexts/StationContext';
import { useState } from 'react';

export default function IncidentTable({ status }: { status: string }) {
  const { station } = useStation();
  const { data } = useIncidents(status, station);
  const [query, setQuery] = useState('');
  const action  = useIncidentAction();

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
          <th>ID</th><th>ESTACION</th><th>Defecto</th>
          <th>Vehiculo</th><th>Problema</th>
          <th>Reporte</th><th>Reproceso</th><th>Finalizado</th><th>Accion</th>
        </tr>
      </thead>
      <tbody>
        {filtered.map((i: any) => (
          <tr key={i.id} className="text-center">
            <td>{i.id}</td>
            <td>{i.station_id}</td>
            <td>{i.defect_code}</td>
            <td>{i.vehicle_id}</td>
            <td>{i.problem}</td>
            <td>{i.opened_at && new Date(i.opened_at).toLocaleString()}</td>
            <td>{i.reprocess_at && new Date(i.reprocess_at).toLocaleString()}</td>
            <td>{i.closed_at && new Date(i.closed_at).toLocaleString()}</td>
            <td>
              {i.status === 'open' && (
                <select
                  defaultValue=""
                  onChange={e => {
                    const val = e.target.value;
                    if(val) action.mutate({ id: i.id, action: val });
                  }}
                  className="border p-1"
                >
                  <option value="">Accion</option>
                  <option value="finalizado">finalizado</option>
                  <option value="reproceso">reproceso</option>
                </select>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {filtered.length === 0 && <p>No hay registros</p>}
    </div>
  );
}
