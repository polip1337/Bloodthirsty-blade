function updateEnergyAndKills() {
    document.getElementById('energy').textContent = game.sword.energy.toFixed(0);
    document.getElementById('maxEnergy').textContent = game.sword.maxEnergy.toFixed(0);
    document.getElementById('totalKills').textContent = game.statistics.totalKills;
    updateUpgrades();
}
function updateWielderStats() {
    const wielder = game.wielder;
    const effectiveStats = getEffectiveStats();
    const baseDamage = effectiveStats.strength * 2 + effectiveStats.swordfighting;

    const controlDamageBonus = baseDamage * game.controlBonus;
    const lifesteal = game.sword.upgrades.siphon.level;
    const totalDamage = (baseDamage + controlDamageBonus) * getDamageMultiplier();
    const damageFromBonus = totalDamage - (baseDamage + controlDamageBonus);
    let wielderHTML = `
        <div class="stat">Name: <span id="wielderName">${wielder.name}</span></div>
        <div class="stat">Race: <span id="wielderRace">${wielder.race}</span></div>
        <div class="stat tooltip">
            Strength: ${effectiveStats.strength.toFixed(1)}${wielder.baseStats.strength > effectiveStats.strength ? '⚠' : ''}
            <span class="tooltiptext">Increases damage dealt per strike (+2 Damage)${getWoundText('strength')}</span>
        </div><br />
        <div class="stat tooltip">
            Swordfighting: ${effectiveStats.swordfighting.toFixed(1)}${wielder.baseStats.swordfighting > effectiveStats.swordfighting ? '⚠' : ''}
            <span class="tooltiptext">Reduces incoming damage (+1 resistance) Increases damage (+1)${getWoundText('swordfighting')}</span>
        </div><br />
        <div class="stat tooltip">
            Endurance: ${effectiveStats.endurance.toFixed(1)}
            <span class="tooltiptext">Determines maximum health (HP = Endurance × 5)</span>
        </div><br />
        <div class="stat tooltip">
            HP: ${Math.max(wielder.currentLife, 0).toFixed(1)}/${(effectiveStats.endurance * 5).toFixed(1)}
            <span class="tooltiptext">Current/Maximum health (Regenerates 1 HP every 5s)</span>
        </div><br />
        <div class="stat tooltip">
            Willpower: ${effectiveStats.willpower.toFixed(1)}${wielder.baseStats.willpower > effectiveStats.willpower ? '⚠' : ''}
            <span class="tooltiptext">Increases exp gain, reduces control (up to 100% at 200)${getWoundText('willpower')}</span>
        </div><br />
        <div class="stat tooltip">
            EXP: ${wielder.exp.toFixed(1)}/${(wielder.level * 100).toFixed(1)}
            <span class="tooltiptext">Gain a level every 100 exp points</span>
        </div><br />
        <div class="stat tooltip">
            Level: ${wielder.level}
        </div><br />
        <div class="stat tooltip">
            Predicted Damage: ${totalDamage.toFixed(1)} + ${lifesteal} lifesteal
            <span class="tooltiptext">
                Base: ${baseDamage.toFixed(1)} (Strength: ${effectiveStats.strength.toFixed(1)} × 2 + Swordfighting: ${effectiveStats.swordfighting.toFixed(1)})<br>
                Control Bonus: +${controlDamageBonus.toFixed(1)} (${(game.controlBonus * 100).toFixed(0)}%)<br>
                Damage multiplier: +${damageFromBonus.toFixed(2)} (${((getDamageMultiplier()-1) * 100).toFixed(0)}%)<br>
                Lifesteal: +${lifesteal} damage & heal per hit
            </span>
        </div><br />
        <div class="stat tooltip">
            Damage Reduction: ${effectiveStats.swordfighting.toFixed(1)}
            <span class="tooltiptext">Reduces incoming damage by this amount</span>
        </div>
        <br />
        <br />
        <div class="stat tooltip">
            Gold: ${game.wielder.gold}
            <span class="tooltiptext">Your current gold. If the wielder dies you loose it along with any equipment</span>
        </div>
    `;

    document.getElementById('statsDiv').innerHTML = wielderHTML;
}
function updateEquipmentAndInventory() {
    let equipmentHTML = '';
    if (gameData.zones[3].unlocked) {
        equipmentHTML += '<div id="equipment-grid">';
        const slots = ['helmet', 'body', 'gauntlets', 'weapon', 'shield', 'boots', 'ring', 'amulet'];
        slots.forEach(slot => {
            const item = game.wielder.equipment[slot];
            equipmentHTML += `
                <div class="equipment-slot tooltip ${getItemBorderClass(item)}" onclick="unequipItem('${slot}')">
                    <img src="${item ? item.icon : 'placeholder.png'}" alt="${item ? item.name : 'none'}">
                    <span class="tooltiptext">${item ? getItemTooltip(item) : ''}</span>
                </div>`;
        });
        equipmentHTML += '</div>';

        equipmentHTML += '<h3>Inventory</h3><div id="inventory-grid">';
        game.wielder.inventory.forEach((item, index) => {
            equipmentHTML += `
                <div class="inventory-slot tooltip ${getItemBorderClass(item)}" onclick="handleInventoryClick(${index})">
                    <img src="${item.icon}" alt="${item.name}">
                    <span class="tooltiptext">${getItemTooltip(item)}</span>
                </div>`;
        });
        for (let i = game.wielder.inventory.length; i < 9; i++) {
            equipmentHTML += '<div class="inventory-slot"><img src="placeholder.png" alt="empty"></div>';
        }
        equipmentHTML += '</div>';

        equipmentHTML += `<div class="stat">Gold: ${game.wielder.gold}</div>`;
        equipmentHTML += `
            <button id="sellModeButton" onclick="toggleSellMode()">
                ${game.sellMode ? 'Exit Sell Mode' : 'Enter Sell Mode'}
            </button>`;
    }
    document.getElementById('equipmentDiv').innerHTML = equipmentHTML;
}
function redrawUpgrades(){
    const upgradesDiv = document.getElementById('upgrades');
    if (!upgradesDiv) return;

    upgradesDiv.innerHTML = Object.entries(game.sword.upgrades)
        .map(([name, data]) => {
            const buttonId = `upgrade-${name}-btn`;
            return `
                <div class="upgrade tooltip" id="upgrade-${name}">
                    ${name.charAt(0).toUpperCase() + name.slice(1)} (Level ${data.level})
                    <span class="tooltiptext">${getUpgradeTooltip(name)}</span>
                    <button id="${buttonId}" onclick="buyUpgrade('${name}')" ${data.level >= gameData.upgradeCaps[name] ? 'disabled' : game.sword.energy >= data.cost ? '' : 'disabled'}>
                        ${data.level >= gameData.upgradeCaps[name] ? 'Max level' : `Upgrade (${Math.round(data.cost)} energy)`}
                    </button>
                </div>
            `;
        })
        .join('');

    // Cache button references and initial costs
    Object.keys(game.sword.upgrades).forEach(name => {
        upgradeButtons[name] = document.getElementById(`upgrade-${name}-btn`);
        previousCosts[name] = game.sword.upgrades[name].cost;
    });
    isUpgradesInitialized = true;
}
let previousEnergy = null; // Cache previous energy to detect changes
let previousCosts = {}; // Cache previous costs to detect changes
let upgradeButtons = {}; // Store references to buttons for selective updates
let isUpgradesInitialized = false; // Track if DOM has been created

