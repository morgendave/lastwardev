import { GameState } from "@shared/schema";

export function generateLevel(state: GameState) {
  state.enemies = [];
  state.level += 1;

  // Spawn initial enemies for the level
  const enemyCount = state.level * 3;
  for (let i = 0; i < enemyCount; i++) {
    const angle = (Math.PI * 2 * i) / enemyCount;
    const distance = 300;

    // Most enemies start smaller than player
    const sizeMultiplier = Math.random() < 0.8 ? 
      0.3 + (Math.random() * 0.4) : // 80% chance: 30-70% of player size
      1.2 + (Math.random() * 0.8);  // 20% chance: 120-200% of player size

    state.enemies.push({
      id: `enemy-${i}`,
      x: state.player.x + Math.cos(angle) * distance,
      y: state.player.y + Math.sin(angle) * distance,
      size: state.player.size * sizeMultiplier,
      speed: 1 + Math.random(),  // Speed between 1-2
      type: sizeMultiplier < 1 ? 'small' : 'large'
    });
  }
}