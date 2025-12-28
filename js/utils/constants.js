// Game Constants - Easily tweakable for balancing
const CONSTANTS = {
    // Game Settings - Ultra-wide 21:9 aspect ratio for modern phones
    GAME_WIDTH: 1260,
    GAME_HEIGHT: 540,
    WORLD_WIDTH: 2400,
    WORLD_HEIGHT: 2400,
    GAME_DURATION: 30 * 60 * 1000, // 30 minutes in ms
    
    // Player Settings
    PLAYER_BASE_SPEED: 150,
    PLAYER_BASE_HP: 100,
    PLAYER_HITBOX_RADIUS: 12,
    PLAYER_PICKUP_RADIUS: 50,  // Range to trigger XP attraction
    PLAYER_INVINCIBILITY_TIME: 1000, // ms after taking damage
    
    // XP and Leveling
    XP_TO_LEVEL: [15, 25, 40, 60, 80, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
    XP_GEM_VALUES: {
        small: 1,
        medium: 2.5,
        large: 10
    },
    
    // Enemy Settings
    ENEMY_SPAWN_RADIUS_MIN: 400,
    ENEMY_SPAWN_RADIUS_MAX: 500,
    ENEMY_DESPAWN_RADIUS: 700,
    ENEMY_SPAWN_RATE_BASE: 2000, // ms between spawns
    ENEMY_SPAWN_RATE_MIN: 200,   // fastest spawn rate
    MAX_ENEMIES: 300,

    // Hoard Event Settings
    HOARD_TRIGGER_LEVEL: 8, // First hoard at level 8
    HOARD_LEVEL_INTERVAL: 6, // Hoard every 6 levels (8, 14, 20, 26, etc.)
    HOARD_MESSAGE_DURATION: 2000, // 2 seconds
    HOARD_DURATION: 30000, // 30 seconds
    HOARD_SPAWN_MULTIPLIER: 5, // 5x more enemies during hoard
    HOARD_MAX_ENEMIES: 500, // Allow more enemies during hoard
    
    // Enemy Types
    ENEMIES: {
        bat: {
            name: 'Bat',
            hp: 5,
            damage: 5,
            speed: 100,
            xp: 1,
            color: 0x8B4513
        },
        zombie: {
            name: 'Zombie',
            hp: 20,
            damage: 10,
            speed: 40,
            xp: 3,
            color: 0x228B22
        },
        skeleton: {
            name: 'Skeleton',
            hp: 15,
            damage: 8,
            speed: 70,
            xp: 5,
            color: 0xF5F5DC
        },
        death: {
            name: 'Death',
            hp: 999999,
            damage: 9999,
            speed: 80,
            xp: 0,
            color: 0x1a0a2e,
            isInvincible: true
        }
    },
    
    // Weapon Definitions
    WEAPONS: {
        magicWand: {
            name: 'Magic Wand',
            description: 'Shoots fire at nearest enemy',
            baseDamage: 10,
            baseCooldown: 1200,
            baseProjectiles: 1,
            baseSpeed: 350,
            color: 0xff6600
        },
        garlic: {
            name: 'Garlic',
            description: 'Damages nearby enemies',
            baseDamage: 5,
            baseCooldown: 500,
            baseRadius: 80,
            color: 0xf5f5dc
        },
        knife: {
            name: 'Knife',
            description: 'Fires in facing direction',
            baseDamage: 8,
            baseCooldown: 800,
            baseProjectiles: 1,
            baseSpeed: 400,
            basePierce: 1,
            color: 0xc0c0c0
        }
    },
    
    // Passive Items
    PASSIVES: {
        spinach: {
            name: 'Spinach',
            description: '+10% damage',
            effect: 'damage',
            value: 0.1,
            color: 0x228B22
        },
        armor: {
            name: 'Armor',
            description: '-5% damage taken',
            effect: 'damageReduction',
            value: 0.05,
            color: 0x808080
        },
        wings: {
            name: 'Wings',
            description: '+10% move speed',
            effect: 'speed',
            value: 0.1,
            color: 0x87CEEB
        }
    },
    
    // Colors
    COLORS: {
        background: 0x1a0a2e,
        grass: 0x2d5a27,
        uiBackground: 0x1a1a2e,
        uiText: 0xffffff,
        xpBar: 0x00ff88,
        hpBar: 0xff4444,
        hpBarBg: 0x440000
    }
};

