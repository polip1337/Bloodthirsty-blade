function updateEnergyAndKills() {
    document.getElementById('energy').textContent = game.sword.energy.toFixed(0);
    document.getElementById('maxEnergy').textContent = game.sword.maxEnergy.toFixed(0);
    document.getElementById('totalKills').textContent = game.statistics.totalKills;
}
function updateWielderStats() {
    const wielder = game.wielder;
    const effectiveStats = getEffectiveStats();
    const baseDamage = effectiveStats.strength * 2 + effectiveStats.swordfighting;
    const controlDamageBonus = baseDamage * game.controlBonus;
    const lifesteal = game.sword.upgrades.siphon.level;
    const totalDamage = (baseDamage + lifesteal + controlDamageBonus) * getDamageMultiplier();

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
            Predicted Damage: ${totalDamage.toFixed(1)}
            <span class="tooltiptext">
                Base: ${baseDamage.toFixed(1)} (Strength: ${effectiveStats.strength.toFixed(1)} × 2 + Swordfighting: ${effectiveStats.swordfighting.toFixed(1)})<br>
                Control Bonus: +${controlDamageBonus.toFixed(1)} (${(game.controlBonus * 100).toFixed(0)}%)<br>
                Lifesteal: +${lifesteal} damage & HP per hit
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

        equipmentHTML += '<div id="inventory-grid">';
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

        equipmentHTML += `
            <button id="sellModeButton" onclick="toggleSellMode()">
                ${game.sellMode ? 'Exit Sell Mode' : 'Enter Sell Mode'}
            </button>`;
    }
    document.getElementById('equipmentDiv').innerHTML = equipmentHTML;
}
function updateUpgrades() {
    document.getElementById('upgrades').innerHTML = Object.entries(game.sword.upgrades)
        .map(([name, data]) => `
            <div class="upgrade tooltip">
                ${name.charAt(0).toUpperCase() + name.slice(1)} (Level ${data.level})
                <span class="tooltiptext">${getUpgradeTooltip(name)}</span>
                <button onclick="buyUpgrade('${name}')" ${data.level >= gameData.upgradeCaps[name] ? 'disabled' : game.sword.energy >= data.cost ? '' : 'disabled'}>
                    ${data.level >= gameData.upgradeCaps[name] ? 'Max level' : `Upgrade (${Math.round(data.cost)} energy)`}
                </button>
            </div>
        `)
        .join('');
}
function updateEnemyZones() {
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
                ${zi > 3 ? `<button onclick="openShop(${zi})">Shop</button>` : ''}
                <span class="autofight">
                    <input type="checkbox" id="auto-${zi}" onchange="toggleAutoFight(${zi})"
                        ${game.currentAction === 'autoFighting' && lastUsedZoneIndex === zi ? 'checked' : ''}>
                    <label for="auto-${zi}">Auto explore</label>
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
            checkbox.disabled = game.sword.upgrades.connection.level < zi + 1 || game.wielder.defeated || (game.currentAction && game.currentAction !== 'autoFighting');
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
}

function showTab(tabName) {
    const zonesContent = document.getElementById('zones-content');
    const achievementsContent = document.getElementById('achievements-content');
    const zonesButton = document.querySelector('#tabs button:nth-child(1)');
    const achievementsButton = document.querySelector('#tabs button:nth-child(2)');

    if (tabName === 'zones') {
        zonesContent.style.display = 'block';
        achievementsContent.style.display = 'none';
        zonesButton.classList.add('active');
        achievementsButton.classList.remove('active');
    } else {
        zonesContent.style.display = 'none';
        achievementsContent.style.display = 'block';
        achievementsButton.classList.add('active');
        zonesButton.classList.remove('active');
        updateAchievementsTab();
    }
}

function showRaceSelection() {
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
    document.getElementById('statisticsContent').innerHTML = `
        <p>Total Kills: ${game.statistics.totalKills}</p>
        <p>Wielders Used: ${game.statistics.wieldersUsed}</p>
        <h4>Kills by Enemy:</h4>
        ${Object.entries(game.statistics.mobKills).map(([mob, count]) => `<p>${mob}: ${count}</p>`).join('')}
    `;
    document.getElementById('statsModal').style.display = 'block';
}

function showStory(viewed) {
    if (viewed) {
        if (!game.story1Viewed) showStory();
        game.story1Viewed = true;
        return;
    }
    const stories = Object.values(gameData.story).filter(story => story.unlocked);
    document.getElementById('storyContent').innerHTML = stories.length > 0 ?
        stories.map(story => `<div class="story-entry"><h4>${story.title}</h4><p>${story.entry.join('</p><p>')}</p></div>`).join('') :
        '<p>No story fragments unlocked yet</p>';
    document.getElementById('storyModal').style.display = 'block';
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