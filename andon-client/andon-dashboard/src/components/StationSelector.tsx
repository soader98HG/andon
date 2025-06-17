import { useStations } from '../hooks/useStations';
import { useStation } from '../contexts/StationContext';

export default function StationSelector() {
  const { data: stations } = useStations();
  const { station, setStation } = useStation();
  if (!stations) return null;
  return (
    <select
      value={station}
      onChange={e => setStation(e.target.value)}
      className="border px-2 py-1 rounded"
    >
      <option value="">Estaci\u00f3n</option>
      {stations.map((s: any) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}
