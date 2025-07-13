import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './components/LanguageSwitcher';
import Navigation from './components/Navigation';

function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-8">
        <LanguageSwitcher />
      </div>

      {/* Main Content - Top Aligned */}
      <div className="pt-20 flex flex-col items-center px-8">
        {/* Fun Circle Title - Centered and Big */}
        <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-16 text-center">
          {t('title')}
        </h1>
        
        {/* Navigation Menu - Full Width, Evenly Distributed */}
        <div className="w-full max-w-4xl mb-12 flex justify-center">
          <Navigation />
        </div>
        
        {/* Welcome Content - Centered */}
        <div className="text-center mt-8">
          <p className="text-xl text-gray-600 max-w-2xl">
            {t('content.description')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
