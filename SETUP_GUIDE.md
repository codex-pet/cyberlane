# CYBERLANE - Complete Setup & Execution Guide

## Prerequisites
- Node.js 18+ installed
- npm or pnpm package manager
- A modern web browser (Chrome, Firefox, Safari, Edge)

---

## Step 1: Install Dependencies

```bash
cd /vercel/share/v0-project
pnpm install
```

This will install all required packages including:
- Next.js 16 (React framework)
- PeerJS (for multiplayer networking)
- qrcode.react (for QR code generation)
- Tailwind CSS (styling)
- shadcn/ui (component library)

---

## Step 2: Start the Development Server

```bash
pnpm dev
```

Expected output:
```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
```

The application will automatically open in your default browser. If not, visit `http://localhost:3000`

---

## Step 3: Access the Game

### Single-Player Mode
1. Click **"PLAY SINGLE PLAYER"** on the main menu
2. Press **"START GAME"** to begin
3. Control your character using:
   - **Mouse**: Move toward cursor position
   - **Arrow Keys**: Up/Down/Left/Right movement
   - **WASD**: W=Up, A=Left, S=Down, D=Right
   - **Mobile Buttons**: Visible arrow buttons in bottom-right corner (tap to move)

### Multiplayer Mode
1. **Host**: Click **"PLAY MULTIPLAYER"** → **"CREATE GAME"**
   - You'll receive a game code (e.g., "HOST-ABC123")
   - A QR code displays for guests to scan
   - Click **"Start Game"** when guests join

2. **Guest**: Click **"PLAY MULTIPLAYER"** → **"Join Game"**
   - Enter the host code when prompted
   - Or scan the QR code on your phone
   - Wait for host to start the game

---

## Step 4: Gameplay Controls

### Input Methods (Works Simultaneously)
- **Mouse**: Move toward the cursor
- **Keyboard**: Arrow keys or WASD
- **Mobile**: Arrow buttons (bottom-right of screen)
- **Touch Screen**: Can use mobile buttons or arrow controller

### Game Mechanics
- **Obstacles**: Red rectangles falling from top - avoid them
- **Power-ups**: Glowing orbs
  - Blue shield: Protection from one hit
  - Orange speed: 1.5x faster movement
  - Blue slow: Slow effect (rare, used strategically)
- **Scoring**: 
  - Each second survived = points
  - Collecting power-ups = bonus points
  - Wave completion = multiplier increase

### Audio Feedback
- **Background Music**: Procedurally generated synth (plays during game)
- **Sound Effects**:
  - Powerup collection: High ascending tone
  - Shield activation: Resonant tone
  - Wave progression: Rising tone
  - Collision: Low beep
  - Game over: Descending tone

---

## Step 5: Game Over & Restart

When you hit an obstacle:
1. Game pauses automatically
2. Your final score and waves completed display
3. Click **"PLAY AGAIN"** to restart or **"MAIN MENU"** to return

---

## Step 6: Build for Production

To create an optimized production build:

```bash
pnpm build
```

To run the production build locally:

```bash
pnpm start
```

---

## Troubleshooting

### Issue: "Port 3000 already in use"
```bash
# Run on a different port
pnpm dev -- -p 3001
```

### Issue: "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next pnpm-lock.yaml
pnpm install
pnpm dev
```

### Issue: Audio not working
- Check browser audio permissions
- Ensure volume is not muted
- Try a different browser

### Issue: Multiplayer connection fails
- Verify both devices are on the same network
- Check browser console for PeerJS errors
- Ensure port forwarding isn't blocking WebRTC

### Issue: Game runs slowly
- Close other browser tabs
- Update your graphics drivers
- Try a different browser (Chromium-based browsers are faster)

---

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── page.tsx              # Main app entry point
│   ├── layout.tsx            # Layout configuration
│   ├── globals.css           # Global styles with neon theme
│   └── controller/
│       └── page.tsx          # Mobile controller page
├── components/
│   ├── GameScreen.tsx        # Single-player game UI
│   ├── MultiplayerGame.tsx   # Multiplayer game UI
│   ├── GameCanvasEnhanced.tsx # Canvas rendering
│   ├── ArrowButtonController.tsx # Mobile arrow buttons
│   ├── MainMenu.tsx          # Main menu UI
│   └── CyberlaneApp.tsx      # App navigation logic
├── lib/
│   ├── gameEngine.ts         # Game loop & physics
│   ├── audioManager.ts       # Sound effects & music
│   ├── multiplayerManager.ts # PeerJS networking
│   └── particles.ts          # Particle effects
└── package.json              # Dependencies
```

---

## Game Features

✓ **Single-Player Mode**: Practice against waves of obstacles
✓ **Multiplayer (PvP)**: Compete against other players in real-time
✓ **Mobile Controls**: Arrow buttons for touch devices
✓ **Background Music**: Procedurally generated synth soundtrack
✓ **Sound Effects**: Audio feedback for all game events
✓ **Power-ups**: Shield, Speed Boost, Slow Effect
✓ **Wave Progression**: Difficulty increases each wave
✓ **Combo System**: Reward players for consecutive dodges
✓ **Neon Aesthetic**: Cyberpunk-themed visual design

---

## Performance Tips

1. **Close unnecessary tabs** - Free up system resources
2. **Use Chrome/Brave** - Better WebGL performance
3. **Update graphics drivers** - Ensures smooth canvas rendering
4. **Disable browser extensions** - Some can interfere with WebGL
5. **Use wired connection** - Better for multiplayer stability

---

## Support

If you encounter issues:
1. Check the browser console (F12) for error messages
2. Clear cache: Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)
3. Restart the dev server: Stop (Ctrl+C) and run `pnpm dev` again
4. Verify Node.js version: `node --version` (should be 18+)

---

## License

This project is created with Next.js, React, and Vercel's modern web technologies.

Enjoy playing CYBERLANE!
