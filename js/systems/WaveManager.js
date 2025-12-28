class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.lastSpawnTime = 0;
        this.spawnRate = CONSTANTS.ENEMY_SPAWN_RATE_BASE;
        this.enemyTypes = ['bat', 'zombie', 'skeleton', 'ghost', 'mummy', 'werewolf'];
        this.spawnWeights = {
            bat: 80,
            zombie: 15,
            skeleton: 5,
            ghost: 0,
            mummy: 0,
            werewolf: 0
        };

        // Hoard system
        this.hoardActive = false;
        this.hoardStartTime = 0;
        this.hoardMessageShown = false;
        this.hoardMessageStartTime = 0;
        this.lastHoardLevel = 0; // Track which hoard levels have triggered
    }

    update(time, delta) {
        const gameProgress = this.scene.gameTime / CONSTANTS.GAME_DURATION;
        const playerLevel = this.scene.player ? this.scene.player.level : 1;

        // Check for hoard trigger every 6 levels starting at level 8 (8, 14, 20, 26, etc.)
        const hoardInterval = CONSTANTS.HOARD_LEVEL_INTERVAL;
        const firstHoardLevel = CONSTANTS.HOARD_TRIGGER_LEVEL;
        
        // Calculate which hoard number we should be at based on current level
        // Level 8 = hoard 1, level 14 = hoard 2, level 20 = hoard 3, etc.
        let expectedHoardCount = 0;
        if (playerLevel >= firstHoardLevel) {
            expectedHoardCount = Math.floor((playerLevel - firstHoardLevel) / hoardInterval) + 1;
        }
        
        // Trigger hoard if we haven't triggered this one yet
        if (!this.hoardActive && !this.hoardMessageShown && expectedHoardCount > this.lastHoardLevel) {
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
            
            // Spawn count - scales with both level and time
            // Early game (level 1-4): 1-3 enemies per spawn
            // Mid game (level 5-10): 2-5 enemies per spawn
            // Late game (level 10-15): 4-8 enemies per spawn
            // End game (level 15+): 5-10 enemies per spawn
            let spawnCount = 1;
            
            if (playerLevel <= 4) {
                spawnCount = 1 + Math.floor(gameProgress * 2); // 1-3
            } else if (playerLevel <= 10) {
                spawnCount = 2 + Math.floor(gameProgress * 3); // 2-5
            } else if (playerLevel <= 15) {
                spawnCount = 4 + Math.floor(gameProgress * 4); // 4-8
            } else {
                spawnCount = 5 + Math.floor(gameProgress * 5); // 5-10
            }
            
            // Time also increases spawn count (more pressure over time)
            spawnCount += Math.floor(gameProgress * 4);
            
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
        // Enemy mix based on TIME - new enemies introduced progressively
        // Ghost appears at ~10 min, Mummy at ~15 min, Werewolf at ~20 min
        
        if (gameProgress < 0.15) {
            // First 4.5 minutes - very easy, mostly bats
            this.spawnWeights = { bat: 90, zombie: 8, skeleton: 2, ghost: 0, mummy: 0, werewolf: 0 };
        } else if (gameProgress < 0.33) {
            // 4.5-10 minutes - introduce more zombies and skeletons
            this.spawnWeights = { bat: 65, zombie: 25, skeleton: 10, ghost: 0, mummy: 0, werewolf: 0 };
        } else if (gameProgress < 0.5) {
            // 10-15 minutes - GHOSTS appear! Fast and spooky
            this.spawnWeights = { bat: 45, zombie: 25, skeleton: 15, ghost: 15, mummy: 0, werewolf: 0 };
        } else if (gameProgress < 0.67) {
            // 15-20 minutes - MUMMIES appear! Tanky threats
            this.spawnWeights = { bat: 30, zombie: 25, skeleton: 15, ghost: 15, mummy: 15, werewolf: 0 };
        } else if (gameProgress < 0.83) {
            // 20-25 minutes - WEREWOLVES appear! Deadly hunters
            this.spawnWeights = { bat: 20, zombie: 20, skeleton: 15, ghost: 15, mummy: 15, werewolf: 15 };
        } else {
            // 25-30 minutes - hardest mix before Death, heavy on dangerous enemies
            this.spawnWeights = { bat: 10, zombie: 15, skeleton: 15, ghost: 20, mummy: 20, werewolf: 20 };
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

        // Enemy scaling to keep up with player upgrades
        // Level 1-4: no scaling (early game is chill)
        // Level 5-10: 8% stronger per level (moderate scaling)
        // Level 10-15: 10% stronger per level (challenging)
        // Level 15+: 12% stronger per level (late game threat)
        const playerLevel = player.level;
        const gameProgress = this.scene.gameTime / CONSTANTS.GAME_DURATION;
        
        let levelScaling = 1;
        if (playerLevel > 4 && playerLevel <= 10) {
            levelScaling = 1 + (playerLevel - 4) * 0.08;
        } else if (playerLevel > 10 && playerLevel <= 15) {
            levelScaling = 1.48 + (playerLevel - 10) * 0.10;
        } else if (playerLevel > 15) {
            levelScaling = 1.98 + (playerLevel - 15) * 0.12;
        }
        
        // Time-based scaling (enemies get 50% stronger over 30 minutes)
        const timeScaling = 1 + (gameProgress * 0.5);
        
        // Combined scaling
        const totalScaling = levelScaling * timeScaling;

        // Create enemy with scaled stats
        const enemy = new Enemy(this.scene, x, y, enemyType);
        enemy.hp *= totalScaling;
        enemy.maxHp *= totalScaling;
        enemy.damage *= totalScaling;
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
                'HOARD INCOMING!',
                {
                    font: 'bold 48px monospace',
                    fill: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 4
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
        this.lastHoardLevel++; // Increment so next hoard can trigger at next interval
        console.log('Hoard ended!');
    }
}
