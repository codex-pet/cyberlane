export interface Player {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  name: string;
  score: number;
  isAlive: boolean;
  shield: number; // Shield duration in ms
  speedBoost: number; // Speed boost duration in ms
  slowEffect: number; // Slow effect duration in ms
  dodges: number; // Number of successful dodges
  combo: number; // Current combo counter
  lastComboTime: number; // Last time combo was broken
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  rotation: number;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'shield' | 'speed' | 'slow';
  active: boolean;
}

export interface GameState {
  players: Map<string, Player>;
  obstacles: Obstacle[];
  powerUps: PowerUp[];
  score: number;
  wave: number;
  time: number;
  isGameActive: boolean;
}

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_RADIUS = 12;
const PLAYER_SPEED = 5;

export class GameEngine {
  private state: GameState;
  private animationId: number | null = null;
  private lastTime = 0;
  private obstacleSpawnRate = 2000; // ms
  private lastSpawnTime = 0;
  private waveMultiplier = 1;

  constructor(playerId: string, playerColor: string, playerName: string) {
    this.state = {
      players: new Map(),
      obstacles: [],
      powerUps: [],
      score: 0,
      wave: 1,
      time: 0,
      isGameActive: false,
    };

    // Add local player
    this.state.players.set(playerId, {
      id: playerId,
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      vx: 0,
      vy: 0,
      radius: PLAYER_RADIUS,
      color: playerColor,
      name: playerName,
      score: 0,
      isAlive: true,
      shield: 0,
      speedBoost: 0,
      slowEffect: 0,
      dodges: 0,
      combo: 0,
      lastComboTime: 0,
    });
  }

  getState(): GameState {
    return this.state;
  }

  getLocalPlayer(playerId: string): Player | undefined {
    return this.state.players.get(playerId);
  }

  startGame() {
    this.state.isGameActive = true;
    this.lastSpawnTime = Date.now();
  }

  stopGame() {
    this.state.isGameActive = false;
  }

  updatePlayerInput(playerId: string, inputX: number, inputY: number) {
    const player = this.state.players.get(playerId);
    if (player && player.isAlive) {
      player.vx = inputX * PLAYER_SPEED;
      player.vy = inputY * PLAYER_SPEED;
    }
  }

  addRemotePlayer(
    playerId: string,
    playerColor: string,
    playerName: string
  ) {
    if (!this.state.players.has(playerId)) {
      this.state.players.set(playerId, {
        id: playerId,
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        vx: 0,
        vy: 0,
        radius: PLAYER_RADIUS,
        color: playerColor,
        name: playerName,
        score: 0,
        isAlive: true,
        shield: 0,
        speedBoost: 0,
        slowEffect: 0,
        dodges: 0,
        combo: 0,
        lastComboTime: 0,
      });
    }
  }

  removePlayer(playerId: string) {
    this.state.players.delete(playerId);
  }

  updateRemotePlayer(playerId: string, x: number, y: number, score: number) {
    const player = this.state.players.get(playerId);
    if (player) {
      player.x = x;
      player.y = y;
      player.score = score;
    }
  }

