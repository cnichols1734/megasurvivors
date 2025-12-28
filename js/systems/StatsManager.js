class StatsManager {
    constructor(scene) {
        this.scene = scene;
        this.reset();
    }

    reset() {
        this.kills = 0;
        this.timeSurvived = 0;
        this.damageDealt = 0;
        this.damageTaken = 0;
        this.xpCollected = 0;
        this.highestLevel = 1;
        this.weaponsAcquired = [];
    }

    addKill(enemyType) {
        this.kills++;
    }

    addDamageDealt(amount) {
        this.damageDealt += amount;
    }

    addDamageTaken(amount) {
        this.damageTaken += amount;
    }

    addXP(amount) {
        this.xpCollected += amount;
    }

    updateLevel(level) {
        if (level > this.highestLevel) {
            this.highestLevel = level;
        }
    }

    addWeapon(weaponName) {
        if (!this.weaponsAcquired.includes(weaponName)) {
            this.weaponsAcquired.push(weaponName);
        }
    }

    getStats() {
        return {
            kills: this.kills,
            timeSurvived: this.timeSurvived,
            damageDealt: this.damageDealt,
            damageTaken: this.damageTaken,
            xpCollected: this.xpCollected,
            highestLevel: this.highestLevel,
            weaponsAcquired: [...this.weaponsAcquired]
        };
    }
}

