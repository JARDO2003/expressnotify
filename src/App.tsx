import { HashRouter, Routes, Route } from 'react-router-dom';
import ClientPage from '@/pages/ClientPage';
import ProviderPage from '@/pages/ProviderPage';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/provider" element={<ProviderPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