  private spawnObstacle() {
    const now = Date.now();
    const spawnInterval = Math.max(800, this.obstacleSpawnRate / this.waveMultiplier);
    
    if (now - this.lastSpawnTime > spawnInterval) {
      const spawnPattern = Math.random();
      let obstacles: Obstacle[] = [];

      if (spawnPattern < 0.4) {
        // Single obstacle
        const width = 40 + Math.random() * 40;
        const height = 10 + Math.random() * 10;
        const x = Math.random() * (CANVAS_WIDTH - width);
        const vx = (Math.random() - 0.5) * 4;
        const vy = 2.5 + Math.random() * 3;

        obstacles.push({
          id: `obs-${Date.now()}-${Math.random()}`,
          x,
          y: -height,
          width,
          height,
          vx,
          vy,
          rotation: Math.random() * Math.PI * 2,
        });
      } else if (spawnPattern < 0.7) {
        // Pair of obstacles
        const width = 35 + Math.random() * 30;
        const height = 10 + Math.random() * 8;
        const gap = 80 + Math.random() * 40;
        const startX = Math.random() * (CANVAS_WIDTH / 2);
        const vy = 2.5 + Math.random() * 3;

        for (let i = 0; i < 2; i++) {
          obstacles.push({
            id: `obs-${Date.now()}-${i}-${Math.random()}`,
            x: startX + i * gap,
            y: -height,
            width,
            height,
            vx: (Math.random() - 0.5) * 3,
            vy,
            rotation: Math.random() * Math.PI * 2,
          });
        }
      } else {
        // Wave pattern - 3 obstacles
        const width = 30 + Math.random() * 25;
        const height = 8 + Math.random() * 6;
        const spacing = 100 + Math.random() * 60;
        const vy = 3 + Math.random() * 2;

        for (let i = 0; i < 3; i++) {
          obstacles.push({
            id: `obs-${Date.now()}-${i}-${Math.random()}`,
            x: (CANVAS_WIDTH / 4) + i * spacing,
            y: -height - i * 50,
            width,
            height,
            vx: (Math.random() - 0.5) * 2,
            vy,
            rotation: Math.random() * Math.PI * 2,
          });
        }
      }

      this.state.obstacles.push(...obstacles);
      this.lastSpawnTime = now;
    }
  }

  private spawnPowerUp() {
    // Spawn power-ups occasionally
    if (Math.random() < 0.001) {
      const types: Array<'shield' | 'speed' | 'slow'> = ['shield', 'speed', 'slow'];
      const type = types[Math.floor(Math.random() * types.length)];

      this.state.powerUps.push({
        id: `pw-${Date.now()}-${Math.random()}`,
        x: Math.random() * CANVAS_WIDTH,
        y: -20,
        type,
        active: true,
      });
    }
  }

  private updateObstacles() {
    // Update obstacle positions
    for (let i = this.state.obstacles.length - 1; i >= 0; i--) {
      const obs = this.state.obstacles[i];
      obs.x += obs.vx;
      obs.y += obs.vy;
      obs.rotation += 0.05;

      // Remove obstacles that are off screen
      if (obs.y > CANVAS_HEIGHT) {
        this.state.obstacles.splice(i, 1);
        this.state.score += 10;
      }
    }
  }

