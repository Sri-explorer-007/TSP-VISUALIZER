import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import type { City, Tour } from '../types';

interface CityCanvasProps {
  cities: City[];
  bestTour: Tour | null;
  onCityClick?: (city: City) => void;
  width: number;
  height: number;
}

const CityCanvas: React.FC<CityCanvasProps> = ({ cities, bestTour, onCityClick: _onCityClick, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set up D3 Zoom
    const zoom = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => setTransform(event.transform));

    d3.select(canvas).call(zoom);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear Canvas
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Apply Transformation (Zoom/Pan)
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    // Draw Tour First (Under)
    if (bestTour && bestTour.path.length > 1) {
      const { path } = bestTour;
      ctx.beginPath();
      ctx.lineWidth = 2 / transform.k;
      ctx.strokeStyle = '#00F2FF'; // Cyan accent
      ctx.shadowBlur = 10;
      ctx.shadowColor = 'rgba(0, 242, 255, 0.5)';
      
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
      ctx.lineTo(path[0].x, path[0].y); // Close loop
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw Cities
    cities.forEach(city => {
      const isStart = bestTour && bestTour.path.length > 0 && city.id === bestTour.path[0].id;
      
      ctx.beginPath();
      ctx.fillStyle = isStart ? '#FF4D00' : '#FFFFFF'; // Orange/Red for start
      ctx.arc(city.x, city.y, (isStart ? 6 : 4) / transform.k, 0, Math.PI * 2);
      ctx.fill();
      
      // Outer Halo
      ctx.beginPath();
      ctx.strokeStyle = isStart ? 'rgba(255, 77, 0, 0.4)' : 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1 / transform.k;
      ctx.arc(city.x, city.y, (isStart ? 10 : 8) / transform.k, 0, Math.PI * 2);
      ctx.stroke();
    });
  }, [cities, bestTour, transform, width, height]);

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ background: '#030308', display: 'block', cursor: 'crosshair' }}
      />
    </div>
  );
};

export default CityCanvas;
