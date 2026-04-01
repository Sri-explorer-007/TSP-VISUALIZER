// src/types.ts

export type City = {
  id: string;
  x: number;
  y: number;
  name?: string;
};

export type Tour = {
  path: City[];
  distance: number;
};

export type AlgorithmType = 'NN' | '2OPT' | 'SA' | 'BRUTE';

export type SimulationStats = {
  iterations: number;
  bestDistance: number | null;
  currentDistance: number | null;
  elapsedTime: number; 
};
