function loadAchievements(){
game.achievements = {
    noviceSlayer: {
        name: "Novice Slayer",
        description: "Defeat 100 enemies",
        condition: () => game.statistics.totalKills >= 100,
        target: 100,
        progress: () => game.statistics.totalKills,
        bonus: { damageMultiplier: 1.05 },
        unlocked: false,
        icon: "🗡️"
    },
    energyHoarder: {
        name: "Energy Hoarder",
        description: "Accumulate 1000 energy",
        condition: () => game.sword.energy >= 1000,
        target: 1000,
        progress: () => game.sword.energy,
        bonus: { maxEnergyMultiplier: 1.10 },
        unlocked: false,
        icon: "🔋"
    },
    upgradeMaster: {
        name: "Upgrade Master",
        description: "Upgrade any sword upgrade to level 5",
        condition: () => Object.values(game.sword.upgrades).some(upg => upg.level >= 5),
        target: 5,
        progress: () => Math.max(...Object.values(game.sword.upgrades).map(upg => upg.level)),
        bonus: { upgradeCostReduction: 0.05 },
        unlocked: false,
        icon: "🔧"
    },
    zoneExplorer: {
        name: "Zone Explorer",
        description: "Explore all available zones",
        condition: () => gameData.zones.every(zone => zone.unlocked),
        target: 5, // Assuming 5 zones; adjust based on gameData.zones.length if dynamic
        progress: () => gameData.zones.filter(zone => zone.unlocked).length,
        bonus: { expMultiplier: 1.10 },
        unlocked: false,
        icon: "🗺️"
    },
    wielderVeteran: {
        name: "Wielder Veteran",
        description: "Have 5 different wielders",
        condition: () => game.statistics.wieldersUsed >= 5,
        target: 5,
        progress: () => game.statistics.wieldersUsed,
        bonus: { startingStats: 1 },
        unlocked: false,
        icon: "👥"
    },
    relentlessFighter: {
        name: "Relentless Fighter",
        description: "Defeat 25 enemies in one zone",
        condition: () => Object.values(game.statistics.zoneKills).some(k => k >= 25),
        target: 25,
        progress: () => Math.max(...Object.values(game.statistics.zoneKills)),
        bonus: { damageMultiplier: 1.02 },
        unlocked: false,
        icon: "⚔️"
    },
    bloodthirsty: {
        name: "Bloodthirsty",
        description: "Kill 500 enemies total",
        condition: () => game.statistics.totalKills >= 500,
        target: 500,
        progress: () => game.statistics.totalKills,
        bonus: { lifestealBonus: 0.5 },
        unlocked: false,
        icon: "🩸"
    },
    zoneDominator: {
        name: "Zone Dominator",
        description: "Kill 100 enemies in zone 4+",
        condition: () => Object.entries(game.statistics.zoneKills).some(([z, k]) => z >= 4 && k >= 100),
        target: 100,
        progress: () => Math.max(...Object.entries(game.statistics.zoneKills).filter(([z, k]) => parseInt(z) >= 4).map(([z, k]) => k)),
        bonus: { goldMultiplier: 1.05 },
        unlocked: false,
        icon: "🏰"
    },
    swiftKiller: {
            name: "Swift Killer",
            description: "Defeat 10 enemies in under 10 seconds",
            condition: () => game.statistics.hasSwiftKilled,
            bonus: { attackSpeed: 0.05 },
            unlocked: false,
            icon: "⏩"
    },
    survivor: {
            name: "Survivor",
            description: "Win a fight with 1 HP left",
            condition: () => game.statistics.hasSurvivedWithOneHP,
            bonus: { regenBonus: 0.1 },
            unlocked: false,
            icon: "❤️"
        },
    trailblazer: {
        name: "Trailblazer",
        description: "Unlock zone 5",
        condition: () => gameData.zones[4].unlocked,
        bonus: { expMultiplier: 1.03 },
        unlocked: false,
        icon: "🛤️"
    },
    zoneHopper: {
        name: "Zone Hopper",
        description: "Fight in all zones",
        condition: () => Object.keys(game.statistics.zoneKills).length >= gameData.zones.length,
        target: 5, // Assuming 5 zones; adjust if dynamic
        progress: () => Object.keys(game.statistics.zoneKills).length,
        bonus: { energyGain: 0.05 },
        unlocked: false,
        icon: "🏃"
    },
    inquisitive: {
        name: "Inquisitive",
        description: "Trigger Inquisition warning",
        condition: () => Object.values(game.statistics.zoneKills).some(k => k >= 50),
        target: 50,
        progress: () => Math.max(...Object.values(game.statistics.zoneKills)),
        bonus: { willpowerBonus: 1 },
        unlocked: false,
        icon: "🕵️"
    },
    escapeArtist: {
            name: "Escape Artist",
            description: "Avoid Inquisition at 75 kills",
            condition: () => game.statistics.hasEscapedInquisition,
            bonus: { moveSpeed: 0.1 },
            unlocked: false,
            icon: "🏃‍♂️"
        },
    veteranWielder: {
        name: "Veteran Wielder",
        description: "Reach level 10 with a wielder",
        condition: () => game.wielder.level >= 10,
        target: 10,
        progress: () => game.wielder.level,
        bonus: { statPointBonus: 0.1 },
        unlocked: false,
        icon: "🎖️"
    },
    resilientSoul: {
        name: "Resilient Soul",
        description: "Survive 2 wounds",
        condition: () => game.wielder.wounds.length >= 2,
        target: 2,
        progress: () => game.wielder.wounds.length,
        bonus: { enduranceBonus: 1 },
        unlocked: false,
        icon: "🛡️"
    },
    willpowerMaster: {
        name: "Willpower Master",
        description: "Reach 150 willpower",
        condition: () => getEffectiveStats().willpower >= 150,
        target: 150,
        progress: () => getEffectiveStats().willpower,
        bonus: { controlReduction: 0.05 },
        unlocked: false,
        icon: "🧠"
    },
    gearCollector: {
        name: "Gear Collector",
        description: "Equip 5 items",
        condition: () => Object.values(game.wielder.equipment).filter(i => i).length >= 5,
        target: 5,
        progress: () => Object.values(game.wielder.equipment).filter(i => i).length,
        bonus: { goldMultiplier: 1.02 },
        unlocked: false,
        icon: "🎒"
    },
    shopaholic: {
            name: "Shopaholic",
            description: "Buy 10 items",
            condition: () => game.statistics.itemsBought >= 10,
            target: 10,
            progress: () => game.statistics.itemsBought,
            bonus: { shopDiscount: 0.03 },
            unlocked: false,
            icon: "🛒"
        },
    goldDigger: {
        name: "Gold Digger",
        description: "Collect 1000 gold",
        condition: () => game.wielder.gold >= 1000,
        target: 1000,
        progress: () => game.wielder.gold,
        bonus: { goldMultiplier: 1.05 },
        unlocked: false,
        icon: "💰"
    },
    energySaver: {
        name: "Energy Saver",
        description: "Reach 500 energy",
        condition: () => game.sword.energy >= 500,
        target: 500,
        progress: () => game.sword.energy,
        bonus: { energyGain: 0.03 },
        unlocked: false,
        icon: "⚡"
    },
    maxCapacity: {
        name: "Max Capacity",
        description: "Upgrade capacity to level 5",
        condition: () => game.sword.upgrades.capacity.level >= 5,
        target: 5,
        progress: () => game.sword.upgrades.capacity.level,
        bonus: { maxEnergyMultiplier: 1.05 },
        unlocked: false,
        icon: "📦"
    },
    siphonLord: {
        name: "Siphon Lord",
        description: "Upgrade siphon to level 5",
        condition: () => game.sword.upgrades.siphon.level >= 5,
        target: 5,
        progress: () => game.sword.upgrades.siphon.level,
        bonus: { lifestealBonus: 1 },
        unlocked: false,
        icon: "💉"
    },
    soulSeeker: {
        name: "Soul Seeker",
        description: "Unlock 3 story fragments",
        condition: () => Object.values(gameData.story).filter(s => s.unlocked).length >= 3,
        target: 3,
        progress: () => Object.values(gameData.story).filter(s => s.unlocked).length,
        bonus: { expMultiplier: 1.05 },
        unlocked: false,
        icon: "📜"
    },
    pacifist: {
            name: "Pacifist",
            description: "Train to level 5 without fighting",
            condition: () => game.statistics.hasPacifistLeveled,
            bonus: { trainingExp: 0.05 },
            unlocked: false,
            icon: "🕊️"
        },
    restful: {
            name: "Restful",
            description: "Rest for 60 seconds total",
            condition: () => game.statistics.totalRestTime >= 60,
            target: 60,
            progress: () => game.statistics.totalRestTime,
            bonus: { regenBonus: 0.2 },
            unlocked: false,
            icon: "🛌"
        },
    autoMaster: {
            name: "Auto Master",
            description: "Auto-explore for 5 minutes",
            condition: () => game.statistics.totalAutoExploreTime >= 300,
            target: 300,
            progress: () => game.statistics.totalAutoExploreTime,
            bonus: { autoEfficiency: 0.05 },
            unlocked: false,
            icon: "🤖"
        },
    manualWarrior: {
            name: "Manual Warrior",
            description: "Kill 50 enemies manually",
            condition: () => game.statistics.manualKills >= 50,
            target: 50,
            progress: () => game.statistics.manualKills,
            bonus: { damageMultiplier: 1.03 },
            unlocked: false,
            icon: "✋"
        },
    woundAvoider: {
        name: "Wound Avoider",
        description: "Reach level 8 with no wounds",
        condition: () => game.wielder.level >= 8 && game.wielder.wounds.length === 0,
        target: 8,
        progress: () => (game.wielder.wounds.length === 0 ? game.wielder.level : 0),
        bonus: { woundResistance: 0.05 },
        unlocked: false,
        icon: "🛡️"
    },
    centuryMark: {
        name: "Century Mark",
        description: "Reach 100 total kills",
        condition: () => game.statistics.totalKills >= 100,
        target: 100,
        progress: () => game.statistics.totalKills,
        bonus: { damageMultiplier: 1.01 },
        unlocked: false,
        icon: "🎯"
    },
    decathlon: {
        name: "Decathlon",
        description: "Use 10 wielders",
        condition: () => game.statistics.wieldersUsed >= 10,
        target: 10,
        progress: () => game.statistics.wieldersUsed,
        bonus: { startingStats: 2 },
        unlocked: false,
        icon: "🏃‍♂️"
    },
    goldHoarder: {
        name: "Gold Hoarder",
        description: "Hold 5000 gold",
        condition: () => game.wielder.gold >= 5000,
        target: 5000,
        progress: () => game.wielder.gold,
        bonus: { goldMultiplier: 1.07 },
        unlocked: false,
        icon: "🏦"
    },
    energyPeak: {
            name: "Energy Peak",
            description: "Reach max energy 10 times",
            condition: () => game.statistics.timesEnergyMaxed >= 10,
            target: 10,
            progress: () => game.statistics.timesEnergyMaxed,
            bonus: { energyGain: 0.07 },
            unlocked: false,
            icon: "🔋"
        },
    levelTwenty: {
        name: "Level Twenty",
        description: "Reach level 20",
        condition: () => game.wielder.level >= 20,
        target: 20,
        progress: () => game.wielder.level,
        bonus: { statPointBonus: 0.2 },
        unlocked: false,
        icon: "🎖️"
    },
    luckyStrike: {
            name: "Lucky Strike",
            description: "Kill an enemy in one hit",
            condition: () => game.statistics.hasOneHitKilled,
            bonus: { critChance: 0.01 },
            unlocked: false,
            icon: "🍀"
        },
    toughNut: {
            name: "Tough Nut",
            description: "Survive 50 damage in one fight",
            condition: () => game.statistics.hasTakenFiftyDamage,
            bonus: { enduranceBonus: 2 },
            unlocked: false,
            icon: "🥜"
        },
    inventoryFull: {
        name: "Inventory Full",
        description: "Fill all 9 inventory slots",
        condition: () => game.wielder.inventory.length >= 9,
        target: 9,
        progress: () => game.wielder.inventory.length,
        bonus: { inventorySize: 1 },
        unlocked: false,
        icon: "📦"
    },
    gearMaster: {
        name: "Gear Master",
        description: "Equip all slots",
        condition: () => Object.values(game.wielder.equipment).every(i => i),
        target: 5, // Assuming 5 equipment slots
        progress: () => Object.values(game.wielder.equipment).filter(i => i).length,
        bonus: { statBonus: 1 },
        unlocked: false,
        icon: "⚙️"
    },
    zoneClear: {
        name: "Zone Clear",
        description: "Kill 200 enemies in one zone",
        condition: () => Object.values(game.statistics.zoneKills).some(k => k >= 200),
        target: 200,
        progress: () => Math.max(...Object.values(game.statistics.zoneKills)),
        bonus: { zoneExp: 0.05 },
        unlocked: false,
        icon: "✅"
    },
    goblinKing: {
        name: "Goblin King",
        description: "Use 5 goblin wielders",
        condition: () => false,
        bonus: { goblinBonus: 1 },
        unlocked: false,
        icon: "👑"
    },
    minimalist: {
        name: "Minimalist",
        description: "Reach level 10 with no items",
        condition: () => game.wielder.level >= 10 && Object.values(game.wielder.equipment).every(i => !i),
        target: 10,
        progress: () => (Object.values(game.wielder.equipment).every(i => !i) ? game.wielder.level : 0),
        bonus: { expMultiplier: 1.04 },
        unlocked: false,
        icon: "🧹"
    },
    hoarder: {
            name: "Hoarder",
            description: "Hold 20 items total",
            condition: () => game.wielder.inventory.length >= 20,
            target: 20,
            progress: () => game.wielder.inventory.length,
            bonus: { goldMultiplier: 1.04 },
            unlocked: false,
            icon: "🗑️"
        },
        marathon: {
            name: "Marathon",
            description: "Play for 1 hour",
            condition: () => game.statistics.totalPlayTime >= 3600,
            target: 3600,
            progress: () => game.statistics.totalPlayTime,
            bonus: { energyGain: 0.06 },
            unlocked: false,
            icon: "🏃"
        },
    bladeLegacy: {
        name: "Blade Legacy",
        description: "Unlock all story fragments",
        condition: () => Object.values(gameData.story).every(s => s.unlocked),
        target: 5, // Assuming 5 story fragments; adjust if dynamic
        progress: () => Object.values(gameData.story).filter(s => s.unlocked).length,
        bonus: { damageMultiplier: 1.05 },
        unlocked: false,
        icon: "📖"
    }
};
}
function checkAchievements() {
    Object.entries(game.achievements).forEach(([key, achievement]) => {
        if (!achievement.unlocked && achievement.condition && achievement.condition()) {
            achievement.unlocked = true;
            addCombatMessage(
                `Achievement Unlocked: ${achievement.name}! Bonus: ${getBonusDescription(achievement.bonus)}`,
                'achievement'
            );
            if (achievement.bonus.maxEnergyMultiplier) {
                calculateMaxEnergy();
            }
        }
    });
}

