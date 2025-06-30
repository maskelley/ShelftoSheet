import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProductData } from "@/types/products";
import { processImageWithType } from "@/utils/imageProcessingUtils";
import { exportMacroCSV } from "@/utils/exportMacroCSV";
import { fetchNutritionInfo } from "@/utils/nutritionUtils";
import { FolderOpen, Download } from "lucide-react";

interface BulkImageProcessorProps {
  provider: "openai" | "gemini";
}

interface ProcessingStatus {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

const BulkImageProcessor: React.FC<BulkImageProcessorProps> = ({ provider }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductData[]>([]);
  const [status, setStatus] = useState<ProcessingStatus>({
    total: 0,
    completed: 0,
    current: "",
    errors: []
  });

  const handleFolderSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Filter for image files
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      alert("No image files found in the selected folder.");
      return;
    }

    setIsProcessing(true);
    setAllProducts([]);
    setStatus({
      total: imageFiles.length,
      completed: 0,
      current: "",
      errors: []
    });

    const allDetectedProducts: ProductData[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setStatus(prev => ({
        ...prev,
        current: `Processing ${file.name}...`,
        completed: i
      }));

      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);
        
        // Process the image with AI vision
        const detectedProducts = await new Promise<ProductData[]>((resolve, reject) => {
          processImageWithType(
            base64,
            null, // Let AI detect product type
            (products) => resolve(products),
            (error) => reject(error),
            () => {}, // setIsProcessing - we'll handle this ourselves
            provider
          );
        });

        // Enrich each product with nutrition info (same as single image workflow)
        setStatus(prev => ({
          ...prev,
          current: `Fetching nutrition for ${file.name}...`
        }));

        const enrichedProducts = await Promise.all(
          detectedProducts.map(async (product) => {
            try {
              console.log(`Fetching nutrition for: ${product.name} (${product.brand})`);
              const nutrition = await fetchNutritionInfo(product.name, product.brand);
              console.log(`Nutrition result for ${product.name}:`, nutrition);
              
              return {
                ...product,
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
            } catch (nutritionError) {
              console.error(`Failed to fetch nutrition for ${product.name}:`, nutritionError);
              return product; // Keep original product with default nutrition
            }
          })
        );

        allDetectedProducts.push(...enrichedProducts);
        setAllProducts([...allDetectedProducts]); // Update UI in real-time

        // Increased delay to prevent overwhelming both AI and nutrition APIs
        await new Promise(resolve => setTimeout(resolve, 1500));

      } catch (error) {
        setStatus(prev => ({
          ...prev,
          errors: [...prev.errors, `${file.name}: ${error instanceof Error ? error.message : String(error)}`]
        }));
      }
    }

    setStatus(prev => ({
      ...prev,
      completed: imageFiles.length,
      current: "Processing complete!"
    }));
    setIsProcessing(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExportAll = () => {
    if (allProducts.length === 0) {
      alert("No products to export.");
      return;
    }
    
    // Debug: Log the products being exported
    console.log("Exporting products:", allProducts.map(p => ({
      name: p.name,
      brand: p.brand,
      nutrition: p.nutrition
    })));
    
    // Create unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bulk_macro_export_${timestamp}`;
    
    exportMacroCSV(allProducts, filename);
  };

  const progressPercentage = status.total > 0 ? (status.completed / status.total) * 100 : 0;

  return (
    <Card className="p-6 shadow-lg mb-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-4">Bulk Image Processing</h2>
      <p className="text-gray-600 mb-4">
        Select a folder of images to process all at once and export the combined results.
      </p>

      {!isProcessing ? (
        <div className="space-y-4">
          <div>
            <input
              type="file"
              multiple
              {...({ webkitdirectory: "" } as any)}
              onChange={handleFolderSelect}
              className="hidden"
              id="folder-input"
              accept="image/*"
            />
            <Button
              variant="default"
              size="lg"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => document.getElementById('folder-input')?.click()}
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              Select Folder of Images
            </Button>
          </div>
          
          {allProducts.length > 0 && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-800">Processing Complete!</h3>
                <p className="text-green-700">
                  Found {allProducts.length} products across {status.total} images.
                </p>
                
                {/* Debug info showing nutrition data */}
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                  <p className="font-medium text-blue-800">Sample nutrition data:</p>
                  {allProducts.slice(0, 3).map((product, idx) => (
                    <div key={idx} className="text-blue-700">
                      {product.name}: Carbs: {product.nutrition.carbs}g, Protein: {product.nutrition.protein}g, Fat: {product.nutrition.fat}g
                    </div>
                  ))}
                </div>
                
                {status.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-600 font-medium">{status.errors.length} errors occurred:</p>
                    <ul className="text-red-600 text-sm max-h-32 overflow-y-auto">
                      {status.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <Button
                variant="default"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleExportAll}
              >
                <Download className="mr-2 h-4 w-4" />
                Export All Products to CSV
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Processing Images</span>
              <span className="text-sm text-gray-500">
                {status.completed} / {status.total}
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <div className="text-sm text-gray-600">
            Current: {status.current}
          </div>
          
          {status.errors.length > 0 && (
            <div className="text-sm text-red-600">
              Errors: {status.errors.length}
            </div>
          )}
          
          <div className="text-sm text-blue-600 font-medium">
            Products found so far: {allProducts.length}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BulkImageProcessor;
