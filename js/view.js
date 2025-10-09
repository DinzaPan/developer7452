// Función para renderizar los detalles del addon
async function renderAddonDetails(addon) {
    const container = document.getElementById('addonDetails');
    const pageTitle = document.getElementById('pageTitle');
    
    if (!addon) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">!</div>
                <h3 class="error-text">Addon no encontrado</h3>
                <p class="error-details">El addon que buscas no existe o ha sido eliminado.</p>
                <a href="index.html" class="clear-search">Volver al inicio</a>
            </div>
        `;
        return;
    }
    
    const reviews = await getReviewsForAddon(addon.id);
    const averageRating = calculateAverageRating(reviews);
    const userReview = await getUserReviewForAddon(addon.id);
    
    // Actualizar título de la página
    pageTitle.textContent = `${addon.title} - Developer7452`;
    
    container.innerHTML = `
        <div class="addon-header">
            <img src="${addon.cover_image}" alt="Portada del addon" class="addon-cover">
            <h1 class="addon-title">${addon.title}</h1>
            
            <div class="addon-meta">
                <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Actualizado: ${formatDate(addon.last_updated)}</span>
                </div>
                <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Minecraft ${addon.version}</span>
                </div>
                <div class="meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span>${addon.file_size}</span>
                </div>
            </div>
            
            <div class="addon-tags">
                ${addon.tags.map(tag => `<span class="addon-tag">${tag}</span>`).join('')}
            </div>
            
            <p class="addon-description">${addon.description}</p>
            
            <button class="download-btn" onclick="downloadAddon(${addon.id})">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar
            </button>
        </div>
        
        <div class="reviews-section">
            <div class="reviews-header">
                <h2 class="reviews-title">Reseñas</h2>
                <div class="overall-rating">
                    <div class="rating-display">
                        <div class="rating-stars">
                            ${renderStars(averageRating)}
                        </div>
                        <div class="rating-score">${averageRating}</div>
                        <div class="rating-count">${reviews.length} reseña${reviews.length !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            </div>
            
            ${renderReviewForm(addon.id, userReview)}
            ${renderReviewsList(reviews, userReview)}
        </div>
    `;
    
    setupReviewForm(addon.id);
}

// Función para renderizar el formulario de reseña
function renderReviewForm(addonId, userReview) {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (userReview) {
        return `
            <div class="user-review">
                <div class="user-review-header">
                    <div class="user-review-info">
                        <img src="${userReview.avatar || getUserProfilePicture()}" alt="Tu foto de perfil" class="profile-picture">
                        <div>
                            <div class="user-review-rating">
                                <span>Tu calificación:</span>
                                ${renderStars(userReview.rating)}
                            </div>
                            <div class="user-review-date">${formatDate(userReview.timestamp)}</div>
                        </div>
                    </div>
                    <button class="delete-review-btn" onclick="deleteUserReview(${addonId})">
                        Eliminar reseña
                    </button>
                </div>
                <p class="user-review-comment">${userReview.comment}</p>
            </div>
        `;
    } else if (currentUser) {
        return `
            <div class="add-review-form">
                <h3 class="form-title">Añadir reseña</h3>
                <form id="reviewForm">
                    <div class="rating-input">
                        <label>Calificación:</label>
                        ${renderStars(0, true)}
                    </div>
                    <div class="comment-input">
                        <label for="reviewComment">Comentario:</label>
                        <textarea id="reviewComment" placeholder="Comparte tu experiencia con este addon..." required></textarea>
                    </div>
                    <div class="review-actions">
                        <button type="submit" class="submit-review-btn">
                            Enviar reseña
                        </button>
                    </div>
                </form>
            </div>
        `;
    } else {
        return `
            <div class="add-review-form">
                <h3 class="form-title">Añadir reseña</h3>
                <div class="login-required">
                    <p>Para añadir una reseña, debes iniciar sesión con Discord.</p>
                    <button class="discord-login-btn" onclick="loginWithDiscord()">
                        <i class="fab fa-discord"></i>
                        Iniciar sesión con Discord
                    </button>
                </div>
            </div>
        `;
    }
}

// Función para renderizar la lista de reseñas
function renderReviewsList(reviews, userReview) {
    const otherReviews = reviews.filter(review => 
        !userReview || review.userId !== userReview.userId
    );
    
    if (otherReviews.length === 0) {
        return `
            <div class="all-reviews">
                <h3>Todas las reseñas</h3>
                <div class="no-reviews">
                    <p>Aún no hay reseñas para este addon.</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="all-reviews">
            <h3>Todas las reseñas</h3>
            <div class="reviews-list">
                ${otherReviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-user-info">
                                <img src="${review.avatar || getUserProfilePicture()}" alt="Foto de perfil" class="profile-picture">
                                <div class="review-user">${review.username || 'Usuario'}</div>
                            </div>
                            <div class="review-rating">
                                ${renderStars(review.rating, false, 'small')}
                                <span class="review-date">${formatDate(review.timestamp)}</span>
                            </div>
                        </div>
                        <p class="review-comment">${review.comment}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Configurar el formulario de reseña
function setupReviewForm(addonId) {
    const reviewForm = document.getElementById('reviewForm');
    const stars = document.querySelectorAll('.stars.interactive .star');
    let selectedRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const comment = document.getElementById('reviewComment').value.trim();
            
            if (selectedRating === 0) {
                alert('Por favor, selecciona una calificación');
                return;
            }
            
            if (!comment) {
                alert('Por favor, escribe un comentario');
                return;
            }
            
            try {
                await addOrUpdateReview(addonId, selectedRating, comment);
                location.reload();
            } catch (error) {
                alert('Error al enviar la reseña. Inténtalo de nuevo.');
            }
        });
    }
}

