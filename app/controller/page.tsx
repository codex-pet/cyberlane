'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MultiplayerManager } from '@/lib/multiplayerManager';

const PLAYER_COLORS = ['#00f0ff', '#ff00ff', '#00ff00', '#ff6600'];
const RANDOM_NAMES = ['Rogue', 'Glitch', 'Spark', 'Volt', 'Byte', 'Dash'];

function ControllerContent() {
  const searchParams = useSearchParams();
  const gameCode = searchParams?.get('code') || searchParams?.get('controller') || '';
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const keysRef = useRef<Set<string>>(new Set());
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');
  const multiplayerRef = useRef<MultiplayerManager | null>(null);
  const [isLandscape, setIsLandscape] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const handleJoin = async () => {
    if (!playerName.trim()) return;
    if (!gameCode) {
      setStatus('error');
      return;
    }

    setStatus('connecting');
    try {
      const multiplayer = new MultiplayerManager();
      const randomColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
      
      await multiplayer.initialize(playerName, randomColor);
      multiplayerRef.current = multiplayer;

      await multiplayer.connectToHost(gameCode);

      // Connection is established, send join message
      multiplayer.sendMessage('controller_join');
      setStatus('connected');
      setIsJoined(true);

    } catch (error) {
      console.error('Failed to initialize controller connection:', error);
      setStatus('error');
    }
  };

  useEffect(() => {
    return () => {
      if (multiplayerRef.current) {
        multiplayerRef.current.disconnect();
      }
    };
  }, []);

  const updateInputState = () => {
    let x = 0;
    let y = 0;

    if (keysRef.current.has('w') || keysRef.current.has('arrowup')) y = -1;
    if (keysRef.current.has('s') || keysRef.current.has('arrowdown')) y = 1;
    if (keysRef.current.has('a') || keysRef.current.has('arrowleft')) x = -1;
    if (keysRef.current.has('d') || keysRef.current.has('arrowright')) x = 1;

    let finalX = x;
    let finalY = y;

    // Normalize if diagonal
    if (x !== 0 && y !== 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      finalX = x / magnitude;
      finalY = y / magnitude;
    }

    if (multiplayerRef.current && status === 'connected') {
      multiplayerRef.current.sendMessage('controller_input', { x: finalX, y: finalY });
    }
  };

  const handleButtonDown = (key: string) => {
    if (status !== 'connected') return;
    keysRef.current.add(key);
    setPressedKeys(new Set(keysRef.current));
    updateInputState();
  };

  const handleButtonUp = (key: string) => {
    keysRef.current.delete(key);
    setPressedKeys(new Set(keysRef.current));
    updateInputState();
  };

  if (!isJoined) {
    return (
      <div className="fixed inset-0 bg-[#050505] text-white flex flex-col items-center justify-center p-8 gap-8 select-none touch-none">
        <div className="text-center space-y-2">
           <h1 className="text-4xl font-black tracking-tighter text-primary italic">CYBERLANE</h1>
           <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.4em]">Pilot Registration</p>
        </div>
        
        <div className="w-full max-w-xs space-y-4">
          <input 
            type="text" 
            placeholder="ENTER PILOT NAME"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
            className="w-full bg-white/5 border border-primary/30 p-4 rounded-xl text-center text-xl font-bold tracking-widest focus:border-primary focus:outline-none transition-all shadow-[0_0_20px_rgba(0,240,255,0.1)]"
            maxLength={12}
          />
          
          <button
            onClick={handleJoin}
            disabled={!playerName.trim() || status === 'connecting'}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-4 rounded-xl text-xl tracking-widest italic transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
          >
            {status === 'connecting' ? 'CONNECTING...' : 'JOIN SESSION'}
          </button>
        </div>

        {status === 'error' && (
          <div className="text-center space-y-1">
            <p className="text-red-500 font-black text-xs uppercase tracking-widest">Neural Link Failed</p>
            <p className="text-white/40 text-[10px]">Check your network connection or room code</p>
          </div>
        )}

        <div className="absolute bottom-8 opacity-20 text-[8px] font-mono tracking-[0.5em] uppercase">
          Waiting for neural handshake...
        </div>
      </div>
    );
  }

  if (!gameCode) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-black">
        <p className="text-secondary font-bold text-xl">Invalid Game Code</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050505] text-white overflow-hidden select-none touch-none flex flex-col items-center justify-center">
      {/* Styles for the page */}
      <style jsx global>{`
        body {
          overscroll-behavior: none;
          touch-action: none;
          user-select: none;
          background: black;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>

      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_#00f0ff_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_#ff00ff_0%,_transparent_50%)]" />
      </div>

      {/* Header Info (Top Left) */}
      <div className="absolute top-6 left-8 flex flex-col items-start gap-1 z-50 pointer-events-none">
        <h1 className="text-xl font-black tracking-tighter text-primary italic">CYBERLANE</h1>
        <div className={`px-4 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.2em] ${
          status === 'connected' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
        }`}>
          {status}
        </div>
      </div>

      {/* Centered Controls Layout */}
      <div className="relative w-full h-full flex items-center justify-center">
        
        {/* D-PAD (Perfectly Centered) */}
        <div className="relative w-80 h-80 flex items-center justify-center">
          {/* D-Pad background circle */}
          <div className="absolute inset-0 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_0_100px_rgba(0,240,255,0.05)]" />
          
          <div className="grid grid-cols-3 grid-rows-3 gap-4 z-10">
            {/* Empty top-left */}
            <div></div>
            
            {/* UP */}
            <button
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                pressedKeys.has('arrowup') ? 'bg-primary shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-90' : 'bg-white/10 active:bg-white/20'
              }`}
              onMouseDown={() => handleButtonDown('arrowup')}
              onMouseUp={() => handleButtonUp('arrowup')}
              onMouseLeave={() => handleButtonUp('arrowup')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('arrowup'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('arrowup'); }}
            >
              <span className="text-3xl">▲</span>
            </button>

            {/* Empty top-right */}
            <div></div>

            {/* LEFT */}
            <button
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                pressedKeys.has('arrowleft') ? 'bg-secondary shadow-[0_0_50px_rgba(255,0,255,0.8)] scale-90' : 'bg-white/10 active:bg-white/20'
              }`}
              onMouseDown={() => handleButtonDown('arrowleft')}
              onMouseUp={() => handleButtonUp('arrowleft')}
              onMouseLeave={() => handleButtonUp('arrowleft')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('arrowleft'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('arrowleft'); }}
            >
              <span className="text-3xl">◄</span>
            </button>

            {/* Empty center */}
            <div className="w-20 h-20 flex items-center justify-center text-white/10">
              <div className="w-4 h-4 rounded-full bg-current animate-pulse" />
            </div>

            {/* RIGHT */}
            <button
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                pressedKeys.has('arrowright') ? 'bg-secondary shadow-[0_0_50px_rgba(255,0,255,0.8)] scale-90' : 'bg-white/10 active:bg-white/20'
              }`}
              onMouseDown={() => handleButtonDown('arrowright')}
              onMouseUp={() => handleButtonUp('arrowright')}
              onMouseLeave={() => handleButtonUp('arrowright')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('arrowright'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('arrowright'); }}
            >
              <span className="text-3xl">►</span>
            </button>

            {/* Empty bottom-left */}
            <div></div>

            {/* DOWN */}
            <button
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
                pressedKeys.has('arrowdown') ? 'bg-primary shadow-[0_0_50px_rgba(0,240,255,0.8)] scale-90' : 'bg-white/10 active:bg-white/20'
              }`}
              onMouseDown={() => handleButtonDown('arrowdown')}
              onMouseUp={() => handleButtonUp('arrowdown')}
              onMouseLeave={() => handleButtonUp('arrowdown')}
              onTouchStart={(e) => { e.preventDefault(); handleButtonDown('arrowdown'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleButtonUp('arrowdown'); }}
            >
              <span className="text-3xl">▼</span>
            </button>

            {/* Empty bottom-right */}
            <div></div>
          </div>
        </div>
      </div>

      {/* Orientation Warning Overlay */}
      {!isLandscape && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
          <div className="w-16 h-24 border-2 border-primary rounded-lg mb-6 animate-bounce flex items-center justify-center">
             <div className="w-10 h-1 bg-primary/30 rounded-full mb-16" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 italic uppercase tracking-tighter">Please Rotate Your Phone</h2>
          <p className="text-white/60 text-sm">Landscape mode provides the best gaming experience</p>
        </div>
      )}

      {/* Footer Branding */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-30">
          <div className="h-[1px] w-12 bg-white/30" />
          <span className="text-[10px] font-mono tracking-[0.3em]">C-LNE CONTROLLER V2.0</span>
          <div className="h-[1px] w-12 bg-white/30" />
      </div>
    </div>
  );
}

export default function ControllerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center min-h-screen bg-black">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      }
    >
      <ControllerContent />
    </Suspense>
  );
}

