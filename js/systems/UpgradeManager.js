class UpgradeManager {
    constructor(scene) {
        this.scene = scene;
        
        // Define all available upgrades
        this.weaponUpgrades = {
            magicWand: {
                name: 'Magic Wand',
                key: 'magicWand',
                type: 'weapon',
                maxLevel: 8,
                descriptions: [
                    'Fire magic projectiles at enemies',
                    '+1 projectile',
                    '+20% damage',
                    '+1 projectile',
                    '+20% cooldown reduction',
                    '+1 projectile',
                    '+30% damage',
                    '+2 projectiles'
                ]
            },
            garlic: {
                name: 'Garlic',
                key: 'garlic',
                type: 'weapon',
                maxLevel: 8,
                descriptions: [
                    'Damages nearby enemies',
                    '+20% radius',
                    '+25% damage',
                    '+20% radius',
                    '+15% knockback',
                    '+30% damage',
                    '+25% radius',
                    '+50% damage'
                ]
            },
            knife: {
                name: 'Knife',
                key: 'knife',
                type: 'weapon',
                maxLevel: 8,
                descriptions: [
                    'Throws knives in facing direction',
                    '+1 projectile',
                    '+1 pierce',
                    '+20% damage',
                    '+1 projectile',
                    '+1 pierce',
                    '+30% damage',
                    '+2 projectiles'
                ]
            }
        };

        this.passiveUpgrades = {
            spinach: {
                name: 'Spinach',
                key: 'spinach',
                type: 'passive',
                maxLevel: 5,
                descriptions: [
                    '+10% damage',
                    '+10% damage',
                    '+10% damage',
                    '+10% damage',
                    '+10% damage'
                ]
            },
            armor: {
                name: 'Armor',
                key: 'armor',
                type: 'passive',
                maxLevel: 5,
                descriptions: [
                    '-5% damage taken',
                    '-5% damage taken',
                    '-5% damage taken',
                    '-5% damage taken',
                    '-5% damage taken'
                ]
            },
            wings: {
                name: 'Wings',
                key: 'wings',
                type: 'passive',
                maxLevel: 5,
                descriptions: [
                    '+10% movement speed',
                    '+10% movement speed',
                    '+10% movement speed',
                    '+10% movement speed',
                    '+10% movement speed'
                ]
            }
        };
    }

    getUpgradeOptions(player, count = 3) {
        const options = [];
        const allUpgrades = [];

        // Add weapon upgrades
        for (const [key, upgrade] of Object.entries(this.weaponUpgrades)) {
            const currentLevel = player.getWeaponLevel(key);
            if (currentLevel < upgrade.maxLevel) {
                allUpgrades.push({
                    ...upgrade,
                    level: currentLevel,
                    description: upgrade.descriptions[currentLevel] || upgrade.descriptions[0]
                });
            }
        }

        // Add passive upgrades
        for (const [key, upgrade] of Object.entries(this.passiveUpgrades)) {
            const currentLevel = player.getPassiveLevel(key);
            if (currentLevel < upgrade.maxLevel) {
                allUpgrades.push({
                    ...upgrade,
                    level: currentLevel,
                    description: upgrade.descriptions[currentLevel] || upgrade.descriptions[0]
                });
            }
        }

        // Shuffle and pick random options
        Phaser.Utils.Array.Shuffle(allUpgrades);
        
        for (let i = 0; i < Math.min(count, allUpgrades.length); i++) {
            options.push(allUpgrades[i]);
        }

        // If we don't have enough options, add some generic stat boosts
        while (options.length < count) {
            options.push({
                name: 'Health Boost',
                key: 'healthBoost',
                type: 'passive',
                level: 0,
                maxLevel: 99,
                description: '+10 max HP'
            });
        }

        return options;
    }

    applyUpgrade(player, upgrade) {
        if (upgrade.type === 'weapon') {
            this.applyWeaponUpgrade(player, upgrade);
        } else {
            this.applyPassiveUpgrade(player, upgrade);
        }
    }

    applyWeaponUpgrade(player, upgrade) {
        const currentLevel = player.getWeaponLevel(upgrade.key);
        
        if (currentLevel === 0) {
            // Add new weapon
            player.addWeapon(upgrade.key);
        } else {
            // Upgrade existing weapon
            const weapon = player.getWeapon(upgrade.key);
            if (weapon) {
                this.upgradeWeaponStats(weapon, upgrade.key, currentLevel + 1);
            }
        }
        
        player.setWeaponLevel(upgrade.key, currentLevel + 1);
    }

    upgradeWeaponStats(weapon, key, level) {
        switch (key) {
            case 'magicWand':
                if (level === 2 || level === 4 || level === 6) weapon.projectileCount++;
                if (level === 3 || level === 7) weapon.damage *= 1.2;
                if (level === 5) weapon.cooldown *= 0.8;
                if (level === 8) weapon.projectileCount += 2;
                break;
                
            case 'garlic':
                if (level === 2 || level === 4 || level === 7) weapon.radius *= 1.2;
                if (level === 3 || level === 6 || level === 8) weapon.damage *= 1.25;
                if (level === 5) weapon.knockback = (weapon.knockback || 0) + 50;
                break;
                
            case 'knife':
                if (level === 2 || level === 5) weapon.projectileCount++;
                if (level === 3 || level === 6) weapon.pierce++;
                if (level === 4 || level === 7) weapon.damage *= 1.2;
                if (level === 8) weapon.projectileCount += 2;
                break;
        }
    }

    applyPassiveUpgrade(player, upgrade) {
        const currentLevel = player.getPassiveLevel(upgrade.key);
        
        switch (upgrade.key) {
            case 'spinach':
                player.damageMultiplier += 0.1;
                break;
            case 'armor':
                player.damageReduction += 0.05;
                break;
            case 'wings':
                player.speedMultiplier += 0.1;
                break;
            case 'healthBoost':
                player.maxHp += 10;
                player.hp = Math.min(player.hp + 10, player.maxHp);
                break;
        }
        
        player.setPassiveLevel(upgrade.key, currentLevel + 1);
    }
}

