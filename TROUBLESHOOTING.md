# CYBERLANE - Troubleshooting Guide

## Quick Checklist Before Running

- [ ] Node.js 18+ installed (`node --version`)
- [ ] In correct directory (`cd /vercel/share/v0-project`)
- [ ] Dependencies installed (`pnpm install`)
- [ ] No other app running on port 3000
- [ ] Browser is updated to latest version

---

## Common Issues & Solutions

### 1. "Cannot find module" errors

**Symptom**: 
```
Error: Cannot find module '@/components/...'
```

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

---

### 2. Port 3000 Already in Use

**Symptom**:
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution**:
```bash
# Option 1: Use different port
pnpm dev -- -p 3001

# Option 2: Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Option 3: Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

### 3. Game Won't Start / Blank Screen

**Symptoms**:
- Main menu not visible
- Canvas is black
- "Loading..." forever

**Solutions**:

**Step A**: Check console errors (F12)
```bash
# Open DevTools:
# Windows/Linux: F12
# Mac: Cmd+Option+I
# Look for red errors in Console tab
```

**Step B**: Clear browser cache
```
# Ctrl+Shift+Delete (Windows/Linux)
# Cmd+Shift+Delete (Mac)
# Select "All time" and clear
```

**Step C**: Restart dev server
```bash
# Stop: Ctrl+C in terminal
# Wait 2 seconds
# Restart:
pnpm dev
```

**Step D**: Try different browser
- Chrome/Brave/Edge (Chromium-based) - best performance
- Firefox - should work fine
- Safari - may have minor issues

---

### 4. Obstacles Not Appearing

**Symptom**: Game runs but no obstacles falling

**Solution**:
1. Press "START GAME" button
2. Wait 1-2 seconds (obstacles spawn after short delay)
3. If still nothing, check browser console for errors

**Why this happens**: 
- Game doesn't spawn obstacles until `isGameActive = true`
- Obstacles spawn at ~0.8 second intervals minimum

---

### 5. Player Movement Not Working

**Symptoms**:
- Character doesn't move with keyboard
- Mouse movement has no effect
- Arrow buttons don't work

**Solutions**:

**For Keyboard**:
- Try all input methods: Arrow Keys, WASD, mouse, buttons
- Check Caps Lock isn't interfering
- Try a different browser

**For Mouse**:
- Move cursor over the game canvas
- Ensure browser window is focused
- Try moving cursor further from center

**For Mobile Buttons**:
- Buttons visible in bottom-right corner
- Tap firmly on each direction
- Check if browser allows touch events

**Debug**: Open console (F12) and type:
```javascript
// Test keyboard input
window.addEventListener('keydown', e => console.log('Key:', e.key));

