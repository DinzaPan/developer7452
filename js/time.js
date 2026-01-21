const cardConfigurations = [
    {
        id: 'hudEditorCard',
        title: 'Editor HUD Screen Imagen',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/index_dev.html',
        initialTime: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    },
    {
        id: 'VideoCard',
        title: 'Editor HUD Screen Videos',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/video.html',
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
    if (totalSeconds <= 0) return "¡Disponible!";
    
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function unlockCard(config, cardElement) {
    if (!cardElement) return;
    
    cardElement.classList.remove('locked');
    cardElement.classList.add('unlocked');
    cardElement.onclick = function() {
        window.location.href = config.targetUrl;
    };
    
    const overlay = document.getElementById(`${config.id}-overlay`);
    if (overlay) overlay.style.display = 'none';
    
    localStorage.removeItem(`${config.id}-endTime`);
}

function setupCountdown(config) {
    const countdownTimer = document.getElementById(`${config.id}-timer`);
    const countdownProgressBar = document.getElementById(`${config.id}-progress-bar`);
    const card = document.getElementById(config.id);
    
    if (!countdownTimer || !countdownProgressBar || !card) return;
    
    const initialTotalSeconds = calculateTotalSeconds(config.initialTime);
    
    if (initialTotalSeconds <= 0) {
        unlockCard(config, card);
        return;
    }
    
    const configKey = `${config.id}-config`;
    const savedConfig = localStorage.getItem(configKey);
    const currentConfig = JSON.stringify(config.initialTime);
    
    let totalSeconds;
    let endTime;
    
    if (savedConfig !== currentConfig) {
        localStorage.removeItem(`${config.id}-endTime`);
        localStorage.setItem(configKey, currentConfig);
        
        endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
        localStorage.setItem(`${config.id}-endTime`, endTime.toString());
        totalSeconds = initialTotalSeconds;
    } else {
        const savedEndTime = localStorage.getItem(`${config.id}-endTime`);
        
        if (savedEndTime) {
            endTime = parseInt(savedEndTime);
            const now = Math.floor(Date.now() / 1000);
            totalSeconds = endTime - now;
            
            if (totalSeconds <= 0) {
                unlockCard(config, card);
                return;
            }
        } else {
            endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
            localStorage.setItem(`${config.id}-endTime`, endTime.toString());
            totalSeconds = initialTotalSeconds;
        }
    }
    
    function updateCountdown() {
        const now = Math.floor(Date.now() / 1000);
        totalSeconds = endTime - now;
        
        if (totalSeconds <= 0) {
            unlockCard(config, card);
            return;
        }
        
        countdownTimer.textContent = formatTime(totalSeconds);
        const progressPercentage = (totalSeconds / initialTotalSeconds) * 100;
        countdownProgressBar.style.width = `${progressPercentage}%`;
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