function updateUpgrades(currentEnergy = game.sword.energy) {


    // Initialize the upgrades DOM on the first call
    if (!isUpgradesInitialized) {
        redrawUpgrades();
    }

    // Skip update if energy hasn't changed and no costs have changed
    let costsChanged = false;
    Object.entries(game.sword.upgrades).forEach(([name, data]) => {
        let finalCost = calculateFinalCost(name);
        if (previousCosts[name] !== finalCost) {
            costsChanged = true;
            previousCosts[name] = finalCost;
        }
    });
    if (previousEnergy === currentEnergy && !costsChanged) return;

    // Update buttons that need to change state or text
    Object.entries(game.sword.upgrades).forEach(([name, data]) => {
        const button = upgradeButtons[name];
        if (!button) return;
        let finalCost = calculateFinalCost(name);

        const isMaxLevel = data.level >= gameData.upgradeCaps[name];
        const wasAffordable = previousEnergy !== null && previousEnergy >= finalCost;
        const isAffordable = currentEnergy >= finalCost;

        // Update if affordability changes or cost changes
        if (isMaxLevel || wasAffordable !== isAffordable || costsChanged) {
            button.disabled = isMaxLevel || !isAffordable;
            button.textContent = isMaxLevel
                ? 'Max level'
                : `Upgrade (${Math.round(finalCost)} energy)`;
        }
    });

    previousEnergy = currentEnergy; // Update cached energy
}
function updateEnemyZones() {
    if (gameData.zones[4].unlocked && !game.selectedPath) {
            showPathSelectionModal();
    }
    document.getElementById('enemies').innerHTML = gameData.zones
        .filter(zone => zone.unlocked)
        .map((zone, zi) => `
            <div class="zone">
                <h4>${zone.name}</h4>
                <span class="tooltip">
                    <button class="explore-btn" onclick="exploreZone(${zi})">Explore</button>
                    <span class="tooltiptext">
                        Possible enemies:<br>
                        ${zone.enemies.map(e => `${e.name} (Lv. ${e.level}, ${e.endurance*5} HP)`).join('<br>')}
                    </span>
                </span>
                ${zi > 2 ? `<button onclick="openShop(${zi})">Shop</button>` : ''}
                <span class="autofight tooltip">
                    <input type="checkbox" id="auto-${zi}" onchange="toggleAutoFight(${zi})"
                        ${game.currentAction === 'autoFighting' && lastUsedZoneIndex === zi ? 'checked' : ''}>
                    <label for="auto-${zi}">Auto explore</label>
                    <span class="tooltiptext">
                        Requires connection lvl ${zi + 1}
                    </span>
                </span>
            </div>
        `)
        .join('');
}
function updateButtonStates() {
    const actionInProgress = !!game.currentAction;
        document.querySelectorAll('#enemies button').forEach(btn => {
            btn.disabled = actionInProgress || game.wielder.defeated;
        });
        gameData.zones.forEach((_, zi) => {
            const checkbox = document.getElementById(`auto-${zi}`);
            if (checkbox) {
                const connectionLevel = game.sword.upgrades.connection?.level || 0;
                const requiredLevel = zi + 1;
                const shouldBeDisabled = connectionLevel < requiredLevel || game.wielder.defeated || (game.currentAction && game.currentAction !== 'autoFighting');
                checkbox.disabled = shouldBeDisabled; // Disable the checkbox
                if (shouldBeDisabled) {
                    checkbox.parentNode.classList.add("disabled");
                } else {
                    checkbox.parentNode.classList.remove("disabled");
                }
            }
        });
    const healButton = document.getElementById('healButton');
    const changeWielderButton = document.getElementById('changeWielderButton');
    const restButton = document.getElementById('restButton');
    const trainButton = document.getElementById('trainButton');

    if (game.wielder.defeated) {
        restButton.disabled = true;
        trainButton.disabled = true;
        healButton.disabled = true;
        changeWielderButton.disabled = false;
    } else {
        restButton.disabled = false;
        trainButton.disabled = false;
        healButton.disabled = game.sword.energy < 10 || game.wielder.currentLife >= getEffectiveStats().endurance * 5;
        changeWielderButton.disabled = game.sword.energy < 10;
    }
}
function updateDisplay() {
    updateEnergyAndKills();
    updateWielderStats();
    updateEquipmentAndInventory();
    updateUpgrades();
    updateEnemyZones();
    updateButtonStates();
    updatePathsTab();
    updateAchievementsTab();
    updateHealthBar();

    const equipmentTabBtn = document.getElementById('equipmentTabBtn');
    equipmentTabBtn.style.display = gameData.zones[3].unlocked ? 'inline' : 'none';

    // Hide/show Paths tab based on Zone 5 unlock
    const pathsTabBtn = document.getElementById('pathsTabBtn');
    pathsTabBtn.style.display = gameData.zones[4].unlocked ? 'inline' : 'none';
}

