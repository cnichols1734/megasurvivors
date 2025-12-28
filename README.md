# MegaSurvivors

A Vampire Survivors-inspired roguelike survival game built with Phaser 3. Survive waves of enemies for 30 minutes, collect XP, level up, and choose powerful upgrades!

## Play Now

Host locally or deploy to GitHub Pages - no build step required!

## Features

- **Auto-attacking weapons** - Focus on movement while your weapons fire automatically
- **3 Starting Weapons**:
  - Magic Wand - Fires projectiles at the nearest enemy
  - Garlic - Damages all enemies within an aura around you
  - Knife - Throws knives in your facing direction
- **3 Passive Items**:
  - Spinach - +10% damage per level
  - Armor - -5% damage taken per level
  - Wings - +10% movement speed per level
- **Progressive difficulty** - Enemies spawn faster and in greater numbers over time
- **Upgrade system** - Choose from 3 random upgrades each level-up
- **30-minute sessions** - Survive until Death comes for you!

## Controls

- **WASD** or **Arrow Keys** - Move
- **ESC** - Pause
- Weapons fire automatically!

## Running Locally

1. Clone the repository
2. Start a local server:
   ```bash
   python3 -m http.server 8080
   ```
3. Open http://localhost:8080 in your browser

## Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings > Pages
3. Select "Deploy from a branch"
4. Choose `main` branch and `/ (root)` folder
5. Your game will be live at `https://yourusername.github.io/megagame/`

## Tech Stack

- **Phaser 3** - Game framework
- **Vanilla JavaScript** - No build step required
- **Procedural Graphics** - Generated at runtime, no external assets needed

## Game Balance

All balance values can be tweaked in `js/utils/constants.js`:

- Game duration
- Player stats (HP, speed)
- XP requirements per level
- Enemy spawn rates
- Weapon damage and cooldowns

## License

MIT License - Feel free to use, modify, and distribute!

