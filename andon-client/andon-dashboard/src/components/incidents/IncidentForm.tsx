import { useQuery } from '@tanstack/react-query';
import axios from '../../api';
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useStation } from '../../contexts/StationContext';
import { DEFECT_CODES } from '../../data/defects';

export default function IncidentForm() {
  const { station } = useStation();
  const { data: stations } = useQuery({
    queryKey: ['stations'],
    queryFn: () => axios.get('/stations').then(r => r.data)
  });
  const defects = DEFECT_CODES;

  const [form, setForm] = useState({
    station_id: '',
    defect_code: '',
    vehicle_id: '',
    problem: ''
  });

  const handle = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // keep form station_id in sync with currently seleccionada station
  useEffect(() => {
    setForm(f => ({ ...f, station_id: station }));
  }, [station]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/incidents', form);
      setForm({
        station_id: '',
        defect_code: '',
        vehicle_id: '',
        problem: ''
      });
    } catch (err) {
      alert('Error al reportar incidencia');
      console.error(err);
    }
  };

  return (
    <form onSubmit={submit} className="border p-4 rounded mt-4">
      <div className="flex gap-2 mb-2">
        <select
          required
          name="defect_code"
          value={form.defect_code}
          onChange={handle}
          className="border p-1"
          style={{ width: '33%' }}
        >
          <option value="">Codigo defecto</option>
          {defects.map(d => (
            <option key={d.code} value={d.code}>
              {d.code}-{d.description}
            </option>
          ))}
        </select>

        <select
          required
          name="station_id"
          value={form.station_id}
          onChange={handle}
          className="border p-1"
          style={{ flex: 1 }}
          disabled={!station}
        >
          <option value="">Estaci\u00f3n de Notificaci\u00f3n</option>
          {stations?.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          name="vehicle_id"
          placeholder="ID Veh\u00edculo"
          value={form.vehicle_id}
          onChange={handle}
          className="border p-1"
          style={{ flex: 1 }}
        />
      </div>

      <textarea
        name="problem"
        placeholder="Detalle del problema"
        value={form.problem}
        onChange={handle}
        className="border p-1 w-full mb-2"
      />

      <div className="flex" style={{ justifyContent: 'flex-end' }}>
        <button className="bg-blue-500 text-white px-4 py-1 rounded">
          Reportar
        </button>
      </div>
    </form>
  );
}
