// Detect if we're on a mobile device
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Calculate safe dimensions for mobile
function getSafeDimensions() {
    if (isMobile && window.innerWidth < 900) {
        // For mobile, use visual viewport if available for more accurate sizing
        const vv = window.visualViewport;
        const width = vv ? vv.width : window.innerWidth;
        const height = vv ? vv.height : window.innerHeight;
        return { width, height };
    }
    return { width: CONSTANTS.GAME_WIDTH, height: CONSTANTS.GAME_HEIGHT };
}

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
        height: CONSTANTS.GAME_HEIGHT,
        // Expand to fill parent container
        expandParent: true
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

// Handle orientation changes and resizes on mobile
function handleResize() {
    if (game && game.scale) {
        // Force a scale refresh
        game.scale.refresh();
    }
}

// Listen for various resize events
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    // Delay slightly to let the browser settle
    setTimeout(handleResize, 100);
});

// Visual Viewport API for better mobile support
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize);
}

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

// Prevent pull-to-refresh on mobile
document.body.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });
