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