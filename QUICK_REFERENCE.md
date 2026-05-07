# CYBERLANE - Quick Reference Card

## 🚀 Installation (Copy & Paste)

```bash
cd /vercel/share/v0-project
pnpm install
pnpm dev
```

Then open browser to: **http://localhost:3000**

---

## 🎮 Controls Cheat Sheet

```
KEYBOARD       MOUSE              MOBILE
─────────────────────────────────────────────
↑ Arrow Up     Move to cursor     ▲ Tap Up
↓ Arrow Down                      ▼ Tap Down
← Arrow Left                      ◄ Tap Left
→ Arrow Right                     ► Tap Right

or WASD keys   (all work at same time)
```

---

## 📊 Game Quick Facts

| Aspect | Details |
|--------|---------|
| **FPS** | 60 (smooth gameplay) |
| **Load Time** | 2-3 seconds |
| **Playable On** | Desktop, tablet, mobile |
| **Requires** | Modern web browser |
| **Audio** | Yes (click to enable) |
| **Multiplayer** | Yes (same WiFi) |

---

## 🎯 Gameplay Quick Tips

### Obstacles
- Red boxes fall from top
- Increase each wave
- Touch = Game Over (unless shielded)

### Power-ups
- 🔵 Shield: Block 1 hit (8 sec)
- ⚡ Speed: 1.5x faster (4 sec)
- ❄️ Slow: 0.4x slower (5 sec)

### Scoring
- 1 point/frame survived
- Powerup: +50-100
- Shield break: +100
- Wave clear: +1000×wave

### Strategy
1. Keep moving
2. Avoid corners
3. Collect power-ups
4. Use shield defensively
5. Use speed offensively

---

## ⚙️ Terminal Commands

### Development
```bash
pnpm dev              # Start dev server (port 3000)
pnpm dev -- -p 3001  # Use different port if 3000 occupied
```

### Production
```bash
pnpm build            # Create optimized build
pnpm start            # Run production build
```

### Maintenance
```bash
pnpm install          # Install/update dependencies
rm -rf .next          # Clear cache
rm -rf node_modules   # Remove dependencies
```

### Troubleshooting
```bash
node --version        # Check Node.js version (need 18+)
pnpm --version        # Check pnpm version
ps aux | grep next    # Check if dev server running
lsof -i :3000         # Check what's on port 3000
```

---

## 🐛 Common Issues (5-Second Fixes)

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `pnpm dev -- -p 3001` |
| Blank screen | F12 → clear cache → refresh |
| No movement | Try mouse/keyboard/buttons |
| No obstacles | Click "START GAME" button |
| No audio | Check browser volume + permissions |
| Game slow | Close other tabs + update drivers |
| Can't join multiplayer | Check same WiFi + firewall |

---

## 📱 Mobile Setup

### On Same Phone
```
1. Open http://localhost:3000 in browser
2. Use arrow buttons (bottom-right corner)
3. Works with touch input
```

### On Different Phones (Multiplayer)
```
1. Find your IP: Use 192.168.x.x (ask host)
2. Host opens: http://192.168.1.X:3000
3. Guest opens same URL on WiFi
4. Create/Join game codes to connect
```

---

## 🎨 Game Aesthetics

