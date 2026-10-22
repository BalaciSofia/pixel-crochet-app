import {
  hexToOklab,
  labDistanceSq,
  linearToOklab,
  oklabToHex,
  srgbByteToLinear,
  type Lab,
} from './color';

export interface PixelizeOptions {
  targetWidth: number;
  targetHeight: number;
  maxColors?: number;
  yarnPalette?: string[];
}

interface CellSample {
  lab: Lab;
  weight: number;
}

const ALPHA_CUTOFF = 128;
const REFINE_ITERATIONS = 6;

export function pixelizeImage(
  imageData: ImageData,
  options: PixelizeOptions
): (string | null)[][] {
  const { targetWidth, targetHeight, maxColors, yarnPalette } = options;

  const labs = sampleCells(imageData, targetWidth, targetHeight);

  const opaque = labs.filter((lab): lab is Lab => lab !== null);
  const palette = buildPalette(opaque, maxColors, yarnPalette);

  const cache = new Map<string, number>();
  const grid: (string | null)[][] = [];
  const paletteHex = palette.map(oklabToHex);

  for (let row = 0; row < targetHeight; row++) {
    const gridRow: (string | null)[] = [];
    for (let col = 0; col < targetWidth; col++) {
      const lab = labs[row * targetWidth + col];
      if (!lab) {
        gridRow.push(null);
        continue;
      }
      const key = lab.join(',');
      let index = cache.get(key);
      if (index === undefined) {
        index = nearestIndex(lab, palette);
        cache.set(key, index);
      }
      gridRow.push(paletteHex[index]);
    }
    grid.push(gridRow);
  }

  return grid;
}

function sampleCells(
  imageData: ImageData,
  targetWidth: number,
  targetHeight: number
): (Lab | null)[] {
  const { width: srcWidth, height: srcHeight, data } = imageData;
  const cellWidth = srcWidth / targetWidth;
  const cellHeight = srcHeight / targetHeight;
  const result: (Lab | null)[] = [];

  for (let row = 0; row < targetHeight; row++) {
    const startY = Math.min(srcHeight - 1, Math.floor(row * cellHeight));
    const endY = Math.max(startY + 1, Math.min(srcHeight, Math.floor((row + 1) * cellHeight)));

    for (let col = 0; col < targetWidth; col++) {
      const startX = Math.min(srcWidth - 1, Math.floor(col * cellWidth));
      const endX = Math.max(startX + 1, Math.min(srcWidth, Math.floor((col + 1) * cellWidth)));

      let r = 0;
      let g = 0;
      let b = 0;
      let alphaTotal = 0;
      let weightTotal = 0;
      let count = 0;

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * srcWidth + x) * 4;
          const alpha = data[idx + 3];
          const w = alpha / 255;
          r += srgbByteToLinear(data[idx]) * w;
          g += srgbByteToLinear(data[idx + 1]) * w;
          b += srgbByteToLinear(data[idx + 2]) * w;
          weightTotal += w;
          alphaTotal += alpha;
          count++;
        }
      }

      if (weightTotal === 0 || alphaTotal / count < ALPHA_CUTOFF) {
        result.push(null);
        continue;
      }

      result.push(linearToOklab(r / weightTotal, g / weightTotal, b / weightTotal));
    }
  }

  return result;
}

function buildPalette(colors: Lab[], maxColors: number | undefined, yarnPalette: string[] | undefined): Lab[] {
  if (colors.length === 0) return [[0, 0, 0]];

  if (yarnPalette && yarnPalette.length > 0) {
    return restrictToYarn(colors, yarnPalette.map(hexToOklab), maxColors);
  }

  const samples = groupSamples(colors);
  const limit = maxColors && maxColors > 0 ? maxColors : samples.length;
  if (samples.length <= limit) return samples.map(s => s.lab);

  return refine(samples, weightedMedianCut(samples, limit));
}

function restrictToYarn(colors: Lab[], yarn: Lab[], maxColors: number | undefined): Lab[] {
  const usage = new Array<number>(yarn.length).fill(0);
  for (const lab of colors) usage[nearestIndex(lab, yarn)]++;

  const used = yarn
    .map((lab, index) => ({ lab, count: usage[index] }))
    .filter(entry => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const limit = maxColors && maxColors > 0 ? maxColors : used.length;
  return used.slice(0, limit).map(entry => entry.lab);
}

function groupSamples(colors: Lab[]): CellSample[] {
  const groups = new Map<string, CellSample>();
  for (const lab of colors) {
    const key = lab.join(',');
    const existing = groups.get(key);
    if (existing) existing.weight++;
    else groups.set(key, { lab, weight: 1 });
  }
  return Array.from(groups.values());
}

function bucketStats(bucket: CellSample[]) {
  let total = 0;
  const mean: Lab = [0, 0, 0];
  for (const { lab, weight } of bucket) {
    total += weight;
    mean[0] += lab[0] * weight;
    mean[1] += lab[1] * weight;
    mean[2] += lab[2] * weight;
  }
  mean[0] /= total;
  mean[1] /= total;
  mean[2] /= total;

  const variance: Lab = [0, 0, 0];
  for (const { lab, weight } of bucket) {
    for (let c = 0; c < 3; c++) variance[c] += weight * (lab[c] - mean[c]) ** 2;
  }
  return { total, mean, variance };
}

function weightedMedianCut(samples: CellSample[], maxColors: number): CellSample[][] {
  const buckets: CellSample[][] = [samples];

  while (buckets.length < maxColors) {
    let bestIndex = -1;
    let bestChannel = 0;
    let bestScore = 0;

    buckets.forEach((bucket, index) => {
      if (bucket.length < 2) return;
      const { variance } = bucketStats(bucket);
      for (let c = 0; c < 3; c++) {
        if (variance[c] > bestScore) {
          bestScore = variance[c];
          bestIndex = index;
          bestChannel = c;
        }
      }
    });

    if (bestIndex === -1) break;

    const bucket = buckets[bestIndex];
    bucket.sort((a, b) => a.lab[bestChannel] - b.lab[bestChannel]);

    const half = bucket.reduce((sum, s) => sum + s.weight, 0) / 2;
    let running = 0;
    let splitAt = 1;
    for (let i = 0; i < bucket.length - 1; i++) {
      running += bucket[i].weight;
      splitAt = i + 1;
      if (running >= half) break;
    }

    buckets.splice(bestIndex, 1, bucket.slice(0, splitAt), bucket.slice(splitAt));
  }

  return buckets;
}

function refine(samples: CellSample[], buckets: CellSample[][]): Lab[] {
  let centers = buckets.map(bucket => bucketStats(bucket).mean);

  for (let iteration = 0; iteration < REFINE_ITERATIONS; iteration++) {
    const groups: CellSample[][] = centers.map(() => []);
    for (const sample of samples) groups[nearestIndex(sample.lab, centers)].push(sample);

    const next = centers.map((center, index) =>
      groups[index].length > 0 ? bucketStats(groups[index]).mean : center
    );

    const moved = next.some((center, index) => labDistanceSq(center, centers[index]) > 1e-7);
    centers = next;
    if (!moved) break;
  }

  return centers;
}

function nearestIndex(lab: Lab, palette: Lab[]): number {
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const d = labDistanceSq(lab, palette[i]);
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
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
