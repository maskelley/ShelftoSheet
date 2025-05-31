import React from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { ProductData } from "@/types/products";
import { exportToCSV } from "@/utils/exportUtils";
import { exportMacroCSV } from "@/utils/exportMacroCSV";

interface SpreadsheetExportProps {
  products: ProductData[];
}

const SpreadsheetExport: React.FC<SpreadsheetExportProps> = ({ products }) => {
  const handleExport = () => {
    exportToCSV(products, 'scanned-products');
  };

  return (
    <div className="text-center">
      <Button 
        onClick={handleExport} 
        className="bg-green-600 hover:bg-green-700"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export to Spreadsheet
      </Button>
      <Button
        onClick={() => exportMacroCSV(products, 'macro-nutrition')}
        className="bg-blue-600 hover:bg-blue-700 ml-2"
      >
        <FileSpreadsheet className="mr-2 h-4 w-4" />
        Export Macros Only
      </Button>
      <p className="text-sm text-gray-500 mt-2">
        Save nutrition data as a CSV file
      </p>
    </div>
  );
};

export default SpreadsheetExport;