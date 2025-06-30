import { ProductData } from "@/types/products";

// Helper function to properly escape CSV values
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const exportToCSV = (products: ProductData[], fileName: string) => {
  // Create header row
  const headers = [
    'Product Name',
    'Brand',
    'Calories',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Sugar (g)',
    'Sodium (mg)',
    'Fiber (g)',
    'Serving Size',
    'Claims',
    'Category',
    'Scan Date'
  ];

  // Create data rows
  const rows = products.map(product => [
    escapeCSVValue(product.name),
    escapeCSVValue(product.brand),
    product.nutrition.calories.toString(),
    product.nutrition.protein.toString(),
    product.nutrition.carbs.toString(),
    product.nutrition.fat.toString(),
    product.nutrition.sugar?.toString() || '',
    product.nutrition.sodium?.toString() || '',
    product.nutrition.fiber?.toString() || '',
    escapeCSVValue(product.nutrition.servingSize),
    escapeCSVValue((product.claims || []).join("; ")), // Join claims with semicolon separator
    escapeCSVValue(product.category),
    product.timestamp
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
