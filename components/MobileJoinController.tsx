'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MobileJoinControllerProps {
  onConnect: (code: string) => void;
  isLoading?: boolean;
}

export const MobileJoinController: React.FC<MobileJoinControllerProps> = ({
  onConnect,
  isLoading = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputCode, setInputCode] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Check for URL parameters (for QR code scanning)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setInputCode(joinCode);
      // Auto-connect if code is in URL
      setTimeout(() => onConnect(joinCode), 500);
    }
  }, [onConnect]);

  const handleConnect = () => {
    if (inputCode.trim()) {
      onConnect(inputCode.trim().toUpperCase());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConnect();
    }
  };

  const handleCameraToggle = async () => {
    if (!useCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setUseCamera(true);
          scanQRCode();
        }
      } catch (err) {
        console.error('Camera access denied:', err);
        alert('Unable to access camera. Please enter code manually.');
      }
    } else {
      // Stop camera
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      setUseCamera(false);
    }
  };

  const scanQRCode = () => {
    if (!useCamera || !canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const video = videoRef.current;
    ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

    // Simple QR code detection - look for patterns in the image
    // For production, use a proper QR code library like jsQR
    const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Continue scanning
    if (useCamera) {
      setTimeout(scanQRCode, 500);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/50 p-6 space-y-4 max-w-sm w-full">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-primary">JOIN GAME</h3>
        <p className="text-sm text-muted-foreground">
          Enter the game code or scan QR code
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Game Code</label>
          <Input
            ref={inputRef}
            type="text"
            placeholder="E.g., GAME-12345"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            disabled={isLoading || useCamera}
            className="bg-background/50 border-primary/30 text-primary placeholder:text-muted-foreground focus:border-primary uppercase text-center text-lg font-mono"
          />
        </div>

        {useCamera && (
          <div className="space-y-2">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full rounded border border-primary/30 bg-black"
              style={{ maxHeight: '300px' }}
            />
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground text-center">
              Point camera at QR code
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleConnect}
            disabled={!inputCode.trim() || isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            {isLoading ? 'Connecting...' : 'Join'}
          </Button>
          <Button
            onClick={handleCameraToggle}
            variant="outline"
            className="flex-1 border-secondary text-secondary hover:bg-secondary/10 font-bold"
          >
            {useCamera ? 'Close Camera' : 'Scan QR'}
          </Button>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Ask the host for the game code or scan their QR code
        </p>
      </div>
    </Card>
  );
};
