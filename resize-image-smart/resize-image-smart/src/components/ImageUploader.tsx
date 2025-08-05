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
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const processFile = (file: File | null | undefined) => {
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
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
      
      analyzeImage(img);
      
      ctx!.fillStyle = selectedBgColor;
      ctx!.fillRect(0, 0, size, size);
      
      const maxSize = size * 0.85;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      
      const x = (size - scaledWidth) / 2;
      const y = (size - scaledHeight) / 2;
      
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
      
      <Card className={`border-dashed border-2 transition-all duration-200 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400'
      }`}>
        <CardContent 
          className="p-8 text-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!selectedImage ? (
            <div className="space-y-4">
              <Upload className={`mx-auto h-12 w-12 transition-colors ${
                isDragOver ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <div>
                <p className="text-lg font-medium">
                  {isDragOver ? 'Drop your image here' : 'Upload your image'}
                </p>
                <p className="text-gray-500">
                  {isDragOver ? 'Release to upload' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-sm text-gray-400 mt-1">PNG or JPG files only</p>
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