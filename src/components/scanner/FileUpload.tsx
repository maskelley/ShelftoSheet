import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { determineImageType, detectProductType } from "@/utils/imageProcessingUtils"; // Updated imports
import { useToast } from "@/components/ui/use-toast";

interface FileUploadProps {
  onImageSelected: (imageData: string, detectedType: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onImageSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;

        toast({
          title: "Processing Image",
          description: "Analyzing the image to detect product type...",
        });

        try {
          // First, try to determine the type from the filename
          const filenameType = determineImageType(file.name);
          console.log(`Determined product type from filename: ${filenameType}`);

          if (filenameType !== "unknown") {
            // If a type is determined from the filename, use it
            onImageSelected(imageDataUrl, filenameType);
          } else {
            // Otherwise, use AI vision to detect the product type
            const detectedType = await detectProductType(imageDataUrl);
            console.log(`Detected product type from AI: ${detectedType}`);
            onImageSelected(imageDataUrl, detectedType);
          }
        } catch (error) {
          console.error("Error in product detection:", error);

          // Fallback to a default type if detection fails
          toast({
            title: "Detection Error",
            description: "Could not detect the product type. Defaulting to 'snack'.",
            variant: "destructive",
          });
          onImageSelected(imageDataUrl, "snack");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      className="p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors"
      onClick={triggerFileInput}
    >
      <Upload className="h-12 w-12 text-blue-600 mb-2" />
      <h3 className="font-medium">Upload Image</h3>
      <p className="text-sm text-gray-500">Select an existing photo</p>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </Card>
  );
};

export { FileUpload, type FileUploadProps };