  private updatePowerUps() {
    for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
      const pw = this.state.powerUps[i];
      pw.y += 2;

      if (pw.y > CANVAS_HEIGHT) {
        this.state.powerUps.splice(i, 1);
      }
    }
  }

  private updatePlayers() {
    this.state.players.forEach((player) => {
      if (player.isAlive) {
        // Apply speed modifiers
        let speedMultiplier = 1;
        if (player.speedBoost > 0) {
          speedMultiplier = 1.5;
        }
        if (player.slowEffect > 0) {
          speedMultiplier = 0.4;
        }

        // Update position with velocity
        player.x += player.vx * speedMultiplier;
        player.y += player.vy * speedMultiplier;

        // Boundary collision
        if (player.x - player.radius < 0) {
          player.x = player.radius;
          player.vx = 0;
        }
        if (player.x + player.radius > CANVAS_WIDTH) {
          player.x = CANVAS_WIDTH - player.radius;
          player.vx = 0;
        }
        if (player.y - player.radius < 0) {
          player.y = player.radius;
          player.vy = 0;
        }
        if (player.y + player.radius > CANVAS_HEIGHT) {
          player.y = CANVAS_HEIGHT - player.radius;
          player.vy = 0;
        }
      }
    });
  }

  private checkCollisions() {
    // Check obstacle collisions with all players
    this.state.players.forEach((player) => {
      if (!player.isAlive) return;

      for (let i = this.state.obstacles.length - 1; i >= 0; i--) {
        const obs = this.state.obstacles[i];

        // Circle-rectangle collision
        const closestX = Math.max(obs.x, Math.min(player.x, obs.x + obs.width));
        const closestY = Math.max(obs.y, Math.min(player.y, obs.y + obs.height));

        const distX = player.x - closestX;
        const distY = player.y - closestY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.radius) {
          if (player.shield > 0) {
            // Shield absorbs hit
            player.shield = 0;
            this.state.obstacles.splice(i, 1);
            player.score += 100; // Shield break bonus
          } else {
            player.isAlive = false;
          }
        }
      }

      // Check power-up collisions
      for (let i = this.state.powerUps.length - 1; i >= 0; i--) {
        const pw = this.state.powerUps[i];
        const distX = player.x - pw.x;
        const distY = player.y - pw.y;
        const distance = Math.sqrt(distX * distX + distY * distY);

        if (distance < player.radius + 10) {
          // Apply power-up effect
          switch (pw.type) {
            case 'shield':
              player.shield = 8000; // 8 seconds
              player.score += 100;
              break;
            case 'speed':
              player.speedBoost = 4000; // 4 seconds
              player.score += 75;
              break;
            case 'slow':
              player.slowEffect = 5000; // 5 seconds
              player.score += 50;
              break;
          }

          this.state.powerUps.splice(i, 1);
          this.state.score += 50;
          player.combo += 1;
          player.lastComboTime = this.state.time;
        }
      }

      // Update effect timers
      player.shield = Math.max(0, player.shield - 16);
      player.speedBoost = Math.max(0, player.speedBoost - 16);
      player.slowEffect = Math.max(0, player.slowEffect - 16);

      // Reset combo if too much time has passed
      if (this.state.time - player.lastComboTime > 3000) {
        player.combo = 0;
      }

      // Count successful dodges
      if (player.combo > 0 && player.slowEffect === 0) {
        player.dodges++;
      }
    });
  }

  private checkWaveProgression() {
    // Increase difficulty every 5000 points
    const newWave = Math.floor(this.state.score / 5000) + 1;
    if (newWave !== this.state.wave) {
      this.state.wave = newWave;
      this.waveMultiplier = 1 + (newWave - 1) * 0.3;
    }
  }

  update() {
    if (!this.state.isGameActive) return;

    this.state.time += 16; // Approximate 60fps

    this.spawnObstacle();
    this.spawnPowerUp();
    this.updateObstacles();
    this.updatePowerUps();
    this.updatePlayers();
    this.checkCollisions();
    this.checkWaveProgression();

    // Reset input for local player after update
    // Stop game only if ALL players are dead
    const anyPlayerAlive = Array.from(this.state.players.values()).some(p => p.isAlive);
    if (!anyPlayerAlive) {
      this.state.isGameActive = false;
    }
  }

  getAlivePlayers(): Player[] {
    return Array.from(this.state.players.values()).filter((p) => p.isAlive);
  }

  isGameOver(): boolean {
    return (
      !this.state.isGameActive &&
      Array.from(this.state.players.values()).length > 0 &&
      Array.from(this.state.players.values()).every((p) => !p.isAlive)
    );
  }

  reset() {
    this.state.players.forEach((player) => {
      player.isAlive = true;
      player.x = CANVAS_WIDTH / 2;
      player.y = CANVAS_HEIGHT - 50;
      player.vx = 0;
      player.vy = 0;
      player.score = 0;
      player.shield = 0;
      player.speedBoost = 0;
      player.slowEffect = 0;
      player.dodges = 0;
      player.combo = 0;
      player.lastComboTime = 0;
    });

    this.state.obstacles = [];
    this.state.powerUps = [];
    this.state.score = 0;
    this.state.wave = 1;
    this.state.time = 0;
    this.waveMultiplier = 1;
    this.lastSpawnTime = Date.now();
  }
}

export const CANVAS_WIDTH_EXPORT = CANVAS_WIDTH;
export const CANVAS_HEIGHT_EXPORT = CANVAS_HEIGHT;
