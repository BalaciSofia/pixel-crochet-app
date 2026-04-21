export interface PixelizeOptions {
  targetWidth: number;
  targetHeight: number;
  palette?: string[];
  maxColors?: number;
}

export function pixelizeImage(
  imageData: ImageData,
  options: PixelizeOptions
): (string | null)[][] {
  const { targetWidth, targetHeight, palette, maxColors } = options;
  const { width: srcWidth, height: srcHeight, data } = imageData;

  let grid: (string | null)[][] = [];

  const cellWidth = srcWidth / targetWidth;
  const cellHeight = srcHeight / targetHeight;

  for (let row = 0; row < targetHeight; row++) {
    const gridRow: (string | null)[] = [];

    for (let col = 0; col < targetWidth; col++) {
      const startX = Math.floor(col * cellWidth);
      const startY = Math.floor(row * cellHeight);
      const endX = Math.floor((col + 1) * cellWidth);
      const endY = Math.floor((row + 1) * cellHeight);

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let totalA = 0;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * srcWidth + x) * 4;
          totalR += data[idx];
          totalG += data[idx + 1];
          totalB += data[idx + 2];
          totalA += data[idx + 3];
          count++;
        }
      }

      const avgR = Math.round(totalR / count);
      const avgG = Math.round(totalG / count);
      const avgB = Math.round(totalB / count);
      const avgA = Math.round(totalA / count);

      if (avgA < 128) {
        gridRow.push(null);
      } else {
        const color = rgbToHex(avgR, avgG, avgB);
        gridRow.push(color);
      }
    }

    grid.push(gridRow);
  }

  if (maxColors && maxColors > 0) {
    grid = reduceColors(grid, maxColors);
  }

  if (palette) {
    grid = grid.map(row =>
      row.map(color => (color ? findClosestColor(color, palette) : null))
    );
  }

  return grid;
}

function reduceColors(
  grid: (string | null)[][],
  maxColors: number
): (string | null)[][] {
  const colorCounts = new Map<string, number>();
  for (const row of grid) {
    for (const color of row) {
      if (color) {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    }
  }

  const uniqueColors = Array.from(colorCounts.keys());
  
  if (uniqueColors.length <= maxColors) {
    return grid;
  }

  const reducedPalette = medianCut(uniqueColors, maxColors);

  const colorMap = new Map<string, string>();
  for (const color of uniqueColors) {
    colorMap.set(color, findClosestColor(color, reducedPalette));
  }

  return grid.map(row =>
    row.map(color => (color ? colorMap.get(color) || color : null))
  );
}

function medianCut(colors: string[], maxColors: number): string[] {
  if (colors.length <= maxColors) {
    return colors;
  }

  let buckets: [number, number, number][][] = [
    colors.map(c => hexToRgbArray(c))
  ];

  while (buckets.length < maxColors) {
    let maxRange = -1;
    let maxBucketIdx = 0;
    let splitChannel = 0;

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      for (let channel = 0; channel < 3; channel++) {
        const values = bucket.map(c => c[channel]);
        const range = Math.max(...values) - Math.min(...values);
        if (range > maxRange) {
          maxRange = range;
          maxBucketIdx = i;
          splitChannel = channel;
        }
      }
    }

    if (maxRange <= 0) break;

    const bucketToSplit = buckets[maxBucketIdx];
    bucketToSplit.sort((a, b) => a[splitChannel] - b[splitChannel]);
    
    const midpoint = Math.floor(bucketToSplit.length / 2);
    const bucket1 = bucketToSplit.slice(0, midpoint);
    const bucket2 = bucketToSplit.slice(midpoint);

    buckets.splice(maxBucketIdx, 1, bucket1, bucket2);
    buckets = buckets.filter(b => b.length > 0);
  }

  return buckets.map(bucket => {
    const avgR = Math.round(bucket.reduce((sum, c) => sum + c[0], 0) / bucket.length);
    const avgG = Math.round(bucket.reduce((sum, c) => sum + c[1], 0) / bucket.length);
    const avgB = Math.round(bucket.reduce((sum, c) => sum + c[2], 0) / bucket.length);
    return rgbToHex(avgR, avgG, avgB);
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function hexToRgbArray(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
  ];
}

function colorDistance(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgbArray(hex1);
  const [r2, g2, b2] = hexToRgbArray(hex2);
  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
}

function findClosestColor(color: string, palette: string[]): string {
  let closest = palette[0];
  let minDist = Infinity;

  for (const paletteColor of palette) {
    const dist = colorDistance(color, paletteColor);
    if (dist < minDist) {
      minDist = dist;
      closest = paletteColor;
    }
  }

  return closest;
}

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function getImageData(img: HTMLImageElement): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, img.width, img.height);
}
