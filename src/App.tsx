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
import CookieSettings from './pages/CookieSettings';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ServicePage from './pages/ServicePage';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import EmailVerification from './components/EmailVerification';
import RequireEmailVerification from './components/RequireEmailVerification';
import CookieBanner from './components/CookieBanner';
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
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<UserRegistration />} />
                <Route path="/signup" element={<UserRegistration />} />
                <Route path="/user-registration" element={<UserRegistration />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/community-guidelines" element={<CommunityGuidelines />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/cookie-settings" element={<CookieSettings />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/services/:category" element={<ServicePage />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                
                {/* Email verification route */}
                <Route path="/verify-email" element={<EmailVerification />} />
                
                {/* Protected routes that require email verification */}
                <Route path="/i-offer" element={
                  <RequireEmailVerification>
                    <IOffer />
                  </RequireEmailVerification>
                } />
                <Route path="/i-need" element={
                  <RequireEmailVerification>
                    <INeed />
                  </RequireEmailVerification>
                } />
                <Route path="/user-profile" element={
                  <RequireEmailVerification>
                    <UserProfile />
                  </RequireEmailVerification>
                } />
                <Route path="/user/:userId" element={
                  <RequireEmailVerification>
                    <UserProfile />
                  </RequireEmailVerification>
                } />
                <Route path="/post/:postId" element={
                  <RequireEmailVerification>
                    <PostDetail />
                  </RequireEmailVerification>
                } />
                <Route path="/rate/:postId" element={
                  <RequireEmailVerification>
                    <RatingPage />
                  </RequireEmailVerification>
                } />
                <Route path="/admin" element={
                  <RequireEmailVerification>
                    <AdminPanel />
                  </RequireEmailVerification>
                } />
              </Routes>
              
              {/* Cookie consent banner */}
              <CookieBanner />
            </Router>
          </OffersProvider>
        </AdminProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
