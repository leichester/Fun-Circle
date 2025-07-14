import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IOffer from './pages/IOffer';
import INeed from './pages/INeed';
import { OffersProvider } from './contexts/OffersContext';

function App() {
  return (
    <OffersProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/i-offer" element={<IOffer />} />
          <Route path="/i-need" element={<INeed />} />
        </Routes>
      </Router>
    </OffersProvider>
  );
}

export default App;
