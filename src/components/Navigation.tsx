import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { key: 'home', to: '/' },
    { key: 'iOffer', to: '/i-offer' },
    { key: 'iNeed', to: '/i-need' },
  ];

  return (
    <nav className="w-full">
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:flex justify-evenly items-center gap-8">
        {navItems.map((item) => (
          item.to.startsWith('#') ? (
            <a
              key={item.key}
              href={item.to}
              className="text-white hover:text-blue-200 font-medium text-xl transition-colors duration-200 border-b-2 border-transparent hover:border-blue-200 pb-2 text-center"
            >
              {t(`navigation.${item.key}`)}
            </a>
          ) : (
            <Link
              key={item.key}
              to={item.to}
              className="text-white hover:text-blue-200 font-medium text-xl transition-colors duration-200 border-b-2 border-transparent hover:border-blue-200 pb-2 text-center"
            >
              {t(`navigation.${item.key}`)}
            </Link>
          )
        ))}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Hamburger Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center justify-center w-full py-2 text-white hover:text-blue-200 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <div className="flex flex-col items-center gap-1">
            <div className={`w-6 h-0.5 bg-current transition-transform duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-current transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-current transition-transform duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></div>
          </div>
          <span className="ml-2 text-lg font-medium">Menu</span>
        </button>

        {/* Mobile Menu Dropdown */}
        <div className={`absolute top-full left-0 right-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-b-2xl shadow-lg transition-all duration-300 z-50 ${
          isMenuOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform -translate-y-4 pointer-events-none'
        }`}>
          <div className="py-4 px-6 space-y-4">
            {navItems.map((item) => (
              item.to.startsWith('#') ? (
                <a
                  key={item.key}
                  href={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white hover:text-blue-200 font-medium text-lg transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  {t(`navigation.${item.key}`)}
                </a>
              ) : (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-white hover:text-blue-200 font-medium text-lg transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-white/10"
                >
                  {t(`navigation.${item.key}`)}
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
