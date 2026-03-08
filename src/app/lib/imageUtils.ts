
export const getSakePlaceholderUrl = (name: string) => {
  const colors = ['4A90E2', '7ED321', 'F5A623', 'D0021B', '9013FE', '50E3C2', 'FF6B6B', '48C6EF'];
  
  const cleanName = name.replace(/[\s\u3000]+/g, '').trim();
  const colorIndex = cleanName.length % colors.length;
  const bgColor = colors[colorIndex];
  
  return `https://placehold.co/600x600/${bgColor}/${bgColor}.png`;
};


export const getDisplayImageUrl = (imageUrl: string | null | undefined, name: string) => {
  if (!imageUrl || imageUrl.includes('placehold.co') || imageUrl.includes('95a5a6')) {
    return getSakePlaceholderUrl(name);
  }
  return imageUrl;
};
