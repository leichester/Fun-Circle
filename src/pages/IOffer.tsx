import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';

const IOffer = () => {
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

  const [errors, setErrors] = useState({
    location: '',
    city: '',
    state: ''
  });

  // US states for dropdown
  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  const validateLocation = (location: string): string => {
    if (!location.trim()) return '';
    
    // Basic validation - should contain some address-like components
    const hasLetters = /[a-zA-Z]/.test(location);
    const minLength = location.trim().length >= 5;
    
    if (!hasLetters) {
      return 'Location should contain letters';
    }
    
    if (!minLength) {
      return 'Location should be at least 5 characters';
    }
    
    return '';
  };

  const validateCity = (city: string): string => {
    if (!city.trim()) return '';
    
    // City validation
    const onlyLettersAndSpaces = /^[a-zA-Z\s\-'\.]+$/.test(city);
    const minLength = city.trim().length >= 2;
    const maxLength = city.trim().length <= 50;
    
    if (!onlyLettersAndSpaces) {
      return 'City should only contain letters, spaces, hyphens, and apostrophes';
    }
    
    if (!minLength) {
      return 'City name should be at least 2 characters';
    }
    
    if (!maxLength) {
      return 'City name should not exceed 50 characters';
    }
    
    return '';
  };

  const validateState = (state: string): string => {
    if (!state.trim()) return '';
    
    // For dropdown, we just need to ensure a selection is made
    if (state === '') {
      return 'Please select a state';
    }
    
    return '';
  };

  const validateLocationFields = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'location':
        error = validateLocation(value);
        break;
      case 'city':
        error = validateCity(value);
        break;
      case 'state':
        error = validateState(value);
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validate location fields on change (but only if not online)
    if (!formData.online && ['location', 'city', 'state'].includes(name) && type !== 'checkbox') {
      validateLocationFields(name, value);
    }

    // Clear location errors when switching to online
    if (name === 'online' && checked) {
      setErrors({
        location: '',
        city: '',
        state: ''
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Submit clicked, form data:', formData);
    
    // Check if required fields are filled
    if (!formData.title || !formData.description || !formData.dateTime || !formData.price) {
      alert('Please fill in all required fields (Title, Description, Date & Time, Price).');
      return;
    }
    
    // Validate location fields if not online
    if (!formData.online) {
      const locationError = validateLocation(formData.location);
      const cityError = validateCity(formData.city);
      const stateError = validateState(formData.state);
      
      setErrors({
        location: locationError,
        city: cityError,
        state: stateError
      });
      
      // Don't submit if there are validation errors
      if (locationError || cityError || stateError) {
        alert('Please fix the validation errors before submitting.');
        return;
      }
    }
    
    console.log('All validations passed, adding offer...');
    
    // Prepare offer data - only include location fields if not online
    const offerData: any = {
      title: formData.title,
      description: formData.description,
      dateTime: formData.dateTime,
      price: formData.price,
      online: formData.online,
      type: 'offer',
    };

    // Only add location fields if not online
    if (!formData.online) {
      offerData.location = formData.location;
      offerData.city = formData.city;
      offerData.state = formData.state;
    }
    
    // Add the offer to the global state
    addOffer(offerData);
    
    console.log('Offer added, navigating to home...');
    
    // Show success message and navigate to home
    alert('Offer submitted successfully!');
    navigate('/');
  };

  const handleCancel = () => {
    // Navigate back to home page
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{t('iOffer.title')}</h1>
            <p className="text-gray-600 mt-2">{t('iOffer.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.title')} *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('iOffer.form.titlePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.description')} *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('iOffer.form.descriptionPlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.dateTime')} *
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                required
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.price')} *
              </label>
              <input
                type="text"
                id="price"
                name="price"
                required
                value={formData.price}
                onChange={handleInputChange}
                placeholder={t('iOffer.form.pricePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="online" className="ml-2 block text-sm font-medium text-gray-700">
                  {t('iOffer.form.onlineLabel')}
                </label>
              </div>
            </div>

            {/* Location Fields - Only required if not online */}
            {!formData.online && (
              <>
                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('iOffer.form.location')} *
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    required={!formData.online}
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder={t('iOffer.form.locationPlaceholder')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                  )}
                </div>

                {/* City and State */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('iOffer.form.city')} *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required={!formData.online}
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder={t('iOffer.form.cityPlaceholder')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('iOffer.form.state')} *
                    </label>
                    <select
                      id="state"
                      name="state"
                      required={!formData.online}
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('iOffer.form.statePlaceholder')}</option>
                      {usStates.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name} ({state.code})
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {t('iOffer.form.submit')}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                {t('iOffer.form.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IOffer;
