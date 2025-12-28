class UpgradeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UpgradeScene' });
    }

    init(data) {
        this.gameScene = data.gameScene;
        this.upgradeManager = data.upgradeManager;
        this.player = data.player;
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Dark overlay
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

        // Title
        this.add.text(width / 2, 60, 'LEVEL UP!', {
            font: 'bold 36px monospace',
            fill: '#ffd700',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.add.text(width / 2, 100, 'Choose an upgrade:', {
            font: '18px monospace',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Get upgrade options
        const upgrades = this.upgradeManager.getUpgradeOptions(this.player, 3);
        
        // Create upgrade cards
        const cardWidth = 180;
        const cardSpacing = 30;
        const totalWidth = (cardWidth * 3) + (cardSpacing * 2);
        const startX = (width - totalWidth) / 2 + cardWidth / 2;

        upgrades.forEach((upgrade, index) => {
            this.createUpgradeCard(
                startX + (index * (cardWidth + cardSpacing)),
                height / 2 + 30,
                upgrade
            );
        });
    }

    createUpgradeCard(x, y, upgrade) {
        const container = this.add.container(x, y);

        // Card background
        const card = this.add.image(0, 0, 'upgrade_card');
        container.add(card);

        // Icon
        const iconKey = upgrade.type === 'weapon' ? `icon_${upgrade.key}` : `icon_${upgrade.key}`;
        if (this.textures.exists(iconKey)) {
            const icon = this.add.image(0, -60, iconKey);
            container.add(icon);
        } else {
            // Fallback colored circle
            const color = upgrade.type === 'weapon' 
                ? CONSTANTS.WEAPONS[upgrade.key]?.color || 0x9966ff
                : CONSTANTS.PASSIVES[upgrade.key]?.color || 0x888888;
            const iconCircle = this.add.circle(0, -60, 24, color);
            container.add(iconCircle);
        }

        // Upgrade level badge
        if (upgrade.level > 0) {
            const levelBadge = this.add.circle(40, -90, 14, 0x00ff88);
            const levelText = this.add.text(40, -90, `${upgrade.level}`, {
                font: 'bold 14px monospace',
                fill: '#000000'
            }).setOrigin(0.5);
            container.add([levelBadge, levelText]);
        }

        // Name
        const name = this.add.text(0, -10, upgrade.name, {
            font: 'bold 14px monospace',
            fill: '#ffffff',
            align: 'center',
            wordWrap: { width: 160 }
        }).setOrigin(0.5);
        container.add(name);

        // Description
        const desc = this.add.text(0, 30, upgrade.description, {
            font: '11px monospace',
            fill: '#aaaaaa',
            align: 'center',
            wordWrap: { width: 160 }
        }).setOrigin(0.5);
        container.add(desc);

        // Type label
        const typeLabel = upgrade.type === 'weapon' ? 'WEAPON' : 'PASSIVE';
        const typeColor = upgrade.type === 'weapon' ? '#9966ff' : '#00ff88';
        const type = this.add.text(0, 70, typeLabel, {
            font: 'bold 10px monospace',
            fill: typeColor
        }).setOrigin(0.5);
        container.add(type);

        // Make interactive
        card.setInteractive({ useHandCursor: true });

        card.on('pointerover', () => {
            container.setScale(1.05);
            card.setTint(0x8a2be2);
        });

        card.on('pointerout', () => {
            container.setScale(1);
            card.clearTint();
        });

        card.on('pointerdown', () => {
            this.selectUpgrade(upgrade);
        });

        // Entrance animation
        container.setScale(0);
        container.setAlpha(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            alpha: 1,
            duration: 300,
            delay: container.x * 0.3,
            ease: 'Back.easeOut'
        });
    }

    selectUpgrade(upgrade) {
        // Apply upgrade
        this.upgradeManager.applyUpgrade(this.player, upgrade);

        // Flash effect
        this.cameras.main.flash(200, 255, 255, 255, false);

        // Close upgrade menu
        this.time.delayedCall(200, () => {
            this.gameScene.resumeFromUpgrade();
            this.scene.stop();
        });
    }
}

