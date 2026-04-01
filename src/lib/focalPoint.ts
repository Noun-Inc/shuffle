/**
 * Smart focal point detection for thumbnail cropping.
 *
 * Handles:
 * - Normal photos: center on highest-detail region
 * - Split images (L/R): pick the side with more photo content
 * - 2x2 collages: pick the most visually interesting quadrant
 * - Infographics/screenshots (mostly text): signal to use contain mode
 * - Text-heavy images: center on text mass
 */

const GRID = 8;
const S = 96; // larger sample for better split detection

export interface FocalResult {
  objectPosition: string;
  /** If true, image is mostly text/diagram — use object-fit: contain */
  useContain: boolean;
}

interface CellInfo {
  gx: number;
  gy: number;
  edgeScore: number;
  colorVariance: number;
  horizontalEdgeRatio: number;
  avgLum: number;
  isPhoto: boolean;
  isText: boolean;
  isEmpty: boolean;
}

export function detectFocalPoint(img: HTMLImageElement): FocalResult {
  const fallback: FocalResult = { objectPosition: "center center", useContain: false };

  try {
    const canvas = document.createElement("canvas");
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;

    ctx.drawImage(img, 0, 0, S, S);
    const { data } = ctx.getImageData(0, 0, S, S);

    const lum = new Float32Array(S * S);
    const r = new Float32Array(S * S);
    const g = new Float32Array(S * S);
    const b = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) {
      const p = i * 4;
      r[i] = data[p]; g[i] = data[p + 1]; b[i] = data[p + 2];
      lum[i] = r[i] * 0.299 + g[i] * 0.587 + b[i] * 0.114;
    }

    // Sobel edges
    const hEdges = new Float32Array(S * S);
    const vEdges = new Float32Array(S * S);
    for (let y = 1; y < S - 1; y++) {
      for (let x = 1; x < S - 1; x++) {
        const idx = y * S + x;
        const gx =
          -lum[idx - S - 1] + lum[idx - S + 1] -
          2 * lum[idx - 1] + 2 * lum[idx + 1] -
          lum[idx + S - 1] + lum[idx + S + 1];
        const gy =
          -lum[idx - S - 1] - 2 * lum[idx - S] - lum[idx - S + 1] +
          lum[idx + S - 1] + 2 * lum[idx + S] + lum[idx + S + 1];
        hEdges[idx] = Math.abs(gy);
        vEdges[idx] = Math.abs(gx);
      }
    }

    // Analyze grid cells
    const cellW = S / GRID;
    const cellH = S / GRID;
    const cells: CellInfo[] = [];

    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const sx = Math.floor(gx * cellW);
        const sy = Math.floor(gy * cellH);
        const ex = Math.floor((gx + 1) * cellW);
        const ey = Math.floor((gy + 1) * cellH);

        let totalEdge = 0, totalH = 0, totalV = 0;
        let sumR = 0, sumG = 0, sumB = 0;
        let sumR2 = 0, sumG2 = 0, sumB2 = 0;
        let sumLum = 0;
        let count = 0;

        for (let y = sy; y < ey; y++) {
          for (let x = sx; x < ex; x++) {
            const idx = y * S + x;
            totalH += hEdges[idx]; totalV += vEdges[idx];
            totalEdge += hEdges[idx] + vEdges[idx];
            sumR += r[idx]; sumG += g[idx]; sumB += b[idx];
            sumR2 += r[idx] ** 2; sumG2 += g[idx] ** 2; sumB2 += b[idx] ** 2;
            sumLum += lum[idx];
            count++;
          }
        }

        const varR = (sumR2 / count) - (sumR / count) ** 2;
        const varG = (sumG2 / count) - (sumG / count) ** 2;
        const varB = (sumB2 / count) - (sumB / count) ** 2;
        const colorVariance = varR + varG + varB;
        const horizontalEdgeRatio = totalH / (totalH + totalV + 0.001);
        const edgeScore = totalEdge / count;
        const avgLum = sumLum / count;

        const isEmpty = edgeScore < 6;
        const isText = !isEmpty && horizontalEdgeRatio > 0.56 && colorVariance < 1200 && edgeScore > 12;
        const isPhoto = !isEmpty && !isText;

        cells.push({ gx, gy, edgeScore, colorVariance, horizontalEdgeRatio, avgLum, isPhoto, isText, isEmpty });
      }
    }

    const photoCells = cells.filter((c) => c.isPhoto);
    const textCells = cells.filter((c) => c.isText);
    const nonEmptyCells = cells.filter((c) => !c.isEmpty);

    // --- Detect if this is an infographic/screenshot (mostly text, light bg) ---
    const textRatio = textCells.length / (nonEmptyCells.length || 1);
    const avgBrightness = cells.reduce((a, c) => a + c.avgLum, 0) / cells.length;
    // High text ratio + bright bg = infographic/screenshot → use contain
    if (textRatio > 0.35 && avgBrightness > 155 && photoCells.length < 8) {
      return { objectPosition: "center center", useContain: true };
    }
    // Also catch charts/diagrams: low color variance overall + moderate edges
    const avgColorVar = cells.reduce((a, c) => a + c.colorVariance, 0) / cells.length;
    const aspectRatio = img.naturalWidth / (img.naturalHeight || 1);
    if (avgColorVar < 600 && textRatio > 0.25 && avgBrightness > 140 && aspectRatio > 1.3) {
      return { objectPosition: "center center", useContain: true };
    }

    // --- Detect split images ---
    const splitResult = detectSplit(cells, photoCells);
    if (splitResult) {
      return { objectPosition: splitResult, useContain: false };
    }

    // --- Wide images without detected split: default to one side ---
    const gridHalf = GRID / 2;
    if (aspectRatio > 1.35 && !splitResult && photoCells.length > 4) {
      // Wide image, no gap detected — likely a side-by-side with no clear divider
      // Pick whichever half has more visual interest
      const leftScore = photoCells
        .filter((c) => c.gx < gridHalf)
        .reduce((a, c) => a + c.edgeScore + c.colorVariance * 0.015, 0);
      const rightScore = photoCells
        .filter((c) => c.gx >= gridHalf)
        .reduce((a, c) => a + c.edgeScore + c.colorVariance * 0.015, 0);

      // If scores are close (both sides similar), just pick right side
      const winner = rightScore >= leftScore * 0.85 ? "75% 50%" : "25% 50%";
      return { objectPosition: winner, useContain: false };
    }

    // --- Standard focal point: photo cells preferred ---
    let targetCells: CellInfo[];
    if (photoCells.length > 0) {
      targetCells = findLargestCluster(photoCells);
    } else if (textCells.length > 0) {
      // Text-only but not infographic — center on text
      targetCells = textCells;
    } else {
      return fallback;
    }

    // Weighted centroid
    let totalWeight = 0, wx = 0, wy = 0;
    for (const c of targetCells) {
      const w = c.edgeScore + (c.isPhoto ? c.colorVariance * 0.02 : 0);
      wx += c.gx * w;
      wy += c.gy * w;
      totalWeight += w;
    }
    if (totalWeight === 0) return fallback;

    const xPct = clamp(Math.round((wx / totalWeight / (GRID - 1)) * 100));
    const yPct = clamp(Math.round((wy / totalWeight / (GRID - 1)) * 100));

    return { objectPosition: `${xPct}% ${yPct}%`, useContain: false };
  } catch {
    return fallback;
  }
}

