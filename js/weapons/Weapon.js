class Weapon {
    constructor(scene, player, config) {
        this.scene = scene;
        this.player = player;
        
        this.name = config.name || 'Unknown Weapon';
        this.key = config.key || 'unknown';
        this.damage = config.baseDamage || 10;
        this.cooldown = config.baseCooldown || 1000;
        this.color = config.color || 0xffffff;
        
        this.lastFireTime = 0;
        this.isActive = true;
    }

    update(time, delta) {
        if (!this.isActive) return;
        
        // Check if cooldown has passed
        if (time - this.lastFireTime >= this.cooldown) {
            this.fire(time);
            this.lastFireTime = time;
        }
    }

    fire(time) {
        // Override in subclasses
    }

    findNearestEnemy() {
        const enemies = this.scene.enemies.getChildren();
        if (enemies.length === 0) return null;
        
        let nearest = null;
        let nearestDist = Infinity;
        
        enemies.forEach(enemySprite => {
            const enemy = enemySprite.getData('instance');
            if (enemy && !enemy.isDead) {
                const dist = Phaser.Math.Distance.Between(
                    this.player.sprite.x, this.player.sprite.y,
                    enemySprite.x, enemySprite.y
                );
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearest = enemySprite;
                }
            }
        });
        
        return nearest;
    }

    createProjectile(x, y, vx, vy, textureKey) {
        const projectile = this.scene.physics.add.sprite(x, y, textureKey);
        projectile.setData('weapon', this);
        projectile.setData('damage', this.damage);
        projectile.setData('pierce', this.pierce || 0);
        projectile.setDepth(8);
        
        projectile.setVelocity(vx, vy);
        
        // Rotate to face direction
        projectile.setRotation(Math.atan2(vy, vx));
        
        // Add to projectiles group
        this.scene.projectiles.add(projectile);
        
        return projectile;
    }
}

