async function initGame() {
    gameData = await fetch('gameData.json').then(r => r.json());
    races = gameData.races;
    zones = gameData.zones;
    upgradeCaps = gameData.upgradeCaps;

    loadGame();
    saveGame();
    calculateMaxEnergy();
    updateDisplay();
    setInterval(() => {
        if (game.wielder.currentLife < game.wielder.currentStats.endurance * 5) {
                let regenRate = 1; // Base regen
                if (game.currentAction === 'resting') {
                    regenRate += 4; // Resting bonus
                }
                game.wielder.currentLife = Math.min(
                    game.wielder.currentLife + regenRate,
                    getEffectiveStats().endurance * 5
                );
                updateHealthBar();
                console.log(`Health regenerated: +${regenRate} HP (Base: 1, Resting: ${game.currentAction === 'resting' ? 4 : 0})`);
            }
        if (game.currentAction === 'training') {
            game.wielder.exp += 5;
            if (game.wielder.exp >= 100 * game.wielder.level) {
                game.wielder.exp -= 100 * game.wielder.level;
                game.wielder.level++;
                if (game.wielder.level === 5 && !game.wielder.hasFought) {
                    game.statistics.hasPacifistLeveled = true;
                }
                game.wielder.statPoints += calculateStatPointsPerLevel();
                applyLevelBonuses();
                showLevelUpModal();
            }
        }
        updateWielderStats();
        saveGame();
    }, 5000);
    showStory(true);
    setInterval(() => {
        game.statistics.totalPlayTime++;
        if (game.currentAction === 'resting') {
            game.statistics.totalRestTime++;
        }
        if (game.currentAction === 'autoExploring') {
            game.statistics.totalAutoExploreTime++;
        }
    }, 1000);
}

window.onload = initGame;