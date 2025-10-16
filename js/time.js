// Configuración de las tarjetas con temporizador
const cardConfigurations = [
    {
        id: 'hudEditorCard',
        title: 'Editor HUD Screen',
        description: 'Herramienta para crear y personalizar archivos hud_screen.json para Minecraft Bedrock Edition.',
        icon: 'fas fa-code',
        features: ['JSON Generator', 'Minecraft UI', 'Custom HUD'],
        targetUrl: 'web/index_dev.html',
        // Tiempo inicial: 30 días, 0 horas, 0 minutos y 0 segundos
        initialTime: {
            days: 30,
            hours: 0,
            minutes: 0,
            seconds: 0
        },
        // Hash para detectar cambios (cambia este valor cuando modifiques el tiempo)
        timeHash: 'v1.0-30days'
    }
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

// Función para verificar si una tarjeta ha sido modificada
function hasCardChanged(cardId, currentHash) {
    const savedHash = localStorage.getItem(`${cardId}-hash`);
    console.log(`Verificando cambios para ${cardId}:`, { savedHash, currentHash });
    return savedHash !== currentHash;
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
    
    console.log(`Configurando contador para ${config.id}:`, {
        initialTime: config.initialTime,
        initialTotalSeconds,
        timeHash: config.timeHash
    });
    
    // Verificar si la tarjeta ha sido modificada (nuevo hash)
    if (hasCardChanged(config.id, config.timeHash)) {
        console.log(`⚠️ Tarjeta ${config.id} modificada. Reiniciando temporizador...`);
        console.log(`Nuevo tiempo: ${config.initialTime.days} días`);
        // Reiniciar el temporizador para esta tarjeta
        localStorage.removeItem(`${config.id}-endTime`);
        localStorage.setItem(`${config.id}-hash`, config.timeHash);
        
        // Establecer nuevo tiempo de finalización
        const endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
        localStorage.setItem(`${config.id}-endTime`, endTime.toString());
        totalSeconds = initialTotalSeconds;
    }
    
    // Verificar si ya existe un tiempo guardado
    const savedEndTime = localStorage.getItem(`${config.id}-endTime`);
    let endTime;
    
    if (savedEndTime) {
        endTime = parseInt(savedEndTime);
        const now = Math.floor(Date.now() / 1000);
        const timeLeft = endTime - now;
        
        console.log(`Tiempo verificado para ${config.id}:`, {
            savedEndTime,
            now,
            timeLeft
        });
        
        if (timeLeft <= 0) {
            // El contador ya expiró
            console.log(`✅ ${config.id} - Contador expirado, desbloqueando...`);
            unlockCard(config, card);
            return;
        } else {
            totalSeconds = timeLeft;
            console.log(`⏰ ${config.id} - Tiempo restante: ${totalSeconds} segundos`);
        }
    } else {
        // Primera vez - establecer tiempo de finalización
        console.log(`🆕 ${config.id} - Primera ejecución, estableciendo temporizador...`);
        endTime = Math.floor(Date.now() / 1000) + initialTotalSeconds;
        localStorage.setItem(`${config.id}-endTime`, endTime.toString());
        localStorage.setItem(`${config.id}-hash`, config.timeHash);
        totalSeconds = initialTotalSeconds;
    }
    
    // Actualizar la visualización inmediatamente
    countdownTimer.textContent = formatTime(totalSeconds);
    const progressPercentage = (totalSeconds / initialTotalSeconds) * 100;
    countdownProgressBar.style.width = `${progressPercentage}%`;
    
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
        
        // Guardar el progreso cada 30 segundos para evitar pérdida de datos
        if (totalSeconds % 30 === 0) {
            const currentEndTime = Math.floor(Date.now() / 1000) + totalSeconds;
            localStorage.setItem(`${config.id}-endTime`, currentEndTime.toString());
        }
    }
    
    // Función para desbloquear la tarjeta
    function unlockCard(config, cardElement) {
        console.log(`🎉 Desbloqueando tarjeta: ${config.id}`);
        cardElement.classList.remove('locked');
        cardElement.classList.add('unlocked');
        
        // Permitir clic en la tarjeta
        cardElement.onclick = function() {
            window.location.href = config.targetUrl;
        };
        
        // Limpiar el intervalo
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Eliminar el tiempo guardado
        localStorage.removeItem(`${config.id}-endTime`);
        
        // Mostrar mensaje de desbloqueo
        if (typeof showNotification === 'function') {
            showNotification(`¡${config.title} ahora está disponible!`, 'success');
        }
    }
    
    // Actualizar el contador cada segundo
    const countdownInterval = setInterval(updateCountdown, 1000);
    
    // Configurar comportamiento del clic
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
        } else {
            window.location.href = config.targetUrl;
        }
    };
}

// Función para forzar el reinicio de todos los temporizadores
function resetAllTimers() {
    console.log('🔄 Reiniciando TODOS los temporizadores...');
    cardConfigurations.forEach(config => {
        localStorage.removeItem(`${config.id}-endTime`);
        localStorage.removeItem(`${config.id}-hash`);
    });
    
    // Recargar la página para aplicar los cambios
    location.reload();
}

// Función para reiniciar un temporizador específico
function resetTimer(cardId) {
    console.log(`🔄 Reiniciando temporizador: ${cardId}`);
    localStorage.removeItem(`${cardId}-endTime`);
    localStorage.removeItem(`${cardId}-hash`);
    // Recargar la página para aplicar los cambios
    location.reload();
}

// Función para actualizar el tiempo de una tarjeta específica
function updateCardTime(cardId, newTime, newHash) {
    // Encontrar la tarjeta en la configuración
    const cardIndex = cardConfigurations.findIndex(card => card.id === cardId);
    
    if (cardIndex !== -1) {
        // Actualizar el tiempo y el hash
        cardConfigurations[cardIndex].initialTime = newTime;
        cardConfigurations[cardIndex].timeHash = newHash;
        
        console.log(`Tiempo actualizado para ${cardId}:`, newTime);
        console.log(`Nuevo hash: ${newHash}`);
        
        // Reiniciar solo esta tarjeta
        resetTimer(cardId);
    } else {
        console.error(`No se encontró la tarjeta con ID: ${cardId}`);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de tarjetas con temporizador...');
    generateCards();
    setupAllCountdowns();
    
    // Para desarrollo: exponer funciones en la consola
    window.resetAllTimers = resetAllTimers;
    window.resetTimer = resetTimer;
    window.updateCardTime = updateCardTime;
    window.cardConfigurations = cardConfigurations;
    
    console.log('✅ Sistema de tarjetas con temporizador inicializado');
    console.log('Comandos disponibles:');
    console.log('- resetAllTimers(): Reinicia todos los temporizadores');
    console.log('- resetTimer("hudEditorCard"): Reinicia un temporizador específico');
    console.log('- updateCardTime("hudEditorCard", {days: X, hours: X, minutes: X, seconds: X}, "nuevo-hash"): Actualiza el tiempo de una tarjeta');
});
