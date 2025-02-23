import Phaser from 'phaser';
import { GameState } from "@shared/schema";
import { generateLevel } from "./level";

export class Game extends Phaser.Game {
  constructor(parent: HTMLElement) {
    super({
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: GameScene
    });
  }

  stop() {
    this.scene.pause('GameScene');
  }

  start() {
    this.scene.resume('GameScene');
  }
}

class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: any;
  private scoreText!: Phaser.GameObjects.Text;
  private gameState: GameState;

  constructor() {
    super({ key: 'GameScene' });
    this.gameState = {
      player: {
        x: 0,
        y: 0,
        health: 100,
        maxHealth: 100,
        size: 30,
        speed: 5,
        score: 0
      },
      enemies: [],
      level: 0,
      score: 0
    };
  }

  preload() {
    this.load.setBaseURL('/assets');
    
    // Load environment assets
    this.load.image('floor', 'game/environment/floor.png');
    this.load.image('wall', 'game/environment/wall.png');
    this.load.image('torch', 'game/environment/torch.png');
    this.load.image('chest', 'game/environment/chest.png');
    
    // Load player assets
    this.load.spritesheet('player', 'game/characters/player.png', { frameWidth: 32, frameHeight: 32 });
    
    // Load enemy assets
    this.load.spritesheet('slime', 'game/enemies/slime.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('ghost', 'game/enemies/ghost.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('skeleton', 'game/enemies/skeleton.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('demon', 'game/enemies/demon.png', { frameWidth: 32, frameHeight: 32 });
    
    // Load item assets
    this.load.image('health_potion', 'game/items/health_potion.png');
    this.load.image('speed_potion', 'game/items/speed_potion.png');
    this.load.image('coin', 'game/items/coin.png');
  }

  create() {
    // Create level
    const level = Array(20).fill(null).map(() =>
      Array(20).fill(0).map(() => Math.random() > 0.8 ? 1 : 0)
    );

    // Create player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // Setup controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Create floor and walls
    for (let y = 0; y < level.length; y++) {
      for (let x = 0; x < level[y].length; x++) {
        const tileX = x * 32;
        const tileY = y * 32;
        this.add.image(tileX, tileY, 'floor');
        if (level[y][x] === 1) {
          const wall = this.physics.add.image(tileX, tileY, 'wall');
          wall.setImmovable(true);
          this.physics.add.collider(this.player, wall);
        }
      }
    }

    // Add score text
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px' });

    // Setup camera
    this.cameras.main.startFollow(this.player);
  }

  update() {
    const speed = 200;

    // Handle movement
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.a.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.d.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.w.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.s.isDown) {
      this.player.setVelocityY(speed);
    }
  }
}