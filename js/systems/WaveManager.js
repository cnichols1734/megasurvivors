class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.lastSpawnTime = 0;
        this.spawnRate = CONSTANTS.ENEMY_SPAWN_RATE_BASE;
        this.enemyTypes = ['bat', 'zombie', 'skeleton'];
        this.spawnWeights = {
            bat: 60,
            zombie: 30,
            skeleton: 10
        };
    }

    update(time, delta) {
        const gameProgress = this.scene.gameTime / CONSTANTS.GAME_DURATION;
        const playerLevel = this.scene.player ? this.scene.player.level : 1;
        
        // Spawn rate gets MUCH faster based on both time AND player level
        // Base rate starts at 2000ms, gets down to 100ms at max difficulty
        const timeMultiplier = Math.min(gameProgress * 2, 1); // Time factor (0 to 1)
        const levelMultiplier = Math.min(playerLevel / 10, 1); // Level factor (0 to 1 at level 10+)
        const difficultyFactor = Math.max(timeMultiplier, levelMultiplier); // Use whichever is higher
        
        this.spawnRate = Phaser.Math.Linear(
            CONSTANTS.ENEMY_SPAWN_RATE_BASE,
            100, // Much faster minimum spawn rate
            difficultyFactor
        );

        // Update spawn weights based on time
        this.updateSpawnWeights(gameProgress);

        // Check if it's time to spawn
        if (time - this.lastSpawnTime >= this.spawnRate) {
            this.lastSpawnTime = time;
            
            // Spawn count scales with BOTH time AND level
            // At level 1: 1-2 enemies per spawn
            // At level 5: 3-5 enemies per spawn  
            // At level 10+: 5-10 enemies per spawn
            const baseCount = 1 + Math.floor(gameProgress * 3);
            const levelBonus = Math.floor(playerLevel / 2);
            const spawnCount = Math.min(baseCount + levelBonus, 15); // Cap at 15 per spawn
            
            for (let i = 0; i < spawnCount; i++) {
                if (this.scene.enemies.getChildren().length < CONSTANTS.MAX_ENEMIES) {
                    this.spawnEnemy();
                }
            }
        }

        // Despawn enemies that are too far from player
        this.despawnDistantEnemies();
    }

    updateSpawnWeights(gameProgress) {
        // Early game: mostly bats
        // Mid game: mix of all
        // Late game: more skeletons and zombies
        
        if (gameProgress < 0.1) {
            // First 3 minutes - easy start
            this.spawnWeights = { bat: 80, zombie: 15, skeleton: 5 };
        } else if (gameProgress < 0.25) {
            // 3-7.5 minutes
            this.spawnWeights = { bat: 60, zombie: 30, skeleton: 10 };
        } else if (gameProgress < 0.4) {
            // 7.5-12 minutes
            this.spawnWeights = { bat: 45, zombie: 35, skeleton: 20 };
        } else if (gameProgress < 0.6) {
            // 12-18 minutes
            this.spawnWeights = { bat: 35, zombie: 35, skeleton: 30 };
        } else if (gameProgress < 0.8) {
            // 18-24 minutes
            this.spawnWeights = { bat: 25, zombie: 40, skeleton: 35 };
        } else {
            // 24-30 minutes - harder enemies dominate
            this.spawnWeights = { bat: 15, zombie: 40, skeleton: 45 };
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

        // Scale enemy stats based on player level for extra challenge
        const levelScaling = 1 + (player.level - 1) * 0.1; // 10% stronger per player level

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
}
