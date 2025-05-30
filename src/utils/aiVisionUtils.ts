import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// ProductData type definition
interface ProductData {
  id: string;
  name: string;
  brand: string;
  confidence: number;
  imageUrl: string;
  nutrition: Record<string, any>;
  timestamp: string;
}

type Provider = "openai" | "gemini";

/**
 * Processes an image using OpenAI Vision API or Gemini API to detect objects and products.
 */
export const processImageWithVision = async (
  imageData: string,
  productType: string,
  provider: Provider
): Promise<ProductData[]> => {
  try {
    let apiKey: string | null = null;
    let products: any[] = [];

    if (provider === "openai") {
      apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        throw new Error("API key not found. Please enter your OpenAI API key in settings.");
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
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
                  text: `Identify all distinct ${productType} products visible in the image. Return a single JSON array, where each element is an object with 'name', 'brand', and 'confidence' fields. Only return the array, no extra text. Example: [{"name": "Product A", "brand": "Brand X", "confidence": 0.9}, {"name": "Product B", "brand": "Brand Y", "confidence": 0.8}]. If no products are found, return an empty array.`
                },
                {
                  type: "image_url",
                  image_url: { url: imageData }
                }
              ]
            }
          ],
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 60000
        }
      );

      const responseText = response.data.choices[0].message.content;
      // Try to extract JSON array from the response
      const jsonRegex = /\[[\s\S]*\]/;
      const jsonMatch = responseText.match(jsonRegex);

      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        // Try code block extraction
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const codeMatch = responseText.match(codeBlockRegex);
        if (codeMatch) {
          products = JSON.parse(codeMatch[1]);
        } else {
          // Direct parse attempt
          products = JSON.parse(responseText);
        }
      }
    } else if (provider === "gemini") {
      apiKey = localStorage.getItem("gemini_api_key");
      if (!apiKey) {
        throw new Error("API key not found. Please enter your Gemini API key in settings.");
      }

      // Gemini expects base64 image, not a URL
      // If imageData is a URL, you need to fetch and convert it to base64 before calling this function
      const geminiPrompt = `Identify all distinct ${productType} products visible in the image. Return a single JSON array, where each element is an object with 'name', 'brand', and 'confidence' fields. Only return the array, no extra text. Example: [{"name": "Product A", "brand": "Brand X", "confidence": 0.9}, {"name": "Product B", "brand": "Brand Y", "confidence": 0.8}]. If no products are found, return an empty array.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: geminiPrompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData.replace(/^data:image\/\w+;base64,/, "")
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 60000
        }
      );

      // Gemini's response format
      const candidates = response.data.candidates || [];
      let responseText = "";
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        responseText = candidates[0].content.parts.map((p: any) => p.text).join("");
      }
      // Try to extract JSON array from the response
      const jsonRegex = /\[[\s\S]*\]/;
      const jsonMatch = responseText.match(jsonRegex);

      if (jsonMatch) {
        products = JSON.parse(jsonMatch[0]);
      } else {
        // Try code block extraction
        const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
        const codeMatch = responseText.match(codeBlockRegex);
        if (codeMatch) {
          products = JSON.parse(codeMatch[1]);
        } else {
          // Direct parse attempt
          products = JSON.parse(responseText);
        }
      }
    } else {
      throw new Error("Unknown provider");
    }

    // Convert the parsed products to our app's product data format
    const detectedProducts = products.map((product: any) => ({
      id: uuidv4(),
      name: product.name || product.product || "Unknown product",
      brand: product.brand || "Unknown brand",
      confidence: product.confidence || 0.8,
      imageUrl: imageData,
      nutrition: {},
      timestamp: new Date().toISOString(),
    }));

    return detectedProducts;
  } catch (error) {
    let errorMessage = "Failed to process image: ";
    if (axios.isAxiosError(error)) {
      errorMessage += error.message;
      if (error.response) {
        errorMessage += ` (status: ${error.response.status})`;
        if (typeof error.response.data === "string") {
          errorMessage += `\nResponse: ${error.response.data}`;
        } else if (error.response.data) {
          errorMessage += `\nResponse: ${JSON.stringify(error.response.data)}`;
        }
      }
    } else if (error instanceof Error) {
      errorMessage += error.message;
    } else {
      errorMessage += "Unknown error";
    }
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Detects the product type based on the image data using OpenAI or Gemini.
 */
export const detectProductType = async (
  imageData: string,
  provider: Provider
): Promise<string> => {
  try {
    let apiKey: string | null = null;
    let productType = "unknown";

    if (provider === "openai") {
      apiKey = localStorage.getItem("openai_api_key");
      if (!apiKey) {
        throw new Error("API key not found. Please enter your OpenAI API key in settings.");
      }

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
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
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const responseText = response.data.choices[0].message.content.trim().toLowerCase();
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      productType = validTypes.includes(responseText) ? responseText : "unknown";
    } else if (provider === "gemini") {
      apiKey = localStorage.getItem("gemini_api_key");
      if (!apiKey) {
        throw new Error("API key not found. Please enter your Gemini API key in settings.");
      }

      const geminiPrompt = "What type of products are shown? Answer with: beverage, dairy, cereal, vegetable, snack, bakery, meat, seafood, or unknown.";

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                { text: geminiPrompt },
                {
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: imageData.replace(/^data:image\/\w+;base64,/, "")
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const candidates = response.data.candidates || [];
      let responseText = "";
      if (candidates.length > 0 && candidates[0].content && candidates[0].content.parts) {
        responseText = candidates[0].content.parts.map((p: any) => p.text).join("").trim().toLowerCase();
      }
      const validTypes = ["beverage", "dairy", "cereal", "vegetable", "snack", "bakery", "meat", "seafood"];
      productType = validTypes.includes(responseText) ? responseText : "unknown";
    } else {
      throw new Error("Unknown provider");
    }

    return productType;
  } catch (error) {
    console.error("Error detecting product type:", error);
    if (axios.isAxiosError(error)) {
      console.error("API response:", error.response?.data);
      console.error("API status:", error.response?.status);
    }
    return "unknown";
  }
};