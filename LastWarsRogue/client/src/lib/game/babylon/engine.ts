import {
  Engine,
  Scene,
  Vector3,
  HemisphericLight,
  PointLight,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Texture,
  Camera,
  ArcRotateCamera,
  Tools,
  Mesh,
  KeyboardEventTypes
} from '@babylonjs/core';
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui';
import { GameState } from "@shared/schema";
import { generateLevel } from "../level";

export class BabylonGame {
  private canvas: HTMLCanvasElement;
  private engine: Engine;
  private scene: Scene;
  private camera: Camera;
  private gameState: GameState;

  private playerMesh?: Mesh;
  private enemyMeshes: Map<string, Mesh> = new Map();
  private scoreLabels: Map<string, TextBlock> = new Map(); //added to store score labels

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);

    // Initialize game state
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

    this.createScene();
    this.createEnvironment();

    // Handle browser resize
    window.addEventListener('resize', () => {
      this.engine.resize();
    });
  }

  private createScene(): void {
    // Create camera
    this.camera = new ArcRotateCamera(
      "camera",
      Tools.ToRadians(90),
      Tools.ToRadians(65),
      100,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(this.canvas, true);

    // Make camera follow player
    this.scene.registerBeforeRender(() => {
      if (this.playerMesh) {
        const target = this.playerMesh.position;
        this.camera.target = target;
        this.camera.setPosition(new Vector3(
          target.x,
          target.y + 100,
          target.z + 100
        ));
      }
    });

    // Add lights
    const hemisphericLight = new HemisphericLight(
      "hemisphericLight",
      new Vector3(0, 1, 0),
      this.scene
    );
    hemisphericLight.intensity = 0.7;

    const pointLight = new PointLight(
      "pointLight",
      new Vector3(0, 50, 0),
      this.scene
    );
    pointLight.intensity = 0.5;
  }

  private createEnvironment(): void {
    // Create dungeon ground
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 1000, height: 1000 },
      this.scene
    );

    // Create dungeon material
    const groundMaterial = new StandardMaterial("groundMaterial", this.scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2);
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);

    // Add texture
    const dungeonTexture = new Texture(
      "https://www.babylonjs-playground.com/textures/floor.png",
      this.scene
    );
    dungeonTexture.uScale = 100;
    dungeonTexture.vScale = 100;
    groundMaterial.diffuseTexture = dungeonTexture;

    ground.material = groundMaterial;

    // Add some basic walls for testing
    this.createWalls();
  }

  private createWalls(): void {
    const wallMaterial = new StandardMaterial("wallMaterial", this.scene);
    wallMaterial.diffuseColor = new Color3(0.4, 0.4, 0.4);

    // Create surrounding walls
    const wallHeight = 20;
    const wallThickness = 2;
    const wallPositions = [
      { x: 0, z: 500, rotation: 0 },
      { x: 0, z: -500, rotation: 0 },
      { x: 500, z: 0, rotation: Math.PI / 2 },
      { x: -500, z: 0, rotation: Math.PI / 2 },
    ];

    wallPositions.forEach(pos => {
      const wall = MeshBuilder.CreateBox(
        "wall",
        { height: wallHeight, width: 1000, depth: wallThickness },
        this.scene
      );
      wall.position = new Vector3(pos.x, wallHeight / 2, pos.z);
      wall.rotation.y = pos.rotation;
      wall.material = wallMaterial;
    });
  }

  private createPlayer(): void {
    // Create a more complex player mesh
    const body = MeshBuilder.CreateCapsule("playerBody", { radius: this.gameState.player.size/3, height: this.gameState.player.size }, this.scene);
    const head = MeshBuilder.CreateSphere("playerHead", { diameter: this.gameState.player.size/2 }, this.scene);
    head.position.y = this.gameState.player.size/1.5;

    // Create arms
    const rightArm = MeshBuilder.CreateCapsule("rightArm", { radius: this.gameState.player.size/6, height: this.gameState.player.size/2 }, this.scene);
    rightArm.position.x = this.gameState.player.size/2;
    rightArm.position.y = this.gameState.player.size/3;

    const leftArm = MeshBuilder.CreateCapsule("leftArm", { radius: this.gameState.player.size/6, height: this.gameState.player.size/2 }, this.scene);
    leftArm.position.x = -this.gameState.player.size/2;
    leftArm.position.y = this.gameState.player.size/3;

    // Create a parent mesh to group all parts
    this.playerMesh = new Mesh("player", this.scene);
    body.parent = this.playerMesh;
    head.parent = this.playerMesh;
    rightArm.parent = this.playerMesh;
    leftArm.parent = this.playerMesh;

    // Add materials
    const playerMaterial = new StandardMaterial("playerMaterial", this.scene);
    playerMaterial.diffuseColor = new Color3(0.2, 0.6, 1);
    playerMaterial.emissiveColor = new Color3(0, 0.3, 0.5);

    body.material = playerMaterial;
    head.material = playerMaterial;
    rightArm.material = playerMaterial;
    leftArm.material = playerMaterial;

    this.updatePlayerPosition();
    this.createPlayerScoreLabel(); //add this line
  }

  private createPlayerScoreLabel() {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const playerScoreLabel = new TextBlock();
    playerScoreLabel.text = "Score: " + this.gameState.player.score;
    playerScoreLabel.color = "white";
    playerScoreLabel.fontSize = 24;
    playerScoreLabel.top = "10px";
    playerScoreLabel.left = "10px";
    advancedTexture.addControl(playerScoreLabel);
    this.scoreLabels.set("player", playerScoreLabel);

  }

  private updatePlayerPosition(): void {
    if (this.playerMesh) {
      this.playerMesh.position = new Vector3(
        this.gameState.player.x,
        this.gameState.player.size / 2,
        this.gameState.player.y
      );
      this.playerMesh.scaling = new Vector3(1, 1, 1).scale(this.gameState.player.size / 30);
      this.updatePlayerScoreLabel(); //add this line
    }
  }

  private updatePlayerScoreLabel() {
    const label = this.scoreLabels.get("player");
    if (label) {
      label.text = "Score: " + this.gameState.player.score;
    }
  }

  private updateEnemies(): void {
    // Remove old enemies
    for (const [id, mesh] of this.enemyMeshes) {
      if (!this.gameState.enemies.find(e => e.id === id)) {
        mesh.dispose();
        this.enemyMeshes.delete(id);
        this.scoreLabels.delete(id); //remove score label if enemy is deleted
      }
    }

    // Update or create enemies
    this.gameState.enemies.forEach(enemy => {
      let enemyMesh = this.enemyMeshes.get(enemy.id);

      if (!enemyMesh) {
        // Create monster-like enemy mesh
        const body = MeshBuilder.CreateBox(enemy.id + "_body", { height: enemy.size, width: enemy.size * 0.8, depth: enemy.size * 0.8 }, this.scene);
        const head = MeshBuilder.CreateSphere(enemy.id + "_head", { diameter: enemy.size * 0.6 }, this.scene);
        head.position.y = enemy.size * 0.7;

        // Add spikes
        const spike1 = MeshBuilder.CreateCylinder(enemy.id + "_spike1", { height: enemy.size * 0.4, diameter: enemy.size * 0.2 }, this.scene);
        spike1.position.y = enemy.size * 0.3;
        spike1.position.x = enemy.size * 0.3;

        const spike2 = MeshBuilder.CreateCylinder(enemy.id + "_spike2", { height: enemy.size * 0.4, diameter: enemy.size * 0.2 }, this.scene);
        spike2.position.y = enemy.size * 0.3;
        spike2.position.x = -enemy.size * 0.3;

        // Group all parts
        enemyMesh = new Mesh(enemy.id, this.scene);
        body.parent = enemyMesh;
        head.parent = enemyMesh;
        spike1.parent = enemyMesh;
        spike2.parent = enemyMesh;

        // Add materials
        const enemyMaterial = new StandardMaterial(`${enemy.id}_material`, this.scene);
        enemyMaterial.diffuseColor = enemy.size > this.gameState.player.size ? new Color3(0.8, 0.2, 0.2) : new Color3(0.2, 0.8, 0.2);
        enemyMaterial.emissiveColor = enemy.size > this.gameState.player.size ? new Color3(0.4, 0, 0) : new Color3(0, 0.4, 0);

        body.material = enemyMaterial;
        head.material = enemyMaterial;
        spike1.material = enemyMaterial;
        spike2.material = enemyMaterial;

        this.enemyMeshes.set(enemy.id, enemyMesh);
        this.createEnemyScoreLabel(enemy); //add this line
      }

      enemyMesh.position = new Vector3(enemy.x, enemy.size / 2, enemy.y);
      enemyMesh.scaling = new Vector3(1, 1, 1).scale(enemy.size / 30);
      this.updateEnemyScoreLabel(enemy); //add this line
    });
  }

    private createEnemyScoreLabel(enemy: any) {
    const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");
    const enemyScoreLabel = new TextBlock();
    enemyScoreLabel.text = Math.round(enemy.size).toString();
    enemyScoreLabel.color = enemy.size > this.gameState.player.size ? "red" : "green";
    enemyScoreLabel.fontSize = 12;
    this.scoreLabels.set(enemy.id, enemyScoreLabel);
    advancedTexture.addControl(enemyScoreLabel);
    this.positionScoreLabel(enemy.id, enemyScoreLabel);

  }

  private updateEnemyScoreLabel(enemy: any) {
    const label = this.scoreLabels.get(enemy.id);
    if (label) {
      label.text = Math.round(enemy.size).toString();
      this.positionScoreLabel(enemy.id, label);
    }
  }


  private positionScoreLabel(id: string, label: TextBlock) {
    const enemyMesh = this.enemyMeshes.get(id);
    if (enemyMesh) {
      const worldPos = enemyMesh.getAbsolutePosition().clone();
      const screenPos = this.scene.activeCamera!.getProjectedCoordinates(worldPos);
      if (screenPos) {
        label.left = (screenPos.x * 100) + "%";
        label.top = (screenPos.y * 100) + "%";
      }
    }
  }


  start(): void {
    this.createPlayer();
    generateLevel(this.gameState);

    // Setup input handling
    this.scene.onKeyboardObservable.add((kbInfo) => {
      const speed = this.gameState.player.speed;
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          switch (kbInfo.event.key) {
            case "ArrowUp":
            case "w":
              this.gameState.player.y += speed; //Fixed direction
              break;
            case "ArrowDown":
            case "s":
              this.gameState.player.y -= speed; //Fixed direction
              break;
            case "ArrowLeft":
            case "a":
              this.gameState.player.x -= speed; //Fixed direction
              break;
            case "ArrowRight":
            case "d":
              this.gameState.player.x += speed; //Fixed direction
              break;
          }
          break;
      }
    });

    // Start the render loop
    this.engine.runRenderLoop(() => {
      this.updatePlayerPosition();
      this.updateEnemies();
      this.scene.render();
    });
  }

  stop(): void {
    this.engine.stopRenderLoop();
  }

  getState(): GameState {
    return this.gameState;
  }
}