function showTab(tabName) {
    const zonesContent = document.getElementById('zones-content');
    const achievementsContent = document.getElementById('achievements-content');
    const pathsContent = document.getElementById('paths-content');
    const tabs = document.querySelectorAll('#tabs button');

    zonesContent.style.display = tabName === 'zones' ? 'block' : 'none';
    achievementsContent.style.display = tabName === 'achievements' ? 'block' : 'none';
    pathsContent.style.display = tabName === 'paths' ? 'block' : 'none';

    tabs.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#tabs button[onclick="showTab('${tabName}')"]`).classList.add('active');

    if (tabName === 'achievements') updateAchievementsTab();
    if (tabName === 'paths') updatePathsTab();
}

function showRaceSelection() {
    document.getElementById('wielderDeathModal').style.display = 'none';

    const modal = document.getElementById('raceSelectionModal');
    gameData.zones = gameData.zones.map((zone, index) => ({
        ...zone,
        unlockRace: Object.keys(races).find(race => races[race].unlockRequirement?.zone === index)
    }));

    let content = '<div class="race-list">';
    Object.entries(races).forEach(([raceKey, raceData]) => {
        const zone = gameData.zones[raceData.unlockRequirement?.zone];
        const kills = raceData.unlockRequirement ? (game.statistics.zoneKills[raceData.unlockRequirement.zone] || 0) : 0;
        const required = raceData.unlockRequirement?.kills || 0;
        raceData.unlocked = raceData.unlocked || kills >= required;

        const baseRanges = {
            strength: raceKey === 'goblin' && !game.wielder ? 5 : Math.floor(Math.random() * 6 + 1),
            swordfighting: raceKey === 'goblin' && !game.wielder ? 5 : Math.floor(Math.random() * 6 + 1),
            endurance: raceKey === 'goblin' && !game.wielder ? 2 : Math.floor(Math.random() * 2 + 1),
            willpower: Math.floor(Math.random() * 50 + 50)
        };
        const stats = {
            strength: baseRanges.strength + (raceData.stats.strength || 0),
            swordfighting: baseRanges.swordfighting + (raceData.stats.swordfighting || 0),
            endurance: baseRanges.endurance + (raceData.stats.endurance || 0),
            willpower: baseRanges.willpower + (raceData.stats.willpower || 0)
        };

        const tooltipClass = raceData.unlocked ? 'tooltip' : '';
        content += `
            <div onclick="selectRace('${raceKey}')" class="race-option ${raceData.unlocked ? '' : 'locked'} ${tooltipClass}">
                <h4>${raceKey.toUpperCase()}</h4>
                <div class="stats">
                    Strength: ${stats.strength.toFixed(1)} | Swordfighting: ${stats.swordfighting.toFixed(1)} |
                    Endurance: ${stats.endurance.toFixed(1)} | Willpower: ${stats.willpower.toFixed(1)}
                </div>
                ${!raceData.unlocked ? `
                    <div class="unlock-requirement">
                        ${required} ${zone?.name} kills (${kills}/${required})
                    </div>
                ` : ''}
                ${raceData.unlocked ? `
                    <span class="tooltiptext">
                        Starting stats:<br>
                        Strength: ${stats.strength.toFixed(1)}<br>
                        Swordfighting: ${stats.swordfighting.toFixed(1)}<br>
                        Endurance: ${stats.endurance.toFixed(1)}<br>
                        Willpower: ${stats.willpower.toFixed(1)}
                    </span>
                ` : ''}
            </div>
        `;
    });
    content += '</div>';
    document.getElementById('raceOptions').innerHTML = content;
    modal.style.display = 'block';
    adjustTooltipPosition();
}

