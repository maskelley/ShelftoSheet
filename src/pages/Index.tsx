import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductScanner from "@/components/ProductScanner";
import ProductDisplay from "@/components/ProductDisplay";
import SpreadsheetExport from "@/components/SpreadsheetExport";
import BulkImageProcessor from "@/components/BulkImageProcessor";
import { ProductData } from "@/types/products";

// Accept provider as a prop
interface IndexProps {
  provider: "openai" | "gemini";
}

const Index = ({ provider }: IndexProps) => {
  const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [mode, setMode] = useState<"single" | "bulk">("single");

  const handleProductsDetected = (products: ProductData[]) => {
    setScannedProducts((prev) => [...prev, ...products]);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-teal-50">
      <div className="max-w-4xl mx-auto p-4">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Shelf Scanner</h1>
          <p className="text-xl text-gray-600">
            Scan grocery store shelves for product information
          </p>
        </header>

        {/* Mode Selection */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            <Button
              variant={mode === "single" ? "default" : "outline"}
              onClick={() => setMode("single")}
              className="mr-1"
            >
              Single Image
            </Button>
            <Button
              variant={mode === "bulk" ? "default" : "outline"}
              onClick={() => setMode("bulk")}
            >
              Bulk Processing
            </Button>
          </div>
        </div>

        {mode === "single" ? (
          <Card className="p-6 shadow-lg mb-8">
            {!isScanning ? (
              <div className="text-center">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 mb-4"
                  onClick={() => setIsScanning(true)}
                >
                  Scan Products
                </Button>
                <p className="text-gray-500 text-sm">
                  Take a photo or upload an image of a grocery shelf
                </p>
              </div>
            ) : (
              <ProductScanner 
                provider={provider}
                onProductsDetected={handleProductsDetected}
                onCancel={() => setIsScanning(false)}
              />
            )}
          </Card>
        ) : (
          <BulkImageProcessor provider={provider} />
        )}

        {scannedProducts.length > 0 && mode === "single" && (
          <>
            <ProductDisplay products={scannedProducts} />
            <div className="mt-8">
              <SpreadsheetExport products={scannedProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;