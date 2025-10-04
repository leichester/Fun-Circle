import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { useNavigate } from 'react-router-dom';

const EmailVerification: React.FC = () => {
  const { user, sendEmailVerification, reloadUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [checkingVerification, setCheckingVerification] = useState(false);

  useEffect(() => {
    // If user is already verified, redirect to home
    if (user?.emailVerified) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Auto-check verification status every 3 seconds
    const interval = setInterval(async () => {
      if (user && !user.emailVerified && !checkingVerification) {
        try {
          setCheckingVerification(true);
          await reloadUser();
          // The useEffect above will handle redirection if verified
        } catch (error) {
          console.error('Error checking verification status:', error);
        } finally {
          setCheckingVerification(false);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [user, reloadUser, checkingVerification]);

  const handleResendEmail = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendEmailVerification();
      setMessage('Verification email sent! Please check your inbox and spam folder.');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    
    setCheckingVerification(true);
    setError('');

    try {
      await reloadUser();
      if (user.emailVerified) {
        setMessage('Email verified successfully! Redirecting...');
        setTimeout(() => navigate('/'), 1500);
      } else {
        setError('Email not yet verified. Please check your email and click the verification link.');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: any) {
      setError(error.message);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a verification link to:
          </p>
          <p className="text-purple-600 font-semibold mt-1">
            {user.email}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Check your email inbox</li>
              <li>2. Look in your spam/junk folder if not found</li>
              <li>3. Click the verification link in the email</li>
              <li>4. Return to this page to continue</li>
            </ol>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleCheckVerification}
            disabled={checkingVerification}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {checkingVerification ? 'Checking...' : 'I\'ve Verified My Email'}
          </button>

          <button
            onClick={handleResendEmail}
            disabled={loading}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">
              Wrong email address?
            </p>
            <button
              onClick={handleSignOut}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm underline"
            >
              Sign out and try again
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Email verification helps keep our community safe and ensures you can receive important notifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
