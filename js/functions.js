// Sistema de emojis personalizados para Developer7452
const emojisConfig = {
    "$1": "./img/emojis/1.png",
    "$2": "./img/emojis/2.png", 
    "$3": "./img/emojis/3.png",
    "$4": "./img/emojis/4.png",
    "$5": "./img/emojis/5.png",
    "$6": "./img/emojis/6.png",
    "$7": "./img/emojis/7.png",
    "$8": "./img/emojis/8.png",
    "$9": "./img/emojis/9.png",
    "$10": "./img/emojis/10.png",
    "$11": "./img/emojis/11.png", 
    "$12": "./img/emojis/12.png",
    "$13": "./img/emojis/13.png",
    "$14": "./img/emojis/14.png",
    "$15": "./img/emojis/15.png",
    "$16": "./img/emojis/16.png",
    "$17": "./img/emojis/17.png",
    "$18": "./img/emojis/18.png"
};

// Variable global para controlar el picker activo
let activeEmojiPicker = null;

// Función para procesar texto y convertir códigos de emojis en imágenes
function processTextWithEmojis(text) {
    if (!text) return '';
    
    let processedText = text;
    
    // Ordenar los códigos de más largo a más corto para evitar conflictos
    const emojiCodes = Object.keys(emojisConfig).sort((a, b) => b.length - a.length);
    
    emojiCodes.forEach(emojiCode => {
        const emojiUrl = emojisConfig[emojiCode];
        if (emojiUrl) {
            // Usar una expresión regular para coincidencias exactas
            const regex = new RegExp(emojiCode.replace(/\$/g, '\\$') + '(?![0-9])', 'g');
            processedText = processedText.replace(regex, `<img src="${emojiUrl}" alt="${emojiCode}" class="custom-emoji" data-emoji="${emojiCode.substring(1)}">`);
        }
    });
    
    return processedText;
}

// Función para procesar emojis en títulos (con tamaño diferente)
function processTextWithEmojisInTitles(text) {
    if (!text) return '';
    
    let processedText = text;
    
    // Ordenar los códigos de más largo a más corto para evitar conflictos
    const emojiCodes = Object.keys(emojisConfig).sort((a, b) => b.length - a.length);
    
    emojiCodes.forEach(emojiCode => {
        const emojiUrl = emojisConfig[emojiCode];
        if (emojiUrl) {
            // Usar una expresión regular para coincidencias exactas
            const regex = new RegExp(emojiCode.replace(/\$/g, '\\$') + '(?![0-9])', 'g');
            processedText = processedText.replace(regex, `<img src="${emojiUrl}" alt="${emojiCode}" class="custom-emoji title-emoji" data-emoji="${emojiCode.substring(1)}">`);
        }
    });
    
    return processedText;
}

// Función para obtener la lista de emojis disponibles
function getAvailableEmojis() {
    return Object.keys(emojisConfig).map(key => ({
        code: key,
        url: emojisConfig[key],
        preview: emojisConfig[key]
    }));
}

// Función para añadir un emoji al texto
function addEmojiToText(textarea, emojiCode) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    // Insertar el código del emoji con espacios para evitar conflictos
    const emoji = ` ${emojiCode} `;
    
    textarea.value = text.substring(0, start) + emoji + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    
    // Disparar evento de cambio
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Cerrar el picker después de añadir un emoji
    closeEmojiPicker();
}

// Función para crear un selector de emojis
function createEmojiPicker(textareaId) {
    const emojis = getAvailableEmojis();
    const container = document.createElement('div');
    container.className = 'emoji-picker';
    container.id = `emoji-picker-${textareaId}`;
    
    const pickerHeader = document.createElement('div');
    pickerHeader.className = 'emoji-picker-header';
    pickerHeader.innerHTML = '<h4>Emojis Disponibles</h4>';
    container.appendChild(pickerHeader);
    
    const emojisGrid = document.createElement('div');
    emojisGrid.className = 'emojis-grid';
    
    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.innerHTML = `
            <img src="${emoji.preview}" alt="${emoji.code}" class="emoji-preview">
            <span class="emoji-code">${emoji.code}</span>
        `;
        
        emojiItem.addEventListener('click', () => {
            const textarea = document.getElementById(textareaId);
            if (textarea) {
                addEmojiToText(textarea, emoji.code);
            }
        });
        
        emojisGrid.appendChild(emojiItem);
    });
    
    container.appendChild(emojisGrid);
    
    return container;
}

