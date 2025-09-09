import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import IOffer from './pages/IOffer';
import INeed from './pages/INeed';
import UserRegistration from './pages/UserRegistration';
import UserProfile from './pages/UserProfile';
import PostDetail from './pages/PostDetail';
import AdminPanel from './pages/AdminPanel';
import RatingPage from './pages/RatingPage';
import About from './pages/About';
import Contact from './pages/Contact';
import CommunityGuidelines from './pages/CommunityGuidelines';
import CookiePolicy from './pages/CookiePolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ServicePage from './pages/ServicePage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import { OffersProvider } from './contexts/FirebaseOffersContext';
import { AdminProvider } from './contexts/AdminContext';

function App() {
  return (
    <HelmetProvider>
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
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                {/* Service Category Pages */}
                <Route path="/services/:category" element={<ServicePage />} />
                {/* Blog Routes */}
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
              </Routes>
            </Router>
          </OffersProvider>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
