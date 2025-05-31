// exportMacroCSV.ts
// Script to export only brand, product, carbohydrate, protein, and fat columns from scanned products to a CSV file
import { ProductData } from "@/types/products";

export function exportMacroCSV(products: ProductData[], fileName: string = "macro_export") {
  const headers = ["Brand", "Product Name", "Carbohydrates (g)", "Protein (g)", "Fat (g)"];
  const rows = products.map(product => [
    product.brand,
    product.name,
    product.nutrition.carbs.toString(),
    product.nutrition.protein.toString(),
    product.nutrition.fat.toString()
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
