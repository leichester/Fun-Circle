import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';

const INeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addOffer } = useOffers();
  const { user, loading } = useAuth();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/user-registration');
    }
  }, [user, loading, navigate]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    price: '',
    online: false,
    location: '',
    city: '',
    state: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit clicked, form data:', formData);
    
    // Check if required fields are filled (only title and description are required)
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields (Title, Description).');
      return;
    }
    
    console.log('All validations passed, adding need...');
    
    // Prepare need data - only include location fields if not online
    const needData: any = {
      title: formData.title,
      description: formData.description,
      online: formData.online,
      type: 'need',
    };

    // Only add optional fields if they have values
    if (formData.dateTime) {
      needData.dateTime = formData.dateTime;
    }
    if (formData.price) {
      needData.price = formData.price;
    }
    
    // Only add location fields if not online and they have values
    if (!formData.online) {
      if (formData.location) needData.location = formData.location;
      if (formData.city) needData.city = formData.city;
      if (formData.state) needData.state = formData.state;
    }
    
    // Add the need to the global state
    addOffer(needData);
    
    console.log('Need added, navigating to home...');
    
    // Show success message and navigate to home
    alert('Request submitted successfully!');
    navigate('/');
  };

  const handleCancel = () => {
    // Navigate back to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('iNeed.title')}</h1>
            <p className="text-gray-600 mt-2">{t('iNeed.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('iNeed.form.titlePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('iNeed.form.descriptionPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Date and Time - Optional */}
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.dateTime')} ({t('iNeed.form.optional')})
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.price')} ({t('iNeed.form.optional')})
              </label>
              <input
                type="text"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={t('iNeed.form.pricePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Online Checkbox */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="online"
                  name="online"
                  checked={formData.online}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="online" className="ml-2 block text-sm font-medium text-gray-700">
                  {t('iNeed.form.onlineLabel')}
                </label>
              </div>
            </div>

            {/* Location Fields - Optional */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-4">
                {t('iNeed.form.locationSection')} ({t('iNeed.form.optional')})
              </h3>
              
              {/* Location */}
              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('iNeed.form.location')}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder={t('iNeed.form.locationPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('iNeed.form.city')}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder={t('iNeed.form.cityPlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('iNeed.form.state')}
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder={t('iNeed.form.statePlaceholder')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                {t('iNeed.form.submit')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {t('iNeed.form.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default INeed;
