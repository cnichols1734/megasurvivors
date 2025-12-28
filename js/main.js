// Main Game Configuration
const config = {
    type: Phaser.AUTO,
    width: CONSTANTS.GAME_WIDTH,
    height: CONSTANTS.GAME_HEIGHT,
    parent: 'game-container',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: CONSTANTS.GAME_WIDTH,
        height: CONSTANTS.GAME_HEIGHT
    },
    input: {
        activePointers: 2,
        touch: {
            capture: true
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, UpgradeScene, GameOverScene]
};

// Create the game instance
const game = new Phaser.Game(config);

// Handle orientation changes on mobile
window.addEventListener('resize', () => {
    // Phaser's Scale manager handles this automatically with FIT mode
    game.scale.refresh();
});

// Prevent default touch behaviors on mobile
document.addEventListener('touchmove', (e) => {
    if (e.target.closest('#game-container')) {
        e.preventDefault();
    }
}, { passive: false });

// Prevent context menu on long press
document.addEventListener('contextmenu', (e) => {
    if (e.target.closest('#game-container')) {
        e.preventDefault();
    }
});
