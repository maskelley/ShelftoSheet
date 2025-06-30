// exportMacroCSV.ts
// Script to export only brand, product, carbohydrate, protein, and fat columns from scanned products to a CSV file
import { ProductData } from "@/types/products";

// Helper function to properly escape CSV values
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportMacroCSV(products: ProductData[], fileName: string = "macro_export") {
  const headers = ["Brand", "Product Name", "Carbohydrates (g)", "Protein (g)", "Fat (g)", "Claims", "Category"];
  const rows = products.map(product => [
    escapeCSVValue(product.brand),
    escapeCSVValue(product.name),
    product.nutrition.carbs.toString(),
    product.nutrition.protein.toString(),
    product.nutrition.fat.toString(),
    escapeCSVValue((product.claims || []).join("; ")), // Join claims with semicolon separator
    escapeCSVValue(product.category)
  ]);
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
