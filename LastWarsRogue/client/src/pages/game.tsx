
import { useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Game } from '@/lib/game/engine';
import { AdManager } from '@/lib/game/ads';

export default function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Game>();
  const adManagerRef = useRef<AdManager>();

  useEffect(() => {
    if (!gameContainerRef.current) return;

    gameRef.current = new Game(gameContainerRef.current);
    adManagerRef.current = new AdManager();

    const adCheckInterval = setInterval(() => {
      if (adManagerRef.current?.shouldShowAd()) {
        gameRef.current?.stop();
        adManagerRef.current.showAd();
        setTimeout(() => gameRef.current?.start(), 1000);
      }
    }, 10000);

    return () => {
      gameRef.current?.stop();
      clearInterval(adCheckInterval);
    };
  }, []);

  return (
    <div className="w-full h-screen relative bg-black">
      <div
        ref={gameContainerRef}
        className="w-full h-full"
      />
      <Card className="absolute top-4 right-4 p-4 bg-opacity-80">
        <Button 
          variant="destructive"
          onClick={() => {
            gameRef.current?.stop();
            window.location.href = '/';
          }}
        >
          Exit Game
        </Button>
      </Card>
    </div>
  );
}
