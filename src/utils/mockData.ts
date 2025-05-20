import { ProductData } from "@/types/product";
import { v4 as uuidv4 } from 'uuid';

export const mockProductDetection = (type?: string): ProductData[] => {
  // In a real app, this would come from API calls to product recognition services
  const mockProducts: ProductData[] = [
    {
      id: uuidv4(),
      name: "Organic Almond Milk",
      brand: "Nature's Best",
      confidence: 0.92,
      imageUrl: "https://images.unsplash.com/photo-1590502593989-fd4b7de64796?q=80&w=580&auto=format&fit=crop",
      nutrition: {
        calories: 30,
        protein: 1,
        carbs: 1,
        fat: 2.5,
        sugar: 0,
        sodium: 150,
        fiber: 0,
        servingSize: "1 cup (240ml)"
      },
      timestamp: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: "Whole Grain Bread",
      brand: "Hearty Baker",
      confidence: 0.89,
      imageUrl: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?q=80&w=580&auto=format&fit=crop",
      nutrition: {
        calories: 120,
        protein: 4,
        carbs: 22,
        fat: 2,
        sugar: 3,
        fiber: 3,
        sodium: 200,
        servingSize: "1 slice (45g)"
      },
      timestamp: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: "Greek Yogurt",
      brand: "Pure Dairy",
      confidence: 0.95,
      imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=580&auto=format&fit=crop",
      nutrition: {
        calories: 120,
        protein: 15,
        carbs: 9,
        fat: 0,
        sugar: 7,
        sodium: 65,
        servingSize: "170g container"
      },
      timestamp: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: "Peanut Butter",
      brand: "Nutty's",
      confidence: 0.87,
      imageUrl: "https://images.unsplash.com/photo-1593493049376-361cf4877e95?q=80&w=580&auto=format&fit=crop",
      nutrition: {
        calories: 190,
        protein: 7,
        carbs: 7,
        fat: 16,
        sugar: 3,
        sodium: 150,
        fiber: 2,
        servingSize: "2 tbsp (32g)"
      },
      timestamp: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: "Oat Cereal",
      brand: "Morning Start",
      confidence: 0.90,
      nutrition: {
        calories: 120,
        protein: 3,
        carbs: 24,
        fat: 2,
        sugar: 1,
        fiber: 4,
        sodium: 140,
        servingSize: "3/4 cup (30g)"
      },
      timestamp: new Date().toISOString()
    }
  ];
  
  return mockProducts;
};
