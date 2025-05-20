import { v4 as uuidv4 } from "uuid"; // Correct import for UUID
import { processImageWithVision, detectProductType } from "./aiVisionUtils"; // Import from aiVisionUtils

// Re-export detectProductType so other components can import it from here
export { detectProductType };

// Define the ProductData interface to match what's used in aiVisionUtils
export interface ProductData {
  id: string;
  name: string;
  brand: string;
  confidence: number;
  imageUrl: string;
  nutrition: Record<string, any>;
  timestamp: string;
}

/**
 * Process an image with the specified product type or detect the type automatically
 */
export const processImageWithType = async (
  imageData: string, 
  type: string | null, 
  onSuccess: (products: ProductData[]) => void,
  onError: () => void,
  setIsProcessing: (state: boolean) => void
): Promise<void> => {
  console.log("Starting processImageWithType...");
  setIsProcessing(true);

  try {
    // If no type is provided, detect it first
    const productType = type || await detectProductType(imageData);
    console.log(`Detected product type: ${productType}`);
    
    // Attempt to process with AI vision from aiVisionUtils
    console.log("Calling processImageWithVision...");
    const products = await processImageWithVision(imageData, productType);
    console.log("Products detected by AI vision:", products);

    if (products && products.length > 0) {
      console.log("Products successfully detected. Calling onSuccess...");
      onSuccess(products);
    } else {
      console.warn("No products detected by AI vision.");
      onError();
    }
  } catch (error) {
    console.error("Error in processImageWithType:", error);
    onError();
  } finally {
    console.log("Setting isProcessing to false...");
    setIsProcessing(false);
  }
};

/**
 * Utility function to determine image type from filename or metadata
 * This is used as a fallback when AI detection isn't available
 */
export const determineImageType = (imageData: string): string => {
  console.log("Determining image type from metadata...");
  // Simple string matching for demo purposes
  // In a real app, you might use file metadata or other techniques
  if (imageData.includes("beverage")) return "beverage";
  if (imageData.includes("dairy")) return "dairy";
  if (imageData.includes("cereal")) return "cereal"; 
  if (imageData.includes("vegetable")) return "vegetable";
  if (imageData.includes("snack")) return "snack";
  if (imageData.includes("bakery")) return "bakery";
  if (imageData.includes("meat")) return "meat";
  return "unknown";
};

/**
 * Generate mock products for testing (useful when API is unavailable)
 */
export const generateMockProducts = (productType: string): ProductData[] => {
  console.log("Generating mock product data for testing");
  
  const mockProducts: Record<string, any[]> = {
    beverage: [
      { name: "Coca-Cola", brand: "Coca-Cola Company" },
      { name: "Pepsi", brand: "PepsiCo" }
    ],
    snack: [
      { name: "Lay's Classic", brand: "Frito-Lay" },
      { name: "Doritos Nacho Cheese", brand: "Frito-Lay" }
    ],
    dairy: [
      { name: "Whole Milk", brand: "Horizon Organic" },
      { name: "Greek Yogurt", brand: "Chobani" }
    ],
    // Add more product types as needed
    unknown: [
      { name: "Unknown Product", brand: "Generic Brand" }
    ]
  };
  
  const productsForType = mockProducts[productType] || mockProducts.unknown;
  
  return productsForType.map(product => ({
    id: uuidv4(), // Correctly using uuidv4 instead of uuid4
    name: product.name,
    brand: product.brand,
    confidence: 0.95,
    imageUrl: "https://example.com/placeholder.jpg",
    nutrition: {},
    timestamp: new Date().toISOString()
  }));
};