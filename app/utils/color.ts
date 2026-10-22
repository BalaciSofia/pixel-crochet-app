export type Rgb = [number, number, number];
export type Lab = [number, number, number];

const SRGB_TO_LINEAR = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function srgbByteToLinear(value: number): number {
  return SRGB_TO_LINEAR[value];
}

function linearToSrgbByte(value: number): number {
  const v = Math.min(1, Math.max(0, value));
  const c = v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.round(c * 255);
}

export function linearToOklab(r: number, g: number, b: number): Lab {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb([L, a, b]: Lab): Rgb {
  const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
  const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
  const s = Math.pow(L - 0.0894841775 * a - 1.291485548 * b, 3);
  return [
    linearToSrgbByte(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgbByte(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgbByte(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function hexToRgb(hex: string): Rgb {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
}

export function rgbToHex([r, g, b]: Rgb): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToOklab(hex: string): Lab {
  const [r, g, b] = hexToRgb(hex);
  return linearToOklab(SRGB_TO_LINEAR[r], SRGB_TO_LINEAR[g], SRGB_TO_LINEAR[b]);
}

export function oklabToHex(lab: Lab): string {
  return rgbToHex(oklabToRgb(lab));
}

export function labDistanceSq(a: Lab, b: Lab): number {
  const dl = a[0] - b[0];
  const da = a[1] - b[1];
  const db = a[2] - b[2];
  return dl * dl + da * da + db * db;
}
