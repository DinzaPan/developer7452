// Configuración de las tarjetas con temporizador
const cardConfigurations = [
    {
        id: 'hudEditorCard',
        title: 'Editor HUD Screen',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/index_dev.html',
        // Tiempo inicial: 5 días, 2 horas, 3 minutos y 50 segundos
        initialTime: {
            days: 5,
            hours: 2,
            minutes: 3,
            seconds: 50
        }
    },
    // Ejemplo de otra tarjeta (descomenta para usar)
    /*
    {
        id: 'anotherCard',
        title: 'Otra Herramienta',
        description: 'Descripción de otra herramienta útil para Minecraft.',
        icon: 'fas fa-cogs',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        targetUrl: 'web/another_tool.html',
        // Tiempo inicial: 3 días, 12 horas, 0 minutos y 0 segundos
        initialTime: {
            days: 3,
            hours: 12,
            minutes: 0,
            seconds: 0
        }
    }
    */
];

// Función para generar las tarjetas en el DOM
function generateCards() {
    const gridContainer = document.getElementById('webpagesGrid');
    
    if (!gridContainer) {
        console.error('No se encontró el contenedor de tarjetas');
        return;
    }
    
    gridContainer.innerHTML = '';
    
    cardConfigurations.forEach(config => {
        const totalSeconds = calculateTotalSeconds(config.initialTime);
        
        const cardHTML = `
            <div class="webpage-card locked" id="${config.id}">
                <div class="countdown-overlay" id="${config.id}-overlay">
                    <h3 class="countdown-title">Disponible en:</h3>
                    <div class="countdown-timer" id="${config.id}-timer">${formatTime(totalSeconds)}</div>
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

// Función para calcular el total de segundos a partir del tiempo inicial
function calculateTotalSeconds(timeObj) {
    return (timeObj.days * 24 * 60 * 60) + 
           (timeObj.hours * 60 * 60) + 
           (timeObj.minutes * 60) + 
           timeObj.seconds;
}

// Función para formatear el tiempo en días, horas, minutos y segundos
function formatTime(totalSeconds) {
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;
    
    return `${days}d, ${hours}h, ${minutes}m, ${seconds}s`;
}

// Función para inicializar todos los contadores
function setupAllCountdowns() {
    cardConfigurations.forEach(config => {
        setupCountdown(config);
    });
}

// Sistema de contador regresivo para una tarjeta específica
function setupCountdown(config) {
    const countdownTimer = document.getElementById(`${config.id}-timer`);
    const countdownProgressBar = document.getElementById(`${config.id}-progress-bar`);
    const card = document.getElementById(config.id);
    
    if (!countdownTimer || !countdownProgressBar || !card) {
        console.error(`Elementos no encontrados para la tarjeta: ${config.id}`);
        return;
    }
    
    const initialTotalSeconds = calculateTotalSeconds(config.initialTime);
    let totalSeconds = initialTotalSeconds;
    
    // Verificar si ya ha expirado (para cuando se recarga la página)
    const savedEndTime = localStorage.getItem(`${config.id}-endTime`);
    let endTime;
    
    if (savedEndTime) {
        endTime = parseInt(savedEndTime);
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) {
            // El contador ya expiró
            unlockCard(config, card);
            return;
        } else {
            totalSeconds = timeLeft;
        }
    } else {
        // Primera vez - establecer tiempo de finalización
        endTime = Math.floor(Date.now() / 1000) + totalSeconds;
        localStorage.setItem(`${config.id}-endTime`, endTime.toString());
    }
    
    // Función para actualizar el contador
    function updateCountdown() {
        if (totalSeconds <= 0) {
            unlockCard(config, card);
            return;
        }
        
        // Actualizar el texto del contador
        countdownTimer.textContent = formatTime(totalSeconds);
        
        // Actualizar la barra de progreso
        const progressPercentage = (totalSeconds / initialTotalSeconds) * 100;
        countdownProgressBar.style.width = `${progressPercentage}%`;
        
        // Reducir el tiempo
        totalSeconds--;
    }
    
    // Función para desbloquear la tarjeta
    function unlockCard(config, cardElement) {
        cardElement.classList.remove('locked');
        cardElement.classList.add('unlocked');
        
        // Permitir clic en la tarjeta
        cardElement.onclick = function() {
            window.location.href = config.targetUrl;
        };
        
        // Limpiar el intervalo
        clearInterval(countdownInterval);
        
        // Eliminar el tiempo guardado
        localStorage.removeItem(`${config.id}-endTime`);
    }
    
    // Actualizar el contador inmediatamente y luego cada segundo
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Inicialmente, la tarjeta está bloqueada
    card.onclick = function(e) {
        if (card.classList.contains('locked')) {
            e.preventDefault();
            e.stopPropagation();
            // Mostrar mensaje de que aún no está disponible
            if (typeof showNotification === 'function') {
                showNotification('Esta herramienta aún no está disponible. Por favor, espera a que el contador llegue a cero.', 'info');
            } else {
                alert('Esta herramienta aún no está disponible. Por favor, espera a que el contador llegue a cero.');
            }
        }
    };
}

// Función para reiniciar todos los temporizadores
function resetAllTimers() {
    cardConfigurations.forEach(config => {
        localStorage.removeItem(`${config.id}-endTime`);
    });
    
    // Recargar la página para aplicar los cambios
    location.reload();
}

// Función para reiniciar un temporizador específico
function resetTimer(cardId) {
    localStorage.removeItem(`${cardId}-endTime`);
    // Recargar la página para aplicar los cambios
    location.reload();
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    generateCards();
    setupAllCountdowns();
    
    // Para desarrollo: exponer funciones de reinicio en la consola
    window.resetAllTimers = resetAllTimers;
    window.resetTimer = resetTimer;
    window.cardConfigurations = cardConfigurations;
    
    console.log('Sistema de tarjetas con temporizador inicializado');
    console.log('Para reiniciar todos los temporizadores, ejecuta: resetAllTimers()');
    console.log('Para reiniciar un temporizador específico, ejecuta: resetTimer("id-de-la-tarjeta")');
});
