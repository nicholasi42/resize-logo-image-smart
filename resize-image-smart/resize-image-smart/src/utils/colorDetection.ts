export interface ColorInfo {
  r: number;
  g: number;
  b: number;
  hex: string;
}

export const detectBackgroundColor = (canvas: HTMLCanvasElement, img: HTMLImageElement): ColorInfo | null => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Create temporary canvas for analysis
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return null;

  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tempCtx.drawImage(img, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  // Sample corner pixels to detect background
  const corners = [
    [0, 0], // top-left
    [img.width - 1, 0], // top-right
    [0, img.height - 1], // bottom-left
    [img.width - 1, img.height - 1] // bottom-right
  ];

  const colorCounts = new Map<string, number>();

  corners.forEach(([x, y]) => {
    const index = (y * img.width + x) * 4;
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const a = data[index + 3];

    if (a > 200) { // Only consider opaque pixels
      const colorKey = `${r},${g},${b}`;
      colorCounts.set(colorKey, (colorCounts.get(colorKey) || 0) + 1);
    }
  });

  // Find most common corner color
  let dominantColor = null;
  let maxCount = 0;

  for (const [colorKey, count] of colorCounts) {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = colorKey.split(',').map(Number);
      dominantColor = {
        r, g, b,
        hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
      };
    }
  }

  // Check if it's a solid color (not white/transparent)
  if (dominantColor && maxCount >= 2 && 
      !(dominantColor.r > 240 && dominantColor.g > 240 && dominantColor.b > 240)) {
    return dominantColor;
  }

  return null;
};