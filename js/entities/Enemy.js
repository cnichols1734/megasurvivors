class Enemy {
    constructor(scene, x, y, type) {
        this.scene = scene;
        this.type = type;
        
        // Get stats from constants
        const stats = CONSTANTS.ENEMIES[type];
        this.name = stats.name;
        this.maxHp = stats.hp;
        this.hp = this.maxHp;
        this.damage = stats.damage;
        this.speed = stats.speed;
        this.xpValue = stats.xp;
        this.color = stats.color;
        this.isInvincible = stats.isInvincible || false;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, `enemy_${type}`);
        this.sprite.setData('instance', this);
        this.sprite.setDepth(5);
        
        // Add to enemies group
        scene.enemies.add(this.sprite);
        
        // State
        this.isDead = false;
        this.knockbackVelocity = { x: 0, y: 0 };
        
        // Special behaviors
        if (type === 'death') {
            this.setupDeathBoss();
        }
        
        // Spawn animation
        this.sprite.setScale(0);
        scene.tweens.add({
            targets: this.sprite,
            scale: 1,
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    setupDeathBoss() {
        // Death is larger and has a menacing aura
        this.sprite.setScale(1.5);
        
        // Create pulsing aura
        this.aura = this.scene.add.circle(
            this.sprite.x, this.sprite.y,
            50, 0xff0000, 0.2
        ).setDepth(4);
        
        this.scene.tweens.add({
            targets: this.aura,
            scale: 1.5,
            alpha: 0,
            duration: 1000,
            repeat: -1
        });
    }

    update(time, delta) {
        if (this.isDead) return;
        
        const player = this.scene.player;
        if (!player || !player.sprite) return;

        // Move toward player
        const angle = Phaser.Math.Angle.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        // Apply knockback
        let vx = Math.cos(angle) * this.speed + this.knockbackVelocity.x;
        let vy = Math.sin(angle) * this.speed + this.knockbackVelocity.y;

        this.sprite.setVelocity(vx, vy);
        
        // Decay knockback
        this.knockbackVelocity.x *= 0.9;
        this.knockbackVelocity.y *= 0.9;

        // Flip sprite based on direction
        if (player.sprite.x < this.sprite.x) {
            this.sprite.setFlipX(true);
        } else {
            this.sprite.setFlipX(false);
        }

        // Update death aura position
        if (this.aura) {
            this.aura.setPosition(this.sprite.x, this.sprite.y);
        }
    }

    takeDamage(amount) {
        if (this.isDead || this.isInvincible) return;

        const player = this.scene.player;
        const actualDamage = player ? player.getDamage(amount) : amount;
        
        this.hp -= actualDamage;
        this.scene.statsManager.addDamageDealt(actualDamage);
        
        // Visual feedback
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            if (this.sprite && this.sprite.active) {
                this.sprite.clearTint();
            }
        });

        // Show damage number
        this.showDamageNumber(actualDamage);
        
        // Apply knockback
        if (player) {
            const angle = Phaser.Math.Angle.Between(
                player.sprite.x, player.sprite.y,
                this.sprite.x, this.sprite.y
            );
            this.knockbackVelocity.x = Math.cos(angle) * 100;
            this.knockbackVelocity.y = Math.sin(angle) * 100;
        }
        
        if (this.hp <= 0) {
            this.die();
        }
    }

    showDamageNumber(damage) {
        const text = this.scene.add.text(
            this.sprite.x + Phaser.Math.Between(-10, 10),
            this.sprite.y - 15,
            Math.ceil(damage).toString(),
            {
                font: 'bold 12px monospace',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setDepth(100);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 25,
            alpha: 0,
            duration: 600,
            onComplete: () => text.destroy()
        });
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        
        // Play death sound
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('enemyDeath');
        }
        
        // Track kill
        this.scene.statsManager.addKill(this.type);
        
        // Drop XP gem
        this.dropXP();
        
        // Death effect
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 0,
            alpha: 0,
            duration: 200,
            onComplete: () => {
                if (this.aura) this.aura.destroy();
                this.sprite.destroy();
            }
        });
        
        // Particle burst
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI * 2 / 6) * i;
            const particle = this.scene.add.circle(
                this.sprite.x, this.sprite.y,
                4, this.color
            ).setDepth(100);
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 30,
                y: particle.y + Math.sin(angle) * 30,
                alpha: 0,
                duration: 300,
                onComplete: () => particle.destroy()
            });
        }
    }

    dropXP() {
        // Determine gem size based on XP value
        let gemType = 'small';
        if (this.xpValue >= 10) {
            gemType = 'large';
        } else if (this.xpValue >= 3) {
            gemType = 'medium';
        }
        
        new XPGem(this.scene, this.sprite.x, this.sprite.y, gemType, this.xpValue);
    }

    applyKnockback(angle, force) {
        this.knockbackVelocity.x = Math.cos(angle) * force;
        this.knockbackVelocity.y = Math.sin(angle) * force;
    }
}

