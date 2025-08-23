import React from 'react';
import { Link } from 'react-router-dom';

const CommunityGuidelines: React.FC = () => {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Community Guidelines</h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            These guidelines help ensure Fun Circle remains a safe, welcoming, and positive space for everyone in our community.
          </p>
        </div>

        {/* Overview */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Community Values</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Fun Circle is built on the foundation of mutual respect, kindness, and community support. 
            We believe in creating a space where neighbors can connect, share resources, and help one another thrive.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            By participating in our community, you agree to follow these guidelines and help maintain a positive environment for everyone.
          </p>
        </div>

        {/* Guidelines Sections */}
        <div className="space-y-8">
          {/* Be Respectful */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Be Respectful and Kind</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Treat all community members with respect and courtesy</li>
              <li>• Use inclusive and welcoming language</li>
              <li>• Be patient and understanding with others</li>
              <li>• Respect different opinions, backgrounds, and experiences</li>
              <li>• No harassment, bullying, or discriminatory behavior</li>
            </ul>
          </div>

          {/* Post Authentically */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Post Authentically</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Only post genuine offers and needs</li>
              <li>• Provide accurate and honest descriptions</li>
              <li>• Include clear details about what you're offering or seeking</li>
              <li>• Update or remove posts when they're no longer relevant</li>
              <li>• No spam, duplicate posts, or misleading information</li>
            </ul>
          </div>

          {/* Keep It Local */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Keep It Community-Focused</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Focus on local community connections and support</li>
              <li>• Prioritize helping your neighbors and nearby community members</li>
              <li>• Share resources that benefit the local community</li>
              <li>• Promote community events and initiatives</li>
            </ul>
          </div>

          {/* Safety First */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Prioritize Safety</h3>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li>• Meet in public places when exchanging items</li>
              <li>• Trust your instincts and prioritize your safety</li>
              <li>• Don't share personal information like home addresses publicly</li>
              <li>• Report any suspicious or concerning behavior</li>
            </ul>
          </div>

          {/* Prohibited Content */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Prohibited Content</h3>
            </div>
            <p className="text-gray-700 mb-4">The following types of content are not allowed on Fun Circle:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Illegal items, services, or activities</li>
              <li>• Weapons, drugs, or dangerous substances</li>
              <li>• Hate speech, threats, or violent content</li>
              <li>• Adult content or inappropriate material</li>
              <li>• Scams, fraud, or deceptive practices</li>
              <li>• Commercial sales or business advertising</li>
              <li>• Personal attacks or doxxing</li>
            </ul>
          </div>
        </div>

        {/* Reporting and Enforcement */}
        <div className="bg-blue-50 rounded-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Reporting and Enforcement</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Report</h3>
              <p className="text-gray-700 mb-4">
                If you encounter content or behavior that violates these guidelines:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Contact us directly at <a href="mailto:fun_circle@outlook.com" className="text-blue-600 hover:text-blue-800">fun_circle@outlook.com</a></li>
                <li>• Provide specific details about the violation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Consequences</h3>
              <p className="text-gray-700 mb-4">
                Violations of these guidelines may result in:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li>• Warning and request to modify behavior</li>
                <li>• Temporary suspension of account</li>
                <li>• Permanent removal from the platform</li>
                <li>• Reporting to authorities if illegal activity is involved</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Closing Message */}
        <div className="text-center bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Building Community Together</h2>
          <p className="text-lg text-gray-700 mb-6">
            These guidelines help us maintain a positive, safe, and supportive community. 
            Thank you for doing your part to make Fun Circle a great place for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/user-registration"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Participating
            </Link>
            <Link
              to="/contact"
              className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
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

export default CommunityGuidelines;
