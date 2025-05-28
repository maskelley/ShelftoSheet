import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// ProductData interface to match your existing type
interface ProductData {
  id: string;
  name: string;
  brand: string;
  confidence: number;
  imageUrl: string;
  nutrition: Record<string, any>;
  timestamp: string;
}

export type VisionProvider = 'openai' | 'gemini';

export interface VisionService {
  detectProductType(imageData: string): Promise<string>;
  processImageWithVision(imageData: string, productType: string): Promise<ProductData[]>;
}

// OpenAI Vision Service Implementation
export class OpenAIVisionService implements VisionService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectProductType(imageData: string): Promise<string> {
    console.log("Detecting product type using OpenAI Vision...");
    
    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });
      
      const productType = response.data.choices[0].message.content.trim().toLowerCase();
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      
      const detectedType = validTypes.includes(productType) ? productType : "unknown";
      console.log(`OpenAI detected product type: ${detectedType}`);
      
      return detectedType;
    } catch (error) {
      console.error("Error detecting product type with OpenAI:", error);
      if (axios.isAxiosError(error)) {
        console.error("API response:", error.response?.data);
        console.error("API status:", error.response?.status);
      }
      return "unknown";
    }
  }

  async processImageWithVision(imageData: string, productType: string): Promise<ProductData[]> {
    try {
      console.log(`Processing ${productType} image with OpenAI Vision API...`);
      
      // Call OpenAI directly
      const response = await axios.post(`${this.baseUrl}/chat/completions`, {
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
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      console.log("API response received from OpenAI");
      
      // Extract the response content
      const responseText = response.data.choices[0].message.content;
      console.log("Response text:", responseText.substring(0, 100) + "..."); // Log only part
      
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
        nutrition: {}, // Empty nutrition object to match your interface
        timestamp: new Date().toISOString(),
      }));

      console.log(`OpenAI detected ${detectedProducts.length} products`);
      return detectedProducts;
    } catch (error) {
      console.error("Error processing image with OpenAI:", error);
      if (axios.isAxiosError(error)) {
        console.error("API response:", error.response?.data);
        console.error("API status:", error.response?.status);
      }
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Gemini Vision Service Implementation
export class GeminiVisionService implements VisionService {
  private apiKey: string;
  private baseUrl = "https://generativelanguage.googleapis.com/v1";
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async detectProductType(imageData: string): Promise<string> {
    try {
      // Extract base64 data without the prefix
      const base64Image = imageData.split(',')[1];
    
      // IMPORTANT: Use query parameter for API key, not header
      const response = await axios.post(
        `${this.baseUrl}/models/gemini-1.5-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [{
            parts: [
              { text: "What type of products are shown? Answer with: beverage, dairy, cereal, vegetable, snack, bakery, meat, seafood, or unknown." },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
         }]
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000
        }
    );
      
      // Extract the text response from Gemini
      const productType = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      // Ensure it's one of our expected categories
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      const detectedType = validTypes.includes(productType) ? productType : "unknown";
      
      console.log(`Gemini detected product type: ${detectedType}`);
      return detectedType;
    } catch (error) {
      console.error("Error detecting product type with Gemini:", error);
      if (axios.isAxiosError(error)) {
        console.error("API response:", error.response?.data);
        console.error("API status:", error.response?.status);
      }
      return "unknown";
    }
  }

  async processImageWithVision(imageData: string, productType: string): Promise<ProductData[]> {
    try {
      console.log(`Processing ${productType} image with Gemini Vision API...`);
    
      // Extract base64 data without the prefix (data:image/jpeg;base64,)
      const base64Image = imageData.split(',')[1];
      console.log(`Base64 image length: ${base64Image.length}`);
    
      // Log API key length (not the actual key) for debugging
      console.log(`API key length: ${this.apiKey.length}`);
      console.log(`API key format check: ${this.apiKey.startsWith("AI")}`);
    
      // Construct proper URL with API key as query parameter
      const url = `${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(this.apiKey)}`;
    
      // Update the request payload with a more explicit prompt
      const requestPayload = {
        contents: [{
          parts: [
            // Use this more specific prompt
            { text: `Identify the ${productType} product in this image. Return ONLY a JSON array with this exact format: [{"name": "Product Name"}]. Do not include any explanations or text outside the JSON array.` },
      
            { 
              inline_data: { 
                mime_type: "image/jpeg", 
                data: base64Image 
             } 
            }
           ]
        }],
        generationConfig: {
          temperature: 0.1,  // Lower temperature for more deterministic output
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 512,  // Reduced for efficiency
        }
     };

      console.log("Sending request to Gemini API...");
    
      // Make API request with proper headers
      const response = await axios.post(url, requestPayload, {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });
    
      console.log("API response received from Gemini");
    
      // Extract the text response from Gemini
      const responseText = response.data.candidates[0].content.parts[0].text;
      console.log("Response text:", responseText.substring(0, 100) + "..."); 
    
      // Parse the JSON response with improved extraction
      let products = [];
      try {
        // Try to extract JSON from the response text
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
      
        console.log("Successfully parsed products data from Gemini");
      } catch (parseError) {
        console.error("Error parsing Gemini response:", parseError);
        console.log("Raw Gemini response:", responseText);
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
        nutrition: {}, // Empty nutrition object to match your interface
        timestamp: new Date().toISOString(),
      }));
    
      console.log(`Gemini detected ${detectedProducts.length} products`);
      return detectedProducts;
    } catch (error) {
      console.error("Error processing image with Gemini:", error);
    
      // Enhanced error logging for authentication issues
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error("Authentication failed - Invalid API key or insufficient permissions");
          console.error("Make sure you're using an API key from Google AI Studio (not Cloud Console)");
          console.error("API response:", JSON.stringify(error.response?.data));
        } else if (error.response?.status === 403) {
          console.error("Authorization failed - Your API key may not have access to Gemini Pro Vision");
          console.error("API response:", JSON.stringify(error.response?.data));
        } else if (error.response?.status === 429) {
          console.error("Rate limit exceeded for Gemini API");
          console.error("API response:", JSON.stringify(error.response?.data));
    
          // Check for Retry-After header which suggests when to retry
          const retryAfter = error.response?.headers?.['retry-after'];
          if (retryAfter) {
          console.error(`API suggests retrying after ${retryAfter} seconds`);
          }
    
          // Modify the error message to be more specific about rate limiting
          throw new Error(`Gemini API rate limit exceeded. ${retryAfter ? `Please try again after ${retryAfter} seconds or ` : ''}Consider switching to OpenAI, reducing image size, or trying later.`);
      } else {
          console.error("API response:", error.response?.data);
          console.error("API status:", error.response?.status);
      }
    }

throw new Error(`Failed to process image with Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}    