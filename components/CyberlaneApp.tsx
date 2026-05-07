'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MainMenu } from './MainMenu';
import { GameScreen } from './GameScreen';
import { MultiplayerGame } from './MultiplayerGame';
import { AudioManager } from '@/lib/audioManager';
import { Button } from '@/components/ui/button';

type AppScreen = 'splash' | 'menu' | 'singlePlayer' | 'multiplayer';

export const CyberlaneApp: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const audioManagerRef = useRef<AudioManager | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const audio = AudioManager.getInstance();
    audioManagerRef.current = audio;
    
    // Load music in background
    audio.initializeBackgroundMusic().then(() => {
      setIsLoaded(true);
    });
  }, []);

  const handleStart = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.playBackgroundMusic();
    }
    setCurrentScreen('menu');
  };

  const handlePlaySinglePlayer = () => {
    setCurrentScreen('singlePlayer');
  };

  const handlePlayMultiplayer = () => {
    setCurrentScreen('multiplayer');
  };

  const handleReturnToMenu = () => {
    if (audioManagerRef.current) {
      audioManagerRef.current.playBackgroundMusic();
    }
    setCurrentScreen('menu');
  };

  return (
    <>
      {currentScreen === 'splash' && (
        <div className="fixed inset-0 bg-[#050505] flex flex-col items-center justify-center z-[100] overflow-hidden select-none">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#00f0ff15_0%,_transparent_70%)] animate-pulse" />
            <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-blob" />
            <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px] animate-blob animation-delay-2000" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 text-center p-8 max-w-2xl">
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <h1 className="text-7xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-primary/50 drop-shadow-[0_0_30px_rgba(0,240,255,0.3)]">
                CYBERLANE
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="h-[1px] w-12 bg-white/20" />
                <p className="text-muted-foreground font-mono text-sm uppercase tracking-[0.6em]">Neural Protocol v2.4</p>
                <div className="h-[1px] w-12 bg-white/20" />
              </div>
            </div>

            <div className="space-y-6 w-full max-w-xs animate-in fade-in zoom-in duration-1000 delay-500">
              <Button
                onClick={handleStart}
                disabled={!isLoaded}
                className="group relative w-full h-20 bg-transparent border-2 border-primary/50 hover:border-primary text-white font-black text-2xl tracking-widest italic transition-all overflow-hidden active:scale-95"
              >
                {/* Button Glitch Effect Background */}
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <span className="relative z-10">
                  {isLoaded ? 'INITIALIZE' : 'SYNCING...'}
                </span>
              </Button>
              
              <div className="flex flex-col items-center gap-2">
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-primary transition-all duration-1000 ease-out ${isLoaded ? 'w-full' : 'w-1/3'}`} 
                  />
                </div>
                <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest">
                  {isLoaded ? 'Connection Established' : 'Connecting to Core...'}
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
             <p className="text-[8px] font-mono tracking-[1em] text-white">ESTABLISHED 2026 // DEEP-NEURAL LINK</p>
          </div>
        </div>
      )}

      {currentScreen === 'menu' && (
        <MainMenu
          onPlaySinglePlayer={handlePlaySinglePlayer}
          onPlayMultiplayer={handlePlayMultiplayer}
        />
      )}
      {currentScreen === 'singlePlayer' && (
        <GameScreen onGameOver={() => {}} onReturnToMenu={handleReturnToMenu} />
      )}
      {currentScreen === 'multiplayer' && (
        <MultiplayerGame onReturn={handleReturnToMenu} />
      )}
    </>
  );
};
