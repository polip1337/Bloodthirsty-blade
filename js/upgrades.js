function buyUpgrade(upgradeName) {
    const cap = gameData.upgradeCaps[upgradeName];
    const upgrade = game.sword.upgrades[upgradeName];
    const costReduction = getUpgradeCostReduction();
    const effectiveCost = upgrade.cost * (1 - costReduction);
    if (upgrade.level >= cap) {
        addCombatMessage(`Maximum ${upgradeName} level reached!`, 'damage');
        return;
    }
    if (game.sword.energy >= effectiveCost) {
        game.sword.energy -= effectiveCost;
        upgrade.level++;
        upgrade.cost *= 2;
        if (upgradeName === 'capacity') calculateMaxEnergy();
        if (upgradeName === 'senses') gameData.zones[upgrade.level - 1].unlocked = true;
        if (upgradeName === 'soul') {
            unlockNextStory();
            showStory();
        }
        updateDisplay();
        checkAchievements();
    }
}

function unlockNextStory() {
    const stories = gameData.story;
    const nextLockedStory = Object.entries(stories).find(([_, story]) => !story.unlocked);
    if (nextLockedStory) {
        const [storyKey] = nextLockedStory;
        stories[storyKey].unlocked = true;
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