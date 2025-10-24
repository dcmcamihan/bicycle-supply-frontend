import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductImageGallery = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const productImages = [
    product?.image,
    "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg?auto=compress&cs=tinysrgb&w=800",
    "https://images.pexels.com/photos/544966/pexels-photo-544966.jpeg?auto=compress&cs=tinysrgb&w=800"
  ];

  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => 
      prev === 0 ? productImages?.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => 
      prev === productImages?.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative bg-muted rounded-lg overflow-hidden aspect-square">
        <Image
          src={productImages?.[selectedImageIndex]}
          alt={`${product?.name} - Image ${selectedImageIndex + 1}`}
          className={`w-full h-full object-cover transition-transform duration-300 cursor-zoom-in ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onClick={toggleZoom}
        />
        
        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevImage}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-subtle"
          iconName="ChevronLeft"
          iconSize={20}
        >
          <span className="sr-only">Previous image</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextImage}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 shadow-subtle"
          iconName="ChevronRight"
          iconSize={20}
        >
          <span className="sr-only">Next image</span>
        </Button>

        {/* Image Counter */}
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-caption">
          {selectedImageIndex + 1} / {productImages?.length}
        </div>

        {/* Zoom Indicator */}
        {isZoomed && (
          <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-caption flex items-center space-x-1">
            <Icon name="ZoomIn" size={14} />
            <span>Zoomed</span>
          </div>
        )}
      </div>
      {/* Thumbnail Gallery */}
      <div className="grid grid-cols-4 gap-2">
        {productImages?.map((image, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedImageIndex === index
                ? 'border-primary shadow-subtle'
                : 'border-border hover:border-secondary'
            }`}
          >
            <Image
              src={image}
              alt={`${product?.name} thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {selectedImageIndex === index && (
              <div className="absolute inset-0 bg-primary/10"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImageGallery;