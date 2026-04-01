import React from 'react';
import { useTSP } from './hooks/useTSP';
import CityCanvas from './components/CityCanvas';
import { Play, Pause, RotateCcw, Shuffle, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const { 
    cities, bestTour, isRunning, setIsRunning, stats, generateRandomCities, reset, algo, setAlgo, delayMs, setDelayMs
  } = useTSP();

  const handleGenerate = () => {
    generateRandomCities(25);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#030308', color: 'white' }}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }} 
        animate={{ x: 0 }} 
        className="glass-panel" 
        style={{ width: 340, margin: 20, padding: 24, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24 }}
      >
        <header>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: 4 }}>TSP Viz.</h1>
          <p style={{ fontSize: '0.875rem', color: '#94A3B8' }}>Travelling Salesman Solver v1</p>
        </header>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Algorithm Engine</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button 
              disabled={isRunning && algo !== 'NN'}
              onClick={() => { setAlgo('NN'); setIsRunning(!isRunning); }}
              style={{ 
                height: 48, borderRadius: 8, background: (isRunning && algo === 'NN') ? '#EF4444' : '#7000FF', color: '#FFF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, opacity: (isRunning && algo !== 'NN') ? 0.5 : 1
              }}
            >
              {(isRunning && algo === 'NN') ? <Pause size={18} /> : <Play size={18} />} NN
            </button>
            <button 
              disabled={isRunning && algo !== '2OPT'}
              onClick={() => { setAlgo('2OPT'); setIsRunning(!isRunning); }}
              style={{ 
                height: 48, borderRadius: 8, background: (isRunning && algo === '2OPT') ? '#EF4444' : '#00F2FF', color: (isRunning && algo === '2OPT') ? '#FFF' : '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 600, opacity: (isRunning && algo !== '2OPT') ? 0.5 : 1
              }}
            >
              {(isRunning && algo === '2OPT') ? <Pause size={18} /> : <Play size={18} />} 2-OPT
            </button>
          </div>

          <button 
            onClick={reset}
            style={{ height: 44, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <RotateCcw size={16} /> RESET SIMULATION
          </button>

          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>ANIMATION DELAY</span>
              <span style={{ fontSize: '0.75rem', color: '#7000FF', fontWeight: 700 }}>{delayMs}ms</span>
            </div>
            <input 
              type="range" min="0" max="2000" step="50" 
              value={delayMs} onChange={(e) => setDelayMs(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#7000FF' }}
            />
          </div>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Map Actions</p>
          <button 
            onClick={handleGenerate}
            style={{ 
              height: 44, borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94A3B8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 500
            }}
          >
            <Shuffle size={18} /> GENERATE RANDOM CITIES
          </button>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Statistics</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatCard label="BEST DIST" value={stats.bestDistance?.toFixed(2) || '0.00'} icon={<Activity size={14} color="#00F2FF" />} />
            <StatCard label="ITERATIONS" value={stats.iterations.toString()} icon={<Activity size={14} color="#7000FF" />} />
          </div>
        </section>

        <div style={{ marginTop: 'auto', padding: 16, borderRadius: 8, background: 'rgba(112, 0, 255, 0.1)', border: '1px solid rgba(112, 0, 255, 0.2)' }}>
          <p style={{ fontSize: '0.75rem', color: '#7000FF', fontWeight: 600 }}>ALGORITHM: 2-OPT (BEST IMPROVEMENT)</p>
        </div>
      </motion.aside>

      {/* Main Map */}
      <main style={{ flex: 1, position: 'relative' }}>
        <CityCanvas cities={cities} bestTour={bestTour} width={window.innerWidth - 380} height={window.innerHeight} />
        
        {cities.length === 0 && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
            <h2 style={{ color: '#E2E8F0', marginBottom: 12, fontSize: '1.5rem' }}>No Cities Added</h2>
            <p style={{ color: '#64748B' }}>Add cities by clicking or use "Generate Random Cities" in the sidebar.</p>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: string, icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div style={{ padding: 16, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid rgba(255, 255, 255, 0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
      {icon}
      <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', fontFamily: 'JetBrains Mono' }}>{value}</div>
  </div>
);

export default App;
