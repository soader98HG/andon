import { useIncidents, useIncidentAction } from '../../hooks/useIncidents';
import { useStation } from '../../contexts/StationContext';

export default function IncidentTable({ status }: { status: string }) {
  const { station } = useStation();
  const { data } = useIncidents(status, station);
  const action  = useIncidentAction();

  if (!data) return <p>Cargando...</p>;

  return (
    <table className="w-full border mt-2">
      <thead>
        <tr>
          <th>ID</th><th>Estacion</th><th>Defecto</th>
          <th>Vehiculo</th><th>Abierto</th><th>Accion</th>
        </tr>
      </thead>
      <tbody>
        {data.map((i: any) => (
          <tr key={i.id} className="text-center">
            <td>{i.id}</td>
            <td>{i.station_id}</td>
            <td>{i.defect_code}</td>
            <td>{i.vehicle_id}</td>
            <td>{new Date(i.opened_at).toLocaleTimeString()}</td>
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
                  <option value="recibido">recibido</option>
                </select>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
