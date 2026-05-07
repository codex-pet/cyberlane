'use client';

import React, { useRef, useEffect } from 'react';
import { GameState, CANVAS_WIDTH_EXPORT, CANVAS_HEIGHT_EXPORT } from '@/lib/gameEngine';

interface GameCanvasProps {
  gameState: GameState;
  localPlayerId: string;
  onGameOver?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  localPlayerId,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, CANVAS_WIDTH_EXPORT, CANVAS_HEIGHT_EXPORT);

    // Draw grid background
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < CANVAS_WIDTH_EXPORT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT_EXPORT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT_EXPORT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH_EXPORT, i);
      ctx.stroke();
    }

    // Draw obstacles
    gameState.obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
      ctx.rotate(obs.rotation);

      // Neon gradient for obstacles
      const gradient = ctx.createLinearGradient(
        -obs.width / 2,
        -obs.height / 2,
        obs.width / 2,
        obs.height / 2
      );
      gradient.addColorStop(0, '#ff00ff');
      gradient.addColorStop(1, '#ff1744');

      ctx.fillStyle = gradient;
      ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      // Glow effect
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      ctx.restore();
    });

    // Draw power-ups
    gameState.powerUps.forEach((pw) => {
      const colors: Record<string, string> = {
        shield: '#00f0ff',
        speed: '#00ff00',
        slow: '#ff6600',
      };

      ctx.save();
      ctx.translate(pw.x, pw.y);
      ctx.rotate(Date.now() / 1000);

      ctx.fillStyle = colors[pw.type];
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = colors[pw.type];
      ctx.lineWidth = 2;
      ctx.shadowColor = colors[pw.type];
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Inner star pattern
      ctx.strokeStyle = colors[pw.type];
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 8, Math.sin(angle) * 8);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw players
    gameState.players.forEach((player) => {
      ctx.save();

      if (player.isAlive) {
        // Draw glow
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 20;

        // Draw player circle
      ctx.fillStyle = player.color;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Draw border glow
      ctx.strokeStyle = player.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Draw shield effect
      if (player.shield > 0) {
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Draw speed boost effect
      if (player.speedBoost > 0) {
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(
            player.x,
            player.y,
            player.radius + 6 + i * 4,
            0,
            Math.PI * 2
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // Draw slow effect
      if (player.slowEffect > 0) {
        ctx.fillStyle = '#0099ff';
        ctx.globalAlpha = 0.2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

        // Draw player name
        ctx.fillStyle = player.color;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 5;
        ctx.fillText(player.name.substring(0, 3), player.x, player.y + player.radius + 15);
      } else {
        // Draw dead player as faded
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw X through dead player
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 2;
        const offset = player.radius + 5;
        ctx.beginPath();
        ctx.moveTo(player.x - offset, player.y - offset);
        ctx.lineTo(player.x + offset, player.y + offset);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(player.x + offset, player.y - offset);
        ctx.lineTo(player.x - offset, player.y + offset);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Draw HUD
    ctx.fillStyle = '#00f0ff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 5;

    ctx.fillText(`SCORE: ${gameState.score}`, 10, 10);
    ctx.fillText(`WAVE: ${gameState.wave}`, 10, 35);

    // Draw player scores and stats
    let yOffset = 60;
    gameState.players.forEach((player) => {
      ctx.fillStyle = player.color;
      const status = player.isAlive ? '●' : '○';
      ctx.fillText(`${status} ${player.name}: ${player.score}`, 10, yOffset);

      // Draw combo indicator
      if (player.combo > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`COMBO x${player.combo}`, 10, yOffset + 15);
      }

      // Draw active effects
      let effectText = '';
      if (player.shield > 0) effectText += ' [SHIELD]';
      if (player.speedBoost > 0) effectText += ' [SPEED]';
      if (player.slowEffect > 0) effectText += ' [SLOW]';

      if (effectText) {
        ctx.fillStyle = '#888888';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(effectText, 10, yOffset + 27);
      }

      yOffset += 35;
    });

    ctx.shadowColor = 'transparent';
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH_EXPORT}
      height={CANVAS_HEIGHT_EXPORT}
      className="border border-primary/50 rounded-lg shadow-lg mx-auto"
      style={{
        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
      }}
    />
  );
};
