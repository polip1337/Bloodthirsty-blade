function updateEnergyAndKills() {
    document.getElementById('energy').textContent = game.sword.energy.toFixed(0);
    document.getElementById('maxEnergy').textContent = game.sword.maxEnergy.toFixed(0);
    document.getElementById('totalKills').textContent = game.statistics.totalKills;
    updateUpgrades();
}
function updateWielderHealth() {
    const wielder = game.wielder;
    const effectiveStats = getEffectiveStats();
    const maxHp = effectiveStats.endurance * 5;
    const healthDiv = document.getElementById('wielder-health-stat');

    if (healthDiv) {
        healthDiv.innerHTML = `
            HP: ${Math.max(wielder.currentLife, 0).toFixed(1)}/${maxHp.toFixed(1)}
            <span class="tooltiptext">Current/Maximum health (Regenerates 1 HP every 5s)</span>
        `;
    }
}
function updateModalGold(){
    if(document.getElementById('modal-gold-value')){
        let innerHTML = `
        Gold: ${game.wielder.gold}
        `;

        document.getElementById('modal-gold-value').innerHTML = innerHTML;
    }
}
function updateWielderStats() {
    const wielder = game.wielder;
    const effectiveStats = getEffectiveStats();
    const baseDamage = effectiveStats.strength * 2; // Remove swordfighting
    const controlDamageBonus = baseDamage * game.controlBonus;
    const lifesteal = game.sword.upgrades.siphon.level;
    const totalDamage = (baseDamage + controlDamageBonus) * getDamageMultiplier();
    const damageFromBonus = totalDamage - (baseDamage + controlDamageBonus);
    let wielderHTML = `
        <div class="stat">Name: <span id="wielderName">${wielder.name}</span></div>
        <div class="stat">Race: <span id="wielderRace">${wielder.race.charAt(0).toUpperCase() + wielder.race.slice(1)}</span></div>
        <div class="stat tooltip">
            Strength: ${effectiveStats.strength.toFixed(1)}${wielder.baseStats.strength > effectiveStats.strength ? '⚠' : ''}
            <span class="tooltiptext">Increases damage dealt per strike (+2 Damage)${getWoundText('strength')}</span>
        </div><br />
        <div class="stat tooltip">
            Swordfighting: ${effectiveStats.swordfighting.toFixed(1)}${wielder.baseStats.swordfighting > effectiveStats.swordfighting ? '⚠' : ''}
            <span class="tooltiptext">Reduces incoming damage (+1 resistance)${getWoundText('swordfighting')}</span>
        </div><br />
        <div class="stat tooltip">
            Endurance: ${effectiveStats.endurance.toFixed(1)}
            <span class="tooltiptext">Determines maximum health (HP = Endurance × 5)</span>
        </div><br />
        <div id="wielder-health-stat" class="stat tooltip">
            HP: ${Math.max(wielder.currentLife, 0).toFixed(1)}/${(effectiveStats.endurance * 5).toFixed(1)}
            <span class="tooltiptext">Current/Maximum health (Regenerates 1 HP every 5s)</span>
        </div><br />
        <div class="stat tooltip">
            Willpower: ${effectiveStats.willpower.toFixed(1)}${wielder.baseStats.willpower > effectiveStats.willpower ? '⚠' : ''}
            <span class="tooltiptext">Increases exp gain, reduces control (up to 100% at 200)${getWoundText('willpower')}</span>
        </div><br />
        <div class="stat tooltip">
            EXP: ${wielder.exp.toFixed(1)}/${(wielder.level * 100).toFixed(1)}
            <span class="tooltiptext">Gain a level every level * 100 exp points</span>
        </div><br />
        <div class="stat tooltip">
            Level: ${wielder.level}
        </div><br />
        <div class="stat tooltip">
            Predicted Damage: ${totalDamage.toFixed(1)} + ${lifesteal} lifesteal
            <span class="tooltiptext">
                Base: ${baseDamage.toFixed(1)} (Strength: ${effectiveStats.strength.toFixed(1)} × 2)<br>
                Control Bonus: +${controlDamageBonus.toFixed(1)} (${(game.controlBonus * 100).toFixed(0)}%)<br>
                Damage multiplier: +${damageFromBonus.toFixed(2)} (${((getDamageMultiplier()-1) * 100).toFixed(0)}%)<br>
                Lifesteal: +${lifesteal} damage & heal per hit
            </span>
        </div><br />
        <div class="stat tooltip">
            Damage Reduction: ${effectiveStats.swordfighting.toFixed(1)}
            <span class="tooltiptext">Reduces incoming damage by this amount</span>
        </div>
        <br /><br />
        <div class="stat tooltip">
            Gold: ${game.wielder.gold}
            <span class="tooltiptext">Your current gold. If the wielder dies you loose it along with any equipment</span>
        </div>
    `;
    document.getElementById('statsDiv').innerHTML = wielderHTML;
}
function updateEquipmentAndInventory() {
    let equipmentHTML = '';
    if (game.unlockedZones.includes(3)) {
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
        equipmentHTML += '</div><br/><br/>';

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
    let html = '';
    gameData.zones.forEach((zone, originalIndex) => {
        if (game.unlockedZones.includes(originalIndex)) {
            const activityLevel = game.inquisitionActivity[originalIndex] || 0;
            const chance = (activityLevel * 30).toFixed(1);
            const barWidth = (activityLevel * 100).toFixed(0);
            const inquisitionBar = game.firstInquisitionEncounter ?
                `<div class="inquisition-bar-container">
                    <div class="inquisition-bar" style="width: 100%; background: #444; height: 5px; margin-top: 5px;">
                        <div style="width: ${barWidth}%; background: #ff6666; height: 100%;"></div>
                    </div>
                    <span class="tooltiptext">Inquisition activity: ${chance}% chance of encounter</span>
                </div>` : '';
            html += `
                <div class="zone" data-zone-index="${originalIndex}">
                    <h4>${zone.name}</h4>
                    <div class="zone-actions">
                        <span class="tooltip">
                            <button class="explore-btn" onclick="exploreZone(${originalIndex})">Explore</button>
                            <span class="tooltiptext">
                                Possible enemies:<br>
                                ${zone.enemies.map(e => `${e.name} (Lv. ${e.level}, ${e.endurance*5} HP)`).join('<br>')}
                            </span>
                        </span>
                        <span class="autofight tooltip">
                            <input type="checkbox" id="auto-${originalIndex}" onchange="toggleAutoFight(${originalIndex})"
                                ${game.currentAction === 'autoFighting' && lastUsedZoneIndex === originalIndex ? 'checked' : ''}>
                            <label for="auto-${originalIndex}">Auto explore</label>
                            <span class="tooltiptext">
                                Requires connection lvl ${originalIndex + 1}
                            </span>
                        </span>
                        ${inquisitionBar}
                        ${originalIndex > 2 ? `<button onclick="openShop(${originalIndex})">Shop</button>` : ''}
                    </div>
                </div>
            `;
        }
    });
    document.getElementById('enemies').innerHTML = html;

    // Check for path selection modal
    if (game.unlockedZones.includes(4) && !game.selectedPath) {
        showPathSelectionModal();
    }
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
    updateHealthBar(null);
    adjustTooltipPosition();

    const equipmentTabBtn = document.getElementById('equipmentTabBtn');
    equipmentTabBtn.style.display = game.unlockedZones.includes(3) ? 'inline' : 'none';

    const pathsTabBtn = document.getElementById('pathsTabBtn');
    pathsTabBtn.style.display = game.unlockedZones.includes(4) ? 'inline' : 'none';
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
function checkUnlockRace(race, raceData){
    if(game.unlockedRaces.includes(race)) return;
    if(raceData.unlockRequirement?.kills || 0 > zone ? (game.statistics.zoneKills[raceData.unlockRequirement?.zone] || 0) : 0)
        game.unlockedRaces.push(race);
}
function showRaceSelection() {
    document.getElementById('wielderDeathModal').style.display = 'none';
    disableBackground();
    const modal = document.getElementById('raceSelectionModal');

    let content = '<div class="race-list">';
    Object.entries(gameData.races).forEach(([raceKey, raceData]) => {
        checkUnlockRace(raceKey, raceData);
        const isUnlocked = game.unlockedRaces.includes(raceKey);
        const zoneIndex = raceData.unlockRequirement?.zone;
        const zone = zoneIndex !== undefined ? gameData.zones[zoneIndex] : null;
        const kills = zone ? (game.statistics.zoneKills[zoneIndex] || 0) : 0;
        const required = raceData.unlockRequirement?.kills || 0;
        const zoneName = zone && game.unlockedZones.includes(zoneIndex) ? zone.name : "???";
        const skillpoints = raceData.skillpoints;
        const statsBonuses = raceData.stats || {};
        const bonusRanges = {
            strength: statsBonuses.strength || 0,
            swordfighting: statsBonuses.swordfighting || 0,
            endurance: statsBonuses.endurance || 0,
            willpower: statsBonuses.willpower || 0
        };
        const levelBonuses = raceData.levelBonuses || {};
        const levelBonusText = Object.entries(levelBonuses).length > 0
            ? Object.entries(levelBonuses).map(([stat, value]) => `${stat}: +${value}`).join(', ')
            : 'None';
        const tooltipClass = isUnlocked ? 'tooltip' : '';
        content += `
            <div class="race-option ${game.unlockedRaces.includes(raceKey) ? '' : 'locked'} ${tooltipClass}" id="race-${raceKey}">
                <button class="toggle-button" onclick="toggleRaceDetails('${raceKey}', event)">−</button>
                <div class="race-header">
                    <h4>${raceKey.toUpperCase()}</h4>
                </div>
                <div class="race-details" id="details-${raceKey}">
                    ${isUnlocked ? `
                        <p>Skillpoints per Level: ${skillpoints}</p>
                        <p>Initial Bonus Stats:<br>
                            Strength: +${bonusRanges.strength} | Swordfighting: +${bonusRanges.swordfighting} |
                            Endurance: +${bonusRanges.endurance} | Willpower: +${bonusRanges.willpower}
                        </p>
                        <p>Auto-Assigned per Level: ${levelBonusText}</p>
                    ` : `
                        <p class="unlock-requirement">
                            ${required} ${zoneName} kills (${kills}/${required})
                        </p>
                    `}
                </div>
            </div>
        `;
    });
    content += '</div>';
    document.getElementById('raceOptions').innerHTML = content;
    modal.style.display = 'block';

    // Add click event listeners to race options
    document.querySelectorAll('.race-option').forEach(raceDiv => {
        raceDiv.addEventListener('click', function() {
            const raceKey = this.id.replace('race-', '');
            if (game.unlockedRaces.includes(raceKey)) {
                selectRace(raceKey);
            }
        });
    });

    adjustTooltipPosition();
}
function toggleRaceDetails(raceKey, event) {
    event.stopPropagation(); // Prevent race selection when toggling
    const details = document.getElementById(`details-${raceKey}`);
    const button = document.querySelector(`#race-${raceKey} .toggle-button`);
    if (details.style.display === 'none') {
        details.style.display = 'block';
        button.textContent = '−'; // Maximize symbol
    } else {
        details.style.display = 'none';
        button.textContent = '+'; // Minimize symbol
    }
}
function disableBackground(){
    document.getElementById('modalOverlay').style.display = 'block'; // Show overlay
    document.body.classList.add('modal-active'); // Disable background
}

function onModalClose(modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (!isAnyModalOpen()) {

        document.getElementById('modalOverlay').style.display = 'none'; // Hide overlay
        document.body.classList.remove('modal-active'); // Re-enable background
        if(game.currentAction === 'autoFighting' ){
            startAutoBattle();
        }
    }

    updateDisplay();
}

function updateStatsModal() {
    disableBackground();
    const content = document.getElementById('statsContent');
    let html = '';

    // Stats data
    const stats = [
        { label: "Total Kills", value: game.statistics.totalKills },
        { label: "Achievements Completed", value: Object.keys(game.completedAchievements).length },
        { label: "Current Action", value: game.currentAction || "None" },
        { label: "Time Auto fighting", value: formatTime(game.statistics.totalAutoExploreTime) },
        { label: "Time Resting", value: formatTime(game.statistics.totalRestTime) },
        { label: "Time Playing", value: formatTime(game.statistics.totalPlayTime) },
        { label: "Damage Multiplier", value: getDamageMultiplier().toFixed(2) + "x" },
        { label: "EXP Gain Multiplier", value: getExpMultiplier().toFixed(2) + "x" },
        { label: "Max Energy Multiplier", value: getMaxEnergyMultiplier().toFixed(2) + "x" },
        { label: "Energy Gain Multiplier", value: getEnergyGainMultiplier().toFixed(2) + "x" },
        { label: "Cost Reduction Multiplier", value: (getUpgradeCostReduction() + 1).toFixed(2) + "x" }
    ];

    // Souls if Path of Death
    if (game.selectedPath === 'death' && game.souls) {
        stats.push({ label: "Minor Souls", value: game.souls.minor });
        stats.push({ label: "Normal Souls", value: game.souls.normal });
        stats.push({ label: "Major Souls", value: game.souls.major });
        stats.push({ label: "Epic Souls", value: game.souls.epic });
    }

    // Split into two columns
    const midPoint = Math.ceil(stats.length / 2);
    const leftColumn = stats.slice(0, midPoint);
    const rightColumn = stats.slice(midPoint);

    html += '<div class="column">';
    leftColumn.forEach(stat => {
        html += `<div class="stat-item"><span class="label">${stat.label}:</span> <span class="value">${stat.value}</span></div>`;
    });
    html += '</div>';

    html += '<div class="column">';
    rightColumn.forEach(stat => {
        html += `<div class="stat-item"><span class="label">${stat.label}:</span> <span class="value">${stat.value}</span></div>`;
    });
    html += '</div>';

    content.innerHTML = html;
    closeOtherFooterModals('statsModal');
    document.getElementById('statsModal').style.display = 'block';
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
}

function showStory(viewed) {

    closeOtherFooterModals('storyModal');
    if (viewed) {
        if (!game.story1Viewed){
            showStory();
            showStoryContent("story1");
        }
        game.story1Viewed = true;
        return;
    }
    disableBackground();
    const stories = Object.entries(gameData.story).filter(([key, story]) => game.unlockedStory.includes(key));
    const listDiv = document.querySelector('#storyModal .story-list');
    const contentDiv = document.querySelector('#storyModal .story-content');
    listDiv.innerHTML = stories.map(([key, story]) => `
        <div class="story-title" onclick="showStoryContent('${key}')">${story.title}</div>
    `).join('');
    if(document.querySelector('#storyModal .story-content').innerHTML == '') showStoryContent("story1");
    document.getElementById('storyModal').style.display = 'block';
}
function showStoryContent(key) {

    const story = gameData.story[key];
    if (story && game.unlockedStory.includes(key)) {
        document.querySelector('#storyModal .story-content').innerHTML = `
            <h4>${story.title}</h4>
            <p>${story.entry.join('</p><p>')}</p>
        `;
    }
}
function showChangelog() {
    disableBackground();
    closeOtherFooterModals('changelogModal');
    document.getElementById('changelogContent').innerHTML = `

        <p>0.1 - Base Game</p>
    `;
    document.getElementById('changelogModal').style.display = 'block';
}

function showOptions() {
    disableBackground();
    closeOtherFooterModals('optionsModal');
    document.getElementById('optionsModal').style.display = 'block';
    document.getElementById('saveData').value = '';
}

function adjustTooltipPosition() {
    // Select only tooltips that are not inside a .modal element
    const tooltips = document.querySelectorAll('.tooltip:not(.modal .tooltip)');

    console.log(`Found ${tooltips.length} tooltip elements outside modals`);

    if (tooltips.length === 0) {
        console.log('No elements with class "tooltip" found outside modals.');
        return;
    }

    tooltips.forEach((tooltip, index) => {
        const tooltipText = tooltip.querySelector('.tooltiptext');

        if (!tooltipText) {
            console.log(`Tooltip ${index} has no .tooltiptext child.`);
            return;
        }

        tooltip.addEventListener('mouseenter', () => {
            const rect = tooltip.getBoundingClientRect();
            const tooltipRect = tooltipText.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Reset positioning styles
            tooltipText.style.top = '';
            tooltipText.style.bottom = '';
            tooltipText.style.left = '';
            tooltipText.style.right = '';
            tooltipText.style.transform = '';

            // Calculate available space
            const spaceAbove = rect.top;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceLeft = rect.left;
            const spaceRight = viewportWidth - rect.right;

            // Default position: above
            tooltipText.style.position = 'fixed'; // Use fixed for viewport-based positioning
            let top = rect.top - tooltipRect.height - 5;
            let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

            // Adjust vertical position
            if (spaceAbove < tooltipRect.height && spaceBelow > tooltipRect.height + 5) {
                console.log(`Placing tooltip ${index} below (spaceAbove: ${spaceAbove}, spaceBelow: ${spaceBelow})`);
                top = rect.bottom + 5;
                tooltipText.style.top = `${top}px`;
                tooltipText.style.bottom = 'auto';
            } else {
                console.log(`Placing tooltip ${index} above (spaceAbove: ${spaceAbove}, spaceBelow: ${spaceBelow})`);
                tooltipText.style.top = `${top}px`;
                tooltipText.style.bottom = 'auto';
            }

            // Adjust horizontal position
            if (left < 0) {
                console.log(`Adjusting tooltip ${index} from left edge`);
                left = 5;
                tooltipText.style.left = `${left}px`;
                tooltipText.style.transform = 'none';
            } else if (left + tooltipRect.width > viewportWidth) {
                console.log(`Adjusting tooltip ${index} from right edge`);
                left = viewportWidth - tooltipRect.width - 5;
                tooltipText.style.left = `${left}px`;
                tooltipText.style.transform = 'none';
            } else {
                tooltipText.style.left = `${left}px`;
                tooltipText.style.transform = 'none';
            }

            // Debug positioning
            console.log(`Tooltip ${index} positioned at: top=${tooltipText.style.top}, left=${tooltipText.style.left}`);
            console.log(`Tooltip ${index} visibility: ${window.getComputedStyle(tooltipText).visibility}, opacity: ${window.getComputedStyle(tooltipText).opacity}`);
        });
    });
}

// Run on DOM load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing tooltips');
    adjustTooltipPosition();
});

