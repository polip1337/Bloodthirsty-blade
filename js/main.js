async function initGame() {
    loadGameData();
    races = gameData.races;
    zones = gameData.zones;
    upgradeCaps = gameData.upgradeCaps;

    loadGame();
    saveGame();
    calculateMaxEnergy();
    updateDisplay();

    showStory(true);
    setInterval(() => {
        game.statistics.totalPlayTime++;
        if (game.currentAction === 'resting') {
            game.statistics.totalRestTime++;
        }
        if (game.currentAction === 'autoFighting') {
            game.statistics.totalAutoExploreTime++;
        }
        checkAchievements();

    }, 1000);
    setInterval(() => {
        game.wielder.currentLife = Math.min(game.wielder.currentLife + 1, getEffectiveStats().endurance * 5);
        const energyRegen = game.pathBonuses?.blood?.energyRegen || 0;
        if (energyRegen) {
            game.sword.energy = Math.min(game.sword.energy + energyRegen, game.sword.maxEnergy);
        }
        updateWielderStats();
        saveGame();
        }, 5000);

}

window.onload = initGame;