function updateAchievementsTab() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = Object.entries(game.achievements).map(([key, ach]) => {
        let progressBar = '';
        if (!ach.unlocked && ach.target && ach.progress) {
            const current = ach.progress();
            const percentage = Math.min((current / ach.target) * 100, 100);
            progressBar = `
                <div style="width: 100%; background: #444; height: 10px; margin-top: 5px;">
                    <div style="width: ${percentage}%; background: #66ff66; height: 100%;"></div>
                </div>
                <p>${current} / ${ach.target}</p>`;
        }
        return `
            <div class="achievement-icon tooltip ${ach.unlocked ? 'unlocked' : ''}">
                <span>${ach.icon}</span>
                <span class="tooltiptext">
                    ${ach.name}<br>
                    ${ach.description}<br>
                    Status: ${ach.unlocked ? 'Unlocked' : 'Locked'}<br>
                    Reward: ${getBonusDescription(ach.bonus)}<br>
                    ${progressBar}
                </span>
            </div>
        `;
    }).join('');
}

function getBonusDescription(bonus) {
    if (bonus.damageMultiplier) return `+${((bonus.damageMultiplier - 1) * 100).toFixed(0)}% damage`;
    if (bonus.maxEnergyMultiplier) return `+${((bonus.maxEnergyMultiplier - 1) * 100).toFixed(0)}% max energy`;
    if (bonus.upgradeCostReduction) return `-${(bonus.upgradeCostReduction * 100).toFixed(0)}% upgrade cost`;
    if (bonus.expMultiplier) return `+${((bonus.expMultiplier - 1) * 100).toFixed(0)}% EXP gain`;
    if (bonus.startingStats) return `+${bonus.startingStats} to all starting stats`;
    if (bonus.lifestealBonus) return `+${bonus.lifestealBonus} lifesteal`;
    if (bonus.goldMultiplier) return `+${((bonus.goldMultiplier - 1) * 100).toFixed(0)}% gold gain`;
    if (bonus.energyGain) return `+${(bonus.energyGain * 100).toFixed(0)}% energy gain`;
    if (bonus.willpowerBonus) return `+${bonus.willpowerBonus} willpower`;
    if (bonus.enduranceBonus) return `+${bonus.enduranceBonus} endurance`;
    if (bonus.statBonus) return `+${bonus.statBonus} to all stats`;
    if (bonus.shopDiscount) return `-${(bonus.shopDiscount * 100).toFixed(0)}% shop prices`;
    if (bonus.statPointBonus) return `+${bonus.statPointBonus} stat points per level`;
    if (bonus.goblinBonus) return `+${bonus.goblinBonus} strength for goblins`;
    if (bonus.attackSpeed) return `+${(bonus.attackSpeed * 100).toFixed(0)}% attack speed`;
    if (bonus.regenBonus) return `+${bonus.regenBonus} HP regen per 5s`;
    if (bonus.moveSpeed) return `+${(bonus.moveSpeed * 100).toFixed(0)}% move speed`;
    if (bonus.controlReduction) return `-${(bonus.controlReduction * 100).toFixed(0)}% control penalty`;
    if (bonus.woundResistance) return `+${(bonus.woundResistance * 100).toFixed(0)}% wound resistance`;
    if (bonus.trainingExp) return `+${(bonus.trainingExp * 100).toFixed(0)}% training EXP`;
    if (bonus.autoEfficiency) return `+${(bonus.autoEfficiency * 100).toFixed(0)}% auto-explore efficiency`;
    if (bonus.critChance) return `+${(bonus.critChance * 100).toFixed(0)}% crit chance`;
    if (bonus.inventorySize) return `+${bonus.inventorySize} inventory slot`;
    if (bonus.zoneExp) return `+${(bonus.zoneExp * 100).toFixed(0)}% zone EXP`;
    return 'No bonus';
}

