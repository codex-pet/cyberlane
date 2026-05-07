import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SinglePlayerMobileControllerProps {
  gameCode: string;
  onClose?: () => void;
}

export const SinglePlayerMobileController: React.FC<
  SinglePlayerMobileControllerProps
> = ({ gameCode, onClose }) => {
  const [showQR, setShowQR] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const controllerUrl = mounted 
    ? `${window.location.origin}/controller?code=${gameCode}`
    : '';

  return (
    <Card className="fixed bottom-4 right-4 bg-card/90 backdrop-blur border-primary/50 p-4 max-w-xs z-50 shadow-lg">
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-2 font-bold">
            MOBILE CONTROLLER
          </p>
          {showQR ? (
            <div className="bg-white p-2 rounded inline-flex flex-col items-center justify-center min-h-[136px] min-w-[136px]">
              {mounted && window.location.hostname === 'localhost' && (
                <p className="text-[8px] text-red-500 font-bold mb-1 text-center max-w-[120px] leading-tight">
                  Use network IP instead of localhost
                </p>
              )}
              {mounted ? (
                <QRCodeSVG
                  value={controllerUrl}
                  size={120}
                  level="H"
                  includeMargin={false}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
              ) : (
                <div className="w-[120px] h-[120px] bg-gray-200 animate-pulse" />
              )}
            </div>
          ) : (
            <div className="bg-background/50 border border-primary/50 rounded p-3 mb-2">
              <p className="text-xs text-primary font-mono break-all">
                {gameCode}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant={showQR ? 'default' : 'outline'}
            className="flex-1 h-7 text-xs"
            onClick={() => setShowQR(true)}
          >
            QR
          </Button>
          <Button
            size="sm"
            variant={!showQR ? 'default' : 'outline'}
            className="flex-1 h-7 text-xs"
            onClick={() => setShowQR(false)}
          >
            Code
          </Button>
        </div>

        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-xs"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </div>
    </Card>
  );
};