// Función para mostrar el selector de emojis
function showEmojiPicker(textareaId) {
    closeEmojiPicker(); // Cerrar cualquier picker abierto
    
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const parent = textarea.parentElement;
    const picker = createEmojiPicker(textareaId);
    parent.appendChild(picker);
    
    activeEmojiPicker = {
        element: picker,
        textareaId: textareaId
    };
    
    // Añadir evento para cerrar al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', closeEmojiPickerOnClickOutside);
    }, 10);
}

// Función para cerrar el selector de emojis
function closeEmojiPicker() {
    if (activeEmojiPicker) {
        activeEmojiPicker.element.remove();
        activeEmojiPicker = null;
        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
    }
}

// Función para manejar clics fuera del selector
function closeEmojiPickerOnClickOutside(event) {
    if (activeEmojiPicker && !activeEmojiPicker.element.contains(event.target)) {
        // Verificar si el clic no fue en el botón del emoji
        const emojiButton = document.querySelector('.emoji-picker-toggle');
        if (!emojiButton || !emojiButton.contains(event.target)) {
            closeEmojiPicker();
        }
    }
}

// Función para alternar el selector de emojis
function toggleEmojiPicker(textareaId) {
    if (activeEmojiPicker && activeEmojiPicker.textareaId === textareaId) {
        closeEmojiPicker();
    } else {
        showEmojiPicker(textareaId);
    }
}

// Inicializar sistema de emojis en elementos específicos
function initEmojisForElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Procesar emojis en el contenido inicial
    if (element.innerHTML) {
        // Determinar si es un título para aplicar clase diferente
        if (element.classList.contains('addon-title-large') || element.classList.contains('page-title')) {
            element.innerHTML = processTextWithEmojisInTitles(element.innerHTML);
        } else {
            element.innerHTML = processTextWithEmojis(element.innerHTML);
        }
    }
    
    // Para textareas, añadir botón de emojis
    if (element.tagName === 'TEXTAREA') {
        const parent = element.parentElement;
        if (parent && !parent.querySelector('.emoji-picker-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'emoji-picker-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-smile"></i> Añadir Emoji';
            toggleBtn.title = 'Añadir emoji';
            
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevenir que se cierre inmediatamente
                toggleEmojiPicker(elementId);
            });
            
            parent.style.position = 'relative';
            parent.appendChild(toggleBtn);
        }
    }
}

// Función para procesar todo el documento
function processAllEmojis() {
    // Procesar elementos con clase específica
    const elements = document.querySelectorAll('.emoji-content, .addon-description-large, .review-comment, .user-review-comment, .addon-title, .addon-description, .page-title');
    
    elements.forEach(element => {
        if (element.innerHTML && !element.classList.contains('emoji-processed')) {
            // Determinar qué función de procesamiento usar según el tipo de elemento
            if (element.classList.contains('addon-title-large') || element.classList.contains('page-title') || element.classList.contains('addon-title')) {
                element.innerHTML = processTextWithEmojisInTitles(element.innerHTML);
            } else {
                element.innerHTML = processTextWithEmojis(element.innerHTML);
            }
            element.classList.add('emoji-processed');
        }
    });
}

// Inicializar sistema de emojis para todos los elementos
function initEmojisForAll() {
    processAllEmojis();
    
    // También procesar después de cargar contenido dinámico
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Pequeño delay para asegurar que el contenido se haya renderizado
                setTimeout(processAllEmojis, 50);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Cerrar el picker cuando se presiona Escape
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && activeEmojiPicker) {
        closeEmojiPicker();
    }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initEmojisForAll();
});

// Función para proteger imágenes contra descargas
function protectImages() {
    document.addEventListener('contextmenu', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    document.addEventListener('dragstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
    
    // Prevenir selección de imágenes
    document.addEventListener('selectstart', function(e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
            return false;
        }
    });
}

// Inicializar protección de imágenes cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    protectImages();
});

// Exportar funciones para uso global
window.EmojiSystem = {
    processTextWithEmojis,
    processTextWithEmojisInTitles,
    getAvailableEmojis,
    addEmojiToText,
    createEmojiPicker,
    showEmojiPicker,
    closeEmojiPicker,
    toggleEmojiPicker,
    initEmojisForElement,
    processAllEmojis,
    initEmojisForAll
};

// Función para reemplazar emojis (compatibilidad con código antiguo)
function replaceEmojis(text) {
    return processTextWithEmojis(text);
}

// Función auxiliar para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Eliminar notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    return notification;
}

// Función para obtener avatar por defecto
function getDefaultAvatar() {
    return './img/profile/default-avatar.png';
}
