import { VisionService, OpenAIVisionService, GeminiVisionService } from './VisionServices';

export function getVisionService(): VisionService {
  // Add debugging output here
  const provider = localStorage.getItem("vision_provider") || "openai";
  console.log(`Vision provider from localStorage: "${provider}"`);
  
  const apiKey = localStorage.getItem(`${provider}_api_key`);
  if (!apiKey) {
    // If the preferred provider's key is missing, try the other provider
    const alternateProvider = provider === "openai" ? "gemini" : "openai";
    const alternateKey = localStorage.getItem(`${alternateProvider}_api_key`);
    
    if (alternateKey) {
      console.warn(`No API key found for ${provider}, using ${alternateProvider} instead`);
      // Update the provider in localStorage to match what we're actually using
      localStorage.setItem("vision_provider", alternateProvider);
      
      return provider === "openai" 
        ? new GeminiVisionService(alternateKey)
        : new OpenAIVisionService(alternateKey);
    }
    
    throw new Error(`API key for ${provider} not found. Please enter your API key in settings.`);
  }
  
  console.log(`Using ${provider} vision service`);
  
  if (provider === "gemini") {
    return new GeminiVisionService(apiKey);
  }
  
  return new OpenAIVisionService(apiKey);
}