'use client';

import React, { useRef, useEffect, useState } from 'react';

interface PhoneControllerProps {
  onInput: (x: number, y: number) => void;
  enabled?: boolean;
}

export const PhoneController: React.FC<PhoneControllerProps> = ({
  onInput,
  enabled = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchRef = useRef({ x: 0, y: 0, active: false });
  const [deviceMotionSupported, setDeviceMotionSupported] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const motionRef = useRef({ alpha: 0, beta: 0, gamma: 0 });

  // Virtual joystick rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1f3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background with border
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 50;
    const innerRadius = 30;

    // Draw outer circle
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw crosshairs
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(centerX - outerRadius - 10, centerY);
    ctx.lineTo(centerX + outerRadius + 10, centerY);
    ctx.moveTo(centerX, centerY - outerRadius - 10);
    ctx.lineTo(centerX, centerY + outerRadius + 10);
    ctx.stroke();

    // Draw joystick knob
    if (touchRef.current.active) {
      ctx.fillStyle = '#ff00ff';
      ctx.shadowColor = '#ff00ff';
      ctx.shadowBlur = 15;
    } else {
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
    }

    const knobX = centerX + touchRef.current.x * outerRadius;
    const knobY = centerY + touchRef.current.y * outerRadius;

    ctx.beginPath();
    ctx.arc(knobX, knobY, innerRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner glow
    ctx.strokeStyle = touchRef.current.active ? '#ff00ff' : '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(knobX, knobY, innerRadius - 5, 0, Math.PI * 2);
    ctx.stroke();

    // Draw direction indicator
    if (touchRef.current.active) {
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(knobX, knobY);
      ctx.stroke();
    }

    ctx.shadowColor = 'transparent';
  }, [touchRef.current.x, touchRef.current.y, touchRef.current.active]);

  // Handle touch input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchRef.current.active = true;
      updateTouchInput(e.touches[0]);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchRef.current.active) {
        updateTouchInput(e.touches[0]);
      }
    };

    const handleTouchEnd = () => {
      touchRef.current.active = false;
      touchRef.current.x = 0;
      touchRef.current.y = 0;
      onInput(0, 0);
    };

    const updateTouchInput = (touch: Touch) => {
      const rect = canvas.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const outerRadius = rect.width / 4;

      const dx = touch.clientX - centerX;
      const dy = touch.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 10) {
        const angle = Math.atan2(dy, dx);
        const magnitude = Math.min(distance / outerRadius, 1);

        touchRef.current.x = Math.cos(angle) * magnitude;
        touchRef.current.y = Math.sin(angle) * magnitude;

        onInput(touchRef.current.x, touchRef.current.y);
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, onInput]);

  // Request device motion permission (iOS 13+)
  const requestMotionPermission = async () => {
    if (typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as any).requestPermission) {
      try {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setMotionEnabled(true);
          enableMotionControl();
        }
      } catch (err) {
        console.error('Permission denied:', err);
      }
    }
  };

  const enableMotionControl = () => {
    if (!enabled) return;

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (!event.accelerationIncludingGravity) return;

      const x = event.accelerationIncludingGravity.x || 0;
      const y = event.accelerationIncludingGravity.y || 0;

      // Normalize to -1 to 1 range
      const normalizedX = Math.max(-1, Math.min(1, x / 20));
      const normalizedY = Math.max(-1, Math.min(1, y / 20));

      touchRef.current.x = normalizedX;
      touchRef.current.y = normalizedY;
      touchRef.current.active = true;

      onInput(normalizedX, normalizedY);
    };

    window.addEventListener('devicemotion', handleDeviceMotion);

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  };

  useEffect(() => {
    setDeviceMotionSupported(typeof DeviceMotionEvent !== 'undefined');
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full max-w-sm mx-auto space-y-4"
    >
      <div className="text-center space-y-2">
        <h3 className="text-primary font-bold text-lg">PHONE CONTROLLER</h3>
        <p className="text-sm text-muted-foreground">
          {motionEnabled ? '📱 Tilt Device' : 'Touch to control'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="border border-primary/50 rounded-lg mx-auto shadow-lg"
          style={{
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
          }}
        />

        {deviceMotionSupported && !motionEnabled && (
          <button
            onClick={requestMotionPermission}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-2 rounded-lg transition-colors"
          >
            Enable Tilt Control
          </button>
        )}

        {motionEnabled && (
          <div className="text-center text-sm text-accent font-bold">
            Tilt Control Enabled
          </div>
        )}
      </div>
    </div>
  );
};
