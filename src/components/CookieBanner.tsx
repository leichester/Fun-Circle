import React, { useState, useEffect } from 'react';
import { getCookie, setCookie, areCookiesEnabled } from '../utils/cookies';

// Cookie consent utility functions
const CONSENT_COOKIE_NAME = 'fun-circle-cookie-consent';
const CONSENT_VERSION = '1.0'; // Increment when privacy policy changes

interface CookieConsent {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  version: string;
  timestamp: string;
}

export const getStoredConsent = (): CookieConsent | null => {
  if (!areCookiesEnabled()) return null;
  
  try {
    const consent = getCookie(CONSENT_COOKIE_NAME);
    return consent ? JSON.parse(consent) : null;
  } catch {
    return null;
  }
};

export const saveConsent = (consent: Omit<CookieConsent, 'version' | 'timestamp'>): void => {
  if (!areCookiesEnabled()) return;
  
  const consentData: CookieConsent = {
    ...consent,
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
  };
  
  setCookie(CONSENT_COOKIE_NAME, JSON.stringify(consentData), {
    expires: 365, // 1 year
    path: '/',
    sameSite: 'lax'
  });
};

export const shouldShowConsentBanner = (): boolean => {
  const stored = getStoredConsent();
  return !stored || stored.version !== CONSENT_VERSION;
};

// Initialize Google Analytics based on consent
export const initializeAnalytics = (hasConsent: boolean) => {
  if (hasConsent && typeof window !== 'undefined') {
    // Enable Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
  }
};

const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    necessary: true, // Always required
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    // Check if we need to show the banner
    if (shouldShowConsentBanner()) {
      setShowBanner(true);
    } else {
      // Load existing consent preferences
      const stored = getStoredConsent();
      if (stored) {
        setConsent({
          necessary: stored.necessary,
          functional: stored.functional,
          analytics: stored.analytics,
        });
        // Initialize analytics if previously consented
        if (stored.analytics) {
          initializeAnalytics(true);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const newConsent = { necessary: true, functional: true, analytics: true };
    saveConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
    initializeAnalytics(true);
  };

  const handleAcceptSelected = () => {
    saveConsent(consent);
    setShowBanner(false);
    initializeAnalytics(consent.analytics);
  };

  const handleRejectAll = () => {
    const newConsent = { necessary: true, functional: false, analytics: false };
    saveConsent(newConsent);
    setConsent(newConsent);
    setShowBanner(false);
    initializeAnalytics(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-gray-200 z-50">
      <div className="max-w-7xl mx-auto p-6">
        {!showDetails ? (
          // Simple banner view
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🍪 We Use Cookies
              </h3>
              <p className="text-gray-600 text-sm">
                We use cookies to enhance your experience, remember your language preference, and analyze our traffic. 
                You can choose which cookies you accept.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Customize
              </button>
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Accept All
              </button>
            </div>
          </div>
        ) : (
          // Detailed settings view
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cookie Preferences</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {/* Necessary Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">Necessary Cookies</h4>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Essential for website functionality, including language preferences and authentication.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  />
                </div>
              </div>

              {/* Functional Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Functional Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Remember your preferences and settings for a better user experience.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={consent.functional}
                    onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Analytics Cookies */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">
                    Help us understand how you use our website through Google Analytics.
                  </p>
                </div>
                <div className="ml-4">
                  <input
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptSelected}
                className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Preferences
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                For more information, read our{' '}
                <a href="/cookie-policy" className="text-blue-600 hover:underline">
                  Cookie Policy
                </a>{' '}
                and{' '}
                <a href="/privacy-policy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;