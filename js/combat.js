async function attackEnemy(zoneIndex, enemyIndex) {
    if (game.isFighting) return; // Prevent new combat if one is active
    if (game.currentAction && game.currentAction !== 'autoFighting') return;
    updateBackgroudImage(zoneIndex);

    game.wielder.hasFought = true;
    const effectiveStats = getEffectiveStats();
    lastUsedZoneIndex = zoneIndex;
    const wielder = game.wielder;
    game.isFighting = true;
    game.currentEnemy = { zoneIndex, enemyIndex };
    const enemy = gameData.zones[zoneIndex].enemies[enemyIndex];
    let enemyLife = enemy.endurance * 5;
    let wielderMaxLife = wielder.maxLife;
    updateEnemyHealthBar(enemy,enemyLife);
    startCombat(enemy);
    if (wielder.currentLife <= 0) {
        addCombatMessage('Wielder is too injured to fight!', 'damage');
        game.isFighting = false;
        updateWielderStats();
        updateButtonStates();
        return;
    }

    const controlLevel = game.sword.upgrades.control.level;
    const willpower = Math.min(wielder.currentStats.willpower, 200);
    game.controlBonus = controlLevel * 0.2 * (1 - willpower / 200);

    const baseDamage = effectiveStats.strength * 2 + effectiveStats.swordfighting;
    const controlDamageBonus = baseDamage * game.controlBonus;
    const lifestealBonus = Object.values(game.achievements).reduce((sum, ach) => sum + (ach.unlocked && ach.bonus.lifestealBonus ? ach.bonus.lifestealBonus : 0), 0);
    const lifesteal = game.sword.upgrades.siphon.level + lifestealBonus;
    const damageMultiplier = getDamageMultiplier();
    const totalDamage = (baseDamage + lifesteal + controlDamageBonus) * damageMultiplier;
    addCombatMessage(`Engaging ${enemy.name} (${enemy.endurance*5} HP)`, 'player-stat');
    updateHealthBar(null);

    let roundCount = 0; // Track combat rounds
    while (enemyLife > 0 && wielder.currentLife > 0 && !isAnyModalOpen()) {
        roundCount++;
        updateEnemyHealthBar(enemy,enemyLife);

        document.getElementById('combat-area').classList.add('combat-active');
        const damageDealt = Math.min(totalDamage, enemyLife);
        const lifestealHealing = Math.min(lifesteal, enemyLife);
        enemyLife -= damageDealt;
        wielder.currentLife = Math.min(effectiveStats.endurance * 5, wielder.currentLife + lifestealHealing);

        addCombatMessage(
            `Dealt ${damageDealt.toFixed(1)} damage (Base: ${baseDamage}, Control: ${controlDamageBonus.toFixed(1)}) ` +
            `Lifesteal: +${lifestealHealing} HP | Enemy HP: ${enemyLife.toFixed(2)}`,
            'damage'
        );
        const enemyDamage = Math.max(enemy.strength * 2 - Math.floor(wielder.currentStats.swordfighting), 1);
        wielder.currentLife -= enemyDamage;

        addCombatMessage(`Took ${enemyDamage} damage (Base: ${enemy.strength*2}, Defense: ${Math.floor(getEffectiveStats().swordfighting)}) Player HP left: ${wielder.currentLife.toFixed(1)}`, 'damage');
        updateHealthBar(null);
        if (wielder.currentLife <= 0) {
            defeatWielder();
        }
        updateEnemyHealthBar(enemy,enemyLife);
        updateWielderHealth();
        await new Promise(resolve => setTimeout(resolve, 900));
        document.getElementById('combat-area').classList.remove('combat-active');

        await new Promise(resolve => setTimeout(resolve, 100));

    }
    if (enemyLife <= 0) {
        endCombat(true);
        updateEnemyHealthBar(enemy,0);
        defeatEnemy(enemy, zoneIndex);
        achievementTracker(enemy,roundCount);
        energyPeakTracker();
    } else {
        endCombat(false);
    }
    if (isAnyModalOpen()) {
        addCombatMessage('Combat paused due to open menu.', 'player-stat');
        game.isFighting = false;
        return;
    }



    updateWielderStats();
    updateButtonStates();
    updateEnergyAndKills();

}
function defeatWielder(){
        addCombatMessage('Lost the fight! Disengaging. Rest or heal.', 'damage');
        if (game.currentAction === 'autoFighting') onActionButtonClick('autoFighting');
        applyHeavyWound();
        game.isFighting = false;
        updateWielderStats();
        updateButtonStates();
        return;
}
function startCombat(enemy) {

    const enemySprite = document.getElementById('enemy-sprite');
    const combatArea = document.getElementById('combat-area');

    // Set sprites based on race and enemy

    enemySprite.style.backgroundImage = `url('assets/enemy-${enemy.name.toLowerCase().replace(/\s/g, '-')}.png')`;
    enemySprite.style.display = 'block';
    combatArea.classList.add('combat-active');
}

