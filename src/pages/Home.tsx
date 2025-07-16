import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';
import Navigation from '../components/Navigation';
import { useOffers } from '../contexts/FirebaseOffersContext';

const Home = () => {
  const { t } = useTranslation();
  const { offers } = useOffers();

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

        {/* Submitted Offers Section */}
        {offers.length > 0 && (
          <div className="w-full max-w-6xl mt-16">
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {offer.type === 'need' ? (
                          <span className="text-green-600 font-bold">[{t('navigation.iNeed')}]</span>
                        ) : (
                          <span className="text-blue-600 font-bold">[{t('navigation.iOffer')}]</span>
                        )} {offer.title}
                      </h3>
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {offer.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {offer.dateTime && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date(offer.dateTime).toLocaleDateString()} {new Date(offer.dateTime).toLocaleTimeString()}
                          </span>
                        )}
                        {offer.price && (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            {offer.price}
                          </span>
                        )}
                        {offer.online ? (
                          <span className="flex items-center text-blue-600">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                            </svg>
                            {t('offers.online')}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {offer.location}, {offer.city}, {offer.state}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {t('offers.new')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
