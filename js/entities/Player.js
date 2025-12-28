class Player {
    constructor(scene, x, y) {
        this.scene = scene;
        
        // Create sprite
        this.sprite = scene.physics.add.sprite(x, y, 'player');
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setDepth(10);
        this.sprite.setData('instance', this);
        
        // Stats
        this.maxHp = CONSTANTS.PLAYER_BASE_HP;
        this.hp = this.maxHp;
        this.baseSpeed = CONSTANTS.PLAYER_BASE_SPEED;
        this.xp = 0;
        this.level = 1;
        
        // Stat multipliers
        this.damageMultiplier = 1;
        this.damageReduction = 0;
        this.speedMultiplier = 1;
        this.pickupRangeBonus = 0;
        
        // Weapons and passives
        this.weapons = [];
        this.weaponLevels = {};
        this.passiveLevels = {};
        
        // Facing direction (for knife and other directional weapons)
        this.facing = { x: 1, y: 0 };
        
        // Invincibility after damage
        this.isInvincible = false;
        this.invincibilityTime = CONSTANTS.PLAYER_INVINCIBILITY_TIME;
        
        // Visual effects
        this.createShadow();
    }

    createShadow() {
        this.shadow = this.scene.add.ellipse(
            this.sprite.x, 
            this.sprite.y + 12, 
            24, 12, 
            0x000000, 0.3
        );
        this.shadow.setDepth(9);
    }

    update(time, delta, cursors, wasd, touchInput) {
        // Handle movement (keyboard or touch)
        this.handleMovement(cursors, wasd, touchInput);
        
        // Update weapons
        this.weapons.forEach(weapon => weapon.update(time, delta));
        
        // Update shadow position
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 12);
        
        // Flash when invincible
        if (this.isInvincible) {
            this.sprite.setAlpha(Math.sin(time * 0.02) * 0.3 + 0.7);
        } else {
            this.sprite.setAlpha(1);
        }
    }

    handleMovement(cursors, wasd, touchInput) {
        const speed = this.baseSpeed * this.speedMultiplier;
        let vx = 0;
        let vy = 0;

        // Check for touch/virtual joystick input first
        if (touchInput && touchInput.isActive) {
            vx = touchInput.vectorX;
            vy = touchInput.vectorY;
        } else {
            // Keyboard input - Horizontal movement
            if (cursors.left.isDown || wasd.left.isDown) {
                vx = -1;
            } else if (cursors.right.isDown || wasd.right.isDown) {
                vx = 1;
            }

            // Keyboard input - Vertical movement
            if (cursors.up.isDown || wasd.up.isDown) {
                vy = -1;
            } else if (cursors.down.isDown || wasd.down.isDown) {
                vy = 1;
            }

            // Normalize diagonal movement for keyboard
            if (vx !== 0 && vy !== 0) {
                const factor = 1 / Math.sqrt(2);
                vx *= factor;
                vy *= factor;
            }
        }

        // Apply velocity
        this.sprite.setVelocity(vx * speed, vy * speed);

        // Update facing direction if moving
        if (vx !== 0 || vy !== 0) {
            this.facing = { x: vx, y: vy };
            
            // Change sprite texture based on direction
            if (vx < 0) {
                this.sprite.setTexture('player_left');
            } else if (vx > 0) {
                this.sprite.setTexture('player_right');
            }
        }
    }

    takeDamage(amount) {
        if (this.isInvincible) return;
        
        // Play hit sound
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('playerHit');
        }
        
        // Apply damage reduction
        const actualDamage = amount * (1 - Math.min(this.damageReduction, 0.75));
        this.hp -= actualDamage;
        
        // Track stats
        this.scene.statsManager.addDamageTaken(actualDamage);
        
        // Visual feedback
        this.scene.cameras.main.shake(100, 0.01);
        this.sprite.setTint(0xff0000);
        this.scene.time.delayedCall(100, () => {
            this.sprite.clearTint();
        });

        // Create damage number
        this.showDamageNumber(actualDamage);
        
        // Start invincibility
        this.isInvincible = true;
        this.scene.time.delayedCall(this.invincibilityTime, () => {
            this.isInvincible = false;
        });
        
        // Check for death
        if (this.hp <= 0) {
            this.hp = 0;
            this.die();
        }
    }

    showDamageNumber(damage) {
        const text = this.scene.add.text(
            this.sprite.x + Phaser.Math.Between(-20, 20),
            this.sprite.y - 20,
            `-${Math.ceil(damage)}`,
            {
                font: 'bold 16px monospace',
                fill: '#ff4444',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setDepth(100);

        this.scene.tweens.add({
            targets: text,
            y: text.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => text.destroy()
        });
    }

    addXP(amount) {
        this.xp += amount;
        this.scene.statsManager.addXP(amount);
        
        // Check for level up
        const xpNeeded = this.getXPForNextLevel();
        if (this.xp >= xpNeeded) {
            this.levelUp();
        }
    }

    getXPForNextLevel() {
        const levelIndex = Math.min(this.level - 1, CONSTANTS.XP_TO_LEVEL.length - 1);
        return CONSTANTS.XP_TO_LEVEL[levelIndex];
    }

    levelUp() {
        this.xp -= this.getXPForNextLevel();
        this.level++;
        this.scene.statsManager.updateLevel(this.level);
        
        // Play level up sound
        if (this.scene.soundManager) {
            this.scene.soundManager.playSound('levelUp');
        }
        
        // Visual effect
        this.scene.cameras.main.flash(200, 255, 255, 100);
        
        // Create level up particles
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i;
            const particle = this.scene.add.circle(
                this.sprite.x + Math.cos(angle) * 20,
                this.sprite.y + Math.sin(angle) * 20,
                6, 0x00ff88
            ).setDepth(100);
            
            this.scene.tweens.add({
                targets: particle,
                x: particle.x + Math.cos(angle) * 40,
                y: particle.y + Math.sin(angle) * 40,
                alpha: 0,
                scale: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }

        // Show level up text
        const levelText = this.scene.add.text(
            this.sprite.x,
            this.sprite.y - 40,
            'LEVEL UP!',
            {
                font: 'bold 20px monospace',
                fill: '#00ff88',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(100);

        this.scene.tweens.add({
            targets: levelText,
            y: levelText.y - 30,
            alpha: 0,
            duration: 1000,
            onComplete: () => levelText.destroy()
        });

        // Show upgrade menu
        this.scene.showUpgradeMenu();
    }

    die() {
        this.scene.gameOver();
    }

    // Weapon management
    addWeapon(weaponKey) {
        let weapon;
        
        switch (weaponKey) {
            case 'magicWand':
                weapon = new MagicWand(this.scene, this);
                break;
            case 'garlic':
                weapon = new Garlic(this.scene, this);
                break;
            case 'knife':
                weapon = new Knife(this.scene, this);
                break;
            default:
                console.warn('Unknown weapon:', weaponKey);
                return;
        }
        
        this.weapons.push(weapon);
        this.weaponLevels[weaponKey] = 1;
        this.scene.statsManager.addWeapon(weapon.name);
    }

    getWeapon(weaponKey) {
        return this.weapons.find(w => w.key === weaponKey);
    }

    getWeaponLevel(weaponKey) {
        return this.weaponLevels[weaponKey] || 0;
    }

    setWeaponLevel(weaponKey, level) {
        this.weaponLevels[weaponKey] = level;
    }

    getPassiveLevel(passiveKey) {
        return this.passiveLevels[passiveKey] || 0;
    }

    setPassiveLevel(passiveKey, level) {
        this.passiveLevels[passiveKey] = level;
    }

    // Get calculated damage with multipliers
    getDamage(baseDamage) {
        return baseDamage * this.damageMultiplier;
    }
}

