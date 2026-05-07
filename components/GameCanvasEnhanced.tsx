'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameState, CANVAS_WIDTH_EXPORT, CANVAS_HEIGHT_EXPORT } from '@/lib/gameEngine';
import { ParticleSystem } from '@/lib/particles';

interface GameCanvasEnhancedProps {
  gameState: GameState;
  localPlayerId: string;
}

export const GameCanvasEnhanced: React.FC<GameCanvasEnhancedProps> = ({
  gameState,
  localPlayerId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef(new ParticleSystem());
  const lastObstacleCountRef = useRef(0);
  const lastPowerupCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx || !gameState) return;

    // Update particles
    particlesRef.current.update();

    // Clear canvas with dark background
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, CANVAS_WIDTH_EXPORT, CANVAS_HEIGHT_EXPORT);

    // Draw animated background grid
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 0.5;
    const gridOffset = (Date.now() / 50) % 40;
    for (let i = 0; i < CANVAS_WIDTH_EXPORT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i + gridOffset, 0);
      ctx.lineTo(i + gridOffset, CANVAS_HEIGHT_EXPORT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT_EXPORT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i + gridOffset);
      ctx.lineTo(CANVAS_WIDTH_EXPORT, i + gridOffset);
      ctx.stroke();
    }

    // Draw obstacles with enhanced visuals
    gameState.obstacles.forEach((obs, idx) => {
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
      gradient.addColorStop(0.5, '#ff00ff');
      gradient.addColorStop(1, '#ff1744');

      ctx.fillStyle = gradient;
      ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      // Glow effect with pulsing
      const pulseAlpha = 0.5 + 0.5 * Math.sin(Date.now() / 200 + idx);
      ctx.strokeStyle = `rgba(255, 0, 255, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 10;
      ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

      // Add inner details
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        -obs.width / 4,
        -obs.height / 2,
        obs.width / 2,
        obs.height
      );

      ctx.restore();
    });

    // Check for new obstacles for particle effects
    if (gameState.obstacles.length > lastObstacleCountRef.current) {
      gameState.obstacles.slice(lastObstacleCountRef.current).forEach((obs) => {
        particlesRef.current.addParticles(
          obs.x + obs.width / 2,
          obs.y + obs.height / 2,
          '#ff00ff',
          5,
          'glow'
        );
      });
    }
    lastObstacleCountRef.current = gameState.obstacles.length;

    // Draw power-ups with enhanced visuals
    gameState.powerUps.forEach((pw, idx) => {
      const colors: Record<string, string> = {
        shield: '#00f0ff',
        speed: '#00ff00',
        slow: '#ff6600',
      };

      ctx.save();
      ctx.translate(pw.x, pw.y);
      const rotation = (Date.now() / 1000) + idx;
      ctx.rotate(rotation);

      // Draw outer rings
      for (let ring = 0; ring < 3; ring++) {
        ctx.strokeStyle = colors[pw.type];
        ctx.globalAlpha = 0.4 - ring * 0.1;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 10 + ring * 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      // Main orb
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 8);
      gradient.addColorStop(0, colors[pw.type]);
      gradient.addColorStop(1, colors[pw.type]);
      ctx.fillStyle = gradient;
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

      // Check for new powerups
      if (gameState.powerUps.length > lastPowerupCountRef.current) {
        particlesRef.current.addParticles(
          pw.x,
          pw.y,
          colors[pw.type],
          8,
          'glow'
        );
      }
    });
    lastPowerupCountRef.current = gameState.powerUps.length;

    // Draw players with enhanced effects
    gameState.players.forEach((player) => {
      ctx.save();

      if (player.isAlive) {
        // Draw trail particles for movement
        if (player.speedBoost > 0) {
          particlesRef.current.addParticles(
            player.x,
            player.y,
            '#ff6600',
            2,
            'trail'
          );
        }

        // Draw glow
        ctx.shadowColor = player.color;
        ctx.shadowBlur = 20;

        // Draw player circle with gradient
        const gradient = ctx.createRadialGradient(
          player.x - 3,
          player.y - 3,
          0,
          player.x,
          player.y,
          player.radius
        );
        gradient.addColorStop(0, player.color);
        gradient.addColorStop(1, player.color);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw animated border glow
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() / 200);
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 2 + pulse;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius + 3, 0, Math.PI * 2);
        ctx.stroke();

        // Draw shield effect with animation
        if (player.shield > 0) {
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;
          ctx.globalAlpha = 0.6 * (player.shield / 8000);
          const shieldGrow = Math.sin(Date.now() / 100) * 2;
          ctx.beginPath();
          ctx.arc(
            player.x,
            player.y,
            player.radius + 12 + shieldGrow,
            0,
            Math.PI * 2
          );
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Draw speed boost effect
        if (player.speedBoost > 0) {
          ctx.strokeStyle = '#ff6600';
          ctx.lineWidth = 2;
          ctx.globalAlpha = 0.4 * (player.speedBoost / 4000);
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
          ctx.globalAlpha = 0.2 * (player.slowEffect / 5000);
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
        // Draw dead player as faded with X
        ctx.fillStyle = '#666666';
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fill();

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

    // Render particles
    particlesRef.current.render(ctx);

    // Draw HUD with enhanced visuals
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

      // Draw combo indicator with animation
      if (player.combo > 0) {
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 12px monospace';
        const comboScale = 1 + Math.sin(Date.now() / 100) * 0.1;
        ctx.save();
        ctx.translate(80, yOffset - 5);
        ctx.scale(comboScale, comboScale);
        ctx.fillText(`COMBO x${player.combo}`, 0, 0);
        ctx.restore();
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
