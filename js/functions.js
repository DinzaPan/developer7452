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
    "$9": "./img/emojis/9.png"
};

// Variable global para controlar el picker activo
let activeEmojiPicker = null;

// Función para procesar texto y convertir códigos de emojis en imágenes
function processTextWithEmojis(text) {
    if (!text || typeof text !== 'string') return '';
    
    let processedText = text;
    
    // Procesar cada código de emoji individualmente
    Object.keys(emojisConfig).forEach(emojiCode => {
        const emojiUrl = emojisConfig[emojiCode];
        if (emojiUrl) {
            // Crear expresión regular para coincidencia exacta
            const escapedCode = emojiCode.replace(/\$/g, '\\$');
            const regex = new RegExp(escapedCode, 'g');
            processedText = processedText.replace(regex, `<img src="${emojiUrl}" alt="${emojiCode}" class="custom-emoji">`);
        }
    });
    
    return processedText;
}

// Función para procesar emojis en títulos (con tamaño diferente)
function processTextWithEmojisInTitles(text) {
    if (!text || typeof text !== 'string') return '';
    
    let processedText = text;
    
    // Procesar cada código de emoji individualmente
    Object.keys(emojisConfig).forEach(emojiCode => {
        const emojiUrl = emojisConfig[emojiCode];
        if (emojiUrl) {
            // Crear expresión regular para coincidencia exacta
            const escapedCode = emojiCode.replace(/\$/g, '\\$');
            const regex = new RegExp(escapedCode, 'g');
            processedText = processedText.replace(regex, `<img src="${emojiUrl}" alt="${emojiCode}" class="custom-emoji title-emoji">`);
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
    if (!textarea) return;
    
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
            addEmojiToText(textarea, emoji.code);
        });
        
        emojisGrid.appendChild(emojiItem);
    });
    
    container.appendChild(emojisGrid);
    
    return container;
}

// Función para mostrar el selector de emojis
function showEmojiPicker(textareaId) {
    closeEmojiPicker();
    
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const parent = textarea.parentElement;
    if (!parent) return;
    
    const picker = createEmojiPicker(textareaId);
    parent.appendChild(picker);
    
    activeEmojiPicker = {
        element: picker,
        textareaId: textareaId
    };
    
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
    
    if (element.innerHTML) {
        if (element.classList.contains('addon-title-large') || element.classList.contains('page-title')) {
            element.innerHTML = processTextWithEmojisInTitles(element.innerHTML);
        } else {
            element.innerHTML = processTextWithEmojis(element.innerHTML);
        }
    }
    
    if (element.tagName === 'TEXTAREA') {
        const parent = element.parentElement;
        if (parent && !parent.querySelector('.emoji-picker-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'emoji-picker-toggle';
            toggleBtn.innerHTML = '<i class="fas fa-smile"></i> Añadir Emoji';
            toggleBtn.title = 'Añadir emoji';
            
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleEmojiPicker(elementId);
            });
            
            parent.style.position = 'relative';
            parent.appendChild(toggleBtn);
        }
    }
}

// Función para procesar todo el documento
function processAllEmojis() {
    const elements = document.querySelectorAll('.emoji-content, .addon-description-large, .review-comment, .user-review-comment, .addon-title, .addon-description, .page-title');
    
    elements.forEach(element => {
        if (element.innerHTML && !element.classList.contains('emoji-processed')) {
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
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
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