function endCombat(victory) {
    const enemySprite = document.getElementById('enemy-sprite');
    const combatArea = document.getElementById('combat-area');
    enemySprite.style.display = 'none';
    combatArea.classList.remove('combat-active');
    if (victory) {
       //document.getElementById('combat-sound').play();
    }
}
function achievementTracker(enemy,roundCount){
    if (roundCount === 1) {
        game.statistics.killedInOneRound = true;
        game.statistics.enemiesKilledInOneRound++;
    }
    const enemyDamage = Math.max(enemy.strength * 2 - Math.floor(game.wielder.currentStats.swordfighting), 1)
    if (game.currentAction !== 'autoFighting') {
        game.statistics.manualKills++;
    }
    // Track highest hit survived and 50+ hit survival
    if (enemyDamage >= 50 && wielder.currentLife > 0) {
        game.statistics.survivedHitOf50 = true;
    }
    if (game.wielder.currentLife > 0 && enemyDamage > game.statistics.highestHitSurvived) {
        game.statistics.highestHitSurvived = enemyDamage;
    }
     // Track kills in last 10 seconds
    if (game.swiftKillStartTime === null) {
        game.swiftKillStartTime = Date.now();
        game.statistics.swiftKillCount = 1;
    } else {
        const timeElapsed = (Date.now() - game.swiftKillStartTime) / 1000; // Seconds
        if (timeElapsed <= 10) {
            game.statistics.swiftKillCount++;
            if(game.statistics.swiftKillMaxCount< game.statistics.swiftKillCount) game.statistics.swiftKillMaxCount = game.statistics.swiftKillCount
            if (game.statistics.swiftKillCount >= 10) {
                game.statistics.hasSwiftKilled = true;
            }
        } else {
            game.swiftKillStartTime = Date.now();
            game.statistics.swiftKillCount = 1;
        }
    }
}
function energyPeakTracker(){
if (game.sword.energy >= game.sword.maxEnergy && !game.statistics.wasEnergyMaxed) {
        game.statistics.timesEnergyMaxed++;
        game.statistics.wasEnergyMaxed = true;
    } else if (game.sword.energy < game.sword.maxEnergy) {
        game.statistics.wasEnergyMaxed = false;
    }
}
function defeatEnemy(enemy, zoneIndex) {
    const wielder = game.wielder;
    const goldMultiplier = Object.values(game.achievements).reduce((mul, ach) => mul * (ach.unlocked && ach.bonus.goldMultiplier ? 1 + ach.bonus.goldMultiplier : 1), 1);
    const energyGain = enemy.endurance * 5 * (1 + game.sword.upgrades.siphon.level * 0.1) * getEnergyGainMultiplier();
    game.sword.energy = Math.min(game.sword.energy + energyGain, game.sword.maxEnergy);
    addCombatMessage(`${enemy.name} defeated! +${energyGain.toFixed(1)} energy`, 'enemy-defeated');

    const expGained = calculateExpGain(enemy.exp);
    game.wielder.exp += expGained;
    game.statistics.zoneKills[zoneIndex] = (game.statistics.zoneKills[zoneIndex] ?? 0) + 1;
    game.statistics.totalKills = (game.statistics.totalKills ?? 0) + 1;
    game.statistics.mobKills[enemy.name] = (game.statistics.mobKills[enemy.name] ?? 0) + 1;
    if (game.selectedPath === 'blood') {
        game.pathProgress.blood += energyGain;
        checkPathRewards('blood');
    }
    if (game.selectedPath === 'death') {
        game.pathProgress.death += 1;
        checkPathRewards('death');
        const soulTier = getSoulTier(enemy.level);
        game.souls[soulTier]++;
        addCombatMessage(`Collected a ${soulTier} soul from ${enemy.name}`, 'player-stat');
    }
    if (game.selectedPath === 'vengeance' && enemy.isBoss) { // Placeholder condition
        game.pathProgress.vengeance += 1;
        checkPathRewards('vengeance');
    }
    if (game.inquisitionEnabled) {
        const zoneKills = game.statistics.zoneKills[zoneIndex];
        const modal = document.getElementById('inquisitionModal');
        const message = document.getElementById('inquisitionMessage');
        const closeBtn = document.getElementById('inquisitionClose');
        const resetBtn = document.getElementById('inquisitionReset');
        const continueBtn = document.getElementById('inquisitionContinue');

        if (zoneKills === 50) {
            message.textContent = `The Inquisition has taken notice of the bloodshed in ${gameData.zones[zoneIndex].name}. They are searching for the blade. Move to another area to avoid detection!`;
            closeBtn.style.display = 'inline';
            resetBtn.style.display = 'none';
            continueBtn.style.display = 'none';
            modal.style.display = 'block';
        } else if (zoneKills === 75) {
            message.textContent = `The Inquisition is closing in on ${gameData.zones[zoneIndex].name}! Their pursuit grows relentless. Leave this zone now, or the blade will be captured!`;
            closeBtn.style.display = 'inline';
            resetBtn.style.display = 'none';
            continueBtn.style.display = 'none';
            modal.style.display = 'block';
        } else if (zoneKills >= 100) {
            message.textContent = `The Inquisition has caught the blade in ${gameData.zones[zoneIndex].name}! It has been hidden away, ending your journey. Game Over.`;
            closeBtn.style.display = 'none';
            resetBtn.style.display = 'inline';
            continueBtn.style.display = 'inline';
            modal.style.display = 'block';
            game.currentAction = null;
            game.wielder.defeated = true;
        }
    }

    checkAchievements();
    checkLevelUp();
    if (zoneIndex >= 3) {
        const goldDrop = enemy.level * 10 * goldMultiplier;
        game.wielder.gold += goldDrop;
        addCombatMessage(`Found ${goldDrop} gold`, 'player-stat');
        updateModalGold();
    }

    game.isFighting = false;
    if (game.currentAction === 'autoFighting') startAutoBattle();
}
function checkLevelUp(){
    let wielder = game.wielder;
    while (wielder.exp >= wielder.level * 100) {
        wielder.exp -= wielder.level * 100;
        wielder.level++;

        wielder.statPoints += calculateStatPointsPerLevel();
        applyLevelBonuses();
        showLevelUpModal();
    }
    updateWielderStats();
}
function exploreZone(zoneIndex) {
    if (game.isFighting) return; // Prevent new combat if one is active
    if (game.currentAction && game.currentAction !== 'autoFighting') return;
    lastUsedZoneIndex = zoneIndex;
    const enemyIndex = Math.floor(Math.random() * gameData.zones[zoneIndex].enemies.length);
    attackEnemy(zoneIndex, enemyIndex);
}

