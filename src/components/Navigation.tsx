import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Navigation = () => {
  const { t } = useTranslation();

  const navItems = [
    { key: 'home', to: '/' },
    { key: 'iOffer', to: '/i-offer' },
    { key: 'iNeed', to: '#i-need' },
    { key: 'sampleEvent', to: '#user-registration' },
  ];

  return (
    <nav className="w-full flex justify-evenly items-center">
      {navItems.map((item) => (
        item.to.startsWith('#') ? (
          <a
            key={item.key}
            href={item.to}
            className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1 text-center"
          >
            {t(`navigation.${item.key}`)}
          </a>
        ) : (
          <Link
            key={item.key}
            to={item.to}
            className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1 text-center"
          >
            {t(`navigation.${item.key}`)}
          </Link>
        )
      ))}
    </nav>
  );
};

export default Navigation;
