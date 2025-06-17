import IncidentForm from '../components/incidents/IncidentForm';
import IncidentTable from '../components/incidents/IncidentTable';
import { useState } from 'react';

export default function IncidentsPage() {
  const [tab, setTab] = useState<'open' | 'closed'>('open');

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Incidencias</h1>

      <IncidentForm />

      <div className="mt-4">
        <button
          onClick={() => setTab('open')}
          className={`px-4 py-1 ${tab === 'open' ? 'bg-gray-300' : ''}`}
        >
          Activas
        </button>
        <button
          onClick={() => setTab('closed')}
          className={`px-4 py-1 ${tab === 'closed' ? 'bg-gray-300' : ''}`}
        >
          Histórico
        </button>
      </div>

      <IncidentTable status={tab === 'open' ? 'open' : 'all'} />
    </div>
  );
}
