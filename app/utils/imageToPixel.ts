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

export interface PixelizeResult {
  grid: (string | null)[][];
  toBuy: string[];
}

const YARN_MATCH_CUTOFF = 0.7;
const BUY_MERGE_CUTOFF = 0.65;
const LIGHTNESS_WEIGHT = 0.5;
const MAX_LAB_DISTANCE = 0.5;

interface CellSample {
  lab: Lab;
  weight: number;
}

const ALPHA_CUTOFF = 128;
const REFINE_ITERATIONS = 6;

export function pixelizeImage(
  imageData: ImageData,
  options: PixelizeOptions
): PixelizeResult {
  const { targetWidth, targetHeight, maxColors, yarnPalette } = options;

  const labs = sampleCells(imageData, targetWidth, targetHeight);

  const opaque = labs.filter((lab): lab is Lab => lab !== null);
  const ideal = buildPalette(opaque, maxColors);
  const { usage, dominant } = describeClusters(opaque, ideal);
  const { colors, toBuy } = matchToYarn(ideal, dominant, usage, yarnPalette);

  const cache = new Map<string, string>();
  const grid: (string | null)[][] = [];

  for (let row = 0; row < targetHeight; row++) {
    const gridRow: (string | null)[] = [];
    for (let col = 0; col < targetWidth; col++) {
      const lab = labs[row * targetWidth + col];
      if (!lab) {
        gridRow.push(null);
        continue;
      }
      const key = lab.join(',');
      let color = cache.get(key);
      if (color === undefined) {
        color = colors[nearestIndex(lab, ideal)];
        cache.set(key, color);
      }
      gridRow.push(color);
    }
    grid.push(gridRow);
  }

  return { grid, toBuy };
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

function buildPalette(colors: Lab[], maxColors: number | undefined): Lab[] {
  if (colors.length === 0) return [[0, 0, 0]];

  const samples = groupSamples(colors);
  const limit = maxColors && maxColors > 0 ? maxColors : samples.length;
  if (samples.length <= limit) return samples.map(s => s.lab);

  return refine(samples, weightedMedianCut(samples, limit));
}

function describeClusters(labs: Lab[], ideal: Lab[]) {
  const usage = ideal.map(() => 0);
  const dominant = ideal.slice();
  const best = ideal.map(() => 0);
  const counts = new Map<string, number>();

  for (const lab of labs) {
    const cluster = nearestIndex(lab, ideal);
    usage[cluster]++;
    const key = `${cluster}:${lab.join(',')}`;
    const count = (counts.get(key) ?? 0) + 1;
    counts.set(key, count);
    if (count > best[cluster]) {
      best[cluster] = count;
      dominant[cluster] = lab;
    }
  }

  return { usage, dominant };
}

function similarity(a: Lab, b: Lab): number {
  const dl = (a[0] - b[0]) * LIGHTNESS_WEIGHT;
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return 1 - Math.sqrt(dl * dl + da * da + db * db) / MAX_LAB_DISTANCE;
}

function matchToYarn(
  ideal: Lab[],
  dominant: Lab[],
  usage: number[],
  yarnPalette: string[] | undefined
): { colors: string[]; toBuy: string[] } {
  if (!yarnPalette || yarnPalette.length === 0) {
    return { colors: ideal.map(oklabToHex), toBuy: [] };
  }

  const yarns = yarnPalette.map(hexToOklab);
  const colors: string[] = new Array(ideal.length);
  const unmatched: number[] = [];

  ideal.forEach((lab, i) => {
    const nearest = nearestBySimilarity(lab, yarns);
    const nearestToDominant = nearestBySimilarity(dominant[i], yarns);
    if (similarity(lab, yarns[nearest]) >= YARN_MATCH_CUTOFF) {
      colors[i] = yarnPalette[nearest].toUpperCase();
    } else if (similarity(dominant[i], yarns[nearestToDominant]) >= YARN_MATCH_CUTOFF) {
      colors[i] = yarnPalette[nearestToDominant].toUpperCase();
    } else {
      unmatched.push(i);
    }
  });

  unmatched.sort((a, b) => usage[b] - usage[a]);

  const purchases: { lab: Lab; hex: string }[] = [];
  for (const i of unmatched) {
    const existing = purchases.find(p => similarity(ideal[i], p.lab) >= BUY_MERGE_CUTOFF);
    if (existing) {
      colors[i] = existing.hex;
    } else {
      const hex = oklabToHex(ideal[i]);
      purchases.push({ lab: ideal[i], hex });
      colors[i] = hex;
    }
  }

  return { colors, toBuy: purchases.map(p => p.hex) };
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

function nearestBySimilarity(lab: Lab, palette: Lab[]): number {
  let best = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < palette.length; i++) {
    const score = similarity(lab, palette[i]);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
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
