import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';

interface RequireEmailVerificationProps {
  children: React.ReactNode;
}

const RequireEmailVerification: React.FC<RequireEmailVerificationProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to email verification if not verified
  // Skip verification check for Google users (they're auto-verified)
  const isGoogleUser = user.providerData.some(provider => provider.providerId === 'google.com');
  if (!user.emailVerified && !isGoogleUser) {
    return <Navigate to="/verify-email" replace />;
  }

  // User is authenticated and verified, show the protected content
  return <>{children}</>;
};

export default RequireEmailVerification;
