class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.lastSpawnTime = 0;
        this.spawnRate = CONSTANTS.ENEMY_SPAWN_RATE_BASE;
        this.enemyTypes = ['bat', 'zombie', 'skeleton'];
        this.spawnWeights = {
            bat: 80,
            zombie: 15,
            skeleton: 5
        };

        // Hoard system
        this.hoardActive = false;
        this.hoardStartTime = 0;
        this.hoardMessageShown = false;
        this.hoardMessageStartTime = 0;
    }

    update(time, delta) {
        const gameProgress = this.scene.gameTime / CONSTANTS.GAME_DURATION;
        const playerLevel = this.scene.player ? this.scene.player.level : 1;

        // Check for hoard trigger after level 8
        if (!this.hoardActive && !this.hoardMessageShown && playerLevel >= CONSTANTS.HOARD_TRIGGER_LEVEL) {
            this.startHoardMessage(time);
        }

        // Handle hoard message display
        if (this.hoardMessageShown && !this.hoardActive) {
            if (time - this.hoardMessageStartTime >= CONSTANTS.HOARD_MESSAGE_DURATION) {
                this.hideHoardMessage();
                this.startHoard(time);
            }
        }

        // Check if hoard should end
        if (this.hoardActive && time - this.hoardStartTime >= CONSTANTS.HOARD_DURATION) {
            this.endHoard();
        }

        // Difficulty scaling - GRADUAL increase
        // Level 1-4: Very chill, mostly time-based
        // Level 5-10: Moderate increase
        // Level 10+: Gets challenging
        
        // Time factor (0 to 1 over 30 minutes)
        const timeMultiplier = gameProgress;
        
        // Level factor - very gradual for early levels
        // Level 1-4: almost no impact (0 to 0.1)
        // Level 5-10: moderate (0.1 to 0.3)
        // Level 10+: stronger (0.3+)
        let levelMultiplier = 0;
        if (playerLevel <= 4) {
            levelMultiplier = (playerLevel - 1) * 0.03; // 0, 0.03, 0.06, 0.09
        } else if (playerLevel <= 10) {
            levelMultiplier = 0.09 + (playerLevel - 4) * 0.04; // 0.13 to 0.33
        } else {
            levelMultiplier = 0.33 + (playerLevel - 10) * 0.05; // 0.38+
        }
        
        // Combined difficulty - time is primary factor, level is secondary
        const difficultyFactor = Math.min((timeMultiplier * 0.7) + (levelMultiplier * 0.3), 1);
        
        // Spawn rate: 2000ms down to 300ms (not too crazy fast)
        this.spawnRate = Phaser.Math.Linear(
            CONSTANTS.ENEMY_SPAWN_RATE_BASE,
            300,
            difficultyFactor
        );

        // Update spawn weights based on time (not level)
        this.updateSpawnWeights(gameProgress);

        // Check if it's time to spawn
        if (time - this.lastSpawnTime >= this.spawnRate) {
            this.lastSpawnTime = time;
            
            // Spawn count - gradual increase
            // Early game (level 1-4): 1-2 enemies per spawn
            // Mid game (level 5-10): 2-4 enemies per spawn
            // Late game (level 10+): 3-6 enemies per spawn
            let spawnCount = 1;
            
            if (playerLevel <= 4) {
                spawnCount = 1 + Math.floor(gameProgress * 2); // 1-2
            } else if (playerLevel <= 10) {
                spawnCount = 2 + Math.floor(gameProgress * 3); // 2-4
            } else {
                spawnCount = 3 + Math.floor(gameProgress * 4); // 3-6
            }
            
            // Time also increases spawn count
            spawnCount += Math.floor(gameProgress * 3);
            
            // During hoard, multiply spawn count
            if (this.hoardActive) {
                spawnCount *= CONSTANTS.HOARD_SPAWN_MULTIPLIER;
            }

            // Cap at reasonable amount (higher during hoard)
            const maxEnemies = this.hoardActive ? CONSTANTS.HOARD_MAX_ENEMIES : CONSTANTS.MAX_ENEMIES;
            spawnCount = Math.min(spawnCount, 20); // Allow more per spawn during hoard

            for (let i = 0; i < spawnCount; i++) {
                if (this.scene.enemies.getChildren().length < maxEnemies) {
                    this.spawnEnemy();
                }
            }
        }

        // Despawn enemies that are too far from player
        this.despawnDistantEnemies();
    }

    updateSpawnWeights(gameProgress) {
        // Enemy mix based on TIME only (not player level)
        // This makes progression predictable
        
        if (gameProgress < 0.15) {
            // First 4.5 minutes - very easy, mostly bats
            this.spawnWeights = { bat: 90, zombie: 8, skeleton: 2 };
        } else if (gameProgress < 0.3) {
            // 4.5-9 minutes - introduce more zombies
            this.spawnWeights = { bat: 70, zombie: 25, skeleton: 5 };
        } else if (gameProgress < 0.5) {
            // 9-15 minutes - balanced mix
            this.spawnWeights = { bat: 55, zombie: 30, skeleton: 15 };
        } else if (gameProgress < 0.7) {
            // 15-21 minutes - more dangerous
            this.spawnWeights = { bat: 40, zombie: 35, skeleton: 25 };
        } else if (gameProgress < 0.85) {
            // 21-25.5 minutes - getting tough
            this.spawnWeights = { bat: 30, zombie: 35, skeleton: 35 };
        } else {
            // 25.5-30 minutes - hardest mix before Death
            this.spawnWeights = { bat: 20, zombie: 40, skeleton: 40 };
        }
    }

    getRandomEnemyType() {
        const totalWeight = Object.values(this.spawnWeights).reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        for (const [type, weight] of Object.entries(this.spawnWeights)) {
            random -= weight;
            if (random <= 0) {
                return type;
            }
        }
        
        return 'bat';
    }

    spawnEnemy() {
        const player = this.scene.player;
        if (!player || !player.sprite) return;

        // Calculate spawn position outside of camera view but within spawn radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(
            CONSTANTS.ENEMY_SPAWN_RADIUS_MIN,
            CONSTANTS.ENEMY_SPAWN_RADIUS_MAX
        );

        let x = player.sprite.x + Math.cos(angle) * distance;
        let y = player.sprite.y + Math.sin(angle) * distance;

        // Clamp to world bounds
        x = Phaser.Math.Clamp(x, 50, CONSTANTS.WORLD_WIDTH - 50);
        y = Phaser.Math.Clamp(y, 50, CONSTANTS.WORLD_HEIGHT - 50);

        // Get enemy type based on weights
        const enemyType = this.getRandomEnemyType();

        // Very mild level scaling - only after level 5
        // Level 1-4: no scaling
        // Level 5+: 5% stronger per level above 4
        const playerLevel = player.level;
        let levelScaling = 1;
        if (playerLevel > 4) {
            levelScaling = 1 + (playerLevel - 4) * 0.05;
        }

        // Create enemy with scaled stats
        const enemy = new Enemy(this.scene, x, y, enemyType);
        enemy.hp *= levelScaling;
        enemy.maxHp *= levelScaling;
        enemy.damage *= levelScaling;
    }

    despawnDistantEnemies() {
        const player = this.scene.player;
        if (!player || !player.sprite) return;

        this.scene.enemies.getChildren().forEach(enemySprite => {
            const distance = Phaser.Math.Distance.Between(
                player.sprite.x, player.sprite.y,
                enemySprite.x, enemySprite.y
            );

            if (distance > CONSTANTS.ENEMY_DESPAWN_RADIUS) {
                const enemy = enemySprite.getData('instance');
                // Don't despawn Death
                if (enemy && enemy.type !== 'death') {
                    enemySprite.destroy();
                }
            }
        });
    }

    // Special spawn methods for specific events
    spawnSwarm(count, type = 'bat') {
        const player = this.scene.player;
        if (!player) return;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const x = player.sprite.x + Math.cos(angle) * CONSTANTS.ENEMY_SPAWN_RADIUS_MIN;
            const y = player.sprite.y + Math.sin(angle) * CONSTANTS.ENEMY_SPAWN_RADIUS_MIN;

            new Enemy(this.scene, x, y, type);
        }
    }

    // Hoard system methods
    startHoardMessage(time) {
        this.hoardMessageShown = true;
        this.hoardMessageStartTime = time;

        // Create hoard message overlay
        if (!this.hoardMessage) {
            this.hoardMessage = this.scene.add.text(
                this.scene.cameras.main.centerX,
                this.scene.cameras.main.centerY,
                'HOARD INCOMING',
                {
                    fontSize: '64px',
                    fontFamily: 'Arial Black',
                    color: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 6
                }
            ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        } else {
            this.hoardMessage.setVisible(true);
        }
    }

    hideHoardMessage() {
        if (this.hoardMessage) {
            this.hoardMessage.setVisible(false);
        }
    }

    startHoard(time) {
        this.hoardActive = true;
        this.hoardStartTime = time;
        console.log('Hoard started!');
    }

    endHoard() {
        this.hoardActive = false;
        this.hoardMessageShown = false;
        console.log('Hoard ended!');
    }
}
