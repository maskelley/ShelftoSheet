import axios from "axios";

export interface NutritionInfo {
  servingSize?: string;
  carbohydrates?: number;
  protein?: number;
  fat?: number;
  calories?: number;
}

/**
 * Fetch nutrition info for a product using Open Food Facts API.
 * @param productName The product name (from AI vision output)
 * @param brand The product brand (optional, from AI vision output)
 * @returns NutritionInfo or null if not found
 */
export async function fetchNutritionInfo(productName: string, brand?: string): Promise<NutritionInfo | null> {
  try {
    const query = encodeURIComponent(productName + (brand ? ` ${brand}` : ""));
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${query}&search_simple=1&action=process&json=1&page_size=1`;
    const response = await axios.get(url);

    if (response.data.products && response.data.products.length > 0) {
      const product = response.data.products[0];
      return {
        servingSize: product.serving_size,
        carbohydrates: product.nutriments?.carbohydrates_100g,
        protein: product.nutriments?.proteins_100g,
        fat: product.nutriments?.fat_100g,
        calories: product.nutriments?.energy_kcal_100g,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch nutrition info:", error);
    return null;
  }
}
