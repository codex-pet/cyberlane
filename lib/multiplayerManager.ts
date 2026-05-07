import { io, Socket } from 'socket.io-client';

export interface PlayerUpdate {
  id: string;
  x: number;
  y: number;
  score: number;
  isAlive: boolean;
  name: string;
  color: string;
}

export interface GameMessage {
  type: 'join' | 'update' | 'leave' | 'start' | 'end' | 'controller_join' | 'controller_input';
  playerId: string;
  playerName: string;
  playerColor: string;
  data?: any;
  targetPeerId?: string;
}

export class MultiplayerManager {
  private socket: Socket | null = null;
  private peerId: string = '';
  private roomCode: string = '';
  private playerName: string = '';
  private playerColor: string = '';
  private connectedPlayers: Set<string> = new Set();
  
  private onPlayerJoined: ((player: GameMessage) => void) | null = null;
  private onPlayerLeft: ((playerId: string) => void) | null = null;
  private onPlayerUpdate: ((update: PlayerUpdate) => void) | null = null;
  private onGameStart: (() => void) | null = null;
  private onGameEnd: ((data: any) => void) | null = null;
  private onControllerJoined: ((player: GameMessage) => void) | null = null;
  private onControllerInput: ((playerId: string, input: { x: number, y: number }) => void) | null = null;

  async initialize(playerName: string, playerColor: string): Promise<string> {
    this.playerName = playerName;
    this.playerColor = playerColor;
    return new Promise((resolve, reject) => {
      try {
        // Connect to the Socket.IO server running on the same origin
        this.socket = io();

        this.socket.on('connect', () => {
          this.peerId = this.socket!.id!;
          this.setupSocketHandlers();
          resolve(this.peerId);
        });

        this.socket.on('connect_error', (err) => {
          console.error('Socket connection error:', err);
          reject(new Error(`Socket connection failed: ${err.message}`));
        });

        setTimeout(() => {
          if (!this.peerId) {
            reject(new Error('Socket initialization timeout'));
          }
        }, 10000);
      } catch (err) {
        reject(err);
      }
    });
  }

  async createRoom(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Socket not initialized'));
      }
      this.socket.emit('create_room', {}, (response: { roomCode: string, socketId: string }) => {
        if (response && response.roomCode) {
          this.roomCode = response.roomCode;
          resolve(response.roomCode);
        } else {
          reject(new Error('Failed to create room'));
        }
      });
    });
  }

  private setupSocketHandlers() {
    if (!this.socket) return;

    this.socket.on('game_message', (data: GameMessage) => {
      switch (data.type) {
        case 'join':
          this.connectedPlayers.add(data.playerId);
          if (this.onPlayerJoined) {
            this.onPlayerJoined(data);
          }
          // If we are the host and someone joins, we should also send them our info
          // but avoid infinite loops. The data.data.isHostResponse check handles this.
          if (!data.data?.isHostResponse) {
            this.sendMessage('join', { isHostResponse: true });
          }
          break;
        case 'leave':
          this.connectedPlayers.delete(data.playerId);
          if (this.onPlayerLeft) {
            this.onPlayerLeft(data.playerId);
          }
          break;
        case 'update':
          if (this.onPlayerUpdate) {
            this.onPlayerUpdate(data.data);
          }
          break;
        case 'start':
          if (this.onGameStart) {
            this.onGameStart();
          }
          break;
        case 'end':
          if (this.onGameEnd) {
            this.onGameEnd(data.data);
          }
          break;
        case 'controller_join':
          this.connectedPlayers.add(data.playerId);
          if (this.onControllerJoined) {
            this.onControllerJoined(data);
          }
          break;
        case 'controller_input':
          if (this.onControllerInput) {
            this.onControllerInput(data.playerId, data.data);
          }
          break;
      }
    });
  }

  connectToHost(hostCode: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.socket) {
          reject(new Error('Socket not initialized'));
          return;
        }

        this.roomCode = hostCode;
        this.socket.emit('join_room', hostCode, (response: { success: boolean, error?: string }) => {
          if (response && response.success) {
            // After joining the room, send a join message so others know we are here
            this.sendMessage('join');
            resolve();
          } else {
            reject(new Error(response?.error || 'Failed to join room'));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  sendMessage(
    type: GameMessage['type'],
    data?: any,
    targetPeerId?: string
  ) {
    if (!this.socket || !this.roomCode) return;

    const message: GameMessage = {
      type,
      playerId: this.peerId,
      playerName: this.playerName,
      playerColor: this.playerColor,
      data,
      targetPeerId,
    };

    this.socket.emit('game_message', {
      roomCode: this.roomCode,
      message
    });
  }

  sendPlayerUpdate(update: PlayerUpdate) {
    this.sendMessage('update', update);
  }

  broadcastGameStart() {
    this.sendMessage('start');
  }

  broadcastGameEnd(finalScores: any) {
    this.sendMessage('end', finalScores);
  }

  getPeerId(): string {
    return this.peerId;
  }

  getConnectedPlayers(): string[] {
    return Array.from(this.connectedPlayers);
  }

  onPlayerJoinedCallback(callback: (player: GameMessage) => void) {
    this.onPlayerJoined = callback;
  }

  onPlayerLeftCallback(callback: (playerId: string) => void) {
    this.onPlayerLeft = callback;
  }

  onPlayerUpdateCallback(callback: (update: PlayerUpdate) => void) {
    this.onPlayerUpdate = callback;
  }

  onGameStartCallback(callback: () => void) {
    this.onGameStart = callback;
  }

  onGameEndCallback(callback: (data: any) => void) {
    this.onGameEnd = callback;
  }

  onControllerJoinedCallback(callback: (player: GameMessage) => void) {
    this.onControllerJoined = callback;
  }

  onControllerInputCallback(callback: (playerId: string, input: { x: number, y: number }) => void) {
    this.onControllerInput = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectedPlayers.clear();
    this.roomCode = '';
  }
}
