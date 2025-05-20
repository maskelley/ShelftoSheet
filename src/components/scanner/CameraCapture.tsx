import React, { useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { detectProductType } from "@/utils/imageProcessingUtils"; // Updated import

interface CameraCaptureProps {
  onImageCaptured: (imageData: string) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onImageCaptured }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureImage = async () => {
    if (videoRef.current) {
      toast({
        title: "Processing",
        description: "Analyzing image with AI...",
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");

        // Use detectProductType to analyze the image
        try {
          const productType = await detectProductType(dataUrl);
          console.log(`Detected product type: ${productType}`);
          onImageCaptured(dataUrl); // Pass the image data to the parent component
        } catch (error) {
          console.error("Error detecting product type:", error);
          toast({
            title: "Processing Error",
            description: "Could not analyze the image. Please try again.",
            variant: "destructive",
          });
        }

        stopCamera();
      }
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline
          className="w-full h-auto"
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <Button onClick={captureImage} className="bg-white text-blue-600 hover:bg-blue-100">
            Capture
          </Button>
        </div>
      </div>
    </div>
  );
};

export { CameraCapture, type CameraCaptureProps };