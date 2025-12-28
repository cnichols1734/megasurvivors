class XPGem {
    constructor(scene, x, y, type = 'small', value = 1) {
        this.scene = scene;
        this.type = type;
        this.value = value;
        this.isCollected = false;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, `xp_${type}`);
        this.sprite.setData('instance', this);
        this.sprite.setDepth(3);
        
        // Add to XP gems group
        scene.xpGems.add(this.sprite);
        
        // Spawn animation - pop out with slight random offset
        this.sprite.setScale(0);
        const targetScale = type === 'large' ? 1.2 : type === 'medium' ? 1 : 0.8;
        
        // Pop out in random direction
        const popAngle = Math.random() * Math.PI * 2;
        const popDist = Phaser.Math.Between(10, 30);
        const targetX = x + Math.cos(popAngle) * popDist;
        const targetY = y + Math.sin(popAngle) * popDist;
        
        scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            scale: targetScale,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Simple floating animation
        this.floatTween = scene.tweens.add({
            targets: this.sprite,
            y: '+=5',
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Auto-destroy after 30 seconds if not collected (cleanup)
        this.destroyTimer = scene.time.delayedCall(30000, () => {
            if (!this.isCollected) {
                this.destroy();
            }
        });
    }

    getGlowColor() {
        switch (this.type) {
            case 'large': return 0x00ffdd;
            case 'medium': return 0x00ffaa;
            default: return 0x00ff88;
        }
    }

    collect() {
        if (this.isCollected) return;
        this.isCollected = true;
        
        // Stop tweens
        if (this.floatTween) this.floatTween.stop();
        if (this.destroyTimer) this.destroyTimer.remove();
        
        // Quick collection animation
        this.scene.tweens.add({
            targets: this.sprite,
            scale: 0,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                this.destroy();
            }
        });
    }

    destroy() {
        if (this.floatTween) this.floatTween.stop();
        if (this.destroyTimer) this.destroyTimer.remove();
        if (this.sprite && this.sprite.active) {
            this.sprite.destroy();
        }
    }
}