// Handle dynamic content
const observer = new MutationObserver(() => {
    console.log('DOM changed, re-initializing tooltips');
    adjustTooltipPosition();
});
observer.observe(document.body, { childList: true, subtree: true });
function showPathSelectionModal() {
    disableBackground();
    const modal = document.getElementById('pathSelectionModal');
    const paths = [
        { key: 'blood', name: 'Path of Blood', desc: 'Harness the energy absorbed by the sword.' },
        { key: 'death', name: 'Path of Death', desc: 'Revel in the slaughter and collect souls.' },
        { key: 'vengeance', name: 'Path of Vengeance', desc: 'Seek retribution against mighty foes.' }
    ];
    const content = `
        <div class="race-list">
            ${paths.map(path => {
                // Check if the path is completed
                const isCompleted = game.completedPaths.includes(path.key);
                // A path is locked if it's completed, or if it's Vengeance and both Blood and Death aren't completed
                const isLocked = isCompleted || (path.key === 'vengeance' && !(game.completedPaths.includes('blood') && game.completedPaths.includes('death')));
                return `
                    <div class="race-option tooltip ${isLocked ? 'locked' : 'selectable'} ${isCompleted ? 'completed' : ''}" data-path="${path.key}">
                        <h4>${path.name}</h4>
                        <p>${path.desc}</p>
                        ${isCompleted ? '<span class="completed-marker">Completed</span>' : isLocked ? '<span class="locked-marker">Locked</span>' : ''}
                        <span class="tooltiptext">${gameData.paths[path.key].description}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    document.getElementById('pathOptions').innerHTML = content;
    modal.style.display = 'block';

    // Attach click event listeners only to selectable path options
    const pathDivs = document.querySelectorAll('#pathOptions .race-option.selectable');
    pathDivs.forEach(div => {
        const path = div.getAttribute('data-path');
        div.addEventListener('click', () => {
            selectPath(path);
        });
    });
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
    game.selectedPathsubtab = path;
    const contentDiv = document.getElementById('path-subtab-content');
    const pathData = gameData.paths[path];

    // Base content: path name, description, and any path-specific stats
    let content = `<h3>${pathData.name}</h3><p>${pathData.description}</p>`;

    // Example: souls stat for the 'death' path
    if (path === 'death') {
        content += `
            <div class="stat tooltip">
                Souls: <span class="souls-value">${game.souls.minor}/${game.souls.normal}/${game.souls.major}/${game.souls.epic}</span>
                <span class="tooltiptext">Minor/Normal/Major/Epic souls collected</span>
            </div>`;
    }

    // Add a container for progress and tiers
    content += '<div id="path-progress-container"></div>';

    // Set the content and update the progress section
    contentDiv.innerHTML = content;
    updatePathProgress(path);
}

