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
    const saved = localStorage.getItem('cursedSwordSave');
    if (saved) {
        console.log('Loading game from Saved state');

        const saveData = JSON.parse(saved);
        game = {};
        Object.assign(game, saveData.game);
        game.wielder = saveData.wielder;
        gameData = saveData.gameData;
        const wielderSprite = document.getElementById('wielder-sprite');
        wielderSprite.style.backgroundImage = `url('assets/wielder-${game.wielder.race}.png')`;
        // Ensure completedAchievements exists
        if (!game.completedAchievements) {
            game.completedAchievements = Object.entries(game.achievements)
                .filter(([key, ach]) => ach.unlocked)
                .map(([key]) => key);
        }
        loadAchievements();

    } else {
        console.log('Loading game from scratch');
        loadGameData();
        game.wielder = generateWielder('goblin', true);
        loadAchievements();
    }
}

function wipeSave() {
    if (confirm('Permanently delete all progress?')) {
        localStorage.removeItem('cursedSwordSave');
        clearAllIntervals();
        initGame();
    }
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
    // If clicking the same action, stop it
    if (game.currentAction === actionType) {
        stopCurrentAction();
        return;
    }

    // Stop any existing action and start the new one
    stopCurrentAction();
    startAction(actionType);
    updateButtonStates();
    updateEnemyZones();
}

function startAction(actionType) {
    const restButton = document.getElementById('restButton');
    const trainButton = document.getElementById('trainButton');
    const exploreButton = document.getElementById('exploreButton');
    const autoCombatButton = document.getElementById('autoCombatButton');

    game.currentAction = actionType;

    if (actionType === 'resting') {
        restButton.classList.add('pulse-animation');
        game.actionInterval = setInterval(() => {
            const hpGain = 5;
            game.wielder.currentLife = Math.min(game.wielder.currentLife + hpGain, getEffectiveStats().endurance *5);
            console.log(`Resting: +${hpGain} HP, Current HP: ${game.wielder.currentLife}`);
            showFloatingNumber(hpGain, 'restButton');
            updateWielderStats();
        }, 5000);
    } else if (actionType === 'training') {
        trainButton.classList.add('pulse-animation');
        game.actionInterval = setInterval(() => {
            const expGain = 5;
            game.wielder.exp += expGain;
            console.log(`Training: +${expGain} EXP, Current EXP: ${game.wielder.exp}`);
            showFloatingNumber(expGain, 'trainButton');

            checkLevelUp();
        }, 5000);
    }
}
function stopCurrentAction() {
    const restButton = document.getElementById('restButton');
    const trainButton = document.getElementById('trainButton');


    // Clear the interval if it exists
    if (game.actionInterval !== null) {
        clearInterval(game.actionInterval);
        game.actionInterval = null;
    }

    // Remove animation from all buttons
    restButton.classList.remove('pulse-animation');
    trainButton.classList.remove('pulse-animation');


    game.currentAction = null;
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
    const info = `You have ${totalPoints.toFixed(0)} stat points to allocate. ` +
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