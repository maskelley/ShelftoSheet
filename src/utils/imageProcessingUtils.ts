import { v4 as uuidv4 } from "uuid"; // Correct import for UUID
import { NutritionInfo, ProductData } from "@/types/products";
import { processImageWithVision, detectProductType } from "./aiVisionUtils";
import { detectProductCategory } from "./categoryUtils";

// Re-export detectProductType so other components can import it from here
export { detectProductType };

/**
 * Process an image with the specified product type or detect the type automatically
 */
export const processImageWithType = async (
  imageData: string, 
  type: string | null, 
  onSuccess: (products: ProductData[]) => void,
  onError: (error: Error) => void,
  setIsProcessing: (state: boolean) => void,
  provider: "openai" | "gemini" // <-- add provider param
): Promise<void> => {
  console.log("Starting processImageWithType with provider:", provider);
  setIsProcessing(true);

  try {
    // If no type is provided, detect it first
    const productType = type || await detectProductType(imageData, provider);
    console.log(`Detected product type: ${productType}`);
    // Attempt to process with AI vision from aiVisionUtils
    console.log("Calling processImageWithVision with provider:", provider);
    const products = await processImageWithVision(imageData, productType, provider);
    console.log("Products detected by AI vision:", products);
    if (products && products.length > 0) {
      console.log("Products successfully detected. Calling onSuccess...");
      onSuccess(products);
    } else {
      console.warn("No products detected by AI vision.");
      onError(new Error("No products detected by AI vision."));
    }
  } catch (error) {
    console.error("Error in processImageWithType:", error);
    onError(error);
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
      { 
        name: "Core Hydration Water", 
        brand: "Core Hydration",
        claims: ["Perfect pH", "Electrolyte Enhanced", "Gluten Free"]
      },
      { 
        name: "Protein Shake", 
        brand: "Premier Protein",
        claims: ["High Protein", "30g Protein", "Gluten Free"]
      }
    ],
    snack: [
      { 
        name: "Protein Bar", 
        brand: "Quest Nutrition",
        claims: ["High Protein", "Gluten Free", "20g Protein"]
      },
      { 
        name: "Organic Chips", 
        brand: "Simply Organic",
        claims: ["Non-GMO", "Gluten Free", "Organic"]
      }
    ],
    dairy: [
      { 
        name: "Greek Yogurt", 
        brand: "Chobani",
        claims: ["High Protein", "Probiotic", "Non-GMO"]
      },
      { 
        name: "Organic Milk", 
        brand: "Horizon Organic",
        claims: ["Organic", "Non-GMO", "Grass Fed"]
      }
    ],
    // Add more product types as needed
    unknown: [
      { 
        name: "Unknown Product", 
        brand: "Generic Brand",
        claims: []
      }
    ]
  };
  
  const productsForType = mockProducts[productType] || mockProducts.unknown;
  
  return productsForType.map(product => {
    const claims = product.claims || [];
    const category = detectProductCategory(product.name, product.brand, claims);
    
    return {
      id: uuidv4(),
      name: product.name,
      brand: product.brand,
      confidence: 0.95,
      imageUrl: "https://example.com/placeholder.jpg",
      claims,
      category,
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, servingSize: "" },
      timestamp: new Date().toISOString()
    };
  });
};