// Datos de ejemplo para los addons 
const addonsData = [
    {
        id: 1,
        title: "Sistema de Comandos Avanzados",
        description: "Addon que añade comandos personalizados para mejorar la experiencia de juego en servidores de Minecraft.",
        cover_image: "./img/addon/prueba.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/1",
        tags: ["Comandos", "Personalizado", "Servidores"],
        last_updated: "2025-10-9",
        file_size: "2.5 MB"
    },
    {
        id: 2,
        title: "Interfaz de Tienda Moderna",
        description: "Sistema de tienda con interfaz UI moderna para servidores de Minecraft Bedrock.",
        cover_image: "./img/addon/prueba.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/2",
        tags: ["Tienda", "UI", "Economía"],
        last_updated: "2025-10-9",
        file_size: "1.8 MB"
    }
];

// Configuración de JSONBin.io
const JSONBIN_CONFIG = {
    binId: "68e7e731d0ea881f409b5f77",
    apiKey: "$2a$10$bsdEXJ8oDvQGTbuxPZiNMOCLEIKIvezOL3SmZeRBqYnW5q9Oh08ru",
    baseUrl: "https://api.jsonbin.io/v3/b"
};

// Almacenamiento local para reseñas (cache)
let reviewsCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 300000; // 5 minutos en milisegundos

// Función para obtener un addon por ID
function getAddonById(id) {
    return addonsData.find(addon => addon.id === parseInt(id));
}

// Función para obtener todos los addons
function getAllAddons() {
    return addonsData;
}

// Función para buscar addons
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

// Sistema de carga
function showLoading() {
    let loadingOverlay = document.getElementById('loadingOverlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Cargando...</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
        setTimeout(() => {
            if (loadingOverlay.parentNode) {
                loadingOverlay.parentNode.removeChild(loadingOverlay);
            }
        }, 300);
    }
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
        // Si hay error, intentar cargar desde localStorage
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
        // Guardar en localStorage como backup
        localStorage.setItem('reviews_backup', JSON.stringify(reviewsData));
        return { success: false, error: error.message };
    }
}

// Obtener todas las reseñas (con cache)
async function getAllReviews() {
    const now = Date.now();
    
    // Usar cache si está disponible y no ha expirado
    if (reviewsCache && (now - lastFetchTime) < CACHE_DURATION) {
        return reviewsCache;
    }
    
    try {
        showLoading();
        const reviews = await fetchReviewsFromAPI();
        reviewsCache = reviews;
        lastFetchTime = now;
        hideLoading();
        return reviews;
    } catch (error) {
        console.error('Error getting all reviews:', error);
        hideLoading();
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
        showLoading();
        
        // Obtener reseñas actuales
        const allReviews = await getAllReviews();
        
        // Crear nueva reseña
        const newReview = {
            userId: currentUser.id,
            username: currentUser.username,
            avatar: currentUser.avatar,
            rating: parseInt(rating),
            comment: comment.trim(),
            timestamp: new Date().toISOString()
        };
        
        // Inicializar array si no existe
        if (!allReviews[addonId]) {
            allReviews[addonId] = [];
        }
        
        // Verificar si el usuario ya tiene una reseña para este addon
        const existingReviewIndex = allReviews[addonId].findIndex(
            review => review.userId === currentUser.id
        );
        
        if (existingReviewIndex !== -1) {
            // Actualizar reseña existente
            allReviews[addonId][existingReviewIndex] = newReview;
        } else {
            // Añadir nueva reseña
            allReviews[addonId].push(newReview);
        }
        
        // Guardar en JSONBin.io
        const result = await saveReviewsToAPI(allReviews);
        
        // Actualizar cache
        reviewsCache = allReviews;
        lastFetchTime = Date.now();
        
        hideLoading();
        
        if (result.success === false) {
            console.warn('Review saved locally due to API error');
            // Aún así consideramos éxito porque se guardó localmente
        }
        
        showNotification('¡Reseña añadida correctamente!', 'success');
        return true;
        
    } catch (error) {
        console.error('Error adding review:', error);
        hideLoading();
        showNotification('Error al añadir la reseña', 'error');
        return false;
    }
}

// Función para actualizar la reseña del usuario
async function addOrUpdateReview(addonId, rating, comment) {
    return await addReview(addonId, rating, comment);
}

// Función para eliminar reseña
async function deleteReview(addonId) {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (!currentUser) {
        alert('Debes iniciar sesión para eliminar una reseña');
        return false;
    }
    
    try {
        showLoading();
        
        // Obtener reseñas actuales
        const allReviews = await getAllReviews();
        
        // Verificar si el usuario tiene una reseña para este addon
        if (allReviews[addonId]) {
            const reviewIndex = allReviews[addonId].findIndex(
                review => review.userId === currentUser.id
            );
            
            if (reviewIndex !== -1) {
                // Eliminar la reseña
                allReviews[addonId].splice(reviewIndex, 1);
                
                // Guardar en JSONBin.io
                const result = await saveReviewsToAPI(allReviews);
                
                // Actualizar cache
                reviewsCache = allReviews;
                lastFetchTime = Date.now();
                
                hideLoading();
                
                if (result.success === false) {
                    console.warn('Review deletion saved locally due to API error');
                }
                
                showNotification('¡Reseña eliminada correctamente!', 'success');
                return true;
            }
        }
        
        hideLoading();
        showNotification('No se encontró una reseña para eliminar', 'error');
        return false;
        
    } catch (error) {
        console.error('Error deleting review:', error);
        hideLoading();
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
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Añadir al cuerpo del documento
    document.body.appendChild(notification);
    
    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Función para obtener la foto de perfil del usuario
function getUserProfilePicture() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    return currentUser && currentUser.avatar ? currentUser.avatar : './img/default-avatar.png';
}

// Inicializar datos de reseñas si no existen
async function initializeReviewsData() {
    const currentReviews = await getAllReviews();
    
    // Crear estructura inicial si no existe
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

// Función para formatear fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Renderizar estrellas
function renderStars(rating, interactive = false, size = 'medium') {
    const numericRating = parseFloat(rating) || 0;
    const starSize = size === 'small' ? '0.9rem' : '1.5rem';
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        const isActive = i <= numericRating;
        if (interactive) {
            starsHtml += `
                <span class="star ${isActive ? 'active' : ''}" data-rating="${i}">
                    <i class="fas fa-star" style="font-size: ${starSize}"></i>
                </span>
            `;
        } else {
            starsHtml += `
                <span class="star ${isActive ? 'active' : ''}">
                    <i class="fas fa-star" style="font-size: ${starSize}"></i>
                </span>
            `;
        }
    }
    
    return `<div class="stars ${interactive ? 'interactive' : ''} ${size}">${starsHtml}</div>`;
}

// Llamar a la inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initializeReviewsData();
    }, 1000);
});

// Exportar funciones para uso global
window.getAddonById = getAddonById;
window.getAllAddons = getAllAddons;
window.searchAddons = searchAddons;
window.getReviewsForAddon = getReviewsForAddon;
window.addReview = addReview;
window.addOrUpdateReview = addOrUpdateReview;
window.deleteReview = deleteReview;
window.calculateAverageRating = calculateAverageRating;
window.getUserReviewForAddon = getUserReviewForAddon;
window.getUserProfilePicture = getUserProfilePicture;
window.formatDate = formatDate;
window.renderStars = renderStars;
window.showNotification = showNotification;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
