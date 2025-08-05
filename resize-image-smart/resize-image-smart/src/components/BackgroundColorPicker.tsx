import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface BackgroundColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const BackgroundColorPicker: React.FC<BackgroundColorPickerProps> = ({
  selectedColor,
  onColorChange
}) => {
  const presetColors = [
    '#ffffff', // White
    '#f8f9fa', // Light gray
    '#e9ecef', // Gray
    '#000000', // Black
    '#dc3545', // Red
    '#fd7e14', // Orange
    '#ffc107', // Yellow
    '#28a745', // Green
    '#20c997', // Teal
    '#007bff', // Blue
    '#6f42c1', // Purple
    '#e83e8c'  // Pink
  ];

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <Label className="text-sm font-medium mb-3 block">
          Choose Background Color
        </Label>
        
        <div className="space-y-3">
          {/* Preset colors */}
          <div className="grid grid-cols-6 gap-2">
            {presetColors.map((color) => (
              <Button
                key={color}
                variant={selectedColor === color ? "default" : "outline"}
                size="sm"
                className="h-8 w-full p-0 relative"
                onClick={() => onColorChange(color)}
                style={{ backgroundColor: color === '#ffffff' ? '#f8f9fa' : color }}
              >
                <div 
                  className="w-full h-full rounded border"
                  style={{ backgroundColor: color }}
                />
                {selectedColor === color && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded" />
                )}
              </Button>
            ))}
          </div>
          
          {/* Custom color input */}
          <div className="flex gap-2 items-center">
            <Input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-8 p-0 border-0 cursor-pointer"
            />
            <Input
              type="text"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BackgroundColorPicker;