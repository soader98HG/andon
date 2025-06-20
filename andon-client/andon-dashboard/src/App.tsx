import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IncidentsPage from './pages/IncidentsPage';
import ChartsPage from './pages/ChartsPage';

function Nav() {
  return (
    <nav className="bg-slate-800 text-white p-2 flex gap-4">
      <Link to="/" className="px-2">Inicio</Link>
      <Link to="/incidents" className="px-2">Incidencias</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <h1 className="text-center text-xl font-bold my-2">Dashboard de Incidencias Andon</h1>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/charts" element={<ChartsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
