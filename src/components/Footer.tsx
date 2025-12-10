import { Link } from 'react-router-dom';
import logoSvg from '../logo.svg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const resourceLinks = [
    { name: 'Community Blog', path: '/blog' },
    { name: 'Safety Tips', path: '/blog/safety-tips-community-service-exchanges' },
    { name: 'Trust Building', path: '/blog/how-to-build-trust-community-services' },
    { name: 'Service Trends', path: '/blog/top-10-most-requested-community-services' }
  ];

  const companyLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Community Guidelines', path: '/community-guidelines' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms of Service', path: '/terms-of-service' },
    { name: 'Cookie Policy', path: '/cookie-policy' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img src={logoSvg} alt="Fun Circle" className="h-10 w-10" />
              <span className="text-2xl font-bold">Fun Circle</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connect with your local community through events and activities.
              Host events, join activities, and build meaningful relationships with neighbors.
            </p>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">
                📧 support@fun-circle.com
              </p>
              <p className="text-gray-400 text-sm">
                📱 Available 24/7 for community support
              </p>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Resources</h3>
            <ul className="space-y-3">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-800 to-purple-800 rounded-xl text-center">
          <h3 className="text-2xl font-bold mb-4">Ready to Connect with Your Community?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Join thousands of neighbors discovering events and activities in their community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/i-offer"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Host an Event
            </Link>
            <Link
              to="/i-need"
              className="bg-white text-blue-800 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Find Events
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © {currentYear} Fun Circle. All rights reserved. Building stronger communities, one connection at a time.
            </div>
            
            {/* Social Links (placeholder for future) */}
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/funcircle"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Follow Fun Circle on Facebook"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.twitter.com/funcircle"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Follow Fun Circle on Twitter"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/funcircle"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Follow Fun Circle on LinkedIn"
                rel="noopener noreferrer"
                target="_blank"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
