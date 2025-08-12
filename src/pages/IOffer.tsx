import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useOffers } from '../contexts/FirebaseOffersContext';
import { useAuth } from '../contexts/FirebaseAuthContext';
import { compressImageToBase64, validateImageForBase64, ImageData } from '../utils/base64ImageStorage';

const IOffer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addOffer, offers, updateOffer } = useOffers();
  const { user, loading } = useAuth();
  
  const editId = searchParams.get('edit');
  const isEditing = !!editId;
  const postToEdit = isEditing ? offers.find(offer => offer.id === editId) : null;
  
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

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState({
    location: '',
    city: '',
    state: ''
  });

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successAction, setSuccessAction] = useState<'created' | 'updated' | 'deleted'>('created');

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

  // Get current date and time in the format required by datetime-local input
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

  // Image handling functions
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validationError = validateImageForBase64(file);
    if (validationError && !validationError.includes('compressed')) {
      alert(validationError);
      return;
    }

    setSelectedImage(file);
    setUploadingImage(true);

    try {
      // Show immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Compress to base64 for storage
      const compressed = await compressImageToBase64(file);
      setImageData(compressed);
      
      console.log('✅ Image compressed:', {
        originalSize: Math.round(file.size / 1024) + 'KB',
        compressedSize: Math.round(compressed.size / 1024) + 'KB',
        filename: compressed.filename
      });
      
    } catch (error) {
      console.error('❌ Image compression failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process image';
      alert(errorMessage);
      removeImage();
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    
    console.log('All validations passed, processing offer...');
    
    try {
      const offerData = {
        title: formData.title,
        description: formData.description,
        dateTime: formData.dateTime,
        endDateTime: formData.endDateTime || undefined,
        price: formData.price,
        online: formData.online,
        location: formData.online ? undefined : formData.location,
        city: formData.online ? undefined : formData.city,
        state: formData.online ? undefined : formData.state,
        type: 'offer' as const,
        imageData: imageData // Store base64 image data instead of URL
      };

      if (isEditing && editId) {
        // Update existing offer
        updateOffer(editId, offerData);
        console.log('Offer updated, navigating to post detail...');
        setSuccessMessage('Your offer has been updated successfully!');
        setSuccessAction('updated');
        setShowSuccessModal(true);
      } else {
        // Add new offer
        addOffer(offerData);
        console.log('Offer added, navigating to home...');
        setSuccessMessage('Your offer has been submitted successfully!');
        setSuccessAction('created');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error submitting offer:', error);
      alert('Failed to submit offer. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isEditing ? 'Edit Offer' : t('iOffer.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing ? 'Update your offer details' : t('iOffer.subtitle')}
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

            {/* Image Upload */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Add Photo (Optional)
              </label>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-800">
                  📱 <strong>Free Plan Mode:</strong> Images are compressed and stored efficiently. 
                  For full-resolution storage, upgrade to Firebase Blaze plan.
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="file"
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageSelect}
                  ref={fileInputRef}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex items-center justify-center w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Choose Photo
                    </>
                  )}
                </button>
                
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {selectedImage && imageData && (
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <p className="text-sm text-green-800">
                      ✅ <strong>{selectedImage.name}</strong><br/>
                      Original: {Math.round(selectedImage.size / 1024)}KB → Optimized: {Math.round(imageData.size / 1024)}KB
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Start Date and Time */}
            <div>
              <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.startDateTime')} *
              </label>
              <input
                type="datetime-local"
                id="dateTime"
                name="dateTime"
                required
                min={getCurrentDateTime()}
                value={formData.dateTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* End Date and Time - Optional */}
            <div>
              <label htmlFor="endDateTime" className="block text-sm font-medium text-gray-700 mb-2">
                {t('iOffer.form.endDateTime')} ({t('iOffer.form.optional')})
              </label>
              <input
                type="datetime-local"
                id="endDateTime"
                name="endDateTime"
                min={formData.dateTime || getCurrentDateTime()}
                value={formData.endDateTime}
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
                disabled={uploadingImage}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {uploadingImage ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Uploading...
                  </>
                ) : (
                  isEditing ? 'Update Offer' : t('iOffer.form.submit')
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={uploadingImage}
                className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {t('iOffer.form.cancel')}
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
                    {successAction === 'created' ? 'Offer Created!' :
                     successAction === 'updated' ? 'Offer Updated!' : 'Offer Deleted!'}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700">
                  {successMessage}
                </p>
                {successAction === 'created' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🎉 Your offer is now live! Other users can now see and respond to your post.
                    </p>
                  </div>
                )}
                {successAction === 'updated' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ✨ Your changes have been saved and are now visible to everyone.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end">
                <button
                  onClick={handleSuccessModalClose}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
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

export default IOffer;
