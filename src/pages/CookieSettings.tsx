import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SEO from '../components/SEO';
import { getStoredConsent, saveConsent, initializeAnalytics } from '../components/CookieBanner';

const CookieSettings: React.FC = () => {
  const [consent, setConsent] = useState({
    necessary: true,
    functional: false,
    analytics: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load current consent preferences
    const stored = getStoredConsent();
    if (stored) {
      setConsent({
        necessary: stored.necessary,
        functional: stored.functional,
        analytics: stored.analytics,
      });
    }
  }, []);

  const handleSave = () => {
    saveConsent(consent);
    setSaved(true);
    initializeAnalytics(consent.analytics);
    
    // Show success message for 3 seconds
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Cookie Settings - Fun Circle"
        description="Manage your cookie preferences and privacy settings on Fun Circle community platform."
      />
      
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Cookie Settings</h1>
                <p className="text-gray-600 mt-2">
                  Control how we use cookies to improve your experience on Fun Circle.
                </p>
              </div>
            </div>

            {saved && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-green-800 font-medium">
                    Cookie preferences saved successfully!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cookie Categories */}
          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Necessary Cookies</h3>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Required</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300"
                />
              </div>
              <p className="text-gray-600 mb-4">
                These cookies are essential for the website to function properly. They enable core functionality 
                such as user authentication, language preferences, and security features.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Examples include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Authentication tokens (Firebase Auth)</li>
                  <li>• Language preference (fun-circle-language)</li>
                  <li>• Cookie consent settings</li>
                  <li>• Security and fraud prevention</li>
                </ul>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Functional Cookies</h3>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Optional</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={consent.functional}
                  onChange={(e) => setConsent({ ...consent, functional: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-600 mb-4">
                These cookies enable enhanced functionality and personalization. They remember your preferences 
                and choices to provide a more tailored experience.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Examples include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Remember form data and preferences</li>
                  <li>• Personalized content recommendations</li>
                  <li>• User interface customizations</li>
                  <li>• Regional settings and time zones</li>
                </ul>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Analytics Cookies</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Optional</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={(e) => setConsent({ ...consent, analytics: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-600 mb-4">
                These cookies help us understand how visitors interact with our website by collecting and 
                reporting information anonymously. This helps us improve the user experience.
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Examples include:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Google Analytics tracking (anonymized)</li>
                  <li>• Page views and user behavior</li>
                  <li>• Popular content and features</li>
                  <li>• Website performance metrics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Your Preferences</h3>
                <p className="text-gray-600">
                  Your cookie preferences will be saved for future visits.
                </p>
              </div>
              <button
                onClick={handleSave}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Settings
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-blue-50 rounded-xl p-6 mt-8">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Need More Information?</h4>
                <p className="text-blue-800 mb-3">
                  Learn more about how we handle your data and protect your privacy:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link 
                    to="/cookie-policy" 
                    className="text-blue-700 hover:text-blue-900 underline text-sm"
                  >
                    Cookie Policy
                  </Link>
                  <span className="text-blue-600">•</span>
                  <Link 
                    to="/privacy-policy" 
                    className="text-blue-700 hover:text-blue-900 underline text-sm"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-blue-600">•</span>
                  <Link 
                    to="/contact" 
                    className="text-blue-700 hover:text-blue-900 underline text-sm"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CookieSettings;