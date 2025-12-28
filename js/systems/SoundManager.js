class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.musicPlaying = false;
        
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Master gains
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3; // Background music volume
            this.musicGain.connect(this.audioContext.destination);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.4; // Sound effects volume
            this.sfxGain.connect(this.audioContext.destination);
        } catch (e) {
            console.warn('Web Audio API not supported');
        }
    }

    resumeAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    // Play a short 8-bit style sound effect
    playSound(type) {
        if (!this.audioContext || this.isMuted) return;
        this.resumeAudio();

        switch(type) {
            case 'shoot':
                this.playShootSound();
                break;
            case 'enemyDeath':
                this.playEnemyDeathSound();
                break;
            case 'playerHit':
                this.playPlayerHitSound();
                break;
            case 'xpPickup':
                this.playXPPickupSound();
                break;
            case 'levelUp':
                this.playLevelUpSound();
                break;
        }
    }

    playShootSound() {
        // Short laser/zap sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playEnemyDeathSound() {
        // Short pop/burst sound
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.15);
        
        gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }

    playPlayerHitSound() {
        // Low thud
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    playXPPickupSound() {
        // Quick high blip
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(900, this.audioContext.currentTime + 0.03);
        
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.06);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.06);
    }

    playLevelUpSound() {
        // Ascending arpeggio
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'square';
            osc.frequency.value = freq;
            
            const startTime = this.audioContext.currentTime + i * 0.08;
            gain.gain.setValueAtTime(0.15, startTime);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(startTime);
            osc.stop(startTime + 0.15);
        });
    }

    // 8-bit style background music
    startMusic() {
        if (!this.audioContext || this.musicPlaying) return;
        this.resumeAudio();
        this.musicPlaying = true;
        
        this.playMusicLoop();
    }

    playMusicLoop() {
        if (!this.musicPlaying) return;
        
        // Simple 8-bit melody pattern
        const melody = [
            { note: 330, duration: 0.2 },  // E4
            { note: 330, duration: 0.2 },
            { note: 392, duration: 0.2 },  // G4
            { note: 440, duration: 0.4 },  // A4
            { note: 392, duration: 0.2 },  // G4
            { note: 330, duration: 0.2 },  // E4
            { note: 294, duration: 0.4 },  // D4
            { note: 262, duration: 0.2 },  // C4
            { note: 294, duration: 0.2 },  // D4
            { note: 330, duration: 0.2 },  // E4
            { note: 392, duration: 0.4 },  // G4
            { note: 330, duration: 0.2 },  // E4
            { note: 294, duration: 0.2 },  // D4
            { note: 262, duration: 0.4 },  // C4
        ];
        
        // Bass line
        const bass = [
            { note: 131, duration: 0.4 },  // C3
            { note: 165, duration: 0.4 },  // E3
            { note: 196, duration: 0.4 },  // G3
            { note: 165, duration: 0.4 },  // E3
            { note: 131, duration: 0.4 },  // C3
            { note: 147, duration: 0.4 },  // D3
            { note: 165, duration: 0.4 },  // E3
            { note: 196, duration: 0.4 },  // G3
        ];
        
        let melodyTime = this.audioContext.currentTime;
        melody.forEach(note => {
            this.playMusicNote(note.note, melodyTime, note.duration, 'square', 0.08);
            melodyTime += note.duration;
        });
        
        let bassTime = this.audioContext.currentTime;
        bass.forEach(note => {
            this.playMusicNote(note.note, bassTime, note.duration, 'triangle', 0.1);
            bassTime += note.duration;
        });
        
        // Calculate total duration and schedule next loop
        const totalDuration = melody.reduce((sum, n) => sum + n.duration, 0);
        
        setTimeout(() => {
            if (this.musicPlaying) {
                this.playMusicLoop();
            }
        }, totalDuration * 1000);
    }

    playMusicNote(frequency, startTime, duration, waveType, volume) {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = waveType;
        osc.frequency.value = frequency;
        
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.setValueAtTime(volume, startTime + duration * 0.8);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        osc.connect(gain);
        gain.connect(this.musicGain);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    stopMusic() {
        this.musicPlaying = false;
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.musicGain.gain.value = 0;
            this.sfxGain.gain.value = 0;
        } else {
            this.musicGain.gain.value = 0.3;
            this.sfxGain.gain.value = 0.4;
        }
        return this.isMuted;
    }
}

