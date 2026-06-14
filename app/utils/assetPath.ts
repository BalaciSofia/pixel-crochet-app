const BASE_PATH = "/pixel-crochet-app";

export function assetPath(path: string) {
  return `${BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}