function onModalClose(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (game.currentAction === 'autoFighting' && !game.isFighting && !isAnyModalOpen()) {
        startAutoBattle();
    }
    updateDisplay();
}

function showStatistics() {
const content = document.getElementById('statisticsContent');
    let html = '<ul>';

    // Wielder Stats
    html += '<li><strong>Wielder Stats</strong></li>';
    html += `<li>Current HP: ${game.wielder.currentLife.toFixed(1)} / ${getEffectiveStats().endurance*5}</li>`;
    html += `<li>Level: ${game.wielder.level}</li>`;
    html += `<li>Experience: ${game.wielder.exp.toFixed(1)} / ${(game.wielder.level * 100).toFixed(1)}</li>`;
    html += `<li>Gold: ${game.wielder.gold.toFixed(0)}</li>`;
    html += `<li>Defeated: ${game.wielder.defeated ? 'Yes' : 'No'}</li>`; // Assumed tracked

    // Sword Stats
    html += '<li><strong>Sword Stats</strong></li>';
    html += `<li>Energy: ${game.sword.energy.toFixed(1)} / ${game.sword.maxEnergy.toFixed(1)}</li>`;
    if (game.sword.upgrades) {
        Object.entries(game.sword.upgrades).forEach(([key, upgrade]) => {
            html += `<li>${key.charAt(0).toUpperCase() + key.slice(1)} Level: ${upgrade.level}</li>`;
        });
    }

    // General Statistics
    html += '<li><strong>General Statistics</strong></li>';
    html += `<li>Total Kills: ${game.statistics.totalKills}</li>`;
    html += `<li>Total Upgrades Performed: ${game.statistics.totalUpgrades}</li>`;
    html += `<li>Achievements Completed: ${game.completedAchievements.length}</li>`;

    // Souls (if Path of Death is selected)
    if (game.selectedPath === 'death' && game.souls) {
        html += '<li><strong>Souls Collected</strong></li>';
        html += `<li>Minor Souls: ${game.souls.minor}</li>`;
        html += `<li>Normal Souls: ${game.souls.normal}</li>`;
        html += `<li>Major Souls: ${game.souls.major}</li>`;
        html += `<li>Epic Souls: ${game.souls.epic}</li>`;
    }

    // Zone Progress (assumed tracked)
    if (game.zones) {
        html += '<li><strong>Zone Progress</strong></li>';
        game.zones.forEach((zone, index) => {
            html += `<li>Zone ${index + 1} Unlocked: ${zone.unlocked ? 'Yes' : 'No'}</li>`;
        });
    }

    html += '</ul>';
    content.innerHTML = html;
    document.getElementById('statsModal').style.display = 'block';
}

function showStory(viewed) {
    if (viewed) {
        if (!game.story1Viewed){
            showStory();
            showStoryContent("story1");
        }
        game.story1Viewed = true;
        return;
    }
    const stories = Object.entries(gameData.story).filter(([_, story]) => story.unlocked);
    const listDiv = document.querySelector('#storyModal .story-list');
    const contentDiv = document.querySelector('#storyModal .story-content');
    listDiv.innerHTML = stories.map(([key, story]) => `
        <div class="story-title" onclick="showStoryContent('${key}')">${story.title}</div>
    `).join('');

    document.getElementById('storyModal').style.display = 'block';
}
function showStoryContent(key) {
    const story = gameData.story[key];
    if (story && story.unlocked) {
        document.querySelector('#storyModal .story-content').innerHTML = `
            <h4>${story.title}</h4>
            <p>${story.entry.join('</p><p>')}</p>
        `;
    }
}
function showChangelog() {
    document.getElementById('changelogContent').innerHTML = `
        <p>v1.2 - Added Save System & Wounds</p>
        <p>v1.1 - Zone Combat System</p>
        <p>v1.0 - Base Game</p>
    `;
    document.getElementById('changelogModal').style.display = 'block';
}

function showOptions() {
    document.getElementById('optionsModal').style.display = 'block';
    document.getElementById('saveData').value = '';
}

function adjustTooltipPosition() {
    document.querySelectorAll('.tooltip').forEach(tooltip => {
        const tooltipText = tooltip.querySelector('.tooltiptext');
        if (!tooltipText) return;

        const triggerRect = tooltip.getBoundingClientRect();
        const tooltipRect = tooltipText.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Try to position below the trigger
        let top = triggerRect.bottom + 5;
        let left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);

        // If below goes offscreen, position above
        if (top + tooltipRect.height > viewportHeight) {
            top = triggerRect.top - tooltipRect.height - 5;
        }

        // Adjust horizontal position to stay within viewport
        if (left < 0) {
            left = 0;
        } else if (left + tooltipRect.width > viewportWidth) {
            left = viewportWidth - tooltipRect.width;
        }

        // Apply the calculated position
        tooltipText.style.top = `${top}px`;
        tooltipText.style.left = `${left}px`;
        tooltipText.style.bottom = 'auto';
        tooltipText.style.right = 'auto';
        tooltipText.style.transform = 'none';
    });
}
function showPathSelectionModal() {
    const modal = document.getElementById('pathSelectionModal');
    const content = `
        <div class="race-list">
            <div onclick="selectPath('blood')" class="race-option tooltip">
                <h4>Path of Blood</h4>
                <p>Harness the energy absorbed by the sword.</p>
                <span class="tooltiptext">${gameData.paths.blood.description}</span>
            </div>
            <div onclick="selectPath('death')" class="race-option tooltip">
                <h4>Path of Death</h4>
                <p>Revel in the slaughter and collect souls.</p>
                <span class="tooltiptext">${gameData.paths.death.description}</span>
            </div>
            <div onclick="selectPath('vengeance')" class="race-option tooltip">
                <h4>Path of Vengeance</h4>
                <p>Seek retribution against mighty foes.</p>
                <span class="tooltiptext">${gameData.paths.vengeance.description}</span>
            </div>
        </div>
    `;
    document.getElementById('pathOptions').innerHTML = content;
    modal.style.display = 'block';
}
function updatePathsTab() {
    const display = document.getElementById('paths-display');
    if (!game.unlockedPaths.length) {
        display.innerHTML = '<p>Reach Zone 5 to unlock the Path mechanic.</p>';
        return;
    }
    let content = '<div id="path-subtabs">';
    game.unlockedPaths.forEach(path => {
        content += `<button onclick="showPathSubtab('${path}')">${gameData.paths[path].name}</button>`;
    });
    content += '</div><div id="path-subtab-content"></div>';
    display.innerHTML = content;
    showPathSubtab(game.selectedPath || game.unlockedPaths[0]);
}

