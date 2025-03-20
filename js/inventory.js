function openShop(zoneIndex) {
    closeOtherFooterModals('shopModal');
    disableBackground();
    document.getElementById('shopModal').style.display = 'block';
    const zoneItems = game.shopItems[zoneIndex] || game.shopItems[4];
    const shopContent = `
    <h3>Shop - ${gameData.zones[zoneIndex].name}</h3>
        <p id="modal-gold-value">Gold: ${game.wielder.gold}</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        ${zoneItems.map((item, index) => `
            <div class="shop-item tooltip ${getItemBorderClass(item)} ${index % 3 === 0 ? 'left-column' : ''}">
                <img src="${item.icon}" alt="${item.name}">
                <span class="tooltiptext">${getItemTooltip(item)}<br>Price: ${item.price} gold</span>
                <button onclick="buyItem('${item.name}', ${zoneIndex})">Buy</button>
            </div>
        `).join('')}
        </div>`;
    document.getElementById('shopContent').innerHTML = shopContent;
}

function buyItem(itemName, zoneIndex) {
    const zoneItems = game.shopItems[zoneIndex] || game.shopItems[4];
    const item = zoneItems.find(i => i.name === itemName);
    const discount = Object.values(game.achievements).reduce((sum, ach) => sum + (ach.unlocked && ach.bonus.shopDiscount ? ach.bonus.shopDiscount : 0), 0);
    const effectivePrice = item.price * (1 - discount);
    if (game.wielder.gold >= effectivePrice && game.wielder.inventory.length < 9) {
        game.wielder.gold -= effectivePrice;
        game.wielder.inventory.push(item);
        updateWielderStats();
        updateEquipmentAndInventory();
    } else {
        alert('Not enough gold or inventory full');
    }
    updateModalGold()

}

function handleInventoryClick(index) {
    if (game.sellMode) {
        const item = game.wielder.inventory[index];
        if (item) {
            const sellPrice = Math.floor(item.price / 2);
            game.wielder.gold += sellPrice;
            game.wielder.inventory.splice(index, 1);
            addCombatMessage(`Sold ${item.name} for ${sellPrice} gold`, 'player-stat');
            updateWielderStats();
            updateEquipmentAndInventory();
        }
    } else {
        const item = game.wielder.inventory[index];
        if (item) {
            const slot = item.type;
            if (game.wielder.equipment[slot]) {
                if (game.wielder.inventory.length < 9) {
                    const equippedItem = game.wielder.equipment[slot];
                    game.wielder.equipment[slot] = item;
                    game.wielder.inventory[index] = equippedItem;
                } else {
                    alert('Inventory full, cannot swap');
                }
            } else {
                game.wielder.equipment[slot] = item;
                game.wielder.inventory.splice(index, 1);
            }
            updateWielderStats();
            updateEquipmentAndInventory();
        }
    }
}

function unequipItem(slot) {
    if (slot === 'weapon') {
        // Show popup instead of unequipping
        document.getElementById('swordUnequipMessage').textContent =
            'The Cursed Sword is bound to you and cannot be unequipped!';
        document.getElementById('swordUnequipModal').style.display = 'block';
    } else if (game.wielder.equipment[slot] && game.wielder.inventory.length < 9) {
        game.wielder.inventory.push(game.wielder.equipment[slot]);
        game.wielder.equipment[slot] = null;
        updateWielderStats();
        updateEquipmentAndInventory();
    }
}

function toggleSellMode() {
    game.sellMode = !game.sellMode;
    updateEquipmentAndInventory();
}

function getEquipmentBonuses() {
    const bonuses = {};
    for (let slot in game.wielder.equipment) {
        if (game.wielder.equipment[slot]) {
            for (let stat in game.wielder.equipment[slot].stats) {
                bonuses[stat] = (bonuses[stat] || 0) + game.wielder.equipment[slot].stats[stat];
            }
        }
    }
    return bonuses;
}

function getEffectiveStats() {
    const effective = { ...game.wielder.currentStats };
    const bonuses = getEquipmentBonuses();
    const achBonuses = Object.values(game.achievements).reduce((acc, ach) => {
        if (ach.unlocked) {
            if (ach.bonus.enduranceBonus) acc.endurance = (acc.endurance || 0) + ach.bonus.enduranceBonus;
            if (ach.bonus.willpowerBonus) acc.willpower = (acc.willpower || 0) + ach.bonus.willpowerBonus;
            if (ach.bonus.statBonus) {
                acc.strength = (acc.strength || 0) + ach.bonus.statBonus;
                acc.swordfighting = (acc.swordfighting || 0) + ach.bonus.statBonus;
                acc.endurance = (acc.endurance || 0) + ach.bonus.statBonus;
                acc.willpower = (acc.willpower || 0) + ach.bonus.statBonus;
            }
            if (ach.bonus.goblinBonus && game.wielder.race === 'goblin') {
                acc.strength = (acc.strength || 0) + ach.bonus.goblinBonus;
            }
        }
        return acc;
    }, {});
    for (let stat in bonuses) effective[stat] = (effective[stat] || 0) + bonuses[stat];
    for (let stat in achBonuses) effective[stat] = (effective[stat] || 0) + achBonuses[stat];
    return effective;
}

function getItemStatsText(item) {
    return Object.entries(item.stats).map(([stat, value]) => `+${value} ${stat}`).join(', ');
}

function getItemTooltip(item) {
    return `${item.name}<br>${getItemStatsText(item)}`;
}

function getItemBorderClass(item) {
    if (!item) return '';
    const statSum = Object.values(item.stats).reduce((sum, val) => sum + val, 0);
    switch (statSum) {
        case 1: return 'border-white';
        case 2: return 'border-blue';
        case 3: return 'border-green';
        case 4: return 'border-orange';
        case 5: return 'border-purple';
        default: return '';
    }
}