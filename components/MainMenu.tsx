'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MainMenuProps {
  onPlaySinglePlayer: () => void;
  onPlayMultiplayer: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlaySinglePlayer,
  onPlayMultiplayer,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen gap-8 p-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 240, 255, 0.05) 25%, rgba(0, 240, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.05) 75%, rgba(0, 240, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 240, 255, 0.05) 25%, rgba(0, 240, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(0, 240, 255, 0.05) 75%, rgba(0, 240, 255, 0.05) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
            animation: 'moveGrid 20s linear infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.5); }
        }
        .title-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>

      <div className="text-center space-y-4 relative z-10">
        <h1 className="text-7xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent title-glow">
          CYBERLANE
        </h1>
        <p className="text-xl text-primary font-bold">
          {'> PHONE CONTROLLED MULTIPLAYER DODGE'}
        </p>
        <p className="text-sm text-muted-foreground">
          {'[_] Avoid obstacles. Collect power-ups. Survive the waves.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full relative z-10">
        {/* Single Player Card */}
        <Card className="bg-card/50 backdrop-blur border-primary/50 p-8 hover:border-primary transition-colors cursor-pointer group">
          <div
            onClick={onPlaySinglePlayer}
            className="space-y-4 text-center"
          >
            <div className="text-4xl mb-4">
              <span className="inline-block text-primary font-bold text-5xl">●</span>
            </div>
            <h2 className="text-2xl font-bold text-primary group-hover:text-accent transition-colors">
              SOLO MODE
            </h2>
            <p className="text-sm text-muted-foreground">
              Challenge yourself against infinite waves of obstacles. Test your reflexes and chase high scores.
            </p>
            <div className="text-xs text-accent font-mono pt-2">
              {'> SINGLE PLAYER'}
            </div>
            <Button
              onClick={onPlaySinglePlayer}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold mt-4"
            >
              ENTER
            </Button>
          </div>
        </Card>

        {/* Multiplayer Card */}
        <Card className="bg-card/50 backdrop-blur border-secondary/50 p-8 hover:border-secondary transition-colors cursor-pointer group">
          <div
            onClick={onPlayMultiplayer}
            className="space-y-4 text-center"
          >
            <div className="text-4xl mb-4">
              <span className="inline-block text-secondary font-bold text-5xl">●●</span>
            </div>
            <h2 className="text-2xl font-bold text-secondary group-hover:text-accent transition-colors">
              NETWORK MODE
            </h2>
            <p className="text-sm text-muted-foreground">
              Connect with friends via PeerJS. Compete or cooperate in real-time multiplayer battles.
            </p>
            <div className="text-xs text-accent font-mono pt-2">
              {'> MULTI PLAYER (BETA)'}
            </div>
            <Button
              onClick={onPlayMultiplayer}
              className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold mt-4"
            >
              ENTER
            </Button>
          </div>
        </Card>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full relative z-10 mt-4">
        <Card className="bg-card/30 border-primary/30 p-4 text-center">
          <p className="text-xs text-primary font-bold mb-2">POWERUPS</p>
          <p className="text-xs text-muted-foreground">Shield, Speed, Slow</p>
        </Card>
        <Card className="bg-card/30 border-primary/30 p-4 text-center">
          <p className="text-xs text-primary font-bold mb-2">WAVES</p>
          <p className="text-xs text-muted-foreground">Infinite progression</p>
        </Card>
        <Card className="bg-card/30 border-primary/30 p-4 text-center">
          <p className="text-xs text-primary font-bold mb-2">CONTROLS</p>
          <p className="text-xs text-muted-foreground">Mouse, Keyboard, Touch</p>
        </Card>
        <Card className="bg-card/30 border-primary/30 p-4 text-center">
          <p className="text-xs text-primary font-bold mb-2">COMBOS</p>
          <p className="text-xs text-muted-foreground">Multiplier rewards</p>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground/50 relative z-10 mt-8">
        <p>{'[CYBERLANE v1.0] > Ready to compete?'}</p>
      </div>
    </div>
  );
};
