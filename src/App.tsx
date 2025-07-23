import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import IOffer from './pages/IOffer';
import INeed from './pages/INeed';
import UserRegistration from './pages/UserRegistration';
import UserProfile from './pages/UserProfile';
import PostDetail from './pages/PostDetail';
import AdminPanel from './pages/AdminPanel';
import RatingPage from './pages/RatingPage';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import { OffersProvider } from './contexts/FirebaseOffersContext';
import { AdminProvider } from './contexts/AdminContext';

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <OffersProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/i-offer" element={<IOffer />} />
              <Route path="/i-need" element={<INeed />} />
              <Route path="/user-registration" element={<UserRegistration />} />
              <Route path="/user-profile" element={<UserProfile />} />
              <Route path="/user/:userId" element={<UserProfile />} />
              <Route path="/post/:postId" element={<PostDetail />} />
              <Route path="/rate/:postId" element={<RatingPage />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </Router>
        </OffersProvider>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;
