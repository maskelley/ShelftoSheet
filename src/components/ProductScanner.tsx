import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea"; // Added import
import { Camera } from "lucide-react";
import { ProductData } from "@/types/product";
import { useToast } from "@/components/ui/use-toast";
import { CameraCapture } from "./scanner/CameraCapture";
import { FileUpload } from "./scanner/FileUpload";
import { ImagePreview } from "./scanner/ImagePreview";
import { ProcessingIndicator } from "./scanner/ProcessingIndicator";
import { processImageWithType } from "@/utils/imageProcessingUtils";

interface ProductScannerProps {
  onProductsDetected: (products: ProductData[]) => void;
  onCancel: () => void;
}

const ProductScanner: React.FC<ProductScannerProps> = ({
  onProductsDetected,
  onCancel,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null); // Added state
  const { toast } = useToast();

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
    
    // For camera captures, let the system detect the product type
    setImageType(null);
    toast({
      title: "Processing",
      description: "Using GPT-4o to analyze the image...",
    });
    
    // Process the image with AI detection
    processImageWithType(
      imageData, 
      null, // passing null lets the system detect the type
      (products, rawResponse) => { // Updated callback signature
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} products on the shelf!`,
        });
        onProductsDetected(products);
        setRawApiResponse(rawResponse); // Added line
      },
      () => {
        toast({
          title: "Processing Error",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
      },
      setIsProcessing
    );
  };

  const handleFileSelected = (imageData: string, detectedType: string) => {
    setCapturedImage(imageData);
    setImageType(detectedType);
    
    toast({
      title: "Processing Product Image",
      description: `Analyzing ${detectedType} products with GPT-4o vision...`,
    });
    
    processImageWithType(
      imageData, 
      detectedType, 
      (products, rawResponse) => { // Updated callback signature
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} ${detectedType} products!`,
        });
        onProductsDetected(products);
        setRawApiResponse(rawResponse); // Added line
      },
      () => {
        toast({
          title: "Processing Error",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
      },
      setIsProcessing
    );
  };

  const handleStartCamera = () => {
    setShowCamera(true);
  };

  return (
    <div className="space-y-4">
      {!capturedImage && !isProcessing && !showCamera && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors" 
            onClick={handleStartCamera}
          >
            <Camera className="h-12 w-12 text-blue-600 mb-2" />
            <h3 className="font-medium">Take Photo</h3>
            <p className="text-sm text-gray-500">Use your camera to scan shelves</p>
          </Card>
          
          <FileUpload onImageSelected={handleFileSelected} />
        </div>
      )}

      {showCamera && !capturedImage && (
        <CameraCapture onImageCaptured={handleCameraCapture} />
      )}

      {capturedImage && (
        <ImagePreview 
          imageUrl={capturedImage} 
          imageType={imageType} 
          isProcessing={isProcessing} 
        />
      )}

      {isProcessing && (
        <ProcessingIndicator imageType={imageType} />
      )}

      {rawApiResponse && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">Raw API Response (for debugging):</h4>
          <Textarea
            readOnly
            value={rawApiResponse}
            className="w-full h-48 text-xs"
            placeholder="Raw API response will appear here..."
          />
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={onCancel} className="mr-2">Cancel</Button>
      </div>
    </div>
  );
};

export default ProductScanner;
