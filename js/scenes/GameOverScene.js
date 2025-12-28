class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }

    init(data) {
        this.stats = data.stats || {
            timeSurvived: 0,
            kills: 0,
            level: 1,
            damageDealt: 0
        };
    }

    create() {
        const width = CONSTANTS.GAME_WIDTH;
        const height = CONSTANTS.GAME_HEIGHT;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Fade in
        this.cameras.main.fadeIn(1000, 0, 0, 0);

        // Death overlay effect
        this.createDeathParticles();

        // Game Over title
        const title = this.add.text(width / 2, 100, 'GAME OVER', {
            font: 'bold 48px monospace',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Pulsing animation
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Stats display
        const statsY = 200;
        const statsSpacing = 45;

        // Time survived
        const timeSurvived = this.stats.timeSurvived;
        const minutes = Math.floor(timeSurvived / 60000);
        const seconds = Math.floor((timeSurvived % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.createStatLine(width / 2, statsY, 'Time Survived', timeString, '#8a2be2');
        this.createStatLine(width / 2, statsY + statsSpacing, 'Enemies Killed', this.stats.kills.toString(), '#ff4444');
        this.createStatLine(width / 2, statsY + statsSpacing * 2, 'Level Reached', this.stats.level.toString(), '#00ff88');
        this.createStatLine(width / 2, statsY + statsSpacing * 3, 'Damage Dealt', Math.floor(this.stats.damageDealt).toString(), '#ffd700');

        // Rating based on time survived
        const rating = this.getRating(timeSurvived);
        const ratingText = this.add.text(width / 2, statsY + statsSpacing * 4 + 30, rating.text, {
            font: 'bold 24px monospace',
            fill: rating.color
        }).setOrigin(0.5);

        // Retry button
        const retryBtn = this.add.text(width / 2, height - 120, '[ PLAY AGAIN ]', {
            font: 'bold 28px monospace',
            fill: '#00ff88'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        retryBtn.on('pointerover', () => {
            retryBtn.setFill('#ffffff');
            retryBtn.setScale(1.1);
        });

        retryBtn.on('pointerout', () => {
            retryBtn.setFill('#00ff88');
            retryBtn.setScale(1);
        });

        retryBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });

        // Menu button
        const menuBtn = this.add.text(width / 2, height - 70, '[ MAIN MENU ]', {
            font: '20px monospace',
            fill: '#888888'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        menuBtn.on('pointerover', () => {
            menuBtn.setFill('#ffffff');
        });

        menuBtn.on('pointerout', () => {
            menuBtn.setFill('#888888');
        });

        menuBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('MenuScene');
            });
        });
    }

    createStatLine(x, y, label, value, valueColor) {
        this.add.text(x - 20, y, label + ':', {
            font: '18px monospace',
            fill: '#aaaaaa'
        }).setOrigin(1, 0.5);

        this.add.text(x + 20, y, value, {
            font: 'bold 22px monospace',
            fill: valueColor
        }).setOrigin(0, 0.5);
    }

    getRating(timeSurvived) {
        const minutes = timeSurvived / 60000;
        
        if (minutes >= 30) {
            return { text: '★ LEGENDARY SURVIVOR ★', color: '#ffd700' };
        } else if (minutes >= 25) {
            return { text: '★ ELITE SURVIVOR ★', color: '#c0c0c0' };
        } else if (minutes >= 20) {
            return { text: '★ SKILLED SURVIVOR ★', color: '#cd7f32' };
        } else if (minutes >= 15) {
            return { text: 'Experienced Survivor', color: '#00ff88' };
        } else if (minutes >= 10) {
            return { text: 'Survivor', color: '#88ff88' };
        } else if (minutes >= 5) {
            return { text: 'Rookie', color: '#aaaaaa' };
        } else {
            return { text: 'Fresh Meat', color: '#666666' };
        }
    }

    createDeathParticles() {
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, CONSTANTS.GAME_WIDTH);
            const y = Phaser.Math.Between(0, CONSTANTS.GAME_HEIGHT);
            const size = Phaser.Math.Between(2, 8);
            
            const particle = this.add.circle(x, y, size, 0x8a2be2, 0.3);
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(100, 300),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 5000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, CONSTANTS.GAME_WIDTH);
                    particle.y = CONSTANTS.GAME_HEIGHT + 20;
                    particle.alpha = 0.3;
                }
            });
        }
    }
}

