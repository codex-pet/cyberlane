'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine } from '@/lib/gameEngine';
import { MultiplayerManager, PlayerUpdate, GameMessage } from '@/lib/multiplayerManager';
import { GameCanvasEnhanced } from './GameCanvasEnhanced';
import { QRCodeDisplay } from './QRCodeDisplay';
import { MobileJoinController } from './MobileJoinController';
import { AudioManager } from '@/lib/audioManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const PLAYER_COLORS = ['#00f0ff', '#ff00ff', '#00ff00', '#ff6600'];
const PLAYER_NAMES = ['Nova', 'Pixel', 'Cyber', 'Neon'];

type GameMode = 'menu' | 'lobby' | 'playing' | 'gameOver';

interface MultiplayerGameProps {
  onReturn?: () => void;
}

export const MultiplayerGame: React.FC<MultiplayerGameProps> = ({ onReturn }) => {
  const gameEngineRef = useRef<GameEngine | null>(null);
  const multiplayerRef = useRef<MultiplayerManager | null>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const previousGameStateRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const controllerInputsRef = useRef<Map<string, {x: number, y: number}>>(new Map());

  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PLAYER_COLORS[0]);
  const [hostCode, setHostCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [peerId, setPeerId] = useState('');
  const [gameState, setGameState] = useState<any>(null);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [connectedPlayers, setConnectedPlayers] = useState<string[]>([]);
  const inputVectorRef = useRef({ x: 0, y: 0 });

  // Initialize game engine and audio when peerId is available
  useEffect(() => {
    if (peerId && !gameEngineRef.current) {
      gameEngineRef.current = new GameEngine(
        peerId,
        selectedColor,
        playerName || PLAYER_NAMES[0]
      );
      setGameState(gameEngineRef.current.getState());
      previousGameStateRef.current = gameEngineRef.current.getState();
    }
    // Initialize audio
    if (!audioManagerRef.current) {
      audioManagerRef.current = AudioManager.getInstance();
      audioManagerRef.current.initializeBackgroundMusic();
    }
  }, [peerId, selectedColor, playerName]);

  // Create/host a game
  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      alert('Please enter a player name');
      return;
    }

    const multiplayer = new MultiplayerManager();

    try {
      const id = await multiplayer.initialize(playerName, selectedColor);
      const roomCode = await multiplayer.createRoom();
      setPeerId(id);
      setHostCode(roomCode);
      multiplayerRef.current = multiplayer;

      // Setup multiplayer callbacks
      setupMultiplayerCallbacks(multiplayer);
      setGameMode('lobby');
    } catch (err) {
      console.error('Failed to initialize multiplayer:', err);
      alert('Failed to create game. Check console for details.');
    }
  };

  // Join a game
  const handleJoinGame = async (code?: string) => {
    if (!playerName.trim()) {
      alert('Please enter a player name');
      return;
    }

    const codeToUse = code || joinCode;
    if (!codeToUse.trim()) {
      alert('Please enter a host code');
      return;
    }

    const multiplayer = new MultiplayerManager();

    try {
      const id = await multiplayer.initialize(playerName, selectedColor);
      setPeerId(id);
      multiplayerRef.current = multiplayer;

      // Setup multiplayer callbacks
      setupMultiplayerCallbacks(multiplayer);

      // Connect to host
      await multiplayer.connectToHost(codeToUse);
      setGameMode('lobby');
    } catch (err) {
      console.error('Failed to join game:', err);
      alert('Failed to join game. Check console for details.');
    }
  };

  const setupMultiplayerCallbacks = (multiplayer: MultiplayerManager) => {
    multiplayer.onPlayerJoinedCallback((player: GameMessage) => {
      const gameEngine = gameEngineRef.current;
      if (gameEngine) {
        gameEngine.addRemotePlayer(
          player.playerId,
          player.playerColor,
          player.playerName
        );
        setConnectedPlayers((prev) => {
          const updated = new Set(prev);
          updated.add(player.playerId);
          return Array.from(updated);
        });
      }
    });

    multiplayer.onPlayerLeftCallback((playerId: string) => {
      const gameEngine = gameEngineRef.current;
      if (gameEngine) {
        gameEngine.removePlayer(playerId);
      }
      setConnectedPlayers((prev) => prev.filter((id) => id !== playerId));
    });

    multiplayer.onPlayerUpdateCallback((update: PlayerUpdate) => {
      const gameEngine = gameEngineRef.current;
      if (gameEngine) {
        gameEngine.updateRemotePlayer(update.id, update.x, update.y, update.score);
      }
    });

    multiplayer.onControllerJoinedCallback((player: GameMessage) => {
      const gameEngine = gameEngineRef.current;
      if (gameEngine) {
        // Find a unique color for the new player
        const gameState = gameEngine.getState();
        const takenColors = Array.from(gameState.players.values()).map(p => p.color);
        
        let uniqueColor = player.playerColor;
        if (takenColors.includes(uniqueColor)) {
          // Find first available color from the palette
          const availableColor = PLAYER_COLORS.find(c => !takenColors.includes(c));
          if (availableColor) {
            uniqueColor = availableColor;
          }
        }

        // We simulate this player locally
        gameEngine.addRemotePlayer(
          player.playerId,
          uniqueColor,
          player.playerName
        );
        controllerInputsRef.current.set(player.playerId, { x: 0, y: 0 });
        setConnectedPlayers((prev) => {
          const updated = new Set(prev);
          updated.add(player.playerId);
          return Array.from(updated);
        });
      }
    });

    multiplayer.onControllerInputCallback((playerId: string, input: { x: number, y: number }) => {
      if (controllerInputsRef.current.has(playerId)) {
        controllerInputsRef.current.set(playerId, input);
      }
    });

    multiplayer.onGameStartCallback(() => {
      const gameEngine = gameEngineRef.current;
      const audioManager = audioManagerRef.current;
      if (gameEngine) {
        // Reset the engine for a fresh start/retry
        gameEngine.reset();
        
        gameEngine.startGame();
        setIsGameRunning(true);
        setGameMode('playing');
        audioManager?.playBackgroundMusic();
        previousGameStateRef.current = gameEngine.getState();
      }
    });

    multiplayer.onGameEndCallback((data) => {
      setIsGameRunning(false);
      setGameMode('gameOver');
    });
  };

  // Start/Retry game
  const handleStartGame = () => {
    const gameEngine = gameEngineRef.current;
    const audioManager = audioManagerRef.current;
    if (gameEngine && peerId) {
      gameEngine.reset();
      gameEngine.startGame();
      setIsGameRunning(true);
      setGameMode('playing');
      setGameState({ ...gameEngine.getState() });
      audioManager?.playBackgroundMusic();
      previousGameStateRef.current = gameEngine.getState();
      multiplayerRef.current?.broadcastGameStart();
    }
  };

  // Game loop
  useEffect(() => {
    const gameEngine = gameEngineRef.current;
    const multiplayer = multiplayerRef.current;
    const audioManager = audioManagerRef.current;
    if (!gameEngine || !multiplayer) return;

    const gameLoop = () => {
      if (!peerId) return;
      gameEngine.updatePlayerInput(peerId, inputVectorRef.current.x, inputVectorRef.current.y);
      
      // Update inputs for all simulated mobile controllers
      controllerInputsRef.current.forEach((input, playerId) => {
        gameEngine.updatePlayerInput(playerId, input.x, input.y);
      });

      gameEngine.update();

      const currentGameState = gameEngine.getState();
      
      // Check for sound effect triggers
      if (audioManager && previousGameStateRef.current && peerId) {
        const player = currentGameState.players.get(peerId);
        const prevPlayer = previousGameStateRef.current.players.get(peerId);

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

      // Send player update to other players
      const localPlayer = gameEngine.getLocalPlayer(peerId);
      if (localPlayer) {
        multiplayer.sendPlayerUpdate({
          id: peerId,
          x: localPlayer.x,
          y: localPlayer.y,
          score: localPlayer.score,
          isAlive: localPlayer.isAlive,
          name: localPlayer.name,
          color: localPlayer.color,
        });
      }

      // Check for game over
      if (gameEngine.isGameOver() && isGameRunning) {
        setIsGameRunning(false);
        setGameMode('gameOver');
        audioManager?.playSoundEffect('gameover');
        audioManager?.stopBackgroundMusic();
        multiplayer.broadcastGameEnd({ score: currentGameState.score });
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
  }, [isGameRunning]); // Removed touchInput dependency

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

  const handleReturnToMenu = () => {
    const multiplayer = multiplayerRef.current;
    if (multiplayer) {
      multiplayer.disconnect();
      multiplayerRef.current = null;
    }
    setGameMode('menu');
    setPeerId('');
    setHostCode('');
    onReturn?.();
  };

  // Render menu
  if (gameMode === 'menu') {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            CYBERLANE
          </h1>
          <p className="text-muted-foreground text-lg">Multiplayer Mode</p>
        </div>

        <div className="space-y-4 max-w-md w-full">
          <Input
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="bg-card/50 border-primary/50"
          />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Select Color:</p>
            <div className="flex gap-2">
              {PLAYER_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="w-12 h-12 rounded-lg border-2 transition-all"
                  style={{
                    backgroundColor: color,
                    borderColor: selectedColor === color ? '#00ff00' : 'transparent',
                    opacity: selectedColor === color ? 1 : 0.6,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Button
                onClick={handleCreateGame}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Create Game
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">or</div>

          <MobileJoinController 
            onConnect={handleJoinGame}
            isLoading={false}
          />
        </div>

        <Button
          variant="outline"
          className="border-muted-foreground text-muted-foreground hover:bg-muted/10"
          onClick={onReturn}
        >
          Back to Single Player
        </Button>
      </div>
    );
  }

  // Render lobby
  if (gameMode === 'lobby') {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            CYBERLANE
          </h1>
          <p className="text-muted-foreground text-lg">● LOBBY ●</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-2xl">
          {/* QR Code Display */}
          <QRCodeDisplay gameCode={hostCode} />

          {/* Player Info */}
          <Card className="bg-card/50 backdrop-blur border-primary/50 p-6 max-w-md w-full space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Players Connected:</p>
              <div className="space-y-2">
                <p className="text-primary font-bold">● You (Host)</p>
                {connectedPlayers.length > 0 ? (
                  connectedPlayers.map((id) => (
                    <p key={id} className="text-secondary font-bold">
                      ● {id.substring(0, 8)}...
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm italic">
                    Waiting for players...
                  </p>
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Total Players: {connectedPlayers.length + 1}</p>
            </div>

            <Button
              onClick={handleStartGame}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              disabled={connectedPlayers.length === 0}
            >
              Start Game
            </Button>

            <Button
              variant="outline"
              className="w-full border-muted-foreground text-muted-foreground hover:bg-muted/10"
              onClick={handleReturnToMenu}
            >
              Leave
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Render playing
  if (gameMode === 'playing') {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-screen gap-6 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">CYBERLANE</h1>
          <p className="text-muted-foreground">● MULTIPLAYER ●</p>
        </div>

        <GameCanvasEnhanced gameState={gameState} localPlayerId={peerId} />

        <Card className="bg-card/50 backdrop-blur border-primary/50 px-6 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            WASD/Arrows to move
          </p>
        </Card>
      </div>
    );
  }

  // Render game over
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <div className="text-center space-y-2">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          CYBERLANE
        </h1>
        <p className="text-secondary font-bold text-lg">● GAME OVER ●</p>
      </div>

      <Card className="bg-card/50 backdrop-blur border-primary/50 px-6 py-4 text-center space-y-4 max-w-md">
        <div>
          <p className="text-primary font-bold text-lg">Final Score: {gameState.score}</p>
          <p className="text-accent">Waves Completed: {gameState.wave}</p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            onClick={handleStartGame}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-xl"
          >
            RETRY
          </Button>
          <div className="flex gap-3">
            <Button
              onClick={handleReturnToMenu}
              variant="outline"
              className="flex-1 border-secondary text-secondary hover:bg-secondary/10"
            >
              Lobby
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted/10"
              onClick={handleReturnToMenu}
            >
              Exit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
