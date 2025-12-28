class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0x8a2be2, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
        
        this.createPlaceholderAssets();
    }

    createPlaceholderAssets() {
        // Player - Pixel art humanoid character (32x32)
        this.createPlayerSprite();
        
        // Enemies - Pixel art creatures
        this.createBatSprite();
        this.createZombieSprite();
        this.createSkeletonSprite();
        this.createDeathSprite();

        // XP Gems
        this.createGemTexture('xp_small', 0x00ff88, 8);
        this.createGemTexture('xp_medium', 0x00ffaa, 12);
        this.createGemTexture('xp_large', 0x00ffdd, 16);

        // Projectiles
        this.createFireballTexture('projectile_wand', 16);
        this.createKnifeTexture('projectile_knife', 16);

        // Garlic aura
        const garlicGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        garlicGraphics.lineStyle(3, 0xf5f5dc, 0.6);
        garlicGraphics.strokeCircle(80, 80, 75);
        garlicGraphics.fillStyle(0xf5f5dc, 0.1);
        garlicGraphics.fillCircle(80, 80, 75);
        garlicGraphics.generateTexture('garlic_aura', 160, 160);
        garlicGraphics.destroy();

        // Ground tile
        const groundGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        groundGraphics.fillStyle(0x2d4a27, 1);
        groundGraphics.fillRect(0, 0, 64, 64);
        groundGraphics.fillStyle(0x3d5a37, 1);
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(4, 56);
            const y = Phaser.Math.Between(4, 56);
            groundGraphics.fillRect(x, y, 3, 3);
        }
        groundGraphics.fillStyle(0x1d3a17, 1);
        for (let i = 0; i < 4; i++) {
            const x = Phaser.Math.Between(4, 56);
            const y = Phaser.Math.Between(4, 56);
            groundGraphics.fillRect(x, y, 2, 2);
        }
        groundGraphics.generateTexture('ground', 64, 64);
        groundGraphics.destroy();

        this.createUITextures();
    }

    createPlayerSprite() {
        // Create right-facing mage sprite (detailed pixel art)
        this.createMageSprite('player_right', false);
        // Create left-facing mage sprite (mirrored)
        this.createMageSprite('player_left', true);
        // Default player texture (right-facing)
        this.createMageSprite('player', false);
    }
    
    createMageSprite(key, flipX) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 32;
        const cx = 16; // center x
        
        // Helper to draw mirrored
        const px = (x) => flipX ? (size - 1 - x) : x;
        
        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(16, 30, 14, 4);
        
        // === ROBE (flowing wizard robe) ===
        // Robe base - dark purple
        g.fillStyle(0x2a1a4a, 1);
        g.fillRect(10, 16, 12, 14);
        // Robe flare at bottom
        g.fillRect(8, 26, 16, 4);
        g.fillRect(7, 28, 18, 2);
        
        // Robe highlights - lighter purple
        g.fillStyle(0x4a2a6a, 1);
        g.fillRect(px(11), 17, 3, 11);
        g.fillRect(px(15), 20, 2, 8);
        
        // Robe trim - gold
        g.fillStyle(0xffd700, 1);
        g.fillRect(8, 28, 16, 1);
        g.fillRect(14, 16, 4, 1);
        
        // Robe front opening - dark
        g.fillStyle(0x1a0a2e, 1);
        g.fillRect(14, 17, 4, 11);
        
        // Belt
        g.fillStyle(0x8b4513, 1);
        g.fillRect(10, 21, 12, 2);
        g.fillStyle(0xffd700, 1);
        g.fillRect(14, 21, 4, 2); // Belt buckle
        
        // === ARMS with sleeves ===
        // Left sleeve
        g.fillStyle(0x2a1a4a, 1);
        g.fillRect(px(6), 16, 4, 7);
        g.fillStyle(0x4a2a6a, 1);
        g.fillRect(px(7), 17, 2, 5);
        // Hand
        g.fillStyle(0xf5d0c5, 1);
        g.fillRect(px(6), 22, 3, 3);
        
        // Right sleeve (holding staff)
        g.fillStyle(0x2a1a4a, 1);
        g.fillRect(px(22), 16, 4, 7);
        g.fillStyle(0x4a2a6a, 1);
        g.fillRect(px(23), 17, 2, 5);
        // Hand
        g.fillStyle(0xf5d0c5, 1);
        g.fillRect(px(23), 21, 3, 3);
        
        // === STAFF ===
        // Staff pole
        g.fillStyle(0x5c3317, 1);
        g.fillRect(px(24), 8, 2, 20);
        // Staff orb glow
        g.fillStyle(0x00ffff, 0.4);
        g.fillCircle(px(25), 6, 5);
        // Staff orb
        g.fillStyle(0x00ffff, 1);
        g.fillCircle(px(25), 6, 3);
        // Orb highlight
        g.fillStyle(0xffffff, 1);
        g.fillRect(px(24), 4, 1, 1);
        // Staff top decoration
        g.fillStyle(0xffd700, 1);
        g.fillRect(px(23), 9, 4, 2);
        
        // === HEAD ===
        // Face
        g.fillStyle(0xf5d0c5, 1);
        g.fillRect(12, 8, 8, 7);
        
        // Beard (white/grey wizard beard)
        g.fillStyle(0xe8e8e8, 1);
        g.fillRect(12, 13, 8, 4);
        g.fillRect(13, 17, 6, 2);
        g.fillRect(14, 19, 4, 1);
        // Beard detail
        g.fillStyle(0xcccccc, 1);
        g.fillRect(px(13), 14, 2, 3);
        g.fillRect(px(17), 14, 2, 3);
        
        // === WIZARD HAT ===
        // Hat brim
        g.fillStyle(0x2a1a4a, 1);
        g.fillRect(9, 7, 14, 2);
        // Hat cone
        g.fillRect(11, 5, 10, 2);
        g.fillRect(12, 3, 8, 2);
        g.fillRect(13, 1, 6, 2);
        g.fillRect(14, 0, 4, 1);
        // Hat highlight
        g.fillStyle(0x4a2a6a, 1);
        g.fillRect(px(12), 5, 2, 2);
        g.fillRect(px(13), 3, 2, 2);
        g.fillRect(px(14), 1, 2, 2);
        // Hat band
        g.fillStyle(0xffd700, 1);
        g.fillRect(11, 5, 10, 1);
        // Hat star
        g.fillStyle(0xffff00, 1);
        g.fillRect(15, 2, 2, 2);
        
        // === EYES ===
        // Eyes (mysterious glowing)
        g.fillStyle(0x00ffff, 1);
        g.fillRect(px(13), 10, 2, 2);
        g.fillRect(px(17), 10, 2, 2);
        // Eye pupils
        g.fillStyle(0x006666, 1);
        g.fillRect(px(13), 11, 2, 1);
        g.fillRect(px(17), 11, 2, 1);
        // Eye glow
        g.fillStyle(0xffffff, 0.8);
        g.fillRect(px(13), 10, 1, 1);
        g.fillRect(px(17), 10, 1, 1);
        
        // Eyebrows (bushy)
        g.fillStyle(0xe8e8e8, 1);
        g.fillRect(px(12), 9, 3, 1);
        g.fillRect(px(17), 9, 3, 1);
        
        g.generateTexture(key, size, size);
        g.destroy();
    }

    createBatSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 24;
        
        // Wings
        g.fillStyle(0x4a3728, 1);
        // Left wing
        g.fillTriangle(2, 8, 8, 6, 8, 14);
        g.fillRect(4, 8, 5, 5);
        // Right wing
        g.fillTriangle(22, 8, 16, 6, 16, 14);
        g.fillRect(15, 8, 5, 5);
        
        // Body
        g.fillStyle(0x3d2817, 1);
        g.fillRect(9, 7, 6, 8);
        
        // Head
        g.fillStyle(0x4a3728, 1);
        g.fillRect(10, 4, 4, 4);
        
        // Ears
        g.fillTriangle(9, 4, 11, 2, 11, 5);
        g.fillTriangle(15, 4, 13, 2, 13, 5);
        
        // Eyes (red glowing)
        g.fillStyle(0xff0000, 1);
        g.fillRect(10, 5, 2, 2);
        g.fillRect(12, 5, 2, 2);
        
        // Fangs
        g.fillStyle(0xffffff, 1);
        g.fillRect(11, 8, 1, 2);
        g.fillRect(12, 8, 1, 2);
        
        g.generateTexture('enemy_bat', size, size);
        g.destroy();
    }

    createZombieSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 28;
        
        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(14, 26, 14, 5);
        
        // Body (torn clothes)
        g.fillStyle(0x4a5d23, 1);
        g.fillRect(10, 12, 8, 10);
        
        // Torn fabric
        g.fillStyle(0x3d4d1a, 1);
        g.fillRect(11, 18, 2, 4);
        g.fillRect(15, 17, 2, 5);
        
        // Legs
        g.fillStyle(0x3d5d1a, 1);
        g.fillRect(10, 22, 3, 5);
        g.fillRect(15, 22, 3, 5);
        
        // Arms (reaching forward)
        g.fillStyle(0x6b8e23, 1);
        g.fillRect(6, 13, 4, 4);
        g.fillRect(18, 13, 4, 4);
        
        // Hands
        g.fillStyle(0x556b2f, 1);
        g.fillRect(4, 14, 3, 3);
        g.fillRect(21, 14, 3, 3);
        
        // Head
        g.fillStyle(0x6b8e23, 1);
        g.fillRect(10, 4, 8, 8);
        
        // Rotting patches
        g.fillStyle(0x556b2f, 1);
        g.fillRect(11, 5, 2, 2);
        g.fillRect(15, 7, 2, 2);
        
        // Eyes (empty)
        g.fillStyle(0x000000, 1);
        g.fillRect(11, 7, 2, 2);
        g.fillRect(15, 7, 2, 2);
        
        // Mouth
        g.fillStyle(0x2d3d0a, 1);
        g.fillRect(12, 10, 4, 1);
        
        g.generateTexture('enemy_zombie', size, size);
        g.destroy();
    }

    createSkeletonSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 26;
        
        // Shadow
        g.fillStyle(0x000000, 0.3);
        g.fillEllipse(13, 24, 12, 4);
        
        // Ribcage
        g.fillStyle(0xe8e8d0, 1);
        g.fillRect(10, 11, 6, 7);
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(11, 12, 1, 5);
        g.fillRect(13, 12, 1, 5);
        g.fillRect(15, 12, 1, 5);
        
        // Spine
        g.fillStyle(0xe8e8d0, 1);
        g.fillRect(12, 18, 2, 3);
        
        // Pelvis
        g.fillRect(9, 20, 8, 2);
        
        // Legs
        g.fillRect(10, 22, 2, 4);
        g.fillRect(14, 22, 2, 4);
        
        // Arms
        g.fillRect(6, 12, 4, 2);
        g.fillRect(16, 12, 4, 2);
        g.fillRect(5, 14, 2, 4);
        g.fillRect(19, 14, 2, 4);
        
        // Skull
        g.fillStyle(0xf5f5dc, 1);
        g.fillRect(9, 3, 8, 8);
        
        // Eye sockets
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(10, 5, 2, 3);
        g.fillRect(14, 5, 2, 3);
        
        // Nose hole
        g.fillRect(12, 7, 2, 2);
        
        // Teeth
        g.fillStyle(0xf5f5dc, 1);
        g.fillRect(10, 9, 6, 2);
        g.fillStyle(0x1a1a1a, 1);
        g.fillRect(11, 9, 1, 2);
        g.fillRect(13, 9, 1, 2);
        g.fillRect(15, 9, 1, 2);
        
        g.generateTexture('enemy_skeleton', size, size);
        g.destroy();
    }

    createDeathSprite() {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        const size = 40;
        
        // Shadow
        g.fillStyle(0x000000, 0.4);
        g.fillEllipse(20, 37, 20, 6);
        
        // Robe body
        g.fillStyle(0x0a0a0a, 1);
        g.fillRect(12, 16, 16, 20);
        g.fillTriangle(10, 36, 14, 20, 14, 36);
        g.fillTriangle(30, 36, 26, 20, 26, 36);
        
        // Robe folds
        g.fillStyle(0x1a1a2e, 1);
        g.fillRect(16, 20, 2, 14);
        g.fillRect(22, 18, 2, 16);
        
        // Hood
        g.fillStyle(0x0a0a0a, 1);
        g.fillRect(10, 6, 20, 14);
        g.fillTriangle(10, 6, 20, 2, 30, 6);
        
        // Hood interior (dark void)
        g.fillStyle(0x000000, 1);
        g.fillRect(13, 10, 14, 8);
        
        // Glowing red eyes
        g.fillStyle(0xff0000, 1);
        g.fillRect(16, 13, 3, 3);
        g.fillRect(21, 13, 3, 3);
        
        // Eye glow
        g.fillStyle(0xff4444, 0.6);
        g.fillRect(15, 12, 5, 5);
        g.fillRect(20, 12, 5, 5);
        
        // Scythe handle
        g.fillStyle(0x4a3728, 1);
        g.fillRect(32, 4, 3, 32);
        
        // Scythe blade
        g.fillStyle(0xc0c0c0, 1);
        g.fillTriangle(20, 4, 35, 4, 35, 12);
        g.fillRect(30, 4, 5, 3);
        
        // Blade edge highlight
        g.fillStyle(0xe0e0e0, 1);
        g.fillRect(22, 5, 10, 1);
        
        // Skeletal hands
        g.fillStyle(0xe8e8d0, 1);
        g.fillRect(8, 22, 4, 3);
        g.fillRect(28, 22, 4, 3);
        
        g.generateTexture('enemy_death', size, size);
        g.destroy();
    }

    createGemTexture(key, color, size) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Outer glow
        g.fillStyle(color, 0.3);
        g.fillCircle(size/2, size/2, size/2);
        
        // Diamond shape
        g.fillStyle(color, 1);
        g.beginPath();
        g.moveTo(size/2, 1);
        g.lineTo(size-1, size/2);
        g.lineTo(size/2, size-1);
        g.lineTo(1, size/2);
        g.closePath();
        g.fillPath();
        
        // Highlight
        g.fillStyle(0xffffff, 0.5);
        g.fillTriangle(size/2, 2, size/2 + 2, size/2 - 2, size/2 - 2, size/2 - 2);
        
        g.generateTexture(key, size, size);
        g.destroy();
    }

    createFireballTexture(key, size) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Outer glow
        g.fillStyle(0xff6600, 0.5);
        g.fillCircle(size/2, size/2, size/2);
        
        // Middle layer
        g.fillStyle(0xff8800, 1);
        g.fillCircle(size/2, size/2, size/2 - 3);
        
        // Hot core
        g.fillStyle(0xffff44, 1);
        g.fillCircle(size/2, size/2, size/4);
        
        // Highlight
        g.fillStyle(0xffffff, 0.7);
        g.fillCircle(size/2 - 2, size/2 - 2, 2);
        
        g.generateTexture(key, size, size);
        g.destroy();
    }

    createKnifeTexture(key, size) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        
        // Blade
        g.fillStyle(0xc0c0c0, 1);
        g.beginPath();
        g.moveTo(size - 2, size/2);
        g.lineTo(size/2, size/2 - 3);
        g.lineTo(4, size/2);
        g.lineTo(size/2, size/2 + 3);
        g.closePath();
        g.fillPath();
        
        // Blade highlight
        g.fillStyle(0xe8e8e8, 1);
        g.fillRect(size/2, size/2 - 2, size/3, 2);
        
        // Handle
        g.fillStyle(0x5c3317, 1);
        g.fillRect(2, size/2 - 2, 4, 4);
        
        // Guard
        g.fillStyle(0x8b7355, 1);
        g.fillRect(5, size/2 - 3, 2, 6);
        
        g.generateTexture(key, size, size);
        g.destroy();
    }

    createUITextures() {
        // Upgrade card background - sized for 16:9 aspect ratio
        const cardGraphics = this.make.graphics({ x: 0, y: 0, add: false });
        cardGraphics.fillStyle(0x2a1a4a, 1);
        cardGraphics.fillRoundedRect(0, 0, 160, 180, 10);
        cardGraphics.lineStyle(2, 0x8a2be2, 1);
        cardGraphics.strokeRoundedRect(0, 0, 160, 180, 10);
        cardGraphics.generateTexture('upgrade_card', 160, 180);
        cardGraphics.destroy();

        // Weapon icons
        this.createWeaponIcon('icon_magicWand', 0xff6600);
        this.createWeaponIcon('icon_garlic', 0xf5f5dc);
        this.createWeaponIcon('icon_knife', 0xc0c0c0);
        
        // Passive icons
        this.createPassiveIcon('icon_spinach', 0x228B22);
        this.createPassiveIcon('icon_armor', 0x808080);
        this.createPassiveIcon('icon_wings', 0x87CEEB);
    }

    createWeaponIcon(key, color) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x1a1a2e, 1);
        g.fillCircle(24, 24, 22);
        g.fillStyle(color, 1);
        g.fillCircle(24, 24, 16);
        g.fillStyle(0xffffff, 0.3);
        g.fillCircle(20, 20, 6);
        g.generateTexture(key, 48, 48);
        g.destroy();
    }

    createPassiveIcon(key, color) {
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0x1a1a2e, 1);
        g.fillRoundedRect(0, 0, 48, 48, 8);
        g.fillStyle(color, 1);
        g.fillRoundedRect(8, 8, 32, 32, 4);
        g.fillStyle(0xffffff, 0.3);
        g.fillRoundedRect(10, 10, 12, 12, 2);
        g.generateTexture(key, 48, 48);
        g.destroy();
    }

    create() {
        this.scene.start('MenuScene');
    }
}
