function checkEvents() {
    if (isAnyModalOpen()) return; // Prevent overlapping modals
    gameData.events.forEach(event => {
        if (event.condition()) {
            event.effect();
        }
    });
}

// Function to show the event modal
function showEventModal(title, description, choices) {
    const modal = document.getElementById('eventModal');
    document.getElementById('eventTitle').textContent = title;
    document.getElementById('eventDescription').textContent = description;
    const choicesDiv = document.getElementById('eventChoices');
    choicesDiv.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.label;
        button.onclick = () => {
            choice.action();
            modal.style.display = 'none';
        };
        choicesDiv.appendChild(button);
    });
    modal.style.display = 'block';
}