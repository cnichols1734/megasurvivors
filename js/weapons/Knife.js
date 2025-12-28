class Knife extends Weapon {
    constructor(scene, player) {
        super(scene, player, CONSTANTS.WEAPONS.knife);
        
        this.key = 'knife';
        this.projectileCount = 1;
        this.projectileSpeed = CONSTANTS.WEAPONS.knife.baseSpeed;
        this.pierce = CONSTANTS.WEAPONS.knife.basePierce;
    }

    fire(time) {
        const playerX = this.player.sprite.x;
        const playerY = this.player.sprite.y;
        
        // Get facing direction
        const facing = this.player.facing;
        const baseAngle = Math.atan2(facing.y, facing.x);
        
        // Fire projectiles - all aimed same direction, staggered timing like fireball
        for (let i = 0; i < this.projectileCount; i++) {
            // Very small offset so they don't overlap perfectly but still hit same area
            const tinySpread = (i - (this.projectileCount - 1) / 2) * 0.03; // ~2 degrees max
            const angle = baseAngle + tinySpread;
            
            // Stagger the spawn slightly so they look like a burst
            if (i === 0) {
                this.createKnife(playerX, playerY, angle);
            } else {
                this.scene.time.delayedCall(i * 40, () => {
                    if (this.player && this.player.sprite) {
                        this.createKnife(this.player.sprite.x, this.player.sprite.y, angle);
                    }
                });
            }
        }
        
        // Throwing effect
        this.createThrowEffect();
    }

    createKnife(x, y, angle) {
        const speed = this.projectileSpeed;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Create knife sprite
        const knife = this.scene.physics.add.sprite(x, y, 'projectile_knife');
        
        // Add to projectiles group FIRST
        this.scene.projectiles.add(knife);
        
        // Configure physics body
        knife.body.setAllowGravity(false);
        
        // Set data
        knife.setData('weapon', this);
        knife.setData('damage', this.damage);
        knife.setData('pierce', this.pierce);
        knife.setData('hitCount', 0);
        
        // Visual settings
        knife.setDepth(10);
        knife.setScale(1.3);
        knife.setRotation(angle);
        knife.setTint(0xdddddd); // Slight tint
        
        // NOW set velocity (after adding to group)
        knife.body.setVelocity(vx, vy);
        
        // Spinning animation
        this.scene.tweens.add({
            targets: knife,
            angle: knife.angle + 720,
            duration: 800,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Trail effect
        const trailTimer = this.scene.time.addEvent({
            delay: 40,
            repeat: 60,
            callback: () => {
                if (!knife || !knife.active) {
                    trailTimer.remove();
                    return;
                }
                
                const trail = this.scene.add.circle(
                    knife.x,
                    knife.y,
                    4, 0xaaaaaa, 0.5
                ).setDepth(8);
                
                this.scene.tweens.add({
                    targets: trail,
                    scale: 0,
                    alpha: 0,
                    duration: 150,
                    onComplete: () => trail.destroy()
                });
            }
        });
        
        // Auto-destroy after 2.5 seconds
        this.scene.time.delayedCall(2500, () => {
            if (knife && knife.active) knife.destroy();
            trailTimer.remove();
        });
        
        knife.once('destroy', () => {
            trailTimer.remove();
        });
        
        return knife;
    }

    createThrowEffect() {
        const facing = this.player.facing;
        const angle = Math.atan2(facing.y, facing.x);
        
        const slashX = this.player.sprite.x + Math.cos(angle) * 25;
        const slashY = this.player.sprite.y + Math.sin(angle) * 25;
        
        const flash = this.scene.add.circle(slashX, slashY, 10, 0xcccccc, 0.8).setDepth(9);
        
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 100,
            onComplete: () => flash.destroy()
        });
    }
}