// Test mouse input
window.addEventListener('mousemove', e => console.log('Mouse:', e.clientX, e.clientY));
```

---

### 6. Audio/Sound Not Working

**Symptom**: No background music or sound effects

**Solutions**:

1. **Check browser volume**:
   - Browser mute button (usually right side of address bar)
   - System volume/speaker settings
   - YouTube test: Try playing a video

2. **Check browser permissions**:
   ```
   Click lock icon in address bar → Permissions → Audio
   Ensure it's allowed
   ```

3. **Check browser autoplay policy**:
   - Most browsers require user interaction first
   - Click "START GAME" button to trigger audio
   - Audio plays after first user interaction

4. **Different browser**:
   - Try Chrome/Firefox (better audio support)
   - Safari may have more restrictions

**Test audio independently**:
```bash
# Run in browser console (F12)
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const osc = ctx.createOscillator();
osc.connect(ctx.destination);
osc.start();
setTimeout(() => osc.stop(), 100);
```

---

### 7. Multiplayer Connection Failed

**Symptoms**:
- Can't create game
- Can't join game
- "PeerJS connection failed"

**Solutions**:

1. **Check network**:
   ```bash
   # Both devices on same network?
   # Same WiFi network required
   ```

2. **Check firewall**:
   - Windows: Check Windows Defender firewall
   - Mac: System Preferences → Security & Privacy
   - Allow browser through firewall

3. **Restart PeerJS**:
   ```
   Refresh page (F5)
   Try creating/joining again
   ```

4. **Use different browser**:
   - Chrome has best WebRTC support
   - Firefox also good
   - Safari may have issues

5. **Debug connection**:
   - Check browser console for WebRTC errors
   - Ensure both devices have public IP access
   - Try single-player mode to isolate issue

---

### 8. Game Runs Slowly / Lag

**Symptoms**:
- Low FPS
- Character stutters
- Obstacles seem to jump

**Solutions**:

1. **Close other programs**:
   - Close Chrome tabs
   - Quit heavy applications
   - Free up RAM

2. **Update drivers**:
   - Graphics driver update (NVIDIA/AMD/Intel)
   - Often fixes WebGL performance

3. **Reduce graphics load**:
   ```
   Try different browser (Chrome fastest)
   Close DevTools (F12 closed uses less resources)
   ```

4. **Check system resources**:
   - Task Manager (Windows): Ctrl+Shift+Esc
   - Activity Monitor (Mac): Cmd+Space → Activity Monitor
   - Look for CPU/RAM usage

---

### 9. "ReferenceError: gameInput is not defined"

**Symptom**:
```
ReferenceError: gameInput is not defined
at GameScreen (components/GameScreen.tsx:119:22)
```

**Solution**:
```bash
# This indicates stale code
# Clear cache and rebuild:
rm -rf .next
pnpm build
pnpm dev
```

---

### 10. TypeScript Errors During Build

**Symptom**:
```
Type 'X' is not assignable to type 'Y'
```

**Solution**:
```bash
# Skip type checking during dev:
pnpm dev

# For production build, fix types:
# Check error location and review imports/exports
```

---

## Environment Variables

Check if `.env.local` exists:
```bash
ls -la /vercel/share/v0-project/.env.local
```

No environment variables are required for local development. The game uses:
- Web Audio API (built-in)
- Canvas API (built-in)
- PeerJS (bundled dependency)

---

## Build Errors

### Error: "NEXT_PUBLIC_* variable not found"

This shouldn't happen, but if it does:
```bash
# Rebuild:
rm -rf .next out
pnpm build
```

### Error: "Failed to parse source map"

**Solution**:
```bash
# Development build ignores source maps
pnpm dev

# For production, this is non-critical:
pnpm build  # Still completes successfully
```

---

## Getting Help

1. **Check browser console** (F12):
   - Right-click → Inspect → Console tab
   - Copy full error message

2. **Check terminal output**:
   - Look for red error messages when running `pnpm dev`
   - Provide full error context

3. **Clear everything and start fresh**:
   ```bash
   rm -rf node_modules .next pnpm-lock.yaml
   pnpm install
   pnpm dev
   ```

4. **Verify installation**:
   ```bash
   node --version    # Should be 18+
   pnpm --version    # Should be 9+
   npm list next     # Check Next.js version
   ```

---

## Performance Baseline

**Expected Performance** (on modern hardware):
- FPS: 60 (smooth gameplay)
- Load time: < 3 seconds
- Memory usage: 50-150MB
- Network: <1MB/s (single-player)

**If below baseline**: See "Game Runs Slowly" section above

---

## Still Stuck?

1. **Restart everything**:
   ```bash
   # Stop dev server (Ctrl+C)
   # Wait 5 seconds
   # Clear cache:
   rm -rf .next node_modules/.cache
   # Restart:
   pnpm dev
   ```

2. **Nuclear option** (complete clean):
   ```bash
   rm -rf node_modules .next pnpm-lock.yaml
   git clean -fd (if in git repo)
   pnpm install
   pnpm dev
   ```

3. **Check system requirements**:
   - Node.js 18+ required
   - 2GB RAM minimum (4GB recommended)
   - Modern browser (2020 or newer)

---

Good luck playing CYBERLANE!
