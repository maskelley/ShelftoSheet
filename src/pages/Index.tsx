import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Added import
import ProductScanner from "@/components/ProductScanner";
import ProductDisplay from "@/components/ProductDisplay";
import SpreadsheetExport from "@/components/SpreadsheetExport";
import { ProductData } from "@/types/product";

const Index = () => {
  const [scannedProducts, setScannedProducts] = useState<ProductData[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastRawApiResponse, setLastRawApiResponse] = useState<string | null>(null); // Added state

  const handleProductsDetected = (products: ProductData[], rawResponse: string) => {
  const debugProduct: ProductData = {
    id: 'debug-' + new Date().getTime(),
    name: `RAW_RESPONSE_DEBUG: ${rawResponse ? rawResponse.substring(0, 300) : '[[RAW_RESPONSE_WAS_NULL_OR_EMPTY]]'}`,
    brand: `(Type: ${typeof rawResponse}, Length: ${rawResponse ? rawResponse.length : 0})`,
    confidence: 1,
    imageUrl: '', // No image for this debug item
    nutrition: {},
    timestamp: new Date().toISOString()
  };

  // Add the debug product first to make it prominent
  // Keep existing products as well, if any.
  setScannedProducts((prev) => [debugProduct, ...prev.filter(p => !p.id.startsWith('debug-')), ...products.filter(p => !p.id.startsWith('debug-'))]);
  
  // Ensure lastRawApiResponse is still set, for the other display method (if it ever works)
  setLastRawApiResponse(rawResponse);
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
              onProductsDetected={handleProductsDetected}
              onCancel={() => setIsScanning(false)}
            />
          )}
        </Card>

        {scannedProducts.length > 0 && (
          <>
            <ProductDisplay products={scannedProducts} />
            <div className="mt-8">
              <SpreadsheetExport products={scannedProducts} />
            </div>
            {/* The PREVIOUS location of the rawApiResponse textarea was here - it's now removed */}
          </>
        )}

        {/* New Diagnostic Display Block - Placed AFTER the scannedProducts display */}
        {lastRawApiResponse !== null && (
          <div className="mt-8 p-4 border border-dashed border-gray-400 rounded-md bg-white shadow">
            <h3 className="text-lg font-semibold mb-2 text-center">API Response Debugging Area</h3>
            {lastRawApiResponse === "" ? (
              <p className="text-sm text-orange-600 font-semibold text-center">Status: Raw API Response received (it was an EMPTY STRING).</p>
            ) : (
              <>
                <p className="text-sm text-green-600 font-semibold text-center">Status: Raw API Response received (populated).</p>
                <p className="text-xs text-gray-700 mt-1 mb-2">
                  Beginning of response (first 200 chars): 
                  <code className="block bg-gray-100 p-2 my-1 break-all shadow-inner">{lastRawApiResponse.substring(0, 200)}...</code>
                </p>
                <h4 className="text-md font-semibold mb-1 mt-3">Full Raw API Response:</h4>
                <Textarea
                  readOnly
                  value={lastRawApiResponse}
                  className="w-full h-60 text-xs bg-gray-100 shadow-inner"
                  placeholder="Raw API response should appear here if populated..."
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;