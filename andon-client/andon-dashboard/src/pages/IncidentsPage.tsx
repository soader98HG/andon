import IncidentForm from '../components/incidents/IncidentForm';
import IncidentTable from '../components/incidents/IncidentTable';
import ChartsPage from './ChartsPage';
import { useState } from 'react';
import { useStation } from '../contexts/StationContext';
import { useIncidentSync } from '../hooks/useIncidentSync';

export default function IncidentsPage() {
  const [tab, setTab] = useState<'open' | 'closed' | 'charts'>('open');
  const { station } = useStation();
  useIncidentSync();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Incidencias</h1>
      {station === '' && (
        <p className="text-red-600">Selecciona una ESTACION para operar.</p>
      )}

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
        <button
          onClick={() => setTab('charts')}
          className={`px-4 py-1 ${tab === 'charts' ? 'bg-gray-300' : ''}`}
        >
          Gráficas
        </button>
      </div>

      {tab === 'charts' ? (
        <ChartsPage />
      ) : (
        <IncidentTable status={tab === 'open' ? 'open' : 'all'} />
      )}
    </div>
  );
}