// Eliminar reseña del usuario
async function deleteUserReview(addonId) {
    if (confirm('¿Estás seguro de que quieres eliminar tu reseña?')) {
        try {
            await deleteReview(addonId);
            location.reload();
        } catch (error) {
            alert('Error al eliminar la reseña. Inténtalo de nuevo.');
        }
    }
}

// Función para descargar el addon
function downloadAddon(addonId) {
    const addon = getAddonById(addonId);
    if (addon && addon.download_link) {
        window.open(addon.download_link, '_blank');
    } else {
        alert('Error: No se pudo encontrar el enlace de descarga para este addon.');
    }
}

// Inicializar la página de detalles
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    const urlParams = new URLSearchParams(window.location.search);
    const addonId = urlParams.get('id');
    
    if (addonId) {
        const addon = getAddonById(addonId);
        renderAddonDetails(addon).then(() => {
            hideLoading();
        });
    } else {
        renderAddonDetails(null);
        hideLoading();
    }
});

// Funciones auxiliares para compatibilidad
function addOrUpdateReview(addonId, rating, comment) {
    return addReview(addonId, rating, comment);
}

function deleteReview(addonId) {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    if (!currentUser) {
        alert('Debes iniciar sesión para eliminar una reseña');
        return false;
    }
    
    // Esta función necesitaría implementarse en complement.js
    console.log('Eliminar reseña para addon:', addonId);
    alert('Función de eliminar reseña no implementada completamente');
    return Promise.resolve();
}

function getUserProfilePicture() {
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    return currentUser && currentUser.avatar ? currentUser.avatar : './img/default-avatar.png';
}

// Configuración del sidebar
function setupSidebar() {
    const userAvatar = document.getElementById('userAvatar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    
    function toggleSidebar() {
        const isActive = sidebar.classList.contains('active');
        
        if (isActive) {
            closeSidebarFunction();
        } else {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('menu-open');
            document.body.style.overflow = 'hidden';
        }
    }
    
    function closeSidebarFunction() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
    
    if (userAvatar) {
        userAvatar.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', closeSidebarFunction);
    }
    
    if (closeSidebar) {
        closeSidebar.addEventListener('click', closeSidebarFunction);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('active')) {
            closeSidebarFunction();
        }
    });
}

// Inicializar sidebar
setupSidebar();
