function calculateFinalCost(upgradeName){
    const upgrade = game.sword.upgrades[upgradeName];

    const baseCost = upgrade.initialCost * Math.pow(2, upgrade.level-1); // Example scaling
    const upgradeCostReduction = getUpgradeCostReduction();
    return  Math.floor(baseCost * (1-upgradeCostReduction));
}
function buyUpgrade(name) {
    const upgrade = game.sword.upgrades[name];


    const finalCost = calculateFinalCost(name);

    if (game.sword.energy >= finalCost && upgrade.level < gameData.upgradeCaps[name]) {
        game.sword.energy -= finalCost;
        upgrade.level++;
        upgrade.cost = calculateFinalCost(name);
        showEventBackground('assets/cutscenes/powerUp.jpg');
        if (name === 'capacity') {
            calculateMaxEnergy();
            updateEnergyAndKills();
        }
        // Update the upgrade's level display
        const upgradeDiv = document.getElementById(`upgrade-${name}`);
        if (upgradeDiv) {
            const label = upgradeDiv.firstChild;
            label.textContent = `${name.charAt(0).toUpperCase() + name.slice(1)} (Level ${upgrade.level}) `;
        }
        updateUpgrades(game.sword.energy);
        if (name === 'capacity') calculateMaxEnergy();
        if (name === 'control') calculateControlBonus();
        if (name === 'senses'){
            game.unlockedZones.push(upgrade.level-1);
            updateEnemyZones();
            updateButtonStates();
        }
        if (name === 'soul') {
            unlockNextStory();
            showStory();
            showStoryContent("story" + upgrade.level);
        }
        updateDisplay();
    }
    checkAchievements();
}

function unlockNextStory() {
    const nextLockedKey = Object.keys(gameData.story).find(key => !game.unlockedStory.includes(key));
    if (nextLockedKey) {
        game.unlockedStory.push(nextLockedKey);
        return true;
    }
    return false;
}

function getUpgradeTooltip(name) {
    const tooltips = {
        capacity: 'Increases maximum energy',
        siphon: 'Adds 1 lifesteal per level',
        senses: 'Unlocks stronger enemies',
        connection: 'Improves bond with the wielder, unlocks additional mechanics, increases passive health regen',
        control: 'Increases damage bonus (20% at 0 willpower, 0% at 200+ willpower per level)',
        soul: 'Discover more of your history'
    };
    return tooltips[name] || '';
}

function calculateMaxEnergy() {
    let base = 100;
    base *= Math.pow(2, game.sword.upgrades.capacity.level - 1);
    base *= getMaxEnergyMultiplier();
    game.sword.maxEnergy = base;
}