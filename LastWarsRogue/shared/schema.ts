import { z } from "zod";

export interface GameState {
  player: {
    x: number;
    y: number;
    health: number;
    maxHealth: number;
    size: number;  // Added size property
    speed: number; // Added speed property
    score: number;
  };
  enemies: Array<{
    id: string;
    x: number;
    y: number;
    size: number;  // Added size property
    speed: number; // Added speed property
    type: string;
  }>;
  level: number;
  score: number;
}

export const gameStateSchema = z.object({
  player: z.object({
    x: z.number(),
    y: z.number(),
    health: z.number(),
    maxHealth: z.number(),
    size: z.number(),
    speed: z.number(),
    score: z.number()
  }),
  enemies: z.array(z.object({
    id: z.string(),
    x: z.number(),
    y: z.number(),
    size: z.number(),
    speed: z.number(),
    type: z.string()
  })),
  level: z.number(),
  score: z.number()
});