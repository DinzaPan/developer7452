const cardConfigurations = [
    {
        id: 'hudEditorCard',
        title: 'Editor HUD Screen',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/index_dev.html',
        initialTime: {
            days: 20,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    }
];

function generateCards() {
    const gridContainer = document.getElementById('webpagesGrid');
    if (!gridContainer) return;
    
    gridContainer.innerHTML = '';
    
    cardConfigurations.forEach(config => {
        const cardHTML = `
            <div class="webpage-card locked" id="${config.id}">
                <div class="countdown-overlay" id="${config.id}-overlay">
                    <h3 class="countdown-title">Disponible en:</h3>
                    <div class="countdown-timer" id="${config.id}-timer">Calculando...</div>
                    <div class="countdown-progress">
                        <div class="countdown-progress-bar" id="${config.id}-progress-bar"></div>
                    </div>
                    <p class="countdown-message">Esta herramienta estará disponible una vez que el contador llegue a cero</p>
                </div>
                
                <div class="webpage-icon">
                    <i class="${config.icon}"></i>
                </div>
                <div class="webpage-info">
                    <h3 class="webpage-title">${config.title}</h3>
                    <p class="webpage-description">${config.description}</p>
                    <div class="webpage-features">
                        ${config.features.map(feature => `<div class="feature-tag">${feature}</div>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        gridContainer.innerHTML += cardHTML;
    });
}

function calculateTotalSeconds(timeObj) {
    return (timeObj.days * 24 * 60 * 60) + 
           (timeObj.hours * 60 * 60) + 
           (timeObj.minutes * 60) + 
           timeObj.seconds;
}

function formatTime(totalSeconds) {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
}

function setupCountdown(config) {
    const countdownTimer = document.getElementById(`${config.id}-timer`);
    const countdownProgressBar = document.getElementById(`${config.id}-progress-bar`);
    const card = document.getElementById(config.id);
    
    if (!countdownTimer || !countdownProgressBar || !card) return;
    
    const initialTotalSeconds = calculateTotalSeconds(config.initialTime);
    
    const configKey = `${config.id}-config`;
    const savedConfig = localStorage.getItem(configKey);
    const currentConfig = JSON.stringify(config.initialTime);
    
    let totalSeconds;
    
    if (savedConfig !== currentConfig) {
        localStorage.removeItem(`${config.id}-endTime`);
        localStorage.setItem(configKey, currentConfig);
        
        const endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
        localStorage.setItem(`${config.id}-endTime`, endTime.toString());
        totalSeconds = initialTotalSeconds;
    } else {
        const savedEndTime = localStorage.getItem(`${config.id}-endTime`);
        
        if (savedEndTime) {
            const endTime = parseInt(savedEndTime);
            const now = Math.floor(Date.now() / 1000);
            const timeLeft = endTime - now;
            
            if (timeLeft <= 0) {
                unlockCard(config, card);
                return;
            } else {
                totalSeconds = timeLeft;
            }
        } else {
            const endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
            localStorage.setItem(`${config.id}-endTime`, endTime.toString());
            totalSeconds = initialTotalSeconds;
        }
    }
    
    function updateCountdown() {
        if (totalSeconds <= 0) {
            unlockCard(config, card);
            return;
        }
        
        countdownTimer.textContent = formatTime(totalSeconds);
        const progressPercentage = (totalSeconds / initialTotalSeconds) * 100;
        countdownProgressBar.style.width = `${progressPercentage}%`;
        
        totalSeconds--;
    }
    
    function unlockCard(config, cardElement) {
        cardElement.classList.remove('locked');
        cardElement.classList.add('unlocked');
        cardElement.onclick = function() {
            window.location.href = config.targetUrl;
        };
        clearInterval(countdownInterval);
        localStorage.removeItem(`${config.id}-endTime`);
    }
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    card.onclick = function(e) {
        if (card.classList.contains('locked')) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof showNotification === 'function') {
                showNotification('Esta herramienta aún no está disponible. Por favor, espera a que el contador llegue a cero.', 'info');
            }
        } else {
            window.location.href = config.targetUrl;
        }
    };
}

function setupAllCountdowns() {
    cardConfigurations.forEach(config => {
        setupCountdown(config);
    });
}

function resetAllTimers() {
    cardConfigurations.forEach(config => {
        localStorage.removeItem(`${config.id}-endTime`);
        localStorage.removeItem(`${config.id}-config`);
    });
    location.reload();
}

function resetTimer(cardId) {
    localStorage.removeItem(`${cardId}-endTime`);
    localStorage.removeItem(`${cardId}-config`);
    location.reload();
}

document.addEventListener('DOMContentLoaded', function() {
    generateCards();
    setupAllCountdowns();
    
    window.resetAllTimers = resetAllTimers;
    window.resetTimer = resetTimer;
});
