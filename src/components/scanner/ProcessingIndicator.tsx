import React from 'react';

interface ProcessingIndicatorProps {
  imageType: string | null;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({ imageType }) => {
  // Generate a random percentage complete between 30-90% to simulate AI processing
  const percentComplete = Math.floor(Math.random() * 60) + 30;
  
  return (
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
      <p className="font-medium">AI analyzing products on shelf...</p>
      {imageType && (
        <p className="text-sm text-gray-600 mt-2">
          Processing {imageType} products with GPT-4o vision
        </p>
      )}
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentComplete}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Identifying brands, nutritional info, and packaging details
      </p>
    </div>
  );
};

export { ProcessingIndicator, type ProcessingIndicatorProps };