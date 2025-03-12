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
            const regenRate = game.currentAction === 'resting' ? 5 : 1;
            game.wielder.currentLife = Math.min(
                game.wielder.currentLife + regenRate,
                getEffectiveStats().endurance * 5
            );
        }
        if (game.currentAction === 'training') {
            game.wielder.exp += 5;
            if (game.wielder.exp >= 100 * game.wielder.level) {
                game.wielder.exp -= 100 * game.wielder.level;
                game.wielder.level++;
                game.wielder.statPoints += calculateStatPointsPerLevel();
                applyLevelBonuses();
                showLevelUpModal();
            }
        }
        updateDisplay();
        saveGame();
    }, 5000);
    showStory(true);
}

window.onload = initGame;