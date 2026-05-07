'use client';

import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ArrowButtonControllerProps {
  onMove: (x: number, y: number) => void;
  isVisible?: boolean;
}

export const ArrowButtonController: React.FC<ArrowButtonControllerProps> = ({
  onMove,
  isVisible = true,
}) => {
  const activeKeysRef = React.useRef<Record<string, boolean>>({});

  const updateMovement = React.useCallback(() => {
    let x = 0;
    let y = 0;

    if (activeKeysRef.current['up'] || activeKeysRef.current['w']) y -= 1;
    if (activeKeysRef.current['down'] || activeKeysRef.current['s']) y += 1;
    if (activeKeysRef.current['left'] || activeKeysRef.current['a']) x -= 1;
    if (activeKeysRef.current['right'] || activeKeysRef.current['d']) x += 1;

    if (x !== 0 || y !== 0) {
      const magnitude = Math.sqrt(x * x + y * y);
      onMove(x / magnitude, y / magnitude);
    } else {
      onMove(0, 0);
    }
  }, [onMove]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        activeKeysRef.current[key] = true;
        updateMovement();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        activeKeysRef.current[key] = false;
        updateMovement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [updateMovement]);

  const handleButtonDown = (direction: string) => {
    activeKeysRef.current[direction] = true;
    updateMovement();
  };

  const handleButtonUp = (direction: string) => {
    activeKeysRef.current[direction] = false;
    updateMovement();
  };

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 bg-card/95 backdrop-blur border-primary/50 p-4 z-40 shadow-lg">
      <div className="grid grid-cols-3 gap-2 w-48">
        {/* Up Button */}
        <div className="col-start-2">
          <Button
            size="lg"
            className={`w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all`}
            onMouseDown={() => handleButtonDown('up')}
            onMouseUp={() => handleButtonUp('up')}
            onMouseLeave={() => handleButtonUp('up')}
            onTouchStart={() => handleButtonDown('up')}
            onTouchEnd={() => handleButtonUp('up')}
          >
            ▲
          </Button>
        </div>

        {/* Left Button */}
        <Button
          size="lg"
          className={`w-12 h-12 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold transition-all`}
          onMouseDown={() => handleButtonDown('left')}
          onMouseUp={() => handleButtonUp('left')}
          onMouseLeave={() => handleButtonUp('left')}
          onTouchStart={() => handleButtonDown('left')}
          onTouchEnd={() => handleButtonUp('left')}
        >
          ◄
        </Button>

        {/* Down Button */}
        <Button
          size="lg"
          className={`w-12 h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-all col-start-2`}
          onMouseDown={() => handleButtonDown('down')}
          onMouseUp={() => handleButtonUp('down')}
          onMouseLeave={() => handleButtonUp('down')}
          onTouchStart={() => handleButtonDown('down')}
          onTouchEnd={() => handleButtonUp('down')}
        >
          ▼
        </Button>

        {/* Right Button */}
        <Button
          size="lg"
          className={`w-12 h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-bold transition-all col-start-3 row-start-2`}
          onMouseDown={() => handleButtonDown('right')}
          onMouseUp={() => handleButtonUp('right')}
          onMouseLeave={() => handleButtonUp('right')}
          onTouchStart={() => handleButtonDown('right')}
          onTouchEnd={() => handleButtonUp('right')}
        >
          ►
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Arrow Keys or Buttons
      </p>
    </Card>
  );
};
