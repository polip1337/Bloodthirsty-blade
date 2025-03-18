async function initGame() {
    gameData = await fetch('gameData.json').then(r => r.json());
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
        if (game.currentAction === 'autoExploring') {
            game.statistics.totalAutoExploreTime++;
        }
        checkAchievements();
    }, 1000);
}

window.onload = initGame;