function saveGame() {
    console.log('Saved game');
    const saveData = {
        game,
        wielder: game.wielder,
        timestamp: Date.now(),
        gameData
    };
    localStorage.setItem('cursedSwordSave', JSON.stringify(saveData));
}

function loadGame() {
    console.log('Loading game');
    const saved = localStorage.getItem('cursedSwordSave');
    if (saved) {
        const saveData = JSON.parse(saved);
        Object.assign(game, saveData.game);
        game.wielder = saveData.wielder;
        gameData = saveData.gameData;
        const wielderSprite = document.getElementById('wielder-sprite');
        wielderSprite.style.backgroundImage = `url('assets/wielder-${game.wielder.race}.png')`;
    } else {
        game.wielder = generateWielder('goblin', true);
    }
}

function wipeSave() {
    if (confirm('Permanently delete all progress?')) {
        localStorage.removeItem('cursedSwordSave');
        // Fully reset game state
        game.wielder = generateWielder('goblin', true);
        resetStats();
        game.sword.energy = 0;
        game.inquisitionEnabled = true;
        game.currentAction = null;
        Object.values(game.sword.upgrades).forEach(upg => { upg.level = 1; upg.cost = upg.initialCost; });
        game.selectedPath = null;
        game.pathProgress = { blood: 0, death: 0, vengeance: 0 };
        game.souls = { minor: 0, normal: 0, major: 0, epic: 0 };
        game.pathTiersUnlocked = { blood: [], death: [], vengeance: [] };
        game.unlockedPaths = [];
        clearAllIntervals();
        initGame();
        loadAchievements();
        updateDisplay();
        checkAchievements(); // Safe to call now with reinitialized achievements
    }
}
function resetStats(){
game.statistics = {
    totalKills: 0,          // Existing
    wieldersUsed: 0,        // Existing
    zoneKills: {},          // Existing
    mobKills: {},
    itemsBought: 0,         // For Shopaholic
    manualKills: 0,         // For Manual Warrior
    timesEnergyMaxed: 0,    // For Energy Peak
    goblinWieldersUsed: 0,  // For Goblin King
    totalRestTime: 0,       // For Restful (in seconds)
    totalAutoExploreTime: 0,// For Auto Master (in seconds)
    totalPlayTime: 0,       // For Marathon (in seconds)
    hasSwiftKilled: false,  // For Swift Killer
    hasSurvivedWithOneHP: false, // For Survivor
    hasOneHitKilled: false, // For Lucky Strike
    hasTakenFiftyDamage: false, // For Tough Nut
    hasPacifistLeveled: false, // For Pacifist
    hasEscapedInquisition: false // For Escape Artist
};
}
function clearAllIntervals() {
    let id = setInterval(() => {}, 1000); // Create a dummy interval to get the latest ID
    while (id >= 0) {
        clearInterval(id);
        id--;
    }
}
function resetSaveGameOver() {
    wipeSave();
}

function disableInquisition() {
    game.inquisitionEnabled = false;
    document.getElementById('inquisitionModal').style.display = 'none';
}

function exportSave() {
    const saveData = {
        game,
        timestamp: Date.now(),
        version: 1.2
    };
    document.getElementById('saveData').value = JSON.stringify(saveData, null, 2);
}

function importSave() {
    try {
        const importData = JSON.parse(document.getElementById('saveData').value);
        if (importData.version !== 1.2) throw new Error('Invalid version');
        Object.keys(game).forEach(key => {
            if (importData.game[key]) game[key] = importData.game[key];
        });
        updateDisplay();
        alert('Save imported successfully!');
    } catch (e) {
        alert(`Import failed: ${e.message}`);
    }
}

function onActionButtonClick(actionType) {
    const buttons = ['restButton', 'trainButton'];
    buttons.forEach(id => document.getElementById(id).classList.remove('active-action'));

    switch (actionType) {
        case 'resting':
            game.currentAction = game.currentAction === 'resting' ? null : 'resting';
            if (game.currentAction) document.getElementById('restButton').classList.add('active-action');
            break;
        case 'training':
            game.currentAction = game.currentAction === 'training' ? null : 'training';
            if (game.currentAction) document.getElementById('trainButton').classList.add('active-action');
            break;
    }
    updateButtonStates();
    updateEnemyZones();
}

function addCombatMessage(text, className) {
    const logElement = document.createElement('div');
    logElement.className = `log-entry ${className}`;
    logElement.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    const combatLog = document.getElementById('combat-log');
    combatLog.appendChild(logElement);
    if (combatLog.children.length > 50) combatLog.removeChild(combatLog.firstChild);
    combatLog.scrollTop = combatLog.scrollHeight;
}

function isAnyModalOpen() {
    const modals = [
        'raceSelectionModal', 'unlocksModal', 'statsModal', 'optionsModal',
        'storyModal', 'changelogModal', 'levelUpModal', 'wielderDeathModal',
        'heavyWoundModal', 'inquisitionModal'
    ];
    return modals.some(id => document.getElementById(id).style.display === 'block');
}

function updateStatPointsInfo() {
    const race = game.wielder.race;
    const basePoints = gameData.races[race].skillpoints || 1;
    const totalPoints = game.wielder.statPoints;
    const info = `You have ${totalPoints} stat points to allocate. ` +
        `(Each level grants ${basePoints} point.)`;
    document.getElementById('statPointsInfo').textContent = info;
}

function calculateStatPointsPerLevel() {
    const race = game.wielder.race;
    const basePoints = gameData.races[race].skillpoints || 1;
    const bonus = Object.values(game.achievements).reduce((sum, ach) => sum + (ach.unlocked && ach.bonus.statPointBonus ? ach.bonus.statPointBonus : 0), 0);
    return basePoints + bonus;
}

function getWoundText(stat) {
    const count = game.wielder.wounds.filter(w => w === stat).length;
    return count > 0 ? `\n(Wounded: -${count})` : '';
}