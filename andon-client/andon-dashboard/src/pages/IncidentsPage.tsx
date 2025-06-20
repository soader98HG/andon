import IncidentForm from '../components/incidents/IncidentForm';
import IncidentTable from '../components/incidents/IncidentTable';
import ChartsPage from './ChartsPage';
import { useState } from 'react';
import { useStation } from '../contexts/StationContext';
import { useIncidentSync } from '../hooks/useIncidentSync';
import StationSelector from '../components/StationSelector';

export default function IncidentsPage() {
  const [tab, setTab] = useState<'open' | 'closed' | 'charts'>('open');
  const { station } = useStation();
  useIncidentSync();

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-2">
        <StationSelector />
        <div className="flex gap-2">
          <button
            onClick={() => setTab('open')}
            className={`px-4 py-1 border ${tab === 'open' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Incidencias Activas
          </button>
          <button
            onClick={() => setTab('closed')}
            className={`px-4 py-1 border ${tab === 'closed' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Historial
          </button>
          <button
            onClick={() => setTab('charts')}
            className={`px-4 py-1 border ${tab === 'charts' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          >
            Gráficas
          </button>
        </div>
      </div>
      {station === '' && (
        <p className="text-red-600">Selecciona una ESTACION para operar.</p>
      )}

      {tab === 'open' && <IncidentForm />}

      {tab === 'charts' ? (
        <ChartsPage />
      ) : (
        <IncidentTable status={tab === 'open' ? 'open' : 'all'} />
      )}
    </div>
  );
}
