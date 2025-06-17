import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IncidentsPage from './pages/IncidentsPage';
import ChartsPage from './pages/ChartsPage';
import StationSelector from './components/StationSelector';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-slate-800 text-white p-2 flex gap-4 items-center">
        <StationSelector />
        <Link to="/" className="px-2">Dash</Link>
        <Link to="/incidents" className="px-2">Incidencias</Link>
        <Link to="/charts" className="px-2">Gr\u00e1ficas</Link>
      </nav>

      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/charts"   element={<ChartsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
