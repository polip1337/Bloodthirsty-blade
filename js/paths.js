    function selectPath(path) {
        if (gameData.zones[4].unlocked && !game.selectedPath) {
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
        const tiersUnlocked = game.pathTiersUnlocked[path];
        pathData.tiers.forEach((tier, index) => {
            if (progress >= tier.threshold && !tiersUnlocked.includes(index)) {
                applyPathReward(path, tier.reward, index);
                tiersUnlocked.push(index);
                addCombatMessage(`Unlocked ${pathData.name} Tier ${index + 1}!`, 'achievement');
            }
        });
        if (tiersUnlocked.length === pathData.tiers.length && game.selectedPath === path) {
            addCombatMessage(`You have completed the ${pathData.name}! You can now select a new path.`, 'achievement');
            game.selectedPath = null;
            showPathSelectionModal();
        }
        updatePathsTab();
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