**Color Theme**
- Primary: Cyan (#00f0ff)
- Secondary: Magenta (#ff00ff)
- Accent: Lime (#00ff00)
- Background: Dark blue (#0a0e27)

**Style**
- Cyberpunk/Synthwave
- Neon glow effects
- Dark mode always on
- Monospace fonts for UI

---

## 🔊 Audio Control

| Event | Sound |
|-------|-------|
| Game start | (Music begins) |
| Powerup | Ascending tone |
| Shield | Resonant frequency |
| Wave up | Rising tone |
| Hit | Low beep |
| Game over | Descending tone |

**All audio is synthesized (no files)**

---

## 📂 Important Files to Know

```
app/page.tsx               ← Game entry point
components/GameScreen.tsx  ← Single-player logic
components/MultiplayerGame.tsx ← Multiplayer logic
lib/gameEngine.ts          ← Core physics
lib/audioManager.ts        ← Sound effects
lib/multiplayerManager.ts  ← Networking
```

---

## 🌐 Browser Compatibility

✅ Chrome/Edge/Firefox/Opera
⚠️ Safari (slower but works)
❌ IE (won't work)

**Tip**: Chrome has best performance

---

## 💾 Data & Storage

- **Scores**: Stored in browser (local storage)
- **Settings**: None saved
- **Account**: Not needed
- **Cloud Save**: Not implemented
- **Clearing Cache**: Erases high scores

---

## 🆘 Emergency Reset

If everything breaks:

```bash
# Stop dev server
Ctrl+C

# Full clean
rm -rf node_modules .next pnpm-lock.yaml

# Reinstall everything
pnpm install

# Start fresh
pnpm dev
```

---

## 📊 Expected Performance

### Good Hardware (2020+)
- 60 FPS ✅
- Instant load ✅
- Smooth multiplayer ✅

### Older Hardware
- 30-60 FPS (playable)
- 3-5 sec load (patient wait)
- Slight multiplayer lag (acceptable)

### Poor Performance?
1. Close browser tabs
2. Update GPU drivers
3. Use Chrome browser
4. Reduce other apps

---

## 🎓 Development Files

| File | Purpose |
|------|---------|
| START_HERE.md | This quick start guide |
| README.md | Full documentation |
| SETUP_GUIDE.md | Detailed installation |
| TROUBLESHOOTING.md | Problem solving |
| QUICK_REFERENCE.md | This file |

**Read in order: START_HERE → README → others as needed**

---

## 🎮 Game Modes

### Single-Player
- Play alone against obstacles
- Practice mode
- Build high score
- No waiting for others

### Multiplayer
- Up to 4+ players
- Compete in real-time
- Share game code
- Requires same WiFi

---

## 💡 Pro Tips

1. **Keyboard**: Most responsive control method
2. **Mouse**: Best for casual play
3. **Mobile**: Good for testing
4. **Strategy**: Dodge first, powerups second
5. **Audio**: Mute if in meetings (music on repeat!)

---

## 🏆 Personal Challenges

- [ ] Survive 10 waves
- [ ] Survive 20 waves
- [ ] Get 10,000 points
- [ ] Get 50,000 points
- [ ] Master all control methods
- [ ] Win multiplayer match
- [ ] Get 5x combo

---

## 📞 When Stuck

1. **Simple issue?** → QUICK_REFERENCE.md (this file)
2. **Setup problem?** → SETUP_GUIDE.md
3. **Technical issue?** → TROUBLESHOOTING.md
4. **Want details?** → README.md
5. **Still stuck?** → Try "Emergency Reset" above

---

## ✅ Verification Checklist

Before saying "it doesn't work":

- [ ] Node 18+ installed (`node --version`)
- [ ] In correct folder (`pwd`)
- [ ] `pnpm install` completed
- [ ] `pnpm dev` shows "Ready"
- [ ] Browser shows localhost:3000
- [ ] Can see main menu
- [ ] Can click buttons
- [ ] Can click "PLAY SINGLE PLAYER"
- [ ] Can click "START GAME"
- [ ] Game canvas appears

**If ANY fails**: See TROUBLESHOOTING.md

---

## 🎊 Ready to Play?

```
1. pnpm dev
2. Wait for "Ready"
3. Browser opens
4. Click "PLAY SINGLE PLAYER"
5. Click "START GAME"
6. Use keyboard/mouse/buttons
7. DODGE! SURVIVE! SCORE!
8. Have FUN! 🎮
```

---

## 🚀 Final Reminders

- **First play**: Don't expect perfect score
- **Learning curve**: Controls take ~2 minutes to master
- **No tutorials**: Just start playing
- **No accounts**: Scores local only
- **No ads**: Pure gameplay
- **No bugs**: Report any issues

---

**NOW GO PLAY CYBERLANE! 🎮✨**

*Your high score awaits...*
