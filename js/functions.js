// Sistema de emojis
const emojis = {
    "$1": "1.png",
    "$2": "2.png", 
    "$3": "3.png",
    "$4": "4.png",
    "$5": "5.png",
    "$6": "6.png",
    "$7": "7.png",
    "$8": "8.png",
    "$9": "9.png"
};

// Variable global para controlar el picker activo
let activeEmojiPicker = null;

// Función para reemplazar emojis en texto - CORREGIDA
function replaceEmojis(text) {
    if (!text) return '';
    
    let processedText = text;
    
    // Reemplazar cada código de emoji por su imagen
    Object.keys(emojis).forEach(emojiCode => {
        const emojiPath = `./img/emojis/${emojis[emojiCode]}`;
        const emojiImg = `<img src="${emojiPath}" alt="${emojiCode}" class="emoji" draggable="false">`;
        
        // Usar expresión regular para reemplazar todas las ocurrencias
        const regex = new RegExp(emojiCode.replace(/\$/g, '\\$'), 'g');
        processedText = processedText.replace(regex, emojiImg);
    });
    
    return processedText;
}

// Función para obtener la lista de emojis disponibles
function getAvailableEmojis() {
    return Object.keys(emojis).map(key => ({
        code: key,
        url: `./img/emojis/${emojis[key]}`,
        preview: `./img/emojis/${emojis[key]}`
    }));
}

// Función para añadir un emoji al texto
function addEmojiToText(textarea, emojiCode) {
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
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
    const emojisList = getAvailableEmojis();
    const container = document.createElement('div');
    container.className = 'emoji-picker';
    container.id = `emoji-picker-${textareaId}`;
    
    const pickerHeader = document.createElement('div');
    pickerHeader.className = 'emoji-picker-header';
    pickerHeader.innerHTML = '<h4>Emojis Disponibles</h4>';
    container.appendChild(pickerHeader);
    
    const emojisGrid = document.createElement('div');
    emojisGrid.className = 'emojis-grid';
    
    emojisList.forEach(emoji => {
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
    closeEmojiPicker(); // Cerrar cualquier picker abierto
    
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
    
    // Añadir evento para cerrar al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', closeEmojiPickerOnClickOutside);
    }, 10);
}

// Función para cerrar el selector de emojis
function closeEmojiPicker() {
    if (activeEmojiPicker && activeEmojiPicker.element) {
        activeEmojiPicker.element.remove();
        activeEmojiPicker = null;
        document.removeEventListener('click', closeEmojiPickerOnClickOutside);
    }
}

// Función para manejar clics fuera del selector
function closeEmojiPickerOnClickOutside(event) {
    if (!activeEmojiPicker) return;
    
    const picker = activeEmojiPicker.element;
    const emojiButton = document.querySelector('.emoji-picker-toggle');
    
    if (picker && !picker.contains(event.target) && 
        (!emojiButton || !emojiButton.contains(event.target))) {
        closeEmojiPicker();
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
        element.innerHTML = replaceEmojis(element.innerHTML);
    }
    
    // Para textareas, añadir botón de emojis
    if (element.tagName === 'TEXTAREA') {
        const parent = element.parentElement;
        if (parent && !parent.querySelector('.emoji-picker-toggle')) {
            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.className = 'emoji-picker-toggle';
            toggleBtn.innerHTML = '😊 Añadir Emoji';
            toggleBtn.title = 'Añadir emoji';
            
            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
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
    // Procesar elementos con clase específica
    const elements = document.querySelectorAll('.emoji-content, .addon-description-large, .review-comment, .user-review-comment, .addon-title-large');
    
    elements.forEach(element => {
        if (element.innerHTML && !element.classList.contains('emoji-processed')) {
            element.innerHTML = replaceEmojis(element.innerHTML);
            element.classList.add('emoji-processed');
        }
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
    processAllEmojis();
    
    // También procesar después de cargar contenido dinámico
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                // Pequeño delay para asegurar que el contenido se haya renderizado
                setTimeout(processAllEmojis, 100);
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
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

// Función para obtener avatar por defecto
function getDefaultAvatar() {
    return './img/default-avatar.png';
}

// Funciones para el sistema de reseñas (simuladas)
async function getReviewsForAddon(addonId) {
    // Simular obtención de reseñas
    return [];
}

async function getUserReviewForAddon(addonId) {
    // Simular obtención de reseña del usuario
    return null;
}

async function addReview(addonId, rating, comment) {
    // Simular añadir reseña
    console.log('Añadiendo reseña:', { addonId, rating, comment });
    return Promise.resolve();
}

async function deleteReview(addonId) {
    // Simular eliminar reseña
    console.log('Eliminando reseña para addon:', addonId);
    return Promise.resolve();
}

// Función para obtener addon por ID (simulada)
function getAddonById(addonId) {
    // Esto debería venir de tu base de datos o archivo JSON
    const addons = [
        {
            id: 1,
            title: "Addon Ejemplo $1",
            description: "Este es un addon de ejemplo con emojis $2 $3",
            cover_image: "./img/addons/example.jpg",
            last_updated: "2024-01-15",
            version: "1.19+",
            file_size: "2.5 MB",
            tags: ["RPG", "Armas", "Magia"],
            download_link: "#"
        }
    ];
    return addons.find(addon => addon.id === parseInt(addonId)) || null;
}

// Función para mostrar notificación
function showNotification(message, type) {
    console.log('Notificación:', message, type);
    // Aquí iría tu código de notificaciones
    alert(message);
}

// Exportar funciones para uso global
window.replaceEmojis = replaceEmojis;
window.toggleEmojiPicker = toggleEmojiPicker;
window.getDefaultAvatar = getDefaultAvatar;
window.getReviewsForAddon = getReviewsForAddon;
window.getUserReviewForAddon = getUserReviewForAddon;
window.addReview = addReview;
window.deleteReview = deleteReview;
window.getAddonById = getAddonById;
window.showNotification = showNotification;
window.EmojiSystem = {
    replaceEmojis,
    getAvailableEmojis,
    addEmojiToText,
    createEmojiPicker,
    showEmojiPicker,
    closeEmojiPicker,
    toggleEmojiPicker,
    initEmojisForElement,
    processAllEmojis
};
