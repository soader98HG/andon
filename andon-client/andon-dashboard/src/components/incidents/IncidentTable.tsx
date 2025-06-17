import { useIncidents, useCloseIncident } from '../../hooks/useIncidents';
import { useStation } from '../../contexts/StationContext';

export default function IncidentTable({ status }: { status: string }) {
  const { station } = useStation();
  const { data } = useIncidents(status, station);
  const close   = useCloseIncident();

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
                <button
                  onClick={() => close.mutate(i.id)}
                  className="bg-green-600 text-white px-2"
                >
                  Cerrar
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
