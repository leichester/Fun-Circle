import React from 'react';
import { Link } from 'react-router-dom';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Fun Circle
            </Link>
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Cookie Policy</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            This Cookie Policy explains how Fun Circle uses cookies and similar technologies when you visit our website.
          </p>
        </div>

        {/* What Are Cookies */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Cookies are small text files that are stored on your device when you visit a website. They help websites 
            remember information about your visit, such as your preferences and login status, which can make your 
            next visit easier and the site more useful to you.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Similar technologies include local storage, session storage, and other browser storage mechanisms that 
            serve similar purposes to cookies.
          </p>
        </div>

        {/* How We Use Cookies */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How We Use Cookies</h2>
          
          {/* Essential Cookies */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Essential Cookies</h3>
            </div>
            <p className="text-gray-700 mb-4">
              These cookies are necessary for the website to function properly and cannot be disabled:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• <strong>Authentication:</strong> Firebase Authentication uses cookies and local storage to keep you logged in</li>
              <li>• <strong>Security:</strong> Tokens and session data to protect your account and maintain secure connections</li>
              <li>• <strong>Functionality:</strong> Remember your preferences and settings while using the platform</li>
            </ul>
          </div>

          {/* Firebase Services */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Third-Party Services</h3>
            </div>
            <p className="text-gray-700 mb-4">
              We use Google Firebase services, which may set their own cookies:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• <strong>Firebase Authentication:</strong> Manages user login and account security</li>
              <li>• <strong>Firebase Firestore:</strong> Stores and syncs your posts and profile data</li>
              <li>• <strong>Firebase Storage:</strong> Handles file uploads and image storage</li>
            </ul>
            <p className="text-gray-700 mt-4">
              For more information about Google's use of cookies, please visit 
              <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                Google's Cookie Policy
              </a>.
            </p>
          </div>
        </div>

        {/* Types of Data Stored */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What Information Is Stored</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Authentication Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• User ID and session tokens</li>
                <li>• Login status and preferences</li>
                <li>• Account security information</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Functional Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Language and display preferences</li>
                <li>• Form data during post creation</li>
                <li>• Temporary application state</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Managing Cookies */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Browser Settings</h3>
            <p className="text-gray-700 mb-4">
              You can control cookies through your browser settings:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Block all cookies (may affect website functionality)</li>
              <li>• Delete existing cookies</li>
              <li>• Set preferences for specific websites</li>
              <li>• Receive notifications when cookies are set</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Impact of Disabling Cookies</h3>
            <p className="text-gray-700 mb-4">
              If you disable essential cookies, you may experience:
            </p>
            <ul className="space-y-2 text-gray-700 ml-6">
              <li>• Inability to log in or stay logged in</li>
              <li>• Loss of preferences and settings</li>
              <li>• Reduced website functionality</li>
              <li>• Need to re-enter information repeatedly</li>
            </ul>
          </div>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. 
            When we make changes, we will update the "Last Updated" date at the bottom of this page.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We encourage you to review this Cookie Policy periodically to stay informed about our use of cookies 
            and related technologies.
          </p>
        </div>

        {/* Contact Information */}
        <div className="text-center bg-blue-50 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Cookies?</h2>
          <p className="text-lg text-gray-700 mb-6">
            If you have any questions about our use of cookies or this Cookie Policy, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Last Updated */}
        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Last Updated: August 22, 2025
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Fun Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CookiePolicy;
