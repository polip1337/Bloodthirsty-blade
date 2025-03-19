let gameData, races, zones, upgradeCaps, game,shopItems;
let lastUsedZoneIndex;
function loadGameData() {
    lastUsedZoneIndex = 0;
    game = null;
     game = {
        story1Viewed: false,
        sellMode: false,
        isFighting: false,
        autoBattle: false,
        currentEnemy: null,
        controlBonus: 0,
        inquisitionEnabled: true,
        swiftKillStartTime: null, // For Swift Killer timing
        swiftKillCount: 0,        // For Swift Killer count
        wasEnergyMaxed: false, // To detect Energy Peak transitions
        timesEnergyMaxed:0,
        achievements:{},
        completedAchievements: {},
        sword: {
            energy: 0,
            maxEnergy: 100,
            kills: 0,
            upgrades: {
                capacity: { level: 1, cost: 50, initialCost: 50 },
                siphon: { level: 1, cost: 100, initialCost: 100 },
                senses: { level: 1, cost: 200, initialCost: 200 },
                connection: { level: 1, cost: 150, initialCost: 150 },
                control: { level: 1, cost: 300, initialCost: 300 },
                soul: { level: 1, cost: 500, initialCost: 500 }
            }
        },
        wielder: null,
        statistics: {
            totalKills: 0,
            wieldersUsed: 0,
            mobKills: {},
            zoneKills: {},
            goblinWieldersUsed:0,
            totalPlayTime:0,
            totalRestTime:0,
            totalAutoExploreTime:0,
            manualKills:0,
            itemsBought:0
        },
        story: [],
        unlockedUpgrades: [],
        unlockedRaces: ['human'],
        currentAction: null,
        actionInterval: null, // Store the interval ID
        selectedPath: null,
        unlockedPaths: [],
        pathProgress: {
            blood: 0,  // Total energy gained
            death: 0,  // Total kills
            vengeance: 0  // Boss kills (placeholder)
        },
        souls: {
            minor: 0,
            normal: 0,
            major: 0,
            epic: 0
        },
        pathTiersUnlocked: {
            blood: [],
            death: [],
            vengeance: []
        }
    };



    game.shopItems = {
        3: [
            { type: 'helmet', name: 'Bronze Helmet', stats: { endurance: 1 }, price: 50, icon: 'assets/helmet.png' },
            { type: 'body', name: 'Padded Armor', stats: { endurance: 2 }, price: 80, icon: 'assets/chest.png' },
            { type: 'gauntlets', name: 'Leather Gloves', stats: { strength: 1 }, price: 60, icon: 'assets/gauntlet.png' },
            { type: 'shield', name: 'Wooden Shield', stats: { swordfighting: 1 }, price: 70, icon: 'assets/shield.png' },
            { type: 'boots', name: 'Traveler’s Boots', stats: { endurance: 1 }, price: 50, icon: 'assets/boots.png' },
            { type: 'ring', name: 'Copper Ring', stats: { willpower: 2 }, price: 60, icon: 'assets/ring.png' },
            { type: 'amulet', name: 'Stone Amulet', stats: { endurance: 1 }, price: 50, icon: 'assets/neck.png' }
        ],
        4: [
            { type: 'helmet', name: 'Iron Helm', stats: { endurance: 2 }, price: 100, icon: 'assets/helmet.png' },
            { type: 'body', name: 'Chainmail', stats: { endurance: 3 }, price: 150, icon: 'assets/chest.png' },
            { type: 'gauntlets', name: 'Steel Gauntlets', stats: { strength: 2 }, price: 120, icon: 'assets/gauntlet.png' },
            { type: 'shield', name: 'Iron Shield', stats: { swordfighting: 2 }, price: 140, icon: 'assets/shield.png' },
            { type: 'boots', name: 'Reinforced Boots', stats: { endurance: 2 }, price: 110, icon: 'assets/boots.png' },
            { type: 'ring', name: 'Silver Ring', stats: { willpower: 4 }, price: 130, icon: 'assets/ring.png' },
            { type: 'amulet', name: 'Jade Amulet', stats: { endurance: 2, willpower: 1 }, price: 140, icon: 'assets/neck.png' }
        ],
        5: [
            { type: 'helmet', name: 'Steel Helm', stats: { endurance: 3 }, price: 200, icon: 'assets/helmet.png' },
            { type: 'body', name: 'Plate Armor', stats: { endurance: 4 }, price: 250, icon: 'assets/chest.png' },
            { type: 'gauntlets', name: 'Knight’s Gauntlets', stats: { strength: 3 }, price: 220, icon: 'assets/gauntlet.png' },
            { type: 'shield', name: 'Tower Shield', stats: { swordfighting: 3 }, price: 230, icon: 'assets/shield.png' },
            { type: 'boots', name: 'Plated Boots', stats: { endurance: 3 }, price: 210, icon: 'assets/boots.png' },
            { type: 'ring', name: 'Gold Ring', stats: { willpower: 6 }, price: 240, icon: 'assets/ring.png' },
            { type: 'amulet', name: 'Emerald Amulet', stats: { endurance: 3, willpower: 2 }, price: 260, icon: 'assets/neck.png' }
        ]
    };
    gameData.paths = {
        blood: {
            name: "Path of Blood",
            description: "Tracks total energy gained",
            tiers: [
                { threshold: 1000, reward: { damageMultiplier: 1.05 } },
                { threshold: 5000, reward: { maxEnergyMultiplier: 1.10 } },
                { threshold: 10000, reward: { upgradeCostReduction: 0.05 } },
                { threshold: 20000, reward: { expMultiplier: 1.10 } },
                { threshold: 50000, reward: { startingStats: 1 } }
            ]
        },
        death: {
            name: "Path of Death",
            description: "Tracks total kills and collects souls",
            tiers: [
                { threshold: 100, reward: { souls: { minor: 10 } } },
                { threshold: 500, reward: { souls: { normal: 5 } } },
                { threshold: 1000, reward: { souls: { major: 2 } } },
                { threshold: 2000, reward: { souls: { epic: 1 } } },
                { threshold: 5000, reward: { damageMultiplier: 1.10 } }
            ]
        },
        vengeance: {
            name: "Path of Vengeance",
            description: "Tracks boss kills (placeholder)",
            tiers: [
                { threshold: 1, reward: { bossDamage: 1.05 } }, // Placeholder
                { threshold: 5, reward: { bossExp: 1.10 } },
                { threshold: 10, reward: { bossGold: 1.10 } },
                { threshold: 20, reward: { bossSouls: 1.05 } },
                { threshold: 50, reward: { ultimateReward: true } }
            ]
        }
    };

}

