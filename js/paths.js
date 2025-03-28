    function selectPath(path) {
        if (game.unlockedZones.includes(4) && !game.selectedPath) {
            game.selectedPath = path;
            if (!game.unlockedPaths.includes(path)) {
                game.unlockedPaths.push(path);
            }
            addCombatMessage(`You have chosen the ${gameData.paths[path].name}!`, 'player-stat');
            onModalClose('pathSelectionModal');
            updatePathsTab();
        }
    }
    function checkPathRewards(path) {
        const pathData = gameData.paths[path];
        const progress = game.pathProgress[path];
        let tiersUnlocked = 0;
        for (let i = 0; i < pathData.tiers.length; i++) {
            if (progress >= pathData.tiers[i].threshold) {
                tiersUnlocked = i + 1;
            } else {
                break;
            }
        }
        if (tiersUnlocked > game.pathTiersUnlocked[path]) {
            const oldTiers = game.pathTiersUnlocked[path];
            game.pathTiersUnlocked[path] = tiersUnlocked;
            while (game.pathSelections[path].length < tiersUnlocked) {
                game.pathSelections[path].push(null);
            }
            addCombatMessage(`New tier${tiersUnlocked - oldTiers > 1 ? 's' : ''} unlocked for ${pathData.name}! Choose your reward in the Paths tab.`, 'player-stat');
            updatePathsTab();
        }
        if(tiersUnlocked == 5 && !game.completedPaths.includes(path)) game.completedPaths.push(path);

    }


// Select a path choice and apply its reward
function selectPathChoice(path, tierIndex, choiceIndex) {
    if (game.pathSelections[path][tierIndex] !== null) return;
    const choice = gameData.paths[path].tiers[tierIndex].choices[choiceIndex];
    game.pathSelections[path][tierIndex] = choiceIndex;
    applyPathReward(choice.reward);
    addCombatMessage(`Selected: ${choice.description} for ${path} Tier ${tierIndex + 1}`, 'player-stat');
    updatePathsTab();
    updateMultipliers();
}

// Apply one-time rewards (if any)
function applyPathReward(reward) {
    // For now, assuming all rewards are persistent and handled by multipliers
    // One-time rewards like souls would be applied here if reintroduced
}
    function applyPathReward(path, reward, tierIndex) {
        if (path === 'death') {
            if (reward.souls) {
                for (let type in reward.souls) {
                    game.souls[type] += reward.souls[type];
                }
            }
            if (reward.inquisitionGrowthReduction) {
                if (!game.pathBonuses) game.pathBonuses = {};
                if (!game.pathBonuses.death) game.pathBonuses.death = {};
                game.pathBonuses.death.inquisitionGrowthReduction = (game.pathBonuses.death.inquisitionGrowthReduction || 0) + reward.inquisitionGrowthReduction;
            }
            if (reward.healPerCombat) {
                if (!game.pathBonuses.death) game.pathBonuses.death = {};
                game.pathBonuses.death.maxHealsPerCombat = (game.pathBonuses.death.maxHealsPerCombat || 1) + reward.healPerCombat;
            }
            if (reward.soulGainMultiplier) {
                if (!game.pathBonuses.death) game.pathBonuses.death = {};
                game.pathBonuses.death.soulGainMultiplier = (game.pathBonuses.death.soulGainMultiplier || 1) * reward.soulGainMultiplier;
            }
            if (reward.damageMultiplier) {
                // Applied via getDamageMultiplier()
            }
        }
        if (path === 'blood') {
            if (reward.siphonCapIncrease) {
                gameData.upgradeCaps.siphon += reward.siphonCapIncrease;
                addCombatMessage(`Siphon upgrade cap increased to ${gameData.upgradeCaps.siphon}`, 'achievement');
            }
            if (reward.energyGainMultiplier) {
                if (!game.pathBonuses) game.pathBonuses = {};
                if (!game.pathBonuses.blood) game.pathBonuses.blood = {};
                game.pathBonuses.blood.energyGainMultiplier = (game.pathBonuses.blood.energyGainMultiplier || 1) * reward.energyGainMultiplier;
            }
            if (reward.lifestealBonus) {
                if (!game.pathBonuses.blood) game.pathBonuses.blood = {};
                game.pathBonuses.blood.lifestealBonus = (game.pathBonuses.blood.lifestealBonus || 0) + reward.lifestealBonus;
            }
            if (reward.maxEnergyMultiplier) {
                calculateMaxEnergy();
            }
            if (reward.energyRegen) {
                if (!game.pathBonuses.blood) game.pathBonuses.blood = {};
                game.pathBonuses.blood.energyRegen = (game.pathBonuses.blood.energyRegen || 0) + reward.energyRegen;
            }
        }
        if (reward.damageMultiplier) {
            // Applied via getDamageMultiplier()
        }
        if (reward.maxEnergyMultiplier) {
            calculateMaxEnergy();
        }
        if (reward.upgradeCostReduction) {
            // Applied via getUpgradeCostReduction()
        }
        if (reward.expMultiplier || reward.bossExp) {
            // Applied via getExpMultiplier()
        }
        if (reward.startingStats) {
            // Applied in generateWielder()
        }
        if (reward.souls) {
            for (let type in reward.souls) {
                game.souls[type] += reward.souls[type];
            }
        }
        if (reward.bossDamage || reward.bossGold || reward.bossSouls || reward.ultimateReward) {
            // Placeholder for boss mechanics
        }
        updateDisplay();
    }
    function getSoulTier(enemyLevel) {
        if (enemyLevel <= 5) return 'minor';
        if (enemyLevel <= 10) return 'normal';
        if (enemyLevel <= 15) return 'major';
        return 'epic';
    }
    function updateCollectedEnergy() {
        const energyElement = document.querySelector('#path-subtab-content .energy-stat .energy-value');
        if (energyElement && game.collectedEnergy !== undefined) {
            energyElement.textContent = game.collectedEnergy.toFixed(0);
        }
    }
    function updateSoulsCount() {
        const soulsElement = document.querySelector('#path-subtab-content .stat .souls-value');
        if (soulsElement && game.souls) {
            soulsElement.textContent = `${game.souls.minor}/${game.souls.normal}/${game.souls.major}/${game.souls.epic}`;
        }
    }
    function updatePathProgress(path) {
        if (path !== game.selectedPathsubtab) {
            return; // Exit if the subtab is not selected
        }
        const progressContainer = document.getElementById('path-progress-container');
        if (!progressContainer) return; // Exit if the container isn’t found

        const pathData = gameData.paths[path];
        const progress = game.pathProgress[path];
        const tiersUnlocked = game.pathTiersUnlocked[path];

        // Start building the content for progress and tiers
        let content = '<h4>Progress</h4>';

        // Check for the next tier to unlock
        const nextTierIndex = pathData.tiers.findIndex((tier, idx) => !tiersUnlocked.includes(idx));
        if (nextTierIndex !== -1) {
            const nextTier = pathData.tiers[nextTierIndex];
            content += `
                <div class="upgrade">
                    Tier ${nextTierIndex + 1}: ${progress}/${nextTier.threshold}
                </div>`;
        } else {
            content += '<p>All tiers unlocked for this path.</p>';
        }

        // Add unlocked tiers
        content += '<h4>Unlocked Tiers</h4>';
        tiersUnlocked.forEach(idx => {
            const tier = pathData.tiers[idx];
            content += `
                <div class="upgrade unlocked">
                    Tier ${idx + 1}: Unlocked<br>
                    Reward: ${getPathRewardText(tier.reward)}
                </div>`;
        });

        // Update the container’s content
        progressContainer.innerHTML = content;
    }