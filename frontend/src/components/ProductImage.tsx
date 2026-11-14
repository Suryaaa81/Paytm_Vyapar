import React, { useState } from 'react';
import { getProductImage } from '../utils/productImages';
import { Package } from 'lucide-react';

interface ProductImageProps {
  name?: string;
  category?: string;
  src?: string | null;
  className?: string;
  alt?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ 
  name, 
  category, 
  src: propSrc,
  className = "w-full h-44 object-cover rounded-xl", 
  alt 
}) => {
  const [error, setError] = useState(false);
  const src = (propSrc && propSrc.trim().length > 0) ? propSrc : getProductImage(name, category);

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-sky-100 flex flex-col items-center justify-center text-slate-400 ${className}`}>
        <Package className="w-10 h-10 text-[#0075E3] mb-1 opacity-70" />
        <span className="text-[10px] font-bold text-slate-500 uppercase">{name || 'Grocery'}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || name || 'Product'}
      loading="lazy"
      onError={() => setError(true)}
      className={`${className} transition-opacity duration-300`}
    />
  );
};

export default ProductImage;
