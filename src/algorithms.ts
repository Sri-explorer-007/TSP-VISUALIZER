import type { City, Tour } from './types';

/** 
 * Calculate Euclidean distance between two cities 
 */
export const calcDist = (c1: City, c2: City): number => {
  return Math.hypot(c2.x - c1.x, c2.y - c1.y);
};

/**
 * Calculate total distance of a path
 */
export const calcPathDist = (path: City[]): number => {
  let total = 0;
  for (let i = 0; i < path.length; i++) {
    const nextIdx = (i + 1) % path.length;
    total += calcDist(path[i], path[nextIdx]);
  }
  return total;
};

/**
 * Nearest Neighbor (Greedy)
 * Starts from first city and visits the closest untravelled city
 */
export const nearestNeighbor = (cities: City[]): Tour => {
  if (cities.length < 2) return { path: cities, distance: 0 };

  const visited = [cities[0]];
  const unvisited = [...cities.slice(1)];

  while (unvisited.length > 0) {
    const current = visited[visited.length - 1];
    let closestIdx = -1;
    let minDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const d = calcDist(current, unvisited[i]);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }

    visited.push(unvisited.splice(closestIdx, 1)[0]);
  }

  return { path: visited, distance: calcPathDist(visited) };
};

/**
 * 2-Opt Swap Implementation
 * Swaps edges if it decreases total distance
 */
export const twoOptSwap = (path: City[], i: number, k: number): City[] => {
  const newPath = path.slice(0, i);
  const reversed = path.slice(i, k + 1).reverse();
  const tail = path.slice(k + 1);
  return [...newPath, ...reversed, ...tail];
};

export const twoOptImprove = (tour: Tour): Tour => {
  const { path } = tour;
  let bestDist = tour.distance;
  let bestPath = [...path];

  for (let i = 1; i < path.length - 1; i++) {
    for (let k = i + 1; k < path.length; k++) {
      const newPath = twoOptSwap(bestPath, i, k);
      const newDist = calcPathDist(newPath);

      if (newDist < bestDist) {
        return { path: newPath, distance: newDist }; // Return first improvement for animation
      }
    }
  }

  return { path: bestPath, distance: bestDist };
};
