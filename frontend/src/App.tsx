import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import IncidentCenter from './pages/IncidentCenter';
import History from './pages/History';
import LiveFeed from './pages/LiveFeed';
import Cameras from './pages/Cameras';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Evacuation from './pages/Evacuation';
import CCTV from './pages/CCTV';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live"      element={<LiveFeed />} />
          <Route path="/upload"    element={<Upload />} />
          <Route path="/incidents" element={<IncidentCenter />} />
          <Route path="/evacuation" element={<Evacuation />} />
          <Route path="/cctv"      element={<CCTV />} />
          <Route path="/history"   element={<History />} />
          <Route path="/cameras"   element={<Cameras />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
