const JSONBIN_CONFIG = {
    binId: "68e7e731d0ea881f409b5f77",
    apiKey: "$2a$10$bsdEXJ8oDvQGTbuxPZiNMOCLEIKIvezOL3SmZeRBqYnW5q9Oh08ru",
    baseUrl: "https://api.jsonbin.io/v3/b"
};

const cardConfigurations = [
    {
        id: 'hudEditorCard',
        title: 'Editor HUD Screen',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/index_dev.html',
        initialTime: {
            days: 30,
            hours: 0,
            minutes: 0,
            seconds: 0
        }
    }
];

let countdownDataCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 30000;

async function fetchCountdownData() {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.apiKey,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return data.record || {};
    } catch (error) {
        console.error('Error fetching countdown data:', error);
        const localData = localStorage.getItem('countdown_backup');
        return localData ? JSON.parse(localData) : {};
    }
}

async function saveCountdownData(countdownData) {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(countdownData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving countdown data:', error);
        localStorage.setItem('countdown_backup', JSON.stringify(countdownData));
        return { success: false, error: error.message };
    }
}

async function getCountdownData() {
    const now = Date.now();
    
    if (countdownDataCache && (now - lastFetchTime) < CACHE_DURATION) {
        return countdownDataCache;
    }
    
    try {
        const data = await fetchCountdownData();
        countdownDataCache = data;
        lastFetchTime = now;
        return data;
    } catch (error) {
        console.error('Error getting countdown data:', error);
        return {};
    }
}

async function initializeCountdownData() {
    const currentData = await getCountdownData();
    let needsUpdate = false;

    cardConfigurations.forEach(config => {
        const currentConfig = JSON.stringify(config.initialTime);
        const savedConfig = currentData[config.id] ? JSON.stringify(currentData[config.id].initialTime) : null;
        
        if (!currentData[config.id] || savedConfig !== currentConfig) {
            currentData[config.id] = {
                initialTime: config.initialTime,
                startTime: Math.floor(Date.now() / 1000)
            };
            needsUpdate = true;
        }
    });

    if (needsUpdate) {
        await saveCountdownData(currentData);
    }
    
    return currentData;
}

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

async function setupCountdown(config) {
    const countdownTimer = document.getElementById(`${config.id}-timer`);
    const countdownProgressBar = document.getElementById(`${config.id}-progress-bar`);
    const card = document.getElementById(config.id);
    
    if (!countdownTimer || !countdownProgressBar || !card) return;

    const countdownData = await getCountdownData();
    const cardData = countdownData[config.id];
    
    if (!cardData) {
        console.error(`No data found for card: ${config.id}`);
        return;
    }

    const initialTotalSeconds = calculateTotalSeconds(cardData.initialTime);
    const startTime = cardData.startTime;
    const now = Math.floor(Date.now() / 1000);
    const elapsedSeconds = now - startTime;
    let totalSeconds = initialTotalSeconds - elapsedSeconds;

    if (totalSeconds <= 0) {
        unlockCard(config, card);
        return;
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

async function setupAllCountdowns() {
    const countdownData = await initializeCountdownData();
    
    cardConfigurations.forEach(config => {
        setupCountdown(config);
    });
}

async function updateCardTime(cardId, newTime) {
    try {
        const countdownData = await getCountdownData();
        
        if (countdownData[cardId]) {
            countdownData[cardId].initialTime = newTime;
            countdownData[cardId].startTime = Math.floor(Date.now() / 1000);
            
            const result = await saveCountdownData(countdownData);
            
            if (result.success === false) {
                console.warn('Countdown data saved locally due to API error');
            }
            
            countdownDataCache = countdownData;
            lastFetchTime = Date.now();
            
            showNotification('Tiempo actualizado correctamente', 'success');
            location.reload();
            return true;
        } else {
            console.error(`Card ${cardId} not found in countdown data`);
            return false;
        }
    } catch (error) {
        console.error('Error updating card time:', error);
        showNotification('Error al actualizar el tiempo', 'error');
        return false;
    }
}

async function resetAllTimers() {
    try {
        const countdownData = await getCountdownData();
        
        cardConfigurations.forEach(config => {
            if (countdownData[config.id]) {
                countdownData[config.id].startTime = Math.floor(Date.now() / 1000);
            }
        });
        
        const result = await saveCountdownData(countdownData);
        
        if (result.success === false) {
            console.warn('Countdown data saved locally due to API error');
        }
        
        countdownDataCache = countdownData;
        lastFetchTime = Date.now();
        
        showNotification('Todos los temporizadores reiniciados', 'success');
        location.reload();
        return true;
    } catch (error) {
        console.error('Error resetting timers:', error);
        showNotification('Error al reiniciar los temporizadores', 'error');
        return false;
    }
}

async function resetTimer(cardId) {
    try {
        const countdownData = await getCountdownData();
        
        if (countdownData[cardId]) {
            countdownData[cardId].startTime = Math.floor(Date.now() / 1000);
            
            const result = await saveCountdownData(countdownData);
            
            if (result.success === false) {
                console.warn('Countdown data saved locally due to API error');
            }
            
            countdownDataCache = countdownData;
            lastFetchTime = Date.now();
            
            showNotification('Temporizador reiniciado', 'success');
            location.reload();
            return true;
        } else {
            console.error(`Card ${cardId} not found in countdown data`);
            return false;
        }
    } catch (error) {
        console.error('Error resetting timer:', error);
        showNotification('Error al reiniciar el temporizador', 'error');
        return false;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    generateCards();
    setupAllCountdowns();
    
    window.resetAllTimers = resetAllTimers;
    window.resetTimer = resetTimer;
    window.updateCardTime = updateCardTime;
    window.cardConfigurations = cardConfigurations;
});