function getPathRewardText(reward) {
    if (reward.inquisitionGrowthReduction) return `-${(reward.inquisitionGrowthReduction * 100).toFixed(1)}% inquisition growth rate`;
    if (reward.healPerCombat) return `+${reward.healPerCombat} heal per combat`;
    if (reward.soulGainMultiplier) return `+${((reward.soulGainMultiplier - 1) * 100).toFixed(0)}% soul gain`;
    if (reward.siphonCapIncrease) return `+${reward.siphonCapIncrease} siphon upgrade cap`;
    if (reward.energyGainMultiplier) return `+${((reward.energyGainMultiplier - 1) * 100).toFixed(0)}% energy gain`;
    if (reward.lifestealBonus) return `+${reward.lifestealBonus} lifesteal`;
    if (reward.energyRegen) return `+${reward.energyRegen} energy per 5s`;
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
function updateHealthBar(setValue){
    const wielderHealthFill = document.querySelector('#wielder-health .health-bar-fill');
    if(setValue) wielderHealthFill.style.width = setValue;
    else wielderHealthFill.style.width = `${(game.wielder.currentLife / (getEffectiveStats().endurance *5)) * 100}%`;

}
function updateEnemyHealthBar(enemy,hp){
    const enemyHealthFill = document.querySelector('#enemy-health .health-bar-fill');
    enemyHealthFill.style.width = `${( hp/ (enemy.endurance * 5)) * 100}%`;

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
const footerModals = [
    'statsModal',
    'optionsModal',
    'storyModal',
    'changelogModal',
    'shopModal'
];

// Function to close all footer modals except the specified one
function closeOtherFooterModals(exceptModalId) {
    footerModals.forEach(modalId => {
        if (modalId !== exceptModalId) {
            const modal = document.getElementById(modalId);
            if (modal) modal.style.display = 'none';
        }
    });
}
function updateBackgroudImage(zoneIndex){

    const healthDiv = document.getElementById('background-image').src = "assets/areas/backgroundLevel" + (zoneIndex +1) +".jpg" ;

}
function showEventBackground(imageUrl, duration = 2000) {
    const eventBg = document.getElementById('event-background');
    eventBg.style.backgroundImage = `url('${imageUrl}')`;
    eventBg.style.opacity = '1';
    setTimeout(() => {
        eventBg.style.opacity = '0';
    }, duration);
}
function updateInquisitionTooltips() {
    gameData.zones.forEach((zone, zi) => {
        if (!game.unlockedZones.includes(zi)) return; // Skip locked zones
        const activityLevel = game.inquisitionActivity[zi] || 0;
        const chance = (activityLevel * 30).toFixed(1);
        const zoneElement = document.querySelector(`#enemies .zone[data-zone-index="${zi}"]`);
        if (zoneElement) {
            const barFill = zoneElement.querySelector('.inquisition-bar > div');
            const tooltipElement = zoneElement.querySelector('.inquisition-bar-container .tooltiptext');
            if (barFill) {
                barFill.style.width = `${(activityLevel * 100).toFixed(0)}%`; // Update bar width
            }
            if (tooltipElement) {
                tooltipElement.textContent = `Inquisition activity: ${chance}% chance of encounter`; // Update tooltip
            }
        }
    });
}