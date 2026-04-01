import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { City, Tour, AlgorithmType, SimulationStats } from '../types';
import { nearestNeighbor, twoOptImprove, calcDist, calcPathDist } from '../algorithms';

export const useTSP = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [bestTour, setBestTour] = useState<Tour | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [algo, setAlgo] = useState<AlgorithmType>('NN');
  const [delayMs, setDelayMs] = useState<number>(200);
  const [unvisitedCities, setUnvisitedCities] = useState<City[]>([]);
  const [stats, setStats] = useState<SimulationStats>({
    iterations: 0,
    bestDistance: null,
    currentDistance: null,
    elapsedTime: 0
  });

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const generateRandomCities = useCallback((count: number) => {
    const newCities: City[] = Array.from({ length: count }, () => ({
      id: uuidv4(),
      x: Math.random() * 800 + 50,
      y: Math.random() * 500 + 50,
    }));
    setCities(newCities);
    setBestTour(null);
    setUnvisitedCities([]);
    setStats({ iterations: 0, bestDistance: null, currentDistance: null, elapsedTime: 0 });
  }, []);

  const addCity = useCallback((x: number, y: number) => {
    const newCity = { id: uuidv4(), x, y };
    setCities(prev => [...prev, newCity]);
    setBestTour(null);
  }, []);

  const runStep = useCallback(() => {
    if (cities.length < 2) {
      setIsRunning(false);
      return;
    }

    if (algo === 'NN') {
      if (!bestTour) {
        // Start NN with first city
        const initial = { path: [cities[0]], distance: 0 };
        setBestTour(initial);
        setUnvisitedCities(cities.slice(1));
        return;
      }

      if (unvisitedCities.length === 0) {
        setIsRunning(false);
        // Final loop back to start
        setBestTour(prev => {
          if (!prev) return null;
          return { ...prev, distance: calcPathDist(prev.path) };
        });
        return;
      }

      // Find nearest to last
      const current = bestTour.path[bestTour.path.length - 1];
      let closestIdx = 0;
      let minDist = Infinity;
      unvisitedCities.forEach((city, idx) => {
        const d = calcDist(current, city);
        if (d < minDist) {
          minDist = d;
          closestIdx = idx;
        }
      });

      const nextCity = unvisitedCities[closestIdx];
      const newPath = [...bestTour.path, nextCity];
      setBestTour({ path: newPath, distance: calcPathDist(newPath) });
      setUnvisitedCities(prev => prev.filter((_, i) => i !== closestIdx));
      setStats(s => ({ ...s, iterations: s.iterations + 1, bestDistance: calcPathDist(newPath) }));

    } else if (algo === '2OPT') {
      if (!bestTour) {
        setBestTour(nearestNeighbor(cities));
        return;
      }
      const nextTour = twoOptImprove(bestTour);
      if (nextTour.distance === bestTour.distance) {
        setIsRunning(false);
      } else {
        setBestTour(nextTour);
        setStats(s => ({
          ...s,
          iterations: s.iterations + 1,
          bestDistance: nextTour.distance,
          currentDistance: nextTour.distance,
          elapsedTime: Date.now() - startTimeRef.current
        }));
      }
    }
  }, [cities, algo, bestTour, unvisitedCities]);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - stats.elapsedTime;
      const tick = () => {
        runStep();
        timerRef.current = setTimeout(tick, delayMs) as unknown as number;
      };
      timerRef.current = setTimeout(tick, delayMs) as unknown as number;
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, runStep, stats.elapsedTime, delayMs]);

  return {
    cities,
    bestTour,
    isRunning,
    algo,
    setAlgo,
    delayMs,
    setDelayMs,
    stats,
    generateRandomCities,
    addCity,
    setIsRunning,
    startNN: () => {
      if (cities.length < 2) return;
      const tour = nearestNeighbor(cities);
      setBestTour(tour);
      setStats(s => ({
        ...s,
        bestDistance: tour.distance,
        currentDistance: tour.distance,
        iterations: 1
      }));
    },
    reset: () => {
      setIsRunning(false);
      setBestTour(null);
      setStats({ iterations: 0, bestDistance: null, currentDistance: null, elapsedTime: 0 });
    }
  };
};
