import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();

  // Don't show "Home" button when already on homepage
  const isHomePage = location.pathname === '/';
  
  const navItems = [
    { key: 'home', to: '/' },
    { key: 'iOffer', to: '/i-offer' },
    { key: 'iNeed', to: '/i-need' },
  ].filter(item => !(isHomePage && item.key === 'home'));

  return (
    <nav className="w-full">
      {/* Navigation - Same for Desktop and Mobile */}
      <div className="flex justify-evenly items-center gap-4 md:gap-8 flex-wrap">
        {navItems.map((item) => (
          item.to.startsWith('#') ? (
            <a
              key={item.key}
              href={item.to}
              className="text-white hover:text-blue-200 font-medium text-lg md:text-xl transition-colors duration-200 border-b-2 border-transparent hover:border-blue-200 pb-2 text-center"
            >
              {t(`navigation.${item.key}`)}
            </a>
          ) : (
            <Link
              key={item.key}
              to={item.to}
              className="text-white hover:text-blue-200 font-medium text-lg md:text-xl transition-colors duration-200 border-b-2 border-transparent hover:border-blue-200 pb-2 text-center"
            >
              {t(`navigation.${item.key}`)}
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
