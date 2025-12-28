class MagicWand extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONSTANTS.WEAPONS.magicWand);
        
        this.key = 'magicWand';
        this.projectileCount = 1;
        this.projectileSpeed = CONSTANTS.WEAPONS.magicWand.baseSpeed;
    }

    fire(time) {
        const target = this.findNearestEnemy();
        if (!target) return;
        
        const playerX = this.player.sprite.x;
        const playerY = this.player.sprite.y;
        
        // Calculate angle to target enemy
        const baseAngle = Phaser.Math.Angle.Between(
            playerX, playerY,
            target.x, target.y
        );
        
        // Fire projectiles - all aimed at same target, just slightly staggered timing
        for (let i = 0; i < this.projectileCount; i++) {
            // Very small offset so they don't overlap perfectly but still hit the target
            const tinySpread = (i - (this.projectileCount - 1) / 2) * 0.05; // ~3 degrees max
            const angle = baseAngle + tinySpread;
            
            // Stagger the spawn slightly so they look like a burst
            if (i === 0) {
                this.createFireball(playerX, playerY, angle);
            } else {
                this.scene.time.delayedCall(i * 50, () => {
                    if (this.player && this.player.sprite) {
                        this.createFireball(this.player.sprite.x, this.player.sprite.y, angle);
                    }
                });
            }
        }
        
        // Muzzle flash
        this.createMuzzleFlash();
        
        // Play shoot sound
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('shoot');
        }
    }

    createFireball(x, y, angle) {
        const speed = this.projectileSpeed;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Create fireball sprite
        const fireball = this.scene.physics.add.sprite(x, y, 'projectile_wand');
        
        // Add to projectiles group FIRST
        this.scene.projectiles.add(fireball);
        
        // Configure physics body
        fireball.body.setAllowGravity(false);
        
        // Set data
        fireball.setData('weapon', this);
        fireball.setData('damage', this.damage);
        fireball.setData('pierce', 0);
        
        // Visual settings
        fireball.setDepth(10);
        fireball.setScale(1.8);
        fireball.setRotation(angle);
        
        // NOW set velocity (after adding to group)
        fireball.body.setVelocity(vx, vy);
        
        // Create a bright glow that follows
        const glow = this.scene.add.circle(x, y, 14, 0xff4400, 0.7).setDepth(9);
        
        // Fire trail particles
        const trailTimer = this.scene.time.addEvent({
            delay: 25,
            repeat: 80,
            callback: () => {
                if (!fireball || !fireball.active) {
                    trailTimer.remove();
                    if (glow && glow.active) glow.destroy();
                    return;
                }
                
                // Update glow position
                glow.setPosition(fireball.x, fireball.y);
                
                // Trail particle
                const colors = [0xff6600, 0xff4400, 0xffaa00, 0xff2200, 0xffff00];
                const color = Phaser.Utils.Array.GetRandom(colors);
                const size = Phaser.Math.Between(5, 10);
                
                const trail = this.scene.add.circle(
                    fireball.x + Phaser.Math.Between(-5, 5),
                    fireball.y + Phaser.Math.Between(-5, 5),
                    size, color, 0.9
                ).setDepth(8);
                
                this.scene.tweens.add({
                    targets: trail,
                    scale: 0,
                    alpha: 0,
                    duration: 180,
                    onComplete: () => trail.destroy()
                });
            }
        });
        
        // Auto-destroy after 2.5 seconds
        this.scene.time.delayedCall(2500, () => {
            this.cleanupFireball(fireball, glow, trailTimer);
        });
        
        // Cleanup on destroy
        fireball.once('destroy', () => {
            this.cleanupFireball(null, glow, trailTimer);
        });
        
        return fireball;
    }
    
    cleanupFireball(fireball, glow, trailTimer) {
        if (fireball && fireball.active) fireball.destroy();
        if (glow && glow.active) glow.destroy();
        if (trailTimer) trailTimer.remove();
    }

    createMuzzleFlash() {
        const flash = this.scene.add.circle(
            this.player.sprite.x,
            this.player.sprite.y,
            18, 0xff6600, 0.9
        ).setDepth(11);
        
        this.scene.tweens.add({
            targets: flash,
            scale: 2.5,
            alpha: 0,
            duration: 150,
            onComplete: () => flash.destroy()
        });
    }
}
