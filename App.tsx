import React, { useState } from 'react';
import GameCanvas from './components/DrawingCanvas'; // Actually Game3D
import { GamePhase } from './types';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [stats, setStats] = useState({ hp: 100, maxHp: 100, xp: 0 });

  const handleStart = () => setPhase(GamePhase.PLAYING);
  
  const handleGameOver = () => {
      setPhase(GamePhase.GAME_OVER);
      // document.exitPointerLock(); // Auto exit
  };

  return (
    <div className="w-full h-full relative bg-black text-white select-none">
      
      {/* MENU */}
      {phase === GamePhase.MENU && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop')] bg-cover">
          <div className="bg-black/80 p-12 backdrop-blur-md border border-cyan-500 text-center shadow-[0_0_50px_rgba(0,255,255,0.3)]">
            <h1 className="text-6xl font-bold mb-4 text-cyan-400 tracking-tighter" style={{ textShadow: '0 0 10px cyan' }}>AETHEREA</h1>
            <p className="text-xl text-slate-300 mb-8 tracking-widest">3D MMORPG PROTOCOL</p>
            <button 
              onClick={handleStart}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xl uppercase tracking-widest transition-all hover:scale-105"
            >
              Initialize Link
            </button>
            <p className="mt-4 text-xs text-slate-500">WASD to Move • Click to Lock Mouse • Click to Attack</p>
          </div>
        </div>
      )}

      {/* GAME HUD */}
      {phase === GamePhase.PLAYING && (
        <>
          {/* Crosshair */}
          <div className="crosshair border-2 border-cyan-500 rounded-full bg-white/10 mix-blend-difference"></div>
          <div className="crosshair w-1 h-1 bg-cyan-500 rounded-full"></div>

          {/* Stats */}
          <div className="absolute top-4 left-4 z-10 w-80">
            {/* HP */}
            <div className="flex justify-between items-end mb-1">
                <span className="font-bold text-cyan-400 text-lg">UNIT-01</span>
                <span className="text-sm text-slate-400">{Math.ceil(stats.hp)} / {stats.maxHp} HP</span>
            </div>
            <div className="w-full h-4 bg-slate-800 border border-slate-600 skew-x-[-12deg]">
                <div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all duration-200"
                    style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
                ></div>
            </div>
            
            {/* XP */}
            <div className="mt-2 text-xs text-yellow-500 font-mono">
                 XP COLLECTED: {stats.xp}
            </div>
          </div>

          {/* Mini-map / Radar Placeholder */}
          <div className="absolute top-4 right-4 z-10 w-32 h-32 bg-black/50 border border-cyan-500/50 rounded-full flex items-center justify-center">
              <div className="text-cyan-500/30 text-xs animate-pulse">RADAR OFFLINE</div>
          </div>
        </>
      )}

      {/* GAME OVER */}
      {phase === GamePhase.GAME_OVER && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm">
          <h2 className="text-8xl font-black text-red-500 mb-4 drop-shadow-xl">CRITICAL FAILURE</h2>
          <p className="text-2xl mb-8">System Disconnected</p>
          <button 
             onClick={() => window.location.reload()}
             className="px-6 py-3 border border-white hover:bg-white hover:text-black transition-colors"
          >
             REBOOT SYSTEM
          </button>
        </div>
      )}

      {/* 3D SCENE CONTAINER */}
      {(phase === GamePhase.PLAYING || phase === GamePhase.GAME_OVER) && (
        <GameCanvas 
           onStatsUpdate={(hp, maxHp, xp) => setStats({ hp, maxHp, xp })}
           onGameOver={handleGameOver}
        />
      )}
    </div>
  );
};

export default App;