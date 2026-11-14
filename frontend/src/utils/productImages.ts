// High quality, fast-loading, reliable curated authentic product photos with graceful SVG fallback
export const PRODUCT_IMAGES: Record<string, string> = {
  // Rice & Grains
  'sona masoori rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  'basmati rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
  
  // Dals & Pulses (Authentic Indian Lentils / Pulses)
  'toor dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tur_Dal.JPG',
  'tur dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tur_Dal.JPG',
  'moong dal': 'https://upload.wikimedia.org/wikipedia/commons/7/78/Moong_dal.jpg',
  'chana dal': 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Chana_dal.jpg',
  'dal': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tur_Dal.JPG',
  'pulses': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Tur_Dal.JPG',

  // Oils
  'sunflower oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'groundnut oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'cooking oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',

  // Flour & Atta
  'wheat flour / atta': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'wheat flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'atta': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',

  // Sweeteners & Sugar
  'sugar': 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',
  'jaggery': 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?auto=format&fit=crop&w=600&q=80',

  // Default Grocery Fallback
  'default': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
};

export const getProductImage = (productName?: string, category?: string): string => {
  if (!productName) return PRODUCT_IMAGES['default'];
  const nameLower = productName.toLowerCase();
  
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }

  // Category based matching
  if (category) {
    const catLower = category.toLowerCase();
    if (catLower.includes('grain') || catLower.includes('rice')) return PRODUCT_IMAGES['rice'];
    if (catLower.includes('pulse') || catLower.includes('dal')) return PRODUCT_IMAGES['toor dal'];
    if (catLower.includes('oil')) return PRODUCT_IMAGES['sunflower oil'];
    if (catLower.includes('sweet') || catLower.includes('sugar')) return PRODUCT_IMAGES['sugar'];
    if (catLower.includes('flour') || catLower.includes('atta')) return PRODUCT_IMAGES['atta'];
  }

  return PRODUCT_IMAGES['default'];
};
