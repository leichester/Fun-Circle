import React from 'react';

interface ProfilePictureProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackText?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8', 
  xl: 'w-10 h-10'
};

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt = 'Profile picture',
  size = 'md',
  className = '',
  fallbackText
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoading, setImageLoading] = React.useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const showFallback = !src || imageError;

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden ${className}`}>
      {!showFallback ? (
        <>
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {imageLoading && (
            <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-blue-100 flex items-center justify-center">
          {fallbackText ? (
            <span className={`font-bold text-blue-600 ${
              size === 'sm' ? 'text-xs' : 
              size === 'md' ? 'text-sm' : 
              size === 'lg' ? 'text-base' : 'text-lg'
            }`}>
              {fallbackText.charAt(0).toUpperCase()}
            </span>
          ) : (
            <svg className={`${iconSizes[size]} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
