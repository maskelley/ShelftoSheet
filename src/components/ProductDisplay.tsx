import React, { useState } from "react";
import { ProductData } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NutritionCard from "@/components/NutritionCard";
import { Button } from "@/components/ui/button";

interface ProductDisplayProps {
  products: ProductData[];
}

const ProductDisplay: React.FC<ProductDisplayProps> = ({ products }) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    products.length > 0 ? products[0].id : null
  );

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Scanned Products ({products.length})</h2>
      
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer overflow-hidden hover:shadow-md transition-shadow ${
                  selectedProductId === product.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="h-32 bg-gray-100 flex items-center justify-center">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-500 truncate">{product.brand}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list">
          <div className="mt-4 space-y-2">
            {products.map((product) => (
              <Card 
                key={product.id} 
                className={`cursor-pointer overflow-hidden hover:shadow-md transition-shadow ${
                  selectedProductId === product.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="p-3 flex items-center">
                  <div className="h-16 w-16 bg-gray-100 flex-shrink-0 mr-4">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 h-full w-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.brand}</p>
                    <p className="text-sm text-gray-400">{product.nutrition.calories} cal</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedProduct && (
        <div className="mt-8">
          <NutritionCard product={selectedProduct} />
        </div>
      )}

      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => window.scrollTo(0, 0)}>
          Scan More Products
        </Button>
      </div>
    </div>
  );
};

export default ProductDisplay;
