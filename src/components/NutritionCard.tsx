import React from "react";
import { ProductData } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface NutritionCardProps {
  product: ProductData;
}

const NutritionCard: React.FC<NutritionCardProps> = ({ product }) => {
  const { nutrition } = product;
  const totalMacros = nutrition.carbs + nutrition.protein + nutrition.fat;

  const getPercentage = (value: number) => {
    return totalMacros > 0 ? Math.round((value / totalMacros) * 100) : 0;
  };

  return (
    <Card>
      <CardHeader className="bg-blue-50">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{product.name}</CardTitle>
            <p className="text-sm text-gray-500">{product.brand}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{nutrition.calories}</p>
            <p className="text-xs text-gray-500">calories</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Serving size: {nutrition.servingSize}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Carbohydrates</span>
              <span>{nutrition.carbs}g ({getPercentage(nutrition.carbs)}%)</span>
            </div>
            <Progress value={getPercentage(nutrition.carbs)} className="h-2 bg-gray-100" indicatorClassName="bg-blue-400" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Protein</span>
              <span>{nutrition.protein}g ({getPercentage(nutrition.protein)}%)</span>
            </div>
            <Progress value={getPercentage(nutrition.protein)} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium">Fat</span>
              <span>{nutrition.fat}g ({getPercentage(nutrition.fat)}%)</span>
            </div>
            <Progress value={getPercentage(nutrition.fat)} className="h-2 bg-gray-100" indicatorClassName="bg-yellow-500" />
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          {nutrition.sugar !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Sugar</p>
              <p className="font-medium">{nutrition.sugar}g</p>
            </div>
          )}
          
          {nutrition.sodium !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Sodium</p>
              <p className="font-medium">{nutrition.sodium}mg</p>
            </div>
          )}
          
          {nutrition.fiber !== undefined && (
            <div>
              <p className="text-sm text-gray-500">Fiber</p>
              <p className="font-medium">{nutrition.fiber}g</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionCard;