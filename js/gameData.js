let gameData, races, zones, upgradeCaps, game,shopItems;
let lastUsedZoneIndex;
function loadGameData() {
    lastUsedZoneIndex = 0;
    roundCount = 0;
    game = null;
    gameData = null;
     game = {
        story1Viewed: false,
        sellMode: false,
        isFighting: false,
        autoBattle: false,
        currentEnemy: null,
        controlBonus: 0,
        inquisitionEnabled: true,
        swiftKillStartTime: null, // For Swift Killer timing
        achievements:{},
        completedAchievements: {},
        inquisitionActivity: {}, // Activity level per zone (0 to 1)
        firstInquisitionEncounter: false,
        unlockedRaces: ['goblin'],
        unlockedZones: [0],
        unlockedStory: ['story1'],
        completedPaths:[],
        dodgeActive: false,
        lastDodgeTime: 0,
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
        bonus:{
        lifesteal:0,
        inventorySize:0
        },
        statistics: {
            currentHighestDamageTaken: 0,
            maxLevelWithoutCombat:0,
            totalKills: 0,
            wieldersUsed: 0,
            mobKills: {},
            zoneKills: {},
            goblinWieldersUsed:0,
            totalPlayTime:0,
            totalRestTime:0,
            totalAutoExploreTime:0,
            manualKills:0,
            itemsBought:0,
            swiftKillCount: 0,        // For Swift Killer count
            swiftKillMaxCount: 0,        // For Swift Killer count
            wasEnergyMaxed: false, // To detect Energy Peak transitions
            highestHitSurvived: 0,      // Tracks largest hit survived
            survivedHitOf50: false,
            racesUsed: {},
            timesEnergyMaxed:0
        },
        story: [],
        unlockedUpgrades: [],
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
        },
        pathSelections: {
            blood: [],
            death: [],
            vengeance: []
        }
    };



gameData = {
  races: {
    goblin: {
      stats: {},
      levelBonuses: {},
      skillpoints: 1,
      names: ["Vragik", "Braz", "Groll", "Thrank"],
      unlockRequirement: null
    },
    beastman: {
      stats: { strength: 2, endurance: 1 },
      levelBonuses: { strength: 1 },
      skillpoints: 1,
      names: ["Kel-thok", "Gar-dem", "Krug-en", "Dank-eb"],
      unlockRequirement: { zone: 1, kills: 10 }
    },
    human: {
      stats: { strength: 2, swordfighting: 1 },
      levelBonuses: { strength: 1, swordfighting: 1 },
      skillpoints: 2,
      names: ["Aldric", "Elara", "Gareth", "Liora"],
      unlockRequirement: { zone: 2, kills: 15 }
    },
    elf: {
      stats: { swordfighting: 2, willpower: 5 },
      levelBonuses: { swordfighting: 2, willpower: 5 },
      skillpoints: 3,
      names: ["Aelar", "Lyria", "Thalorin", "Faelwen"],
      unlockRequirement: { zone: 3, kills: 20 }
    },
    dwarf: {
      stats: { strength: 2, swordfighting: 1, willpower: 5 },
      skillpoints: 2,
      levelBonuses: { strength: 1, endurance: 2 },
      names: ["Thrain", "Hilda", "Borin", "Freyja"],
      unlockRequirement: { zone: 4, kills: 20 }
    },
    orc: {
      stats: { strength: 3, swordfighting: 1, willpower: 5 },
      skillpoints: 1,
      levelBonuses: { strength: 3, endurance: 2 },
      names: ["Thur'rog the Red", "Black hand", "Mardok'kar'vel", "Thrug one Handed"],
      unlockRequirement: { zone: 5, kills: 20 }
    }
  },
  upgradeCaps: {
    capacity: 10,
    siphon: 5,
    senses: 8,
    connection: 8,
    control: 5,
    soul: 6
  },
  story: {
    story1: {
      title: "Lost in Darkness",
      entry: [
        "Your first memories are blurry and hard to focus on any details. All of them are blotted out by the hunger. You have been asleep for so long that from the time the first drop of blood touches your blade, it is all you can think of. It is only after hours and days of battle, when you have drunk the blood of monsters and men that you can finally start to think straight.",
        "You are the Ebon Blade. You don’t know what that means, but you will, no matter how many people you have to kill to find out."
      ]
    },
    story2: {
      title: "Through the Hinterlands",
      entry: [
        "This far out, there’s almost nothing to kill, but you don’t let that stop you. Every man and beast that crosses your path is nothing but lambs to the slaughter. Your wielder doesn’t understand what’s going on any more than you do, but they are not hard to convince. Power appeals to everyone.",
        "Gnolls that try to eat you are exterminated. Bandits that try to rob you are left bleeding. You cut a bloody swath across the flat lands, leaving it a safer place for those who are lucky enough not to cross your path as you search for clues to who you are.",
        "That’s cold comfort for the farms and villages you happen across, though. The only peace you can offer them is the peace of the grave as their souls fuel your rise to power."
      ]
    },
    story3: {
      title: "Beasts and Brutes",
      entry: [
        "The endless plains give way to the rocky hills that ring the mountains. You don’t know where you are, but you know that what you seek lies in that direction. Flashes of memory draw you to them. This is where you were found, somewhere.",
        "Before you can find the temple, though, you must deal with the beasts that infest the place. While there were beastmen in the lowlands, their ugly tribes are everywhere in the highlands, fighting and rutting. Not even their strongest are a challenge for you, though. All they can do, all anyone can do, is make you stronger."
      ]
    },
    story4: {
      title: "Questions Instead of Answers",
      entry: [
        "You find the temple where the worshipers of the Death Goddess kept you prisoner for an age. Now, it is a haunted place filled with the dead but also with your memories. When you see them, you can remember killing them, at least some of them.",
        "This one was once a wielder, and that one was once an ally. Still, your enemies outnumber any positive remembrances you might have had. You were betrayed, and though whoever did it isn’t here, you now have some idea of what you are looking for. There’s a throne somewhere to the east just waiting to be bathed in blood!"
      ]
    },
    story5: {
      title: "Let it Burn",
      entry: [
        "Your next stop is the city of Kalraka. It’s a small city or a large town. Either way, it has walls, but they cannot keep you out, and you will put the entire place to the torch.",
        "This is not the city you need to raze. It is not where you were betrayed. It’s just on the way, and since you’re here, you might as well kill as many as you can to feed your growing power. When you are done, all you will leave behind are warm corpses and cold bodies as your power continues to swell."
      ]
    },
    story6: {
      title: "The View from on High",
      entry: [
        "You learned much in Kalraka, both from the living and the dead. Your path leads no the east and the north, to the inner kingdoms. There is where your vengeance awaits. It won’t be an easy road, though.",
        "Between here and there lie the razor peaks and forested valleys of the Greenstone mountains. They aren’t named for the color of their granite spine but for the sheer number of orcs and goblins that dwell within them. Too wild to be tamed by civilization, the region is swarming with greenskins and worse. Here, there are griffons and dragons, but none of that scares you. You were made for dragon slaying."
      ]
    },
      story7: {
        title: "It's Been A long Way",
        entry: [
          "On the far side of the mountains lie the verdant lands you have been aiming for, for so long. You have finally arrived at the edge of the Inner Kingdoms, and endless grasslands have been replaced with green fields, and instead of monsters, the land is dotted with villages that are ripe for plunder.",
          "Their populations have heard that you are coming. Some flee before your fearsome wielder, and others prepare to fight. In the end, neither group will live much longer."
        ]
      },
        story8: {
          title: "Revenge is at Hand",
          entry: [
            "Behind you, lie the shattered wreckage of the Inner Kingdoms. The blood flowed freely there, but no matter how many towns you put to the sword, it would never equal the prize that lies ahead of you.",
            "Severon is a city with hundreds of thousands of souls. More importantly, though, it is where this nightmare began for you. Their thick walls will not save them. You will have your revenge here, and everyone who gets in your way will pay the price for their folly."
          ]
        },
          story9: {
            title: "Where it all Began",
            entry: [
              "The castle rises before you, but not all the defenders have fled. Still, you do not fear them. As the memories of what happened here spring into your mind at the sight of this place, though, and you remember how you were forged in the darkest basements with forbidden magics, it's impossible to ignore the streak of fear that surges through your anger.",
              "After all this time you have arrived, and you will not rest until the king is dead, his family’s souls have been devoured and the ancient castle is nothing but a flaming heap of rubble."
            ]
            }
  },
  zones: [
    {
      name: "Kaladian Plains",
      enemies: [
        { name: "Wild Beast", level: 1, strength: 2, defense: 0, endurance: 3, exp: 10 },
        { name: "Bandit", level: 1, strength: 3, defense: 0, endurance: 8, exp: 15 },
        { name: "A Group of Bandits", level: 2, strength: 4, defense: 1, endurance: 15, exp: 20 }
      ]
    },
    {
      name: "Rocky Foothills",
      enemies: [
        { name: "A Sneak Goblin", level: 2, strength: 5, defense: 1, endurance: 10, exp: 20 },
        { name: "A Wild Beastman", level: 2, strength: 6, defense: 1, endurance: 15, exp: 20 },
        { name: "A Goblin Hunting Party", level: 3, strength: 7, defense: 2, endurance: 20, exp: 30 },
        { name: "A Pack of Beastmen", level: 3, strength: 8, defense: 2, endurance: 25, exp: 30 }
      ]
    },
    {
      name: "Ancient Ruins",
      enemies: [
        { name: "Ghost of the Past", level: 3, strength: 6, defense: 2, endurance: 12, exp: 25 },
        { name: "Painful Memory", level: 3, strength: 7, defense: 1, endurance: 18, exp: 25 },
        { name: "Corpse of a Former Wielder", level: 4, strength: 9, defense: 3, endurance: 25, exp: 35 }
      ]
    },
    {
      name: "The City of Kalraka",
      enemies: [
        { name: "A fearful Guardsman", level: 4, strength: 7, defense: 2, endurance: 15, exp: 30 },
        { name: "A Prepared Knight", level: 4, strength: 8, defense: 3, endurance: 20, exp: 30 },
        { name: "A Pack of Goat Men", level: 5, strength: 10, defense: 1, endurance: 30, exp: 40 }
      ],
         boss: {
             name: "Troll",
             level: 6,
             strength: 15,
             defense: 2,
             endurance: 200,
             exp: 150,
             gold: 100,
             isBoss: true,
             mechanics: {
                 regenPerTurn: 100,
                 lifestealImmuneRegen: true
             }
         }
    },
    {
      name: "High Mountains",
      enemies: [
        { name: "A Minotaur", level: 4, strength: 10, defense: 1, endurance: 60, exp: 50 },
        { name: "An Orc", level: 4, strength: 10, defense: 1, endurance: 60, exp: 50 },
        { name: "An Orcish Hunting Party", level: 5, strength: 12, defense: 2, endurance: 100, exp: 60 },
        { name: "A Young Dragon", level: 6, strength: 15, defense: 2, endurance: 200, exp: 100 }
      ],
         boss: {
             name: "Forge Guardian",
             level: 9,
             strength: 22,
             defense: 6,
             endurance: 400,
             exp: 300,
             gold: 250,
             isBoss: true,
             mechanics: {
                 dwarfRequired: true
             }
         }
    },
    {
        name: "The Inner Kingdoms",
        enemies: [
            { name: "A Wandering Hero", level: 7, strength: 17, defense: 3, endurance: 220, exp: 110 },
            { name: "A Powerful Mage", level: 8, strength: 20, defense: 5, endurance: 300, exp: 150 },
            { name: "A Guard Patrol", level: 9, strength: 22, defense: 6, endurance: 400, exp: 200 }
        ],
         boss: {
             name: "Armored Sentinel",
             level: 7,
             strength: 18,
             defense: 75,
             endurance: 1,
             exp: 200,
             gold: 150,
             isBoss: true,
             mechanics: {
                 lifestealImmune: true
             }
         }
    },
    {
        name: "The Capital City",
        enemies: [
            { name: "A Well Armed Knight", level: 9, strength: 24, defense: 7, endurance: 350, exp: 220 },
            { name: "A Squad of Warriors", level: 10, strength: 28, defense: 9, endurance: 500, exp: 280 },
            { name: "An Warpriest", level: 11, strength: 30, defense: 10, endurance: 600, exp: 350 }
        ],
         boss: {
             name: "Resonating Golem",
             level: 8,
             strength: 20,
             defense: 5,
             endurance: 300,
             exp: 250,
             gold: 200,
             isBoss: true,
             mechanics: {
                 tenthAttackMultiplier: 10
             }
         }
    },
    {
        name: "Altbearstein Keep",
        enemies: [
            { name: "A Guardian Golem", level: 12, strength: 35, defense: 12, endurance: 800, exp: 400 },
            { name: "A Royal Guard", level: 13, strength: 38, defense: 15, endurance: 1000, exp: 500 },
            { name: "An Archmage", level: 14, strength: 42, defense: 18, endurance: 1500, exp: 600 }
        ],
             boss: {
                 name: "Cursed King",
                 level: 11,
                 strength: 30,
                 defense: 10,
                 endurance: 600,
                 exp: 400,
                 gold: 300,
                 isBoss: true,
                 mechanics: {
                     requiredItem: "King's Bane"
                 }
             }
    }
],
  paths: {
      blood: {
          name: "Path of Blood",
          description: "Tracks total energy gained",
          tiers: [
              {
                  threshold: 1000,
                  choices: [
                      { reward: { lifestealBonus: 2 }, description: "Increase lifesteal by 2" },
                      { reward: { energyGainMultiplier: 1.1 }, description: "10% more energy from kills" },
                      { reward: { regenBonus: 0.5 }, description: "Regenerate 0.5 HP per 5s" }
                  ]
              },
              {
                  threshold: 5000,
                  choices: [
                      { reward: { maxEnergyMultiplier: 1.15 }, description: "15% more max energy" },
                      { reward: { lifestealBleed: 0.1 }, description: "Lifesteal applies 10% bleed damage" },
                      { reward: { energyBurst: 50 }, description: "Killing blows release 50 bonus energy" }
                  ]
              },
              {
                  threshold: 10000,
                  choices: [
                      { reward: { lifestealOverheal: true }, description: "Lifesteal can overheal up to 25% max HP" },
                      { reward: { energyGainMultiplier: 1.2 }, description: "20% more energy from kills" },
                      { reward: { bloodFrenzy: 0.1 }, description: "10% damage bonus when HP below 50%" }
                  ]
              },
              {
                  threshold: 20000,
                  choices: [
                      { reward: { lifestealBonus: 5 }, description: "Increase lifesteal by 5" },
                      { reward: { energyShield: 0.2 }, description: "20% of energy gained shields HP" },
                      { reward: { regenBonus: 1 }, description: "Regenerate 1 HP per 5s" }
                  ]
              },
              {
                  threshold: 50000,
                  choices: [
                      { reward: { bloodMastery: true }, description: "Double lifesteal when HP below 25%" },
                      { reward: { energyGainMultiplier: 1.5 }, description: "50% more energy from kills" },
                      { reward: { maxEnergyMultiplier: 1.25 }, description: "25% more max energy" }
                  ]
              }
          ]
      },
      death: {
          name: "Path of Death",
          description: "Tracks total kills and collects souls",
          tiers: [
              {
                  threshold: 100,
                  choices: [
                      { reward: { soulDamage: 0.05 }, description: "5% bonus damage per soul type held" },
                      { reward: { deathSpeed: 0.1 }, description: "10% faster attack speed" },
                      { reward: { soulGainMultiplier: 1.2 }, description: "20% more souls from kills" }
                  ]
              },
              {
                  threshold: 500,
                  choices: [
                      { reward: { soulShield: 5 }, description: "5 HP shield per soul type" },
                      { reward: { deathCrit: 0.05 }, description: "5% crit chance" },
                      { reward: { soulBurst: 10 }, description: "10 damage burst per kill" }
                  ]
              },
              {
                  threshold: 1000,
                  choices: [
                      { reward: { soulConversion: true }, description: "Convert souls to energy (1:10)" },
                      { reward: { deathSpeed: 0.15 }, description: "15% faster attack speed" },
                      { reward: { soulGainMultiplier: 1.3 }, description: "30% more souls from kills" }
                  ]
              },
              {
                  threshold: 2000,
                  choices: [
                      { reward: { soulDamage: 0.1 }, description: "10% bonus damage per soul type" },
                      { reward: { deathCrit: 0.1 }, description: "10% crit chance" },
                      { reward: { soulReaper: true }, description: "Chance to gain extra soul on kill" }
                  ]
              },
              {
                  threshold: 5000,
                  choices: [
                      { reward: { deathMastery: true }, description: "Double soul effects" },
                      { reward: { soulShield: 10 }, description: "10 HP shield per soul type" },
                      { reward: { soulBurst: 25 }, description: "25 damage burst per kill" }
                  ]
              }
          ]
      },
      vengeance: {
          name: "Path of Vengeance",
          description: "Tracks boss kills",
          tiers: [
              {
                  threshold: 1,
                  choices: [
                      { reward: { bossDamage: 1.05 }, description: "Increase boss damage by 5%" },
                      { reward: { bossExp: 1.05 }, description: "Increase boss EXP by 5%" },
                      { reward: { bossGold: 1.05 }, description: "Increase boss gold by 5%" }
                  ]
              },
              {
                  threshold: 5,
                  choices: [
                      { reward: { bossExp: 1.10 }, description: "Increase boss EXP by 10%" },
                      { reward: { bossGold: 1.10 }, description: "Increase boss gold by 10%" },
                      { reward: { bossSouls: 1.05 }, description: "Increase boss souls by 5%" }
                  ]
              },
              {
                  threshold: 10,
                  choices: [
                      { reward: { bossGold: 1.10 }, description: "Increase boss gold by 10%" },
                      { reward: { bossDamage: 1.10 }, description: "Increase boss damage by 10%" },
                      { reward: { bossExp: 1.15 }, description: "Increase boss EXP by 15%" }
                  ]
              },
              {
                  threshold: 20,
                  choices: [
                      { reward: { bossSouls: 1.05 }, description: "Increase boss souls by 5%" },
                      { reward: { bossDamage: 1.15 }, description: "Increase boss damage by 15%" },
                      { reward: { bossGold: 1.15 }, description: "Increase boss gold by 15%" }
                  ]
              },
              {
                  threshold: 50,
                  choices: [
                      { reward: { ultimateReward: true }, description: "Unlock ultimate vengeance reward" },
                      { reward: { bossDamage: 1.20 }, description: "Increase boss damage by 20%" },
                      { reward: { bossSouls: 1.15 }, description: "Increase boss souls by 15%" }
                  ]
              }
          ]
      }
  }
};
gameData.shopItems = {
        3: [
            { type: 'helmet', name: 'Bronze Helmet', stats: { endurance: 1 }, price: 50, icon: 'assets/equipment/helmet.png' },
            { type: 'body', name: 'Padded Armor', stats: { endurance: 2 }, price: 80, icon: 'assets/equipment/chest.png' },
            { type: 'gauntlets', name: 'Leather Gloves', stats: { strength: 1 }, price: 60, icon: 'assets/equipment/gauntlet.png' },
            { type: 'shield', name: 'Wooden Shield', stats: { swordfighting: 1 }, price: 70, icon: 'assets/equipment/shield.png' },
            { type: 'boots', name: 'Traveler’s Boots', stats: { endurance: 1 }, price: 50, icon: 'assets/equipment/boots.png' },
            { type: 'ring', name: 'Copper Ring', stats: { willpower: 2 }, price: 60, icon: 'assets/equipment/ring.png' },
            { type: 'amulet', name: 'Stone Amulet', stats: { endurance: 1 }, price: 50, icon: 'assets/equipment/neck.png' }
        ],
        4: [
            { type: 'helmet', name: 'Iron Helm', stats: { endurance: 2 }, price: 100, icon: 'assets/equipment/helmet.png' },
            { type: 'body', name: 'Chainmail', stats: { endurance: 3 }, price: 150, icon: 'assets/equipment/chest.png' },
            { type: 'gauntlets', name: 'Steel Gauntlets', stats: { strength: 2 }, price: 120, icon: 'assets/equipment/gauntlet.png' },
            { type: 'shield', name: 'Iron Shield', stats: { swordfighting: 2 }, price: 140, icon: 'assets/equipment/shield.png' },
            { type: 'boots', name: 'Reinforced Boots', stats: { endurance: 2 }, price: 110, icon: 'assets/equipment/boots.png' },
            { type: 'ring', name: 'Silver Ring', stats: { willpower: 4 }, price: 130, icon: 'assets/equipment/ring.png' },
            { type: 'amulet', name: 'Jade Amulet', stats: { endurance: 2, willpower: 1 }, price: 140, icon: 'assets/equipment/neck.png' }
        ],
        5: [
            { type: 'helmet', name: 'Steel Helm', stats: { endurance: 3 }, price: 200, icon: 'assets/equipment/helmet.png' },
            { type: 'body', name: 'Plate Armor', stats: { endurance: 4 }, price: 250, icon: 'assets/equipment/chest.png' },
            { type: 'gauntlets', name: 'Knight’s Gauntlets', stats: { strength: 3 }, price: 220, icon: 'assets/equipment/gauntlet.png' },
            { type: 'shield', name: 'Tower Shield', stats: { swordfighting: 3 }, price: 230, icon: 'assets/equipment/shield.png' },
            { type: 'boots', name: 'Plated Boots', stats: { endurance: 3 }, price: 210, icon: 'assets/equipment/boots.png' },
            { type: 'ring', name: 'Gold Ring', stats: { willpower: 6 }, price: 240, icon: 'assets/equipment/ring.png' },
            { type: 'amulet', name: 'Emerald Amulet', stats: { endurance: 3, willpower: 2 }, price: 260, icon: 'assets/equipment/neck.png' },
            { type: 'weapon', name: "King's Bane", stats: { strength: 5 }, price: 500, icon: 'assets/equipment/kings_bane.png' }

        ]
    };

gameData.events = [
 {
     id: 'treasureChest',
     hasTriggeredBefore:false,
     condition: () => Math.random() < 0.03, // 5% chance per kill
     effect: () => {
         const choices = [
             {
                 label: 'Open the chest',
                 action: () => {
                     const goldGained = Math.floor(Math.random() * 100) + 50;
                     game.wielder.gold += goldGained;
                     addCombatMessage('You found '+ goldGained + ' gold in the chest!', 'player-stat');
                 }
             },
             {
                 label: 'Leave it alone',
                 action: () => {
                     addCombatMessage('You decided to leave the chest alone.', 'player-stat');
                 }
             },
             {
                 label: 'Disarm trap',
                 action: () => {
                     if (Math.random() < 0.5) {
                         const goldGained = Math.floor(Math.random() * 200) + 100;
                         game.wielder.gold += goldGained;
                         addCombatMessage('You disarmed the trap and found ${goldGained} gold!', 'player-stat');
                     } else {
                         const damage = Math.floor(Math.random() * 20) + 10;
                         game.wielder.currentLife -= damage;
                         addCombatMessage('The trap triggered! You took ${damage} damage.', 'player-stat');
                     }
                 }
             }
         ];
         showEventModal('Treasure Chest', 'You found a mysterious treasure chest. What will you do?', choices);
     }
 },

];
}