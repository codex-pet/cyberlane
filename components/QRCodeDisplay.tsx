'use client';

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  gameCode: string;
  gameUrl?: string;
  onDownload?: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  gameCode,
  gameUrl,
  onDownload,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const qrCodeUrl = mounted ? (gameUrl || `${window.location.origin}/controller?code=${gameCode}`) : '';

  const handleDownload = () => {
    const qrCodeSvg = document.querySelector('svg');
    if (qrCodeSvg) {
      const svgData = new XMLSerializer().serializeToString(qrCodeSvg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `cyberlane-code-${gameCode}.png`;
        link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
    onDownload?.();
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/50 p-6 space-y-4 max-w-sm w-full">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-bold text-primary">SCAN TO JOIN</h3>
        <p className="text-sm text-muted-foreground">
          Scan this code on your phone to join the game
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-white p-4 rounded-lg min-h-[232px]">
        {mounted && window.location.hostname === 'localhost' && (
          <p className="text-[10px] text-red-500 font-bold mb-2 text-center max-w-[200px]">
            Cannot scan localhost on mobile. Open using your network IP (192.168.x.x).
          </p>
        )}
        {mounted ? (
          <QRCodeSVG
            value={qrCodeUrl}
            size={200}
            level="H"
            includeMargin={true}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        ) : (
          <div className="w-[200px] h-[200px] animate-pulse bg-gray-200" />
        )}
      </div>

      <div className="space-y-2">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">CODE</p>
          <p className="text-lg font-mono font-bold text-accent">{gameCode}</p>
        </div>

        <Button
          onClick={handleDownload}
          variant="outline"
          className="w-full border-secondary text-secondary hover:bg-secondary/10 text-sm"
        >
          Download QR Code
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Or manually enter the code on the join screen
        </p>
      </div>
    </Card>
  );
};
