export const getImageUrl = (imageField: string | undefined): string => {
  if (!imageField) {
    return "https://archive.org/download/placeholder-image/placeholder-image.jpg";
  }
  
  // If it's already a full URL, return as is
  if (imageField.startsWith('http://') || imageField.startsWith('https://')) {
    return imageField;
  }
  
  // Otherwise, construct the full URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/${imageField}`;
};

export const getBlogImageUrl = (blog: any): string => {
  const imageField = blog.featuredImage || blog.image || blog.imageUrl;
  return getImageUrl(imageField);
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.src = "https://archive.org/download/placeholder-image/placeholder-image.jpg";
}; 