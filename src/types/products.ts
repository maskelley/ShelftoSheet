export interface ProductData {
  id: string;
  name: string;
  brand: string;
  imageUrl?: string;
  confidence: number;
  nutrition: NutritionInfo;
  timestamp: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
  sodium?: number;
  fiber?: number;
  servingSize: string;
}