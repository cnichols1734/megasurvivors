class Garlic extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONSTANTS.WEAPONS.garlic);
        
        this.key = 'garlic';
        this.radius = CONSTANTS.WEAPONS.garlic.baseRadius;
        this.knockback = 30;
        
        // Create visual aura
        this.createAura();
    }

    createAura() {
        // Create the aura sprite that follows the player
        this.aura = this.scene.add.sprite(
            this.player.sprite.x,
            this.player.sprite.y,
            'garlic_aura'
        );
        this.aura.setDepth(4);
        this.aura.setAlpha(0.3);
        this.aura.setScale(this.radius / 80); // Scale based on radius
        
        // Pulsing animation
        this.scene.tweens.add({
            targets: this.aura,
            alpha: 0.5,
            scale: this.aura.scaleX * 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    update(time, delta) {
        // Update aura position
        if (this.aura) {
            this.aura.setPosition(this.player.sprite.x, this.player.sprite.y);
            this.aura.setScale(this.radius / 80);
        }
        
        // Call parent update for cooldown-based damage
        super.update(time, delta);
    }

    fire(time) {
        // Damage all enemies within radius
        const playerX = this.player.sprite.x;
        const playerY = this.player.sprite.y;
        
        let hitCount = 0;
        
        this.scene.enemies.getChildren().forEach(enemySprite => {
            const enemy = enemySprite.getData('instance');
            if (enemy && !enemy.isDead) {
                const distance = Phaser.Math.Distance.Between(
                    playerX, playerY,
                    enemySprite.x, enemySprite.y
                );
                
                if (distance <= this.radius) {
                    // Deal damage
                    enemy.takeDamage(this.damage);
                    hitCount++;
                    
                    // Apply knockback
                    if (this.knockback > 0) {
                        const angle = Phaser.Math.Angle.Between(
                            playerX, playerY,
                            enemySprite.x, enemySprite.y
                        );
                        enemy.applyKnockback(angle, this.knockback);
                    }
                }
            }
        });
        
        // Visual pulse effect when hitting enemies
        if (hitCount > 0) {
            this.createHitPulse();
        }
    }

    createHitPulse() {
        const pulse = this.scene.add.circle(
            this.player.sprite.x,
            this.player.sprite.y,
            this.radius * 0.5,
            this.color,
            0.4
        ).setDepth(3);
        
        this.scene.tweens.add({
            targets: pulse,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => pulse.destroy()
        });
    }

    destroy() {
        if (this.aura) {
            this.aura.destroy();
        }
    }
}

