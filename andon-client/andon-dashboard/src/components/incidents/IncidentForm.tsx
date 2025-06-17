import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FormEvent, useState } from 'react';

export default function IncidentForm() {
  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: () => axios.get('/stations').then(r => r.data)
  });
  const { data: defects } = useQuery({
    queryKey: ['defects'],
    queryFn: () => axios.get('/defects').then(r => r.data)
  });

  const [form, setForm] = useState({
    station_id: '',
    defect_code: '',
    vehicle_id: ''
  });

  const handle = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await axios.post('/incidents', form);
    setForm({ station_id: '', defect_code: '', vehicle_id: '' });
  };

  return (
    <form onSubmit={submit} className="space-y-2 border p-4 rounded mt-4">
      <select
        required
        name="station_id"
        value={form.station_id}
        onChange={handle}
        className="border p-1 w-full"
      >
        <option value="">Estacion</option>
        {stations?.map((s: any) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        required
        name="defect_code"
        value={form.defect_code}
        onChange={handle}
        className="border p-1 w-full"
      >
        <option value="">Codigo defecto</option>
        {defects?.map((d: any) => (
          <option key={d.code} value={d.code}>
            {d.code}-{d.description}
          </option>
        ))}
      </select>

      <input
        name="vehicle_id"
        placeholder="Vehiculo ID"
        value={form.vehicle_id}
        onChange={handle}
        className="border p-1 w-full"
      />

      <button className="bg-blue-500 text-white px-4 py-1 rounded">
        Crear
      </button>
    </form>
  );
}