function getDamageMultiplier() {
    let multiplier = 1;
    Object.values(game.achievements).forEach(ach => {
        if (ach.unlocked && ach.bonus.damageMultiplier) multiplier *= ach.bonus.damageMultiplier;
    });
    ['blood', 'death'].forEach(path => {
        game.pathTiersUnlocked[path].forEach(tierIdx => {
            const tier = gameData.paths[path].tiers[tierIdx];
            if (tier.reward.damageMultiplier) multiplier *= tier.reward.damageMultiplier;
        });
    });
    return multiplier;
}

function getExpMultiplier() {
    let multiplier = 1;
    Object.values(game.achievements).forEach(ach => {
        if (ach.unlocked && ach.bonus.expMultiplier) multiplier *= ach.bonus.expMultiplier;
        if (ach.unlocked && ach.bonus.zoneExp) multiplier *= ach.bonus.zoneExp;
    });
    ['blood', 'vengeance'].forEach(path => {
        game.pathTiersUnlocked[path].forEach(tierIdx => {
            const tier = gameData.paths[path].tiers[tierIdx];
            if (tier.reward.expMultiplier || tier.reward.bossExp) multiplier *= (tier.reward.expMultiplier || tier.reward.bossExp);
        });
    });
    return multiplier;
}

function getMaxEnergyMultiplier() {
    let multiplier = 1;
    Object.values(game.achievements).forEach(ach => {
        if (ach.unlocked && ach.bonus.maxEnergyMultiplier) multiplier *= ach.bonus.maxEnergyMultiplier;
    });
    game.pathTiersUnlocked.blood.forEach(tierIdx => {
        const tier = gameData.paths.blood.tiers[tierIdx];
        if (tier.reward.maxEnergyMultiplier) multiplier *= tier.reward.maxEnergyMultiplier;
    });
    return multiplier;
}

function getUpgradeCostReduction() {
    let reduction = 0;
    Object.values(game.achievements).forEach(ach => {
        if (ach.unlocked && ach.bonus.upgradeCostReduction) reduction += ach.bonus.upgradeCostReduction;
    });
    game.pathTiersUnlocked.blood.forEach(tierIdx => {
        const tier = gameData.paths.blood.tiers[tierIdx];
        if (tier.reward.upgradeCostReduction) reduction += tier.reward.upgradeCostReduction;
    });
    return reduction;
}