import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t } = useTranslation();

  const navItems = [
    { key: 'home', href: '#home' },
    { key: 'iOffer', href: '#i-offer' },
    { key: 'iNeed', href: '#i-need' },
    { key: 'sampleEvent', href: '#sample-event' },
  ];

  return (
    <nav className="w-full flex justify-evenly items-center">
      {navItems.map((item) => (
        <a
          key={item.key}
          href={item.href}
          className="text-gray-700 hover:text-blue-600 font-medium text-lg transition-colors duration-200 border-b-2 border-transparent hover:border-blue-600 pb-1 text-center"
        >
          {t(`navigation.${item.key}`)}
        </a>
      ))}
    </nav>
  );
};

export default Navigation;