/**
 * Detect L/R or 2x2 split images.
 * Looks for a vertical dividing line (strong luminance contrast between left/right halves)
 * or a grid pattern. Returns object-position favoring the better half/quadrant.
 */
function detectSplit(cells: CellInfo[], photoCells: CellInfo[]): string | null {
  const half = GRID / 2;

  // Check for vertical split: compare left vs right halves
  const leftCells = photoCells.filter((c) => c.gx < half);
  const rightCells = photoCells.filter((c) => c.gx >= half);

  // Check for horizontal split
  const topCells = photoCells.filter((c) => c.gy < half);
  const bottomCells = photoCells.filter((c) => c.gy >= half);

  // Score each region by total visual interest (edges + color)
  const scoreRegion = (region: CellInfo[]) =>
    region.reduce((a, c) => a + c.edgeScore + c.colorVariance * 0.015, 0);

  const leftScore = scoreRegion(leftCells);
  const rightScore = scoreRegion(rightCells);
  const topScore = scoreRegion(topCells);
  const bottomScore = scoreRegion(bottomCells);

  // Detect vertical dividing line: check for luminance gap in middle columns
  const midCols = cells.filter((c) => c.gx === Math.floor(half) - 1 || c.gx === Math.floor(half));
  const hasVerticalGap = midCols.some((c) => c.isEmpty || c.edgeScore < 15);

  // Detect if it's a 2x2 collage: both vertical and horizontal gaps
  const midRows = cells.filter((c) => c.gy === Math.floor(half) - 1 || c.gy === Math.floor(half));
  const hasHorizontalGap = midRows.some((c) => c.isEmpty || c.edgeScore < 15);

  if (hasVerticalGap && hasHorizontalGap) {
    // 2x2 collage — pick best quadrant
    const q = [
      { cells: photoCells.filter((c) => c.gx < half && c.gy < half), pos: "15% 15%" },
      { cells: photoCells.filter((c) => c.gx >= half && c.gy < half), pos: "85% 15%" },
      { cells: photoCells.filter((c) => c.gx < half && c.gy >= half), pos: "15% 85%" },
      { cells: photoCells.filter((c) => c.gx >= half && c.gy >= half), pos: "85% 85%" },
    ];
    const best = q.reduce((a, b) => (scoreRegion(a.cells) >= scoreRegion(b.cells) ? a : b));
    if (scoreRegion(best.cells) > 0) return best.pos;
  }

  if (hasVerticalGap && leftCells.length > 0 && rightCells.length > 0) {
    // L/R split — pick the better side
    const ratio = Math.max(leftScore, rightScore) / (Math.min(leftScore, rightScore) + 0.001);
    if (ratio > 1.15) {
      // Clear winner
      return leftScore > rightScore ? "25% 50%" : "75% 50%";
    }
    // Similar scores — pick the one with more color variance (more "photo-like")
    const leftColor = leftCells.reduce((a, c) => a + c.colorVariance, 0);
    const rightColor = rightCells.reduce((a, c) => a + c.colorVariance, 0);
    return leftColor > rightColor ? "25% 50%" : "75% 50%";
  }

  return null;
}

function findLargestCluster(cells: CellInfo[]): CellInfo[] {
  const set = new Set(cells.map((c) => `${c.gx},${c.gy}`));
  const visited = new Set<string>();
  const clusters: CellInfo[][] = [];

  for (const cell of cells) {
    const key = `${cell.gx},${cell.gy}`;
    if (visited.has(key)) continue;

    const cluster: CellInfo[] = [];
    const queue = [cell];
    visited.add(key);

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nk = `${current.gx + dx},${current.gy + dy}`;
        if (set.has(nk) && !visited.has(nk)) {
          visited.add(nk);
          const neighbor = cells.find((c) => c.gx === current.gx + dx && c.gy === current.gy + dy);
          if (neighbor) queue.push(neighbor);
        }
      }
    }
    clusters.push(cluster);
  }

  clusters.sort((a, b) => b.length - a.length);
  return clusters[0] || cells;
}

function clamp(v: number): number {
  return Math.max(15, Math.min(85, v));
}
