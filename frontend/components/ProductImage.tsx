'use client';

import { useState } from 'react';

interface ProductImageProps {
  src?: string;
  images?: string[];
  alt: string;
  fallback?: React.ReactNode;
  className?: string;
}

export default function ProductImage({ 
  src, 
  images, 
  alt, 
  fallback,
  className = 'w-full h-full object-cover' 
}: ProductImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const imageUrl = src || (images && images.length > 0 ? images[currentImageIndex] : null);
  
  // Build full URL if it's a relative path (starts with /uploads)
  const getImageUrl = () => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    // If it's a relative path, prepend the API URL base
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
    return `${apiUrl}${imageUrl}`;
  };

  const fullImageUrl = getImageUrl();

  if (!fullImageUrl || imageError) {
    return (
      <div className={`${className} bg-gradient-to-br from-brand-blue via-blue-500 to-brand-green flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black opacity-10"></div>
        {fallback || (
          <div className="relative text-white text-5xl font-bold z-10">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={fullImageUrl}
        alt={alt}
        className={className}
        onError={() => setImageError(true)}
      />
      {images && images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentImageIndex(index);
                setImageError(false);
              }}
              className={`w-2 h-2 rounded-full ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

