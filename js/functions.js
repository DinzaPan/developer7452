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

// Función para reemplazar emojis en texto
function replaceEmojis(text) {
    if (!text) return '';
    
    let processedText = text;
    Object.keys(emojis).forEach(emojiCode => {
        const emojiPath = `./img/emojis/${emojis[emojiCode]}`;
        const emojiImg = `<img src="${emojiPath}" alt="${emojiCode}" class="emoji" draggable="false">`;
        processedText = processedText.split(emojiCode).join(emojiImg);
    });
    
    return processedText;
}

// Función para mostrar el selector de emojis
function showEmojiPicker(textareaId) {
    const emojiPicker = document.getElementById('emojiPicker');
    const textarea = document.getElementById(textareaId);
    
    if (!emojiPicker || !textarea) return;
    
    // Posicionar el selector cerca del textarea
    const rect = textarea.getBoundingClientRect();
    emojiPicker.style.top = `${rect.bottom + 5}px`;
    emojiPicker.style.left = `${rect.left}px`;
    
    // Mostrar selector
    emojiPicker.classList.add('active');
    
    // Configurar evento para cerrar al hacer clic fuera
    setTimeout(() => {
        document.addEventListener('click', closeEmojiPickerOnClickOutside);
    }, 100);
}

// Función para cerrar el selector al hacer clic fuera
function closeEmojiPickerOnClickOutside(event) {
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiButton = document.querySelector('.emoji-picker-button');
    
    if (emojiPicker && 
        !emojiPicker.contains(event.target) && 
        !emojiButton.contains(event.target)) {
        closeEmojiPicker();
    }
}

// Función para cerrar el selector
function closeEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    if (emojiPicker) {
        emojiPicker.classList.remove('active');
    }
    document.removeEventListener('click', closeEmojiPickerOnClickOutside);
}

// Función para insertar emoji en el textarea
function insertEmoji(emojiCode, textareaId) {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    
    // Insertar el código del emoji en la posición del cursor
    textarea.value = text.substring(0, startPos) + emojiCode + text.substring(endPos);
    
    // Mover el cursor después del emoji insertado
    textarea.selectionStart = startPos + emojiCode.length;
    textarea.selectionEnd = startPos + emojiCode.length;
    
    // Enfocar el textarea nuevamente
    textarea.focus();
    
    // Cerrar el selector
    closeEmojiPicker();
}

// Función para crear el selector de emojis en el DOM
function createEmojiPicker() {
    const emojiPicker = document.createElement('div');
    emojiPicker.id = 'emojiPicker';
    emojiPicker.className = 'emoji-picker';
    
    let emojiListHTML = '';
    Object.keys(emojis).forEach(emojiCode => {
        const emojiPath = `./img/emojis/${emojis[emojiCode]}`;
        emojiListHTML += `
            <div class="emoji-item" onclick="insertEmoji('${emojiCode}', 'reviewComment')">
                <img src="${emojiPath}" alt="${emojiCode}" class="emoji-picker-emoji">
                <span class="emoji-code">${emojiCode}</span>
            </div>
        `;
    });
    
    emojiPicker.innerHTML = `
        <div class="emoji-picker-header">
            <h4>Emojis Disponibles</h4>
            <button class="emoji-picker-close" onclick="closeEmojiPicker()">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="emoji-picker-grid">
            ${emojiListHTML}
        </div>
    `;
    
    document.body.appendChild(emojiPicker);
}

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

// Inicializar protección de imágenes y crear el selector de emojis
document.addEventListener('DOMContentLoaded', function() {
    protectImages();
    createEmojiPicker();
});
