import React from 'react';

interface ImagePreviewProps {
  imageUrl: string;
  imageType: string | null;
  isProcessing: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, imageType, isProcessing }) => {
  return (
    <div className="mt-4">
      <div className="rounded-lg overflow-hidden">
        <img src={imageUrl} alt="Captured" className="w-full h-auto" />
        {imageType && !isProcessing && (
          <div className="mt-2 text-center">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Detected: {imageType} products
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export { ImagePreview, type ImagePreviewProps };