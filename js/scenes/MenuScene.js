class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

        // Animated background particles
        this.createBackgroundParticles();

        // Title
        const title = this.add.text(width / 2, height / 3, 'MEGA\nSURVIVORS', {
            font: 'bold 56px monospace',
            fill: '#8a2be2',
            align: 'center',
            stroke: '#2a1a4a',
            strokeThickness: 8
        }).setOrigin(0.5);

        // Pulsing animation for title
        this.tweens.add({
            targets: title,
            scale: 1.05,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Subtitle
        this.add.text(width / 2, height / 2 + 20, 'Survive the horde for 30 minutes...', {
            font: '16px monospace',
            fill: '#aaaaaa'
        }).setOrigin(0.5);

        // Start button
        const startBtn = this.add.text(width / 2, height / 2 + 100, '[ START GAME ]', {
            font: 'bold 28px monospace',
            fill: '#00ff88'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        startBtn.on('pointerover', () => {
            startBtn.setFill('#ffffff');
            startBtn.setScale(1.1);
        });

        startBtn.on('pointerout', () => {
            startBtn.setFill('#00ff88');
            startBtn.setScale(1);
        });

        startBtn.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.time.delayedCall(500, () => {
                this.scene.start('GameScene');
            });
        });

        // Controls info - detect if on mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            this.add.text(width / 2, height - 80, 'Touch & drag anywhere to move', {
                font: '14px monospace',
                fill: '#666666'
            }).setOrigin(0.5);
        } else {
            this.add.text(width / 2, height - 80, 'WASD or Arrow Keys to move', {
                font: '14px monospace',
                fill: '#666666'
            }).setOrigin(0.5);
        }

        this.add.text(width / 2, height - 50, 'Weapons fire automatically!', {
            font: '14px monospace',
            fill: '#666666'
        }).setOrigin(0.5);

        // Fade in
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    createBackgroundParticles() {
        // Create floating particles in background
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, this.cameras.main.width);
            const y = Phaser.Math.Between(0, this.cameras.main.height);
            const size = Phaser.Math.Between(2, 6);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
            
            const particle = this.add.circle(x, y, size, 0x8a2be2, alpha);
            
            this.tweens.add({
                targets: particle,
                y: y - Phaser.Math.Between(50, 150),
                alpha: 0,
                duration: Phaser.Math.Between(3000, 6000),
                repeat: -1,
                onRepeat: () => {
                    particle.x = Phaser.Math.Between(0, this.cameras.main.width);
                    particle.y = this.cameras.main.height + 20;
                    particle.alpha = alpha;
                }
            });
        }
    }
}