function toggleAutoFight(zoneIndex) {
    const connectionLevel = game.sword.upgrades.connection.level || 0;
    const requiredLevel = zoneIndex + 1;
    if (connectionLevel < requiredLevel) {
        addCombatMessage(`Connection level too low for auto explore in this zone.`, 'error');
        document.getElementById(`auto-${zoneIndex}`).checked = false; // Reset checkbox
        return;
    }
    const checkbox = document.getElementById(`auto-${zoneIndex}`);
    if (checkbox.checked) {
        gameData.zones.forEach((_, i) => {
            if (i !== zoneIndex && document.getElementById(`auto-${i}`)) document.getElementById(`auto-${i}`).checked = false;
        });
        game.currentAction = 'autoFighting';
        lastUsedZoneIndex = zoneIndex;
        startAutoBattle();
    } else {
        game.currentAction = null;
    }
    updateButtonStates();
}

function startAutoBattle() {
    if (!game.isFighting && !isAnyModalOpen()) {
        if (!gameData.zones[lastUsedZoneIndex]) lastUsedZoneIndex = 0;
        const zone = gameData.zones[lastUsedZoneIndex];
        const enemyIndex = Math.floor(Math.random() * zone.enemies.length);
        attackEnemy(lastUsedZoneIndex, enemyIndex);
    }
}

function calculateExpGain(baseExp) {
    const enemy = gameData.zones[game.currentEnemy.zoneIndex].enemies[game.currentEnemy.enemyIndex];
    const levelDiff = enemy.level - game.wielder.level;
    const expMultiplier = Math.max(1 + (levelDiff * 0.2),0);
    const expGained = Math.max(Math.floor(baseExp * expMultiplier), 0) * (1 + game.wielder.currentStats.willpower / 200);
    addCombatMessage(`Gained ${expGained.toFixed(1)} exp. ${(expMultiplier * 100).toFixed(2)}% of base due to level gap.`, 'player-stat');
    return expGained;
}