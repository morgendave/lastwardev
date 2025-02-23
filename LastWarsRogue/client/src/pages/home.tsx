import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center flex items-center justify-center gap-2">
            <Gamepad2 className="w-8 h-8" />
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Rogue Wars
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            A fast-paced roguelike adventure. Survive waves of enemies and level up!
          </p>
          <Link href="/game">
            <Button className="w-full text-lg h-12" size="lg">
              Play Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
