import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// Textarea import removed as it's no longer used
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
  provider: "openai" | "gemini";
}

const ProductScanner: React.FC<ProductScannerProps> = ({
  onProductsDetected,
  onCancel,
  provider,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // rawApiResponse state removed
  const { toast } = useToast();

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setShowCamera(false);
    setImageType(null);
    setErrorMessage(null);
    toast({
      title: "Processing",
      description: `Using ${provider} to analyze the image...`,
    });
    processImageWithType(
      imageData,
      null,
      (products) => {
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} products on the shelf!`,
        });
        setErrorMessage(null);
        onProductsDetected(products);
      },
      (error) => {
        toast({
          title: "Processing Error",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
        setErrorMessage(error instanceof Error ? error.message : String(error));
      },
      setIsProcessing,
      provider // Pass provider to processImageWithType
    );
  };

  const handleFileSelected = (imageData: string, detectedType: string) => {
    setCapturedImage(imageData);
    setImageType(detectedType);
    setErrorMessage(null);
    toast({
      title: "Processing Product Image",
      description: `Analyzing ${detectedType} products with ${provider} vision...`,
    });
    processImageWithType(
      imageData,
      detectedType,
      (products) => {
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} ${detectedType} products!`,
        });
        setErrorMessage(null);
        onProductsDetected(products);
      },
      (error) => {
        toast({
          title: "Processing Error",
          description: "Could not process the image. Please try again.",
          variant: "destructive",
        });
        setErrorMessage(error instanceof Error ? error.message : String(error));
      },
      setIsProcessing,
      provider // Pass provider to processImageWithType
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

      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm break-words max-w-full overflow-x-auto mt-2" role="alert" style={{ wordBreak: 'break-word' }}>
          <strong className="font-bold">Error:</strong>
          <span className="block whitespace-pre-wrap">{errorMessage}</span>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <Button variant="outline" onClick={onCancel} className="mr-2">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ProductScanner;
