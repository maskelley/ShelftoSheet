export type ProductCategory = "Protein" | "Cognition" | "Hydration" | "Prebiotic" | "Gluten Free" | "Non-GMO" | "No Category";

export function detectProductCategory(productName: string, productBrand: string, claims: string[]): ProductCategory {
  const searchText = `${productName} ${productBrand} ${claims.join(' ')}`.toLowerCase();
  
  // Check for specific categories in order of priority
  if (searchText.includes('protein') || searchText.includes('whey') || searchText.includes('casein')) {
    return "Protein";
  }
  
  if (searchText.includes('cognition') || searchText.includes('brain') || searchText.includes('focus') || 
      searchText.includes('memory') || searchText.includes('nootropic') || searchText.includes('cognitive')) {
    return "Cognition";
  }
  
  if (searchText.includes('hydration') || searchText.includes('electrolyte') || searchText.includes('hydrate') ||
      searchText.includes('sports drink') || searchText.includes('enhanced water') || searchText.includes('core hydration')) {
    return "Hydration";
  }
  
  if (searchText.includes('prebiotic') || searchText.includes('probiotic') || searchText.includes('gut health') ||
      searchText.includes('digestive health') || searchText.includes('microbiome')) {
    return "Prebiotic";
  }
  
  if (searchText.includes('gluten free') || searchText.includes('gluten-free') || searchText.includes('no gluten')) {
    return "Gluten Free";
  }
  
  if (searchText.includes('non-gmo') || searchText.includes('non gmo') || searchText.includes('no gmo') ||
      searchText.includes('gmo free') || searchText.includes('gmo-free')) {
    return "Non-GMO";
  }
  
  return "No Category";
}
