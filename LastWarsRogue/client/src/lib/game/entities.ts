import { GameState } from "@shared/schema";
import { nanoid } from "nanoid";

const ENEMY_TYPES = ['small', 'medium', 'large'] as const;

export function updateEntities(state: GameState, delta: number) {
  moveEnemies(state, delta);
  checkCollisions(state);
  spawnEnemies(state);
}

function moveEnemies(state: GameState, delta: number) {
  const time = Date.now() * 0.001;

  state.enemies = state.enemies.map(enemy => {
    const wanderX = Math.cos(time * enemy.speed + parseInt(enemy.id)) * 2;
    const wanderY = Math.sin(time * enemy.speed + parseInt(enemy.id)) * 2;

    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const isLarger = enemy.size > state.player.size;
      const directionMultiplier = isLarger ? 1 : -1;
      const speedMultiplier = isLarger ? 0.5 : 0.8;
      const chaseInfluence = isLarger ? 0.7 : 0.4;

      enemy.x += (wanderX + (dx / distance) * directionMultiplier * chaseInfluence) * enemy.speed * speedMultiplier;
      enemy.y += (wanderY + (dy / distance) * directionMultiplier * chaseInfluence) * enemy.speed * speedMultiplier;
    }

    return enemy;
  });
}

function checkCollisions(state: GameState) {
  for (const enemy of state.enemies) {
    const dx = state.player.x - enemy.x;
    const dy = state.player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedSize = (state.player.size + enemy.size) * 0.8;

    if (distance < combinedSize) {
      if (enemy.size > state.player.size * 1.2) {
        state.player.health = 0;
        return;
      } else if (state.player.size > enemy.size * 1.2) {
        state.player.size += enemy.size * 0.2;
        state.player.score += Math.floor(enemy.size);
        state.enemies = state.enemies.filter(e => e.id !== enemy.id);
      }
    }
  }
}

function spawnEnemies(state: GameState) {
  const maxEnemies = 50 + Math.floor(state.level * 1.5); 
  const targetCount = Math.min(maxEnemies, 80); 

  while (state.enemies.length < targetCount) {
    const spawnDistance = Math.max(window.innerWidth, window.innerHeight);
    const angle = Math.random() * Math.PI * 2;

    const sizeRoll = Math.random();
    let sizeMultiplier;

    if (sizeRoll < 0.5) { 
      sizeMultiplier = 0.4 + (Math.random() * 0.3); 
    } else if (sizeRoll < 0.8) { 
      sizeMultiplier = 0.7 + (Math.random() * 0.4); 
    } else { 
      sizeMultiplier = 1.2 + (Math.random() * 0.8); 
    }

    const enemySize = state.player.size * sizeMultiplier;
    const enemy = {
      id: nanoid(),
      x: state.player.x + Math.cos(angle) * spawnDistance,
      y: state.player.y + Math.sin(angle) * spawnDistance,
      size: enemySize,
      speed: 1 + (Math.random() * 1.5),
      type: enemySize < state.player.size ? 'small' : 
            enemySize > state.player.size * 1.2 ? 'large' : 'medium'
    };

    state.enemies.push(enemy);
  }
}