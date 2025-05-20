import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Create a proper type definition for ProductData
interface ProductData {
  id: string;
  name: string;
  brand: string;
  confidence: number;
  imageUrl: string;
  nutrition: Record<string, any>;
  timestamp: string;
}

// Update to use OpenAI directly instead of a proxy server
const API_BASE_URL = "https://api.openai.com/v1";

/**
 * Processes an image using OpenAI Vision API to detect objects and products.
 */
export const processImageWithVision = async (
  imageData: string,
  productType: string
): Promise<ProductData[]> => {
  try {
    console.log(`Processing ${productType} image with OpenAI Vision API directly...`);
    
    // Get API key from local storage or prompt user
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("API key not found. Please enter your OpenAI API key in settings.");
    }

    // Call OpenAI directly instead of using proxy
    const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are a product identification assistant. Identify ${productType} products in the image.`
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `What ${productType} products do you see? Return results as a JSON array with format: [{"name": "Product Name", "brand": "Brand Name", "confidence": 0.95}]`
            },
            { 
              type: "image_url",
              image_url: { url: imageData }
            }
          ]
        }
      ],
      max_tokens: 1000
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 60000
    });

    console.log("API response received directly from OpenAI");
    
    // Extract the response content - keep your existing processing code
    const responseText = response.data.choices[0].message.content;
    console.log("Response text:", responseText.substring(0, 100) + "..."); // Log only part to avoid huge logs
    
    // Parse the JSON response with improved extraction
    let products = [];
    try {
      // Try to extract JSON from the response text with better regex
      const jsonRegex = /\[[\s\S]*\]/; // Match anything between square brackets
      const jsonMatch = responseText.match(jsonRegex);
      
      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        // Alternative extraction for code blocks
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const codeMatch = responseText.match(codeBlockRegex);
        
        if (codeMatch) {
          products = JSON.parse(codeMatch[1]);
        } else {
          // Direct parse attempt
          products = JSON.parse(responseText);
        }
      }
      
      console.log("Successfully parsed products data");
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      console.log("Raw response:", responseText);
      // Fallback approach
      products = [{
        name: `${productType} product`,
        brand: "Unknown",
        confidence: 0.5
      }];
    }

    // Convert the parsed products to our app's product data format
    const detectedProducts = products.map((product: any) => ({
      id: uuidv4(),
      name: product.name || product.product || "Unknown product",
      brand: product.brand || "Unknown brand",
      confidence: product.confidence || 0.8,
      imageUrl: imageData,
      nutrition: {}, // Add logic to fetch nutrition data if available
      timestamp: new Date().toISOString(),
    }));

    console.log(`Detected ${detectedProducts.length} products`);
    return detectedProducts;
  } catch (error) {
    console.error("Error processing image:", error);
    if (axios.isAxiosError(error)) {
      console.error("API response:", error.response?.data);
      console.error("API status:", error.response?.status);
    }
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Detects the product type based on the image data using OpenAI.
 */
export const detectProductType = async (imageData: string): Promise<string> => {
  console.log("Detecting product type directly via OpenAI...");
  
  try {
    // Get API key from local storage
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("API key not found. Please enter your OpenAI API key in settings.");
    }
    
    // Call OpenAI directly for product type detection
    const response = await axios.post(`${API_BASE_URL}/chat/completions`, {
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a product category detection assistant."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "What type of products are shown? Answer with: beverage, dairy, cereal, vegetable, snack, bakery, meat, seafood, or unknown." 
            },
            { 
              type: "image_url",
              image_url: { url: imageData }
            }
          ]
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    const productType = response.data.choices[0].message.content.trim().toLowerCase();
    const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
    
    const detectedType = validTypes.includes(productType) ? productType : "unknown";
    console.log(`Detected product type: ${detectedType}`);
    
    return detectedType;
  } catch (error) {
    console.error("Error detecting product type:", error);
    if (axios.isAxiosError(error)) {
      console.error("API response:", error.response?.data);
      console.error("API status:", error.response?.status);
    }
    return "unknown";
  }
};