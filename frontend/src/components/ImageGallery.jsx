import React, { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaDownload } from 'react-icons/fa';

const ImageGallery = ({ images, initialIndex = 0, onClose, darkMode }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.url;
    link.download = currentImage.filename || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      onClick={onClose}
      data-testid="image-gallery"
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition text-white z-10"
        data-testid="close-gallery"
      >
        <FaTimes className="text-xl" />
      </button>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="absolute top-4 right-20 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition text-white z-10"
        data-testid="download-image"
      >
        <FaDownload className="text-xl" />
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          {/* Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition text-white z-10"
            data-testid="previous-image"
          >
            <FaChevronLeft className="text-xl" />
          </button>

          {/* Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition text-white z-10"
            data-testid="next-image"
          >
            <FaChevronRight className="text-xl" />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white bg-opacity-10 rounded-full text-white z-10">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}

      {/* Image */}
      <div 
        className="max-w-7xl max-h-[90vh] p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={currentImage.url}
          alt={currentImage.filename || 'Image'}
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
        />
        {currentImage.filename && (
          <p className="text-white text-center mt-4 text-sm opacity-75">
            {currentImage.filename}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
