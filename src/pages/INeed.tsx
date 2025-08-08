import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';

const INeed = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addOffer, offers, updateOffer } = useOffers();
  const { user, loading } = useAuth();
  
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const postToEdit = isEditing ? offers.find(offer => offer.id === editId) : null;
  
  // Function to get current date and time in the format required by datetime-local input
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Format datetime for input field (converts various date formats to YYYY-MM-DDTHH:MM)
  const formatDateTimeForInput = (dateTime: string) => {
    if (!dateTime) return '';
    try {
      const date = new Date(dateTime);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return '';
    }
  };
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/user-registration');
    }
  }, [user, loading, navigate]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isEditing && postToEdit) {
      // Check if user owns the post
      if (postToEdit.userId !== user?.uid) {
        alert('You can only edit your own posts.');
        navigate('/');
        return;
      }

      setFormData({
        title: postToEdit.title || '',
        description: postToEdit.description || '',
        dateTime: formatDateTimeForInput(postToEdit.dateTime || '') || '',
        endDateTime: formatDateTimeForInput(postToEdit.endDateTime || '') || '',
        price: postToEdit.price || '',
        online: postToEdit.online || false,
        location: postToEdit.location || '',
        city: postToEdit.city || '',
        state: postToEdit.state || ''
      });
    }
  }, [isEditing, postToEdit, user, navigate]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    endDateTime: '',
    price: '',
    online: false,
    location: '',
    city: '',
    state: ''
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successAction, setSuccessAction] = useState<'created' | 'updated' | 'deleted'>('created');

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
    
    console.log('All validations passed, processing need...');
    
    // Prepare need data - only include location fields if not online
    const needData: any = {
      title: formData.title,
      description: formData.description,
      online: formData.online,
      type: 'need' as const,
    };

    // Only add optional fields if they have values
    if (formData.dateTime) {
      needData.dateTime = formData.dateTime;
    }
    if (formData.endDateTime) {
      needData.endDateTime = formData.endDateTime;
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
    
    if (isEditing && editId) {
      // Update existing need
      updateOffer(editId, needData);
      console.log('Need updated, navigating to post detail...');
      setSuccessMessage('Your request has been updated successfully!');
      setSuccessAction('updated');
      setShowSuccessModal(true);
    } else {
      // Add new need
      addOffer(needData);
      console.log('Need added, navigating to home...');
      setSuccessMessage('Your request has been submitted successfully!');
      setSuccessAction('created');
      setShowSuccessModal(true);
    }
  };

  const handleCancel = () => {
    // Navigate back to home page
    navigate('/');
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    
    // Navigate based on the action
    if (successAction === 'updated' && editId) {
      navigate(`/post/${editId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'Edit Request' : t('iNeed.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update your request details' : t('iNeed.subtitle')}
            </p>
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

            {/* Start Date and Time - Optional */}
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.startDateTime')} ({t('iNeed.form.optional')})
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                min={getCurrentDateTime()}
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* End Date and Time - Optional */}
            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iNeed.form.endDateTime')} ({t('iNeed.form.optional')})
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                min={formData.dateTime || getCurrentDateTime()}
                value={formData.endDateTime}
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
                {isEditing ? 'Update Request' : t('iNeed.form.submit')}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {successAction === 'created' ? 'Request Created!' :
                     successAction === 'updated' ? 'Request Updated!' : 'Request Deleted!'}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700">
                  {successMessage}
                </p>
                {successAction === 'created' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      🎉 Your request is now live! Other users can now see and respond to help you.
                    </p>
                  </div>
                )}
                {successAction === 'updated' && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✨ Your changes have been saved and are now visible to everyone.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={handleSuccessModalClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {successAction === 'updated' ? 'View Post' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default INeed;