function showPathSubtab(path) {
    const contentDiv = document.getElementById('path-subtab-content');
    const pathData = gameData.paths[path];
    const progress = game.pathProgress[path];
    const tiersUnlocked = game.pathTiersUnlocked[path];
    let content = `<h3>${pathData.name}</h3><p>${pathData.description}</p>`;
    if (path === 'death') {
        content += `
            <div class="stat tooltip">
                Souls: ${game.souls.minor}/${game.souls.normal}/${game.souls.major}/${game.souls.epic}
                <span class="tooltiptext">Minor/Normal/Major/Epic souls collected</span>
            </div>`;
    }
    const nextTierIndex = pathData.tiers.findIndex((tier, idx) => !tiersUnlocked.includes(idx));
    content += '<h4>Progress</h4>';
    if (nextTierIndex !== -1) {
        const nextTier = pathData.tiers[nextTierIndex];
        content += `
            <div class="upgrade">
                Tier ${nextTierIndex + 1}: ${progress}/${nextTier.threshold}
            </div>`;
    } else {
        content += '<p>All tiers unlocked for this path.</p>';
    }
    content += '<h4>Unlocked Tiers</h4>';
    tiersUnlocked.forEach(idx => {
        const tier = pathData.tiers[idx];
        content += `
            <div class="upgrade unlocked">
                Tier ${idx + 1}: Unlocked<br>
                Reward: ${getPathRewardText(tier.reward)}
            </div>`;
    });
    contentDiv.innerHTML = content;
    document.querySelectorAll('#path-subtabs button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === pathData.name) btn.classList.add('active');
    });
}

function getPathRewardText(reward) {
    if (reward.damageMultiplier) return `+${((reward.damageMultiplier - 1) * 100).toFixed(0)}% damage`;
    if (reward.maxEnergyMultiplier) return `+${((reward.maxEnergyMultiplier - 1) * 100).toFixed(0)}% max energy`;
    if (reward.upgradeCostReduction) return `-${(reward.upgradeCostReduction * 100).toFixed(0)}% upgrade cost`;
    if (reward.expMultiplier) return `+${((reward.expMultiplier - 1) * 100).toFixed(0)}% EXP gain`;
    if (reward.startingStats) return `+${reward.startingStats} to all starting stats`;
    if (reward.souls) return `+${Object.entries(reward.souls).map(([type, num]) => `${num} ${type}`).join(', ')} souls`;
    if (reward.bossDamage) return `+${((reward.bossDamage - 1) * 100).toFixed(0)}% boss damage`;
    if (reward.bossExp) return `+${((reward.bossExp - 1) * 100).toFixed(0)}% boss EXP`;
    if (reward.bossGold) return `+${((reward.bossGold - 1) * 100).toFixed(0)}% boss gold`;
    if (reward.bossSouls) return `+${((reward.bossSouls - 1) * 100).toFixed(0)}% boss souls`;
    if (reward.ultimateReward) return `Ultimate Vengeance Reward`;
    return 'Unknown reward';
}
function showLeftTab(tabName) {
    const tabs = ['sword', 'wielder', 'equipment'];
    tabs.forEach(tab => {
        document.getElementById(`${tab}-content`).style.display = tab === tabName ? 'block' : 'none';
    });
    document.querySelectorAll('#left-tabs #tabs-left button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`#left-tabs #tabs-left button[onclick="showLeftTab('${tabName}')"]`).classList.add('active');
    updateDisplay();
}
function updateHealthBar(){
    const wielderHealthFill = document.querySelector('#wielder-health .health-bar-fill');

    wielderHealthFill.style.width = `${(game.wielder.currentLife / (getEffectiveStats().endurance *5)) * 100}%`;
}
function updateEnemyHealthBar(enemy){
    const enemyHealthFill = document.querySelector('#enemy-health .health-bar-fill');
    enemyHealthFill.style.width = `${(enemy.endurance * 5 / enemy.maxLife) * 100}%`;

}
function showFloatingNumber(value, elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const number = document.createElement('div');
    number.className = 'floating-number';
    number.textContent = `+${value}`;
    number.style.left = `${rect.left + rect.width / 2 - 10}px`; // Center horizontally
    number.style.top = `${rect.top - 10}px`; // Above the button
    document.body.appendChild(number);

    // Remove the element after animation completes
    setTimeout(() => number.remove(), 2000);
}