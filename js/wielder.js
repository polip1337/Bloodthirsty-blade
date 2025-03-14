function generateWielder(race, isInitial = false) {
    game.statistics.wieldersUsed = (game.statistics.wieldersUsed ?? 0) + 1;
    if (!race) {
        const availableRaces = Object.keys(races).filter(r => races[r].unlocked);
        race = availableRaces[Math.floor(Math.random() * availableRaces.length)];
    }
    if (race === 'goblin') {
        game.statistics.goblinWieldersUsed++;
    }
    const wielderSprite = document.getElementById('wielder-sprite');
    wielderSprite.style.backgroundImage = `url('assets/characters/wielder-${race}.png')`;
    const raceData = races[race];
    const startingBonus = Object.values(game.achievements).reduce((sum, ach) => sum + (ach.unlocked && ach.bonus.startingStats ? ach.bonus.startingStats : 0), 0);
    let baseStats;
    if (isInitial && race === 'goblin') {
        baseStats = {
            strength: 5,
            swordfighting: 5,
            endurance: 2,
            willpower: Math.floor(Math.random() * 50 + 50) + (raceData.stats.willpower || 0) + startingBonus
        };
    } else {
        baseStats = {
            strength: Math.floor(Math.random() * 6 + 1) + (raceData.stats.strength || 0) + startingBonus,
            swordfighting: Math.floor(Math.random() * 6 + 1) + (raceData.stats.swordfighting || 0) + startingBonus,
            endurance: Math.floor(Math.random() * 2 + 1) + (raceData.stats.endurance || 0) + startingBonus,
            willpower: Math.floor(Math.random() * 50 + 50) + (raceData.stats.willpower || 0) + startingBonus
        };
    }

    return {
        name: raceData.names[Math.floor(Math.random() * raceData.names.length)],
        race,
        baseStats: { ...baseStats },
        currentStats: { ...baseStats },
        wounds: [],
        level: 1,
        statPoints: 0,
        exp: 0,
        currentLife: baseStats.endurance * 5,
        hasFought: false,         // For Pacifist
        currentFightDamageTaken: 0, // For Tough Nut
        equipment: {
            helmet: null,
            body: null,
            gauntlets: null,
            weapon: { type: 'weapon', name: 'Cursed Sword', stats: { strength: 1 }, icon: 'assets/equipment/blade.png', permanent: true }, // Permanent sword
            shield: null,
            boots: null,
            ring: null,
            amulet: null
        },
        inventory: [],
        gold: 0,
        resting: false,
        training: false,
        defeated: false
    };
}

function showLevelUpModal() {
    updateStatPointsInfo();
    const effectiveStats = getEffectiveStats();
    document.getElementById('currentStatsDisplay').innerHTML = `
        Strength: ${effectiveStats.strength.toFixed(1)} | Swordfighting: ${effectiveStats.swordfighting.toFixed(1)} |
        Endurance: ${effectiveStats.endurance.toFixed(1)} | HP: ${game.wielder.currentLife.toFixed(1)}/${(effectiveStats.endurance * 5).toFixed(1)} |
        Willpower: ${effectiveStats.willpower.toFixed(1)}
    `;
    document.getElementById('levelUpModal').style.display = 'block';
}

function allocatePoint(stat) {
    game.wielder.currentStats[stat]++;
    game.wielder.statPoints--;
    if (stat === 'endurance') {
        game.wielder.currentLife += 5;
    }
    if (stat === 'willpower') game.wielder.currentStats.willpower += 4;
    if (game.wielder.statPoints <= 0) {
        onModalClose('levelUpModal');
    } else {
        showLevelUpModal();
    }
    updateWielderStats();
}

function applyLevelBonuses() {
    const race = game.wielder.race;
    const levelBonuses = gameData.races[race].levelBonuses || {};
    for (const [stat, bonus] of Object.entries(levelBonuses)) {
        game.wielder.currentStats[stat] += bonus;
        if (stat === 'endurance') {
            game.wielder.currentLife += bonus * 5; // Corrected typo 'enduranec'
        }
    }
}

function applyHeavyWound() {
    const stats = ['strength', 'swordfighting', 'willpower'];
    const affectedStat = stats[Math.floor(Math.random() * stats.length)];
    game.wielder.wounds.push(affectedStat);
    const woundCount = game.wielder.wounds.length;
    game.wielder.currentStats[affectedStat] = Math.max(
        game.wielder.baseStats[affectedStat] - game.wielder.wounds.filter(w => w === affectedStat).length,
        1
    );
    let message = `Heavy wound inflicted! Permanent -1 to ${affectedStat}. This is the ${woundCount}${['st', 'nd', 'rd'][woundCount - 1] || 'th'} wound.`;
    if (woundCount < 3) {
        message += ` If they receive a 3rd wound, they will die.`;
        addCombatMessage(message, 'damage');
        document.getElementById('heavyWoundMessage').textContent = message;
        document.getElementById('heavyWoundModal').style.display = 'block';
    } else {
        handleWielderDeath(affectedStat);
    }
    updateWielderStats();
}

function handleWielderDeath(affectedStat) {
    game.wielder.defeated = true;
    game.currentAction = null;
    game.sword.energy = 0;
    const message = affectedStat ?
        `Your wielder has succumbed to their wounds after receiving a heavy wound to ${affectedStat}.` :
        'Your wielder has died from their wounds.';
    addCombatMessage(message, 'damage');
    document.getElementById('wielderDeathMessage').textContent = message;
    document.getElementById('wielderDeathModal').style.display = 'block';
    updateDisplay();
}

function selectRace(race) {
    if (races[race].unlocked) {
        game.wielder = generateWielder(race);
        document.getElementById('raceSelectionModal').style.display = 'none';
        updateWielderStats();
    }
}

function healWielder() {
    if (game.sword.energy >= 10 && game.wielder.currentLife < game.wielder.currentStats.endurance * 5) {
        game.sword.energy -= 10;
        game.wielder.currentLife = Math.min(
            game.wielder.currentLife + Math.floor(game.wielder.currentStats.endurance * 1.25),
            game.wielder.currentStats.endurance * 5
        );
        const wielderHealthFill = document.querySelector('#wielder-health .health-bar-fill');

        wielderHealthFill.style.width = `${(wielder.currentLife / (effectiveStats.endurance *5)) * 100}%`;

        updateWielderStats();
        updateEnergyAndKills();
    }
}