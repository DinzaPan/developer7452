const addonsData = [
    {
        id: 1,
        title: "Better Commands $fuego",
        description: "Addon que añade comandos personalizados para mejorar la experiencia de juego en servidores de Minecraft.",
        cover_image: "./img/addon/20250718_164538-1.png",
        version: "1.21.111",
        download_link: "https://example.com/download/1",
        tags: ["Api-Beta", "JS", "Servidores"],
        last_updated: "2025-10-9",
        file_size: "2.5 MB"
    },
    {
        id: 2,
        title: "Interfaz de Tienda Moderna $corazon",
        description: "Sistema de tienda con interfaz UI moderna $like para servidores de Minecraft Bedrock.",
        cover_image: "./img/addon/prueba.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/2",
        tags: ["Tienda", "UI", "Economía"],
        last_updated: "2025-10-9",
        file_size: "1.8 MB"
    }
];

const JSONBIN_CONFIG = {
    binId: "68e7e731d0ea881f409b5f77",
    apiKey: "$2a$10$bsdEXJ8oDvQGTbuxPZiNMOCLEIKIvezOL3SmZeRBqYnW5q9Oh08ru",
    baseUrl: "https://api.jsonbin.io/v3/b"
};

let reviewsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000;

function getAddonById(id) {
    return addonsData.find(addon => addon.id === parseInt(id));
}

function getAllAddons() {
    return addonsData;
}

function searchAddons(query) {
    if (!query) {
        return addonsData;
    }
    
    const lowerQuery = query.toLowerCase();
    return addonsData.filter(addon => 
        addon.title.toLowerCase().includes(lowerQuery) ||
        addon.description.toLowerCase().includes(lowerQuery) ||
        addon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

function showLoading() {
    // No hacer nada
}

function hideLoading() {
    // No hacer nada
}

// Obtener reseñas desde JSONBin.io con cache local
async function fetchReviewsFromAPI() {
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
        console.error('Error fetching reviews from JSONBin:', error);
        const localReviews = localStorage.getItem('reviews_backup');
        return localReviews ? JSON.parse(localReviews) : {};
    }
}

// Guardar reseñas en JSONBin.io
async function saveReviewsToAPI(reviewsData) {
    try {
        const response = await fetch(`${JSONBIN_CONFIG.baseUrl}/${JSONBIN_CONFIG.binId}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_CONFIG.apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reviewsData)
        });
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error saving reviews to JSONBin:', error);
        localStorage.setItem('reviews_backup', JSON.stringify(reviewsData));
        return { success: false, error: error.message };
    }
}

// Obtener todas las reseñas (con cache)
async function getAllReviews() {
    const now = Date.now();
    
    if (reviewsCache && (now - lastFetchTime) < CACHE_DURATION) {
        return reviewsCache;
    }
    
    try {
        const reviews = await fetchReviewsFromAPI();
        reviewsCache = reviews;
        lastFetchTime = now;
        return reviews;
    } catch (error) {
        console.error('Error getting all reviews:', error);
        return {};
    }
}

// Obtener reseñas para un addon específico
async function getReviewsForAddon(addonId) {
    const allReviews = await getAllReviews();
    return allReviews[addonId] || [];
}

// Añadir una nueva reseña
async function addReview(addonId, rating, comment = '') {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (!currentUser) {
        alert('Debes iniciar sesión para añadir una reseña');
        return false;
    }
    
    if (rating < 1 || rating > 5) {
        alert('La puntuación debe estar entre 1 y 5 estrellas');
        return false;
    }
    
    try {
        const allReviews = await getAllReviews();
        
        const newReview = {
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar || null,
            rating: parseInt(rating),
            comment: comment.trim(),
            timestamp: new Date().toISOString()
        };
        
        if (!allReviews[addonId]) {
            allReviews[addonId] = [];
        }
        
        const existingReviewIndex = allReviews[addonId].findIndex(
            review => review.userId === currentUser.id
        );
        
        if (existingReviewIndex !== -1) {
            allReviews[addonId][existingReviewIndex] = newReview;
        } else {
            allReviews[addonId].push(newReview);
        }
        
        const result = await saveReviewsToAPI(allReviews);
        
        reviewsCache = allReviews;
        lastFetchTime = Date.now();
        
        if (result.success === false) {
            console.warn('Review saved locally due to API error');
        }
        
        showNotification('¡Reseña añadida correctamente!', 'success');
        return true;
        
    } catch (error) {
        console.error('Error adding review:', error);
        showNotification('Error al añadir la reseña', 'error');
        return false;
    }
}

// Eliminar una reseña
async function deleteReview(addonId) {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (!currentUser) {
        alert('Debes iniciar sesión para eliminar una reseña');
        return false;
    }
    
    try {
        const allReviews = await getAllReviews();
        
        if (allReviews[addonId]) {
            allReviews[addonId] = allReviews[addonId].filter(
                review => review.userId !== currentUser.id
            );
        }
        
        const result = await saveReviewsToAPI(allReviews);
        
        reviewsCache = allReviews;
        lastFetchTime = Date.now();
        
        if (result.success === false) {
            console.warn('Review deletion saved locally due to API error');
        }
        
        showNotification('¡Reseña eliminada correctamente!', 'success');
        return true;
        
    } catch (error) {
        console.error('Error deleting review:', error);
        showNotification('Error al eliminar la reseña', 'error');
        return false;
    }
}

// Calcular promedio de calificaciones
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}

// Obtener la reseña del usuario actual para un addon
async function getUserReviewForAddon(addonId) {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    if (!currentUser) return null;
    
    const reviews = await getReviewsForAddon(addonId);
    return reviews.find(review => review.userId === currentUser.id) || null;
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--rounded);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para avatar por defecto
function getDefaultAvatar() {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM2NDc0OEIiLz4KPHBhdGggZD0iTTIwIDIyQzIzLjMxMzcgMjIgMjYgMTkuMzEzNyAyNiAxNkMyNiAxMi42ODYzIDIzLjMxMzcgMTAgMjAgMTBDMTYuNjg2MyAxMCAxNCAxMi42ODYzIDE0IDE2QzE0IDE5LjMxMzcgMTYuNjg2MyAyMiAyMCAyMloiIGZpbGw9IiNGOEZCRkMiLz4KPHBhdGggZD0iTTI2IDI2QzI2IDIzLjIzODUgMjMuMzEzNyAyMSAyMCAyMUMxNi42ODYzIDIxIDE0IDIzLjIzODUgMTQgMjZWMjhIMjZWMjZaIiBmaWxsPSIjRjhGQkZDIi8+Cjwvc3ZnPgo=';
}

// Inicializar datos de reseñas si no existen
async function initializeReviewsData() {
    const currentReviews = await getAllReviews();
    
    let needsUpdate = false;
    addonsData.forEach(addon => {
        if (!currentReviews[addon.id]) {
            currentReviews[addon.id] = [];
            needsUpdate = true;
        }
    });
    
    if (needsUpdate) {
        await saveReviewsToAPI(currentReviews);
    }
}

// Llamar a la inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeReviewsData();
    }, 1000);
});

// Añadir estilos CSS para animaciones de notificación y emojis
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .emoji {
        width: 20px;
        height: 20px;
        vertical-align: middle;
        margin: 0 2px;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }
    
    .addon-title .emoji,
    .addon-description .emoji {
        width: 18px;
        height: 18px;
    }
`;
document.head.appendChild(notificationStyles);
