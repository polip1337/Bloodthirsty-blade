const game = {
    story1Viewed: false,
    sellMode: false,
    isFighting: false,
    autoBattle: false,
    currentEnemy: null,
    controlBonus: 0,
    inquisitionEnabled: true,
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
        zoneKills: {}
    },
    story: [],
    unlockedUpgrades: [],
    unlockedRaces: ['human'],
    currentAction: null
};

let gameData, races, zones, upgradeCaps;
let lastUsedZoneIndex = 0;

const shopItems = {
    4: [
        { type: 'helmet', name: 'Bronze Helmet', stats: { endurance: 1 }, price: 50, icon: 'helmet.png' },
        { type: 'body', name: 'Padded Armor', stats: { endurance: 2 }, price: 80, icon: 'armor.png' },
        { type: 'gauntlets', name: 'Leather Gloves', stats: { strength: 1 }, price: 60, icon: 'gauntlets.png' },
        { type: 'shield', name: 'Wooden Shield', stats: { swordfighting: 1 }, price: 70, icon: 'shield.png' },
        { type: 'boots', name: 'Traveler’s Boots', stats: { endurance: 1 }, price: 50, icon: 'boots.png' },
        { type: 'ring', name: 'Copper Ring', stats: { willpower: 2 }, price: 60, icon: 'ring.png' },
        { type: 'amulet', name: 'Stone Amulet', stats: { endurance: 1 }, price: 50, icon: 'amulet.png' }
    ],
    5: [
        { type: 'helmet', name: 'Iron Helm', stats: { endurance: 2 }, price: 100, icon: 'helmet.png' },
        { type: 'body', name: 'Chainmail', stats: { endurance: 3 }, price: 150, icon: 'armor.png' },
        { type: 'gauntlets', name: 'Steel Gauntlets', stats: { strength: 2 }, price: 120, icon: 'gauntlets.png' },
        { type: 'shield', name: 'Iron Shield', stats: { swordfighting: 2 }, price: 140, icon: 'shield.png' },
        { type: 'boots', name: 'Reinforced Boots', stats: { endurance: 2 }, price: 110, icon: 'boots.png' },
        { type: 'ring', name: 'Silver Ring', stats: { willpower: 4 }, price: 130, icon: 'ring.png' },
        { type: 'amulet', name: 'Jade Amulet', stats: { endurance: 2, willpower: 1 }, price: 140, icon: 'amulet.png' }
    ],
    6: [
        { type: 'helmet', name: 'Steel Helm', stats: { endurance: 3 }, price: 200, icon: 'helmet.png' },
        { type: 'body', name: 'Plate Armor', stats: { endurance: 4 }, price: 250, icon: 'armor.png' },
        { type: 'gauntlets', name: 'Knight’s Gauntlets', stats: { strength: 3 }, price: 220, icon: 'gauntlets.png' },
        { type: 'shield', name: 'Tower Shield', stats: { swordfighting: 3 }, price: 230, icon: 'shield.png' },
        { type: 'boots', name: 'Plated Boots', stats: { endurance: 3 }, price: 210, icon: 'boots.png' },
        { type: 'ring', name: 'Gold Ring', stats: { willpower: 6 }, price: 240, icon: 'ring.png' },
        { type: 'amulet', name: 'Emerald Amulet', stats: { endurance: 3, willpower: 2 }, price: 260, icon: 'amulet.png' }
    ]
};