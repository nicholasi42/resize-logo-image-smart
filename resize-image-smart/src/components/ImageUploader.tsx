import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Download } from 'lucide-react';
import { detectBackgroundColor, ColorInfo } from '@/utils/colorDetection';
import { hasTransparentBackground } from '@/utils/transparencyDetection';
import BackgroundColorPicker from './BackgroundColorPicker';

const ImageUploader: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedColor, setDetectedColor] = useState<ColorInfo | null>(null);
  const [isTransparent, setIsTransparent] = useState(false);
  const [selectedBgColor, setSelectedBgColor] = useState('#ffffff');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setProcessedImage(null);
        setDetectedColor(null);
        setIsTransparent(false);
        setSelectedBgColor('#ffffff');
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const transparent = hasTransparentBackground(canvas, img);
    setIsTransparent(transparent);
    
    if (!transparent) {
      const bgColor = detectBackgroundColor(canvas, img);
      setDetectedColor(bgColor);
      if (bgColor) {
        setSelectedBgColor(bgColor.hex);
      }
    }
  };

  const processImage = () => {
    if (!selectedImage || !canvasRef.current) return;
    
    setIsProcessing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const size = 640;
      canvas.width = size;
      canvas.height = size;
      
      // Analyze image first
      analyzeImage(img);
      
      // Fill with selected background color
      ctx!.fillStyle = selectedBgColor;
      ctx!.fillRect(0, 0, size, size);
      
      // Scale image to fit within 85% for margins
      const maxSize = size * 0.85;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      // Center the image
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;
      
      // Draw the image
      ctx!.drawImage(img, x, y, scaledWidth, scaledHeight);
      
      const processedDataUrl = canvas.toDataURL('image/png');
      setProcessedImage(processedDataUrl);
      setIsProcessing(false);
    };
    
    img.src = selectedImage;
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = 'resized-image-640x640.png';
    link.href = processedImage;
    link.click();
  };

  return (
    <div className="space-y-6">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png,image/jpeg"
        className="hidden"
      />
      
      <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
        <CardContent className="p-8 text-center">
          {!selectedImage ? (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium">Upload your image</p>
                <p className="text-gray-500">PNG or JPG files only</p>
              </div>
              <Button onClick={() => fileInputRef.current?.click()}>
                Choose File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <img src={selectedImage} alt="Selected" className="max-h-64 mx-auto rounded-lg shadow-md" />
              {detectedColor && !isTransparent && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: detectedColor.hex }}
                  />
                  <span>Background color detected: {detectedColor.hex}</span>
                </div>
              )}
              {isTransparent && (
                <div className="text-sm text-blue-600">
                  ✨ Transparent background detected - choose your background color below
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <Button onClick={processImage} disabled={isProcessing}>
                  {isProcessing ? 'Processing...' : 'Resize to 640x640'}
                </Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Choose Different
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedImage && (isTransparent || detectedColor) && (
        <BackgroundColorPicker 
          selectedColor={selectedBgColor}
          onColorChange={setSelectedBgColor}
        />
      )}
      
      {processedImage && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Processed Image (640x640)</h3>
              <img src={processedImage} alt="Processed" className="mx-auto rounded-lg shadow-lg border" />
              <Button onClick={downloadImage} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageUploader;