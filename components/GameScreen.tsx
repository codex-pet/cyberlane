'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { GameCanvasEnhanced } from './GameCanvasEnhanced';
import { AudioManager } from '@/lib/audioManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const PLAYER_COLORS = ['#00f0ff', '#ff00ff', '#00ff00', '#ff6600'];
const PLAYER_NAMES = ['Nova', 'Pixel', 'Cyber', 'Neon'];

interface GameScreenProps {
  onGameOver?: (score: number, wave: number) => void;
  onReturnToMenu?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, onReturnToMenu }) => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const animationRef = useRef<number | null>(null);
  const [gameState, setGameState] = useState(
    () =>
      new GameEngine(
        'local-player-1',
        PLAYER_COLORS[0],
        PLAYER_NAMES[0]
      ).getState()
  );
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const inputVectorRef = useRef({ x: 0, y: 0 });
  const audioManagerRef = useRef<AudioManager | null>(null);
  const previousGameStateRef = useRef(gameState);

  // Initialize game engine and audio
  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        'local-player-1',
        PLAYER_COLORS[0],
        PLAYER_NAMES[0]
      );
      setGameState(gameEngineRef.current.getState());
    }

    // Initialize audio manager
    if (!audioManagerRef.current) {
      audioManagerRef.current = AudioManager.getInstance();
      audioManagerRef.current.initializeBackgroundMusic();
    }
  }, []);

  // Game loop
  useEffect(() => {
    const gameEngine = gameEngineRef.current;
    if (!gameEngine) return;

    const gameLoop = () => {
      gameEngine.updatePlayerInput('local-player-1', inputVectorRef.current.x, inputVectorRef.current.y);
      gameEngine.update();

      const currentGameState = gameEngine.getState();
      const audioManager = audioManagerRef.current;

      // Check for sound effect triggers
      if (audioManager && previousGameStateRef.current) {
        const player = currentGameState.players.get('local-player-1');
        const prevPlayer = previousGameStateRef.current.players.get('local-player-1');

        if (player && prevPlayer) {
          // Detect powerup collection
          if (player.score > prevPlayer.score && currentGameState.powerUps.length < previousGameStateRef.current.powerUps.length) {
            audioManager.playSoundEffect('powerup');
          }

          // Detect shield activation
          if (player.shield > 0 && prevPlayer.shield === 0) {
            audioManager.playSoundEffect('shield');
          }

          // Detect wave increase
          if (currentGameState.wave > previousGameStateRef.current.wave) {
            audioManager.playSoundEffect('wave');
          }

          // Detect player hit
          if (!player.isAlive && prevPlayer.isAlive) {
            audioManager.playSoundEffect('hit');
          }
        }
      }

      previousGameStateRef.current = { ...currentGameState };
      setGameState({ ...currentGameState });

      // Check for game over
      if (gameEngine.isGameOver() && !isGameOver) {
        setIsGameOver(true);
        setIsGameRunning(false);
        audioManagerRef.current?.playSoundEffect('gameover');
        audioManagerRef.current?.stopBackgroundMusic();
        onGameOver?.(currentGameState.score, currentGameState.wave);
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (isGameRunning) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isGameRunning, isGameOver, onGameOver]); // Removed gameInput dependency

  // Handle mouse movement for desktop control
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isGameRunning) return;
      
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        inputVectorRef.current = {
          x: (dx / distance) * 0.8,
          y: (dy / distance) * 0.8,
        };
      } else {
        inputVectorRef.current = { x: 0, y: 0 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isGameRunning]);

  // Handle keyboard input
  useEffect(() => {
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keys[key] = true;
        updateVector();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keys[key] = false;
        updateVector();
      }
    };

    const updateVector = () => {
      let x = 0;
      let y = 0;

      if (keys['w'] || keys['arrowup']) y = -1;
      if (keys['s'] || keys['arrowdown']) y = 1;
      if (keys['a'] || keys['arrowleft']) x = -1;
      if (keys['d'] || keys['arrowright']) x = 1;

      if (x === 0 && y === 0) {
        inputVectorRef.current = { x: 0, y: 0 };
      } else {
        const magnitude = Math.sqrt(x * x + y * y);
        inputVectorRef.current = { x: x / magnitude, y: y / magnitude };
      }
    };

    if (isGameRunning) {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }
  }, [isGameRunning]);

  const handleStartGame = () => {
    const gameEngine = gameEngineRef.current;
    const audioManager = audioManagerRef.current;
    if (gameEngine) {
      gameEngine.startGame();
      setIsGameRunning(true);
      setIsGameOver(false);
      audioManager?.playBackgroundMusic();
      previousGameStateRef.current = gameEngine.getState();
    }
  };

  const handleResetGame = () => {
    const gameEngine = gameEngineRef.current;
    if (gameEngine) {
      gameEngine.reset();
      setGameState(gameEngine.getState());
      setIsGameOver(false);
      handleStartGame();
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          CYBERLANE
        </h1>
        <p className="text-muted-foreground text-lg">
          {isGameOver ? '● GAME OVER ●' : isGameRunning ? '● ONLINE ●' : '● READY ●'}
        </p>
      </div>

      <GameCanvasEnhanced
        gameState={gameState}
        localPlayerId="local-player-1"
      />

      {/* Centered Modal Overlay for Start/GameOver */}
      {(!isGameRunning || isGameOver) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-card/80 backdrop-blur-xl border-primary/50 p-8 text-center space-y-6 max-w-sm w-full shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter text-primary">
                {isGameOver ? 'MISSION FAILED' : 'READY TO DRIVE?'}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-transparent mx-auto rounded-full" />
            </div>

            {isGameOver && (
              <div className="space-y-1 py-2">
                <p className="text-4xl font-black text-white">{gameState.score}</p>
                <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">Final Score</p>
                <div className="flex justify-center gap-4 mt-4 text-xs font-bold text-accent uppercase tracking-widest">
                  <span>Wave {gameState.wave}</span>
                </div>
              </div>
            )}

            {!isGameOver && (
              <p className="text-sm text-muted-foreground font-medium italic">
                Avoid obstacles. Collect power-ups. <br/>Survive the neon grid.
              </p>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={isGameOver ? handleResetGame : handleStartGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 text-xl italic tracking-tighter transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                {isGameOver ? 'PLAY AGAIN' : 'ENGAGE'}
              </Button>
              
              <Button
                variant="outline"
                className="w-full border-muted-foreground text-muted-foreground hover:bg-white/5 font-bold tracking-widest text-[10px] uppercase"
                onClick={onReturnToMenu}
              >
                RETURN TO MENU
              </Button>
            </div>

            <div className="pt-4 opacity-50">
               <p className="text-[10px] font-mono tracking-widest uppercase">Cyberlane Protocol v1.0</p>
            </div>
          </Card>
        </div>
      )}

      {/* Small info hint when playing */}
      {isGameRunning && !isGameOver && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none transition-opacity hover:opacity-100">
           <p className="text-[10px] font-mono uppercase tracking-[0.3em]">WASD / ARROWS / MOUSE</p>
        </div>
      )}

      <div className="text-xs text-muted-foreground/50 text-center">
        <p>Avoid obstacles. Collect power-ups. Survive the waves.</p>
      </div>
    </div>
  );
};
