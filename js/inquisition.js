function checkInquisitionEncounter(zoneIndex) {
    const activityLevel = game.inquisitionActivity[zoneIndex] || 0;
    const chance = activityLevel * 0.3; // Max 30%
    return Math.random() < chance;
}

function handleInquisitionEncounter(zoneIndex) {
    if (!game.firstInquisitionEncounter) {
        game.firstInquisitionEncounter = true;
        showInquisitionExplanation(zoneIndex);
    } else {
        startInquisitionCombat(zoneIndex);
    }
}

function showInquisitionExplanation(zoneIndex) {
    disableBackground();
    document.getElementById('inquisitionExplanationModal').style.display = 'block';
    addCombatMessage('You narrowly escape the Inquisition this time. Be more careful in the future.', 'warning');
    game.inquisitionActivity[zoneIndex] = Math.max((game.inquisitionActivity[zoneIndex] || 0) - 0.2, 0);
}

function startInquisitionCombat(zoneIndex) {
    const inquisitionEnemy = {
        name: "Inquisition Agent",
        level: 100,
        strength: 100,
        defense: 50,
        endurance: 1000,
        exp: 0,
        isInquisition: true
    };
    attackEnemy(zoneIndex, -1, inquisitionEnemy);
}