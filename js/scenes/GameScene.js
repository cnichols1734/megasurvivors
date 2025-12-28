class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    init() {
        // Reset game state
        this.gameTime = 0;
        this.isPaused = false;
        this.isGameOver = false;
        
        // Touch/joystick state
        this.touchInput = {
            isActive: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            vectorX: 0,
            vectorY: 0
        };
    }

    create() {
        // Set up world bounds
        this.physics.world.setBounds(0, 0, CONSTANTS.WORLD_WIDTH, CONSTANTS.WORLD_HEIGHT);

        // Create ground tiles
        this.createGround();

        // Initialize managers
        this.statsManager = new StatsManager(this);
        this.waveManager = new WaveManager(this);
        this.upgradeManager = new UpgradeManager(this);
        this.soundManager = new SoundManager(this);
        
        // Resume audio context on first interaction (required for sound effects)
        this.input.once('pointerdown', () => {
            this.soundManager.resumeAudio();
        });
        this.input.keyboard.once('keydown', () => {
            this.soundManager.resumeAudio();
        });
        
        // Background music disabled for now (code kept for future use)
        // this.soundManager.startMusic();

        // Create groups
        this.enemies = this.physics.add.group();
        this.projectiles = this.physics.add.group();
        this.xpGems = this.physics.add.group();

        // Create player at center of world
        this.player = new Player(this, CONSTANTS.WORLD_WIDTH / 2, CONSTANTS.WORLD_HEIGHT / 2);

        // Set up camera
        this.cameras.main.setBounds(0, 0, CONSTANTS.WORLD_WIDTH, CONSTANTS.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setZoom(1);

        // Set up collisions
        this.setupCollisions();

        // Create HUD
        this.createHUD();

        // Start the game timer
        this.gameTimer = this.time.addEvent({
            delay: 100,
            callback: this.updateGameTime,
            callbackScope: this,
            loop: true
        });

        // Set up keyboard input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Set up touch/virtual joystick input
        this.setupTouchInput();

        // Pause key
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);

        // Give player starting weapon
        this.player.addWeapon('magicWand');
    }

    setupTouchInput() {
        // Create visual indicator for touch (hidden joystick)
        this.joystickBase = this.add.circle(0, 0, 60, 0x8a2be2, 0.3)
            .setScrollFactor(0)
            .setDepth(150)
            .setVisible(false);
        
        this.joystickThumb = this.add.circle(0, 0, 25, 0x8a2be2, 0.6)
            .setScrollFactor(0)
            .setDepth(151)
            .setVisible(false);

        // Touch start - begin virtual joystick
        this.input.on('pointerdown', (pointer) => {
            if (this.isPaused || this.isGameOver) return;
            
            this.touchInput.isActive = true;
            this.touchInput.startX = pointer.x;
            this.touchInput.startY = pointer.y;
            this.touchInput.currentX = pointer.x;
            this.touchInput.currentY = pointer.y;
            
            // Show joystick at touch position
            this.joystickBase.setPosition(pointer.x, pointer.y).setVisible(true);
            this.joystickThumb.setPosition(pointer.x, pointer.y).setVisible(true);
        });

        // Touch move - update joystick direction
        this.input.on('pointermove', (pointer) => {
            if (!this.touchInput.isActive) return;
            
            this.touchInput.currentX = pointer.x;
            this.touchInput.currentY = pointer.y;
            
            // Calculate direction vector
            let dx = pointer.x - this.touchInput.startX;
            let dy = pointer.y - this.touchInput.startY;
            
            // Clamp to max radius
            const maxRadius = 50;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > maxRadius) {
                dx = (dx / distance) * maxRadius;
                dy = (dy / distance) * maxRadius;
            }
            
            // Normalize for movement (-1 to 1)
            this.touchInput.vectorX = dx / maxRadius;
            this.touchInput.vectorY = dy / maxRadius;
            
            // Update joystick thumb position
            this.joystickThumb.setPosition(
                this.touchInput.startX + dx,
                this.touchInput.startY + dy
            );
        });

        // Touch end - stop movement
        this.input.on('pointerup', () => {
            this.touchInput.isActive = false;
            this.touchInput.vectorX = 0;
            this.touchInput.vectorY = 0;
            
            // Hide joystick
            this.joystickBase.setVisible(false);
            this.joystickThumb.setVisible(false);
        });

        // Handle pointer leaving the game area
        this.input.on('pointerupoutside', () => {
            this.touchInput.isActive = false;
            this.touchInput.vectorX = 0;
            this.touchInput.vectorY = 0;
            this.joystickBase.setVisible(false);
            this.joystickThumb.setVisible(false);
        });
    }

    createGround() {
        // Tile the ground texture across the world
        for (let x = 0; x < CONSTANTS.WORLD_WIDTH; x += 64) {
            for (let y = 0; y < CONSTANTS.WORLD_HEIGHT; y += 64) {
                this.add.image(x + 32, y + 32, 'ground').setDepth(-1);
            }
        }

        // Add some variety with darker patches
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, CONSTANTS.WORLD_WIDTH);
            const y = Phaser.Math.Between(0, CONSTANTS.WORLD_HEIGHT);
            this.add.circle(x, y, Phaser.Math.Between(20, 60), 0x1a3a17, 0.3).setDepth(-1);
        }
    }

    setupCollisions() {
        // Projectiles hitting enemies
        this.physics.add.overlap(
            this.projectiles,
            this.enemies,
            this.handleProjectileHit,
            null,
            this
        );

        // Player collecting XP gems
        this.physics.add.overlap(
            this.player.sprite,
            this.xpGems,
            this.handleXPCollection,
            null,
            this
        );

        // Enemies hitting player
        this.physics.add.overlap(
            this.player.sprite,
            this.enemies,
            this.handlePlayerDamage,
            null,
            this
        );
    }

    handleProjectileHit(projectile, enemySprite) {
        const enemy = enemySprite.getData('instance');
        const weapon = projectile.getData('weapon');
        
        if (enemy && !enemy.isDead) {
            const damage = projectile.getData('damage');
            enemy.takeDamage(damage);
            
            // Handle pierce
            const pierce = projectile.getData('pierce') || 0;
            const hitCount = (projectile.getData('hitCount') || 0) + 1;
            projectile.setData('hitCount', hitCount);
            
            if (hitCount > pierce) {
                projectile.destroy();
            }
        }
    }

    handleXPCollection(playerSprite, gemSprite) {
        const gem = gemSprite.getData('instance');
        if (gem) {
            this.player.addXP(gem.value);
            gem.collect();
        }
    }

    handlePlayerDamage(playerSprite, enemySprite) {
        const enemy = enemySprite.getData('instance');
        if (enemy && !enemy.isDead) {
            this.player.takeDamage(enemy.damage);
        }
    }

    createHUD() {
        // Create fixed HUD layer
        this.hudContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(100);

        // Padding for safe areas on notched devices (iPhone X, 11, 12, 13, 14, 15, etc.)
        const isIPhone = /iPhone/i.test(navigator.userAgent);
        
        // For ultra-wide aspect ratio, we use percentage-based padding
        // iPhone Dynamic Island in landscape takes about 5% of screen width on each side
        // Extra top padding to avoid being cut off
        const topPad = isIPhone ? 25 : 12;  // More top padding for iPhone
        const sidePad = isIPhone ? Math.floor(CONSTANTS.GAME_WIDTH * 0.05) : 15; // ~63px on 1260
        const bottomPad = isIPhone ? 22 : 18;

        // Timer display (top center)
        this.timerText = this.add.text(CONSTANTS.GAME_WIDTH / 2, topPad, '30:00', {
            font: 'bold 26px monospace',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5, 0);
        this.hudContainer.add(this.timerText);

        // HP Bar (top left - with safe area padding)
        const hpBarBg = this.add.rectangle(sidePad, topPad, 160, 16, 0x440000).setOrigin(0, 0);
        this.hpBar = this.add.rectangle(sidePad, topPad, 160, 16, 0xff4444).setOrigin(0, 0);
        this.hpText = this.add.text(sidePad + 80, topPad + 8, '100/100', {
            font: '10px monospace',
            fill: '#ffffff'
        }).setOrigin(0.5);
        this.hudContainer.add([hpBarBg, this.hpBar, this.hpText]);

        // Level display (top left, below HP)
        this.levelText = this.add.text(sidePad, topPad + 20, 'Level: 1', {
            font: '12px monospace',
            fill: '#00ff88'
        });
        this.hudContainer.add(this.levelText);

        // XP Bar (bottom - with safe area padding)
        const xpBarWidth = CONSTANTS.GAME_WIDTH - (sidePad * 2);
        const xpBarBg = this.add.rectangle(CONSTANTS.GAME_WIDTH / 2, CONSTANTS.GAME_HEIGHT - bottomPad, 
            xpBarWidth, 12, 0x003322).setOrigin(0.5);
        this.xpBar = this.add.rectangle(sidePad, CONSTANTS.GAME_HEIGHT - bottomPad - 6, 0, 12, 0x00ff88).setOrigin(0, 0);
        this.xpBarWidth = xpBarWidth; // Store for updates
        this.hudContainer.add([xpBarBg, this.xpBar]);

        // Kill count (top right - with safe area padding)
        this.killText = this.add.text(CONSTANTS.GAME_WIDTH - sidePad, topPad, 'Kills: 0', {
            font: '12px monospace',
            fill: '#ff6666'
        }).setOrigin(1, 0);
        this.hudContainer.add(this.killText);

        // Weapon display (top right, below kills)
        this.weaponText = this.add.text(CONSTANTS.GAME_WIDTH - sidePad, topPad + 16, '', {
            font: '10px monospace',
            fill: '#9966ff'
        }).setOrigin(1, 0);
        this.hudContainer.add(this.weaponText);
        
        // Store padding values for other uses
        this.hudPadding = { top: topPad, side: sidePad, bottom: bottomPad };
    }

    updateHUD() {
        // Update timer
        const remainingTime = Math.max(0, CONSTANTS.GAME_DURATION - this.gameTime);
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);
        this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        // Flash timer when low
        if (remainingTime < 60000) {
            this.timerText.setFill(remainingTime % 1000 < 500 ? '#ff0000' : '#ffffff');
        }

        // Update HP bar
        const hpPercent = this.player.hp / this.player.maxHp;
        this.hpBar.setScale(hpPercent, 1);
        this.hpText.setText(`${Math.ceil(this.player.hp)}/${this.player.maxHp}`);

        // Update level
        this.levelText.setText(`Level: ${this.player.level}`);

        // Update XP bar
        const xpNeeded = this.player.getXPForNextLevel();
        const xpPercent = xpNeeded > 0 ? this.player.xp / xpNeeded : 1;
        this.xpBar.width = (this.xpBarWidth || (CONSTANTS.GAME_WIDTH - 40)) * xpPercent;

        // Update kills
        this.killText.setText(`Kills: ${this.statsManager.kills}`);

        // Update weapons
        const weaponNames = this.player.weapons.map(w => w.name).join(', ');
        this.weaponText.setText(weaponNames || 'No weapons');
    }

    updateGameTime() {
        if (this.isPaused || this.isGameOver) return;
        
        this.gameTime += 100;
        this.statsManager.timeSurvived = this.gameTime;

        // Check for Death spawn at 30 minutes
        if (this.gameTime >= CONSTANTS.GAME_DURATION && !this.deathSpawned) {
            this.spawnDeath();
        }
    }

    spawnDeath() {
        this.deathSpawned = true;
        
        // Flash warning
        this.cameras.main.flash(1000, 255, 0, 0);
        
        // Show warning text
        const warningText = this.add.text(
            CONSTANTS.GAME_WIDTH / 2, 
            CONSTANTS.GAME_HEIGHT / 2, 
            'DEATH APPROACHES...', 
            {
                font: 'bold 48px monospace',
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setScrollFactor(0).setDepth(150);

        this.tweens.add({
            targets: warningText,
            alpha: 0,
            duration: 2000,
            onComplete: () => warningText.destroy()
        });

        // Spawn Death enemy
        const angle = Math.random() * Math.PI * 2;
        const x = this.player.sprite.x + Math.cos(angle) * CONSTANTS.ENEMY_SPAWN_RADIUS_MIN;
        const y = this.player.sprite.y + Math.sin(angle) * CONSTANTS.ENEMY_SPAWN_RADIUS_MIN;
        
        new Enemy(this, x, y, 'death');
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.physics.pause();
            // Show pause overlay
            this.pauseOverlay = this.add.rectangle(
                CONSTANTS.GAME_WIDTH / 2, 
                CONSTANTS.GAME_HEIGHT / 2, 
                CONSTANTS.GAME_WIDTH, 
                CONSTANTS.GAME_HEIGHT, 
                0x000000, 0.7
            ).setScrollFactor(0).setDepth(200);
            
            this.pauseText = this.add.text(
                CONSTANTS.GAME_WIDTH / 2, 
                CONSTANTS.GAME_HEIGHT / 2, 
                'PAUSED\n\nTap to continue', 
                {
                    font: 'bold 32px monospace',
                    fill: '#ffffff',
                    align: 'center'
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(201);
            
            // Allow tap to unpause on mobile
            this.pauseOverlay.setInteractive();
            this.pauseOverlay.on('pointerdown', () => {
                this.togglePause();
            });
        } else {
            this.physics.resume();
            if (this.pauseOverlay) this.pauseOverlay.destroy();
            if (this.pauseText) this.pauseText.destroy();
        }
    }

    showUpgradeMenu() {
        this.isPaused = true;
        this.physics.pause();
        this.scene.launch('UpgradeScene', { 
            gameScene: this,
            upgradeManager: this.upgradeManager,
            player: this.player
        });
    }

    resumeFromUpgrade() {
        this.isPaused = false;
        this.physics.resume();
    }

    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        this.cameras.main.shake(500, 0.02);
        this.cameras.main.fadeOut(1000, 255, 0, 0);
        
        this.time.delayedCall(1000, () => {
            this.scene.start('GameOverScene', {
                stats: {
                    timeSurvived: this.statsManager.timeSurvived,
                    kills: this.statsManager.kills,
                    level: this.player.level,
                    damageDealt: this.statsManager.damageDealt
                }
            });
        });
    }

    update(time, delta) {
        if (this.isPaused || this.isGameOver) return;

        // Update player with both keyboard and touch input
        this.player.update(time, delta, this.cursors, this.wasd, this.touchInput);

        // Update enemies
        this.enemies.getChildren().forEach(enemySprite => {
            const enemy = enemySprite.getData('instance');
            if (enemy) enemy.update(time, delta);
        });

        // Update wave manager
        this.waveManager.update(time, delta);

        // Collect XP gems when player walks over them
        this.collectNearbyXPGems();

        // Clean up off-screen projectiles
        this.cleanupProjectiles();

        // Update HUD
        this.updateHUD();
    }

    collectNearbyXPGems() {
        // XP gems stay on the ground until player gets close
        // When in pickup range, they fly smoothly towards player
        // Collect when they actually reach the player
        const pickupRadius = CONSTANTS.PLAYER_PICKUP_RADIUS * (1 + this.player.pickupRangeBonus);
        const collectRadius = 15; // Actually collect when this close
        
        this.xpGems.getChildren().forEach(gemSprite => {
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                gemSprite.x, gemSprite.y
            );
            
            // Check if gem is being attracted (flying towards player)
            const isAttracting = gemSprite.getData('attracting');
            
            if (distance < collectRadius) {
                // Close enough - collect the gem
                const gem = gemSprite.getData('instance');
                if (gem) {
                    this.player.addXP(gem.value);
                    gem.collect();
                    // Play pickup sound
                    if (this.soundManager) {
                        this.soundManager.playSound('xpPickup');
                    }
                }
            } else if (distance < pickupRadius || isAttracting) {
                // Within pickup range - start flying towards player
                gemSprite.setData('attracting', true);
                
                const angle = Phaser.Math.Angle.Between(
                    gemSprite.x, gemSprite.y,
                    this.player.sprite.x, this.player.sprite.y
                );
                
                // Speed increases as gem gets closer for smooth acceleration
                const speed = 250 + (1 - distance / pickupRadius) * 150;
                
                if (gemSprite.body) {
                    gemSprite.body.setVelocity(
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed
                    );
                }
            } else {
                // Not in range - stay still
                if (gemSprite.body) {
                    gemSprite.body.setVelocity(0, 0);
                }
                gemSprite.setData('attracting', false);
            }
        });
    }

    cleanupProjectiles() {
        this.projectiles.getChildren().forEach(projectile => {
            const distance = Phaser.Math.Distance.Between(
                this.player.sprite.x, this.player.sprite.y,
                projectile.x, projectile.y
            );
            if (distance > 600) {
                projectile.destroy();
            }
        });
    }
}
