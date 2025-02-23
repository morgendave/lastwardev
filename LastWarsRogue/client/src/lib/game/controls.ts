import { GameState } from "@shared/schema";

interface TouchState {
  touching: boolean;
  x: number;
  y: number;
}

const touchState: TouchState = {
  touching: false,
  x: 0,
  y: 0
};

const keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

export function initControls(canvas: HTMLCanvasElement) {
  // Touch controls
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove);
  canvas.addEventListener('touchend', handleTouchEnd);

  // Mouse controls
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mousedown', () => {
    touchState.touching = true;
  });
  canvas.addEventListener('mouseup', () => {
    touchState.touching = false;
  });

  // Keyboard controls
  window.addEventListener('keydown', (e) => {
    switch(e.key.toLowerCase()) {
      case 'w': case 'arrowup': keys.up = true; break;
      case 's': case 'arrowdown': keys.down = true; break;
      case 'a': case 'arrowleft': keys.left = true; break;
      case 'd': case 'arrowright': keys.right = true; break;
    }
  });

  window.addEventListener('keyup', (e) => {
    switch(e.key.toLowerCase()) {
      case 'w': case 'arrowup': keys.up = false; break;
      case 's': case 'arrowdown': keys.down = false; break;
      case 'a': case 'arrowleft': keys.left = false; break;
      case 'd': case 'arrowright': keys.right = false; break;
    }
  });
}

function handleTouchStart(e: TouchEvent) {
  e.preventDefault();
  const touch = e.touches[0];
  touchState.touching = true;
  touchState.x = touch.clientX;
  touchState.y = touch.clientY;
}

function handleTouchMove(e: TouchEvent) {
  e.preventDefault();
  if (!touchState.touching) return;
  const touch = e.touches[0];
  touchState.x = touch.clientX;
  touchState.y = touch.clientY;
}

function handleTouchEnd(e: TouchEvent) {
  e.preventDefault();
  touchState.touching = false;
}

function handleMouseMove(e: MouseEvent) {
  if (!touchState.touching) return;
  touchState.x = e.clientX;
  touchState.y = e.clientY;
}

export function handleControls(state: GameState) {
  const speed = 5;

  // Handle keyboard movement
  if (keys.up) state.player.y -= speed;
  if (keys.down) state.player.y += speed;
  if (keys.left) state.player.x -= speed;
  if (keys.right) state.player.x += speed;

  // Handle touch/mouse movement
  if (touchState.touching) {
    const dx = touchState.x - state.player.x;
    const dy = touchState.y - state.player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {  // Add a small threshold to prevent jittering
      state.player.x += (dx / distance) * speed;
      state.player.y += (dy / distance) * speed;
    }
  }
}