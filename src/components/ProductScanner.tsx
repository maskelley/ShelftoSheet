import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// Textarea import removed as it's no longer used
import { Camera } from "lucide-react";
import { ProductData } from "@/types/products";
import { useToast } from "@/components/ui/use-toast";
import { CameraCapture } from "./scanner/CameraCapture";
import { FileUpload } from "./scanner/FileUpload";
import { ImagePreview } from "./scanner/ImagePreview";
import { ProcessingIndicator } from "./scanner/ProcessingIndicator";
import { processImageWithType } from "@/utils/imageProcessingUtils";
import { fetchNutritionInfo } from "@/utils/nutritionUtils";
import { detectProductCategory } from "@/utils/categoryUtils";

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

  const handleProductsDetectedWithNutrition = async (products: ProductData[]) => {
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      // Fetch nutrition info for each product in parallel
      const enrichedProducts = await Promise.all(
        products.map(async (product) => {
          try {
            const nutrition = await fetchNutritionInfo(product.name, product.brand);
            // Re-detect category with enriched data (in case nutrition info helps)
            const category = detectProductCategory(product.name, product.brand, product.claims || []);
            
            return {
              ...product,
              category,
              nutrition: nutrition
                ? {
                    calories: nutrition.calories ?? 0,
                    protein: nutrition.protein ?? 0,
                    carbs: nutrition.carbohydrates ?? 0,
                    fat: nutrition.fat ?? 0,
                    servingSize: nutrition.servingSize ?? "",
                  }
                : { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: "" },
            };
          } catch (err) {
            // If nutrition fetch fails, fallback to empty/defaults
            return {
              ...product,
              category: detectProductCategory(product.name, product.brand, product.claims || []),
              nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: "" },
            };
          }
        })
      );
      onProductsDetected(enrichedProducts);
    } catch (err) {
      setErrorMessage("Failed to enrich products with nutrition info.");
    } finally {
      setIsProcessing(false);
    }
  };

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
        console.log("Single image claims detected:", products.map(p => ({ name: p.name, claims: p.claims })));
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} products on the shelf!`,
        });
        setErrorMessage(null);
        handleProductsDetectedWithNutrition(products);
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
        console.log("Single image claims detected:", products.map(p => ({ name: p.name, claims: p.claims })));
        toast({
          title: "Analysis Complete",
          description: `Found ${products.length} ${detectedType} products!`,
        });
        setErrorMessage(null);
        handleProductsDetectedWithNutrition(products);
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
