export const hasTransparentBackground = (canvas: HTMLCanvasElement, img: HTMLImageElement): boolean => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  // Create temporary canvas for analysis
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) return false;

  tempCanvas.width = img.width;
  tempCanvas.height = img.height;
  tempCtx.drawImage(img, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, img.width, img.height);
  const data = imageData.data;

  // Check corners and edges for transparency
  const checkPositions = [
    [0, 0], // top-left
    [img.width - 1, 0], // top-right
    [0, img.height - 1], // bottom-left
    [img.width - 1, img.height - 1], // bottom-right
    [Math.floor(img.width / 2), 0], // top-center
    [Math.floor(img.width / 2), img.height - 1], // bottom-center
    [0, Math.floor(img.height / 2)], // left-center
    [img.width - 1, Math.floor(img.height / 2)] // right-center
  ];

  let transparentPixels = 0;
  
  checkPositions.forEach(([x, y]) => {
    const index = (y * img.width + x) * 4;
    const alpha = data[index + 3];
    if (alpha < 128) { // Consider semi-transparent as transparent
      transparentPixels++;
    }
  });

  // If more than half of the edge pixels are transparent, consider it transparent
  return transparentPixels > checkPositions.length / 2;
};