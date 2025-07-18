import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IOffer from './pages/IOffer';
import INeed from './pages/INeed';
import UserRegistration from './pages/UserRegistration';
import UserProfile from './pages/UserProfile';
import PostDetail from './pages/PostDetail';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import { OffersProvider } from './contexts/FirebaseOffersContext';

function App() {
  return (
    <AuthProvider>
      <OffersProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/i-offer" element={<IOffer />} />
            <Route path="/i-need" element={<INeed />} />
            <Route path="/user-registration" element={<UserRegistration />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/post/:postId" element={<PostDetail />} />
          </Routes>
        </Router>
      </OffersProvider>
    </AuthProvider>
  );
}

export default App;
