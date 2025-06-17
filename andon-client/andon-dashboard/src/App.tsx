import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IncidentsPage from './pages/IncidentsPage';
import ChartsPage from './pages/ChartsPage';

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-slate-800 text-white p-2 flex gap-4">
        <Link to="/">Dash</Link>
        <Link to="/incidents">Incidencias</Link>
        <Link to="/charts">Graficas</Link>
      </nav>

      <Routes>
        <Route path="/"        element={<Dashboard />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/charts"   element={<ChartsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
