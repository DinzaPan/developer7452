// Función para renderizar los detalles del addon
async function renderAddonDetails(addon) {
    const container = document.getElementById('addonDetails');
    
    if (!addon) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3 class="error-text">Addon no encontrado</h3>
                <p class="error-details">El addon que buscas no existe o ha sido eliminado.</p>
                <a href="index.html" class="back-btn">
                    <i class="fas fa-arrow-left"></i>
                    Volver al inicio
                </a>
            </div>
        `;
        return;
    }
    
    const reviews = await getReviewsForAddon(addon.id);
    const averageRating = calculateAverageRating(reviews);
    const userReview = await getUserReviewForAddon(addon.id);
    
    container.innerHTML = `
        <div class="addon-header">
            <img src="${addon.cover_image}" alt="Portada del addon" class="addon-cover-large">
            <h1 class="addon-title-large">${addon.title}</h1>
            <p class="addon-description-large">${addon.description}</p>
            
            <div class="addon-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Actualizado: ${formatDate(addon.last_updated)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-cube"></i>
                    <span>Minecraft ${addon.version}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-download"></i>
                    <span>${addon.file_size}</span>
                </div>
            </div>
            
            <div class="addon-tags">
                ${addon.tags.map(tag => `<span class="addon-tag">${tag}</span>`).join('')}
            </div>
            
            <button class="download-btn-large" onclick="downloadAddon(${addon.id})">
                <i class="fas fa-download"></i>
                Descargar Addon
            </button>
        </div>
        
        <div class="reviews-section">
            <h2 class="section-title">Reseñas y Calificaciones</h2>
            
            <div class="overall-rating">
                <div class="rating-display">
                    <div class="rating-stars">
                        ${renderStars(averageRating)}
                    </div>
                    <div class="rating-score">${averageRating}</div>
                    <div class="rating-count">${reviews.length} reseña${reviews.length !== 1 ? 's' : ''}</div>
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
    if (userReview) {
        return `
            <div class="user-review">
                <div class="user-review-header">
                    <div class="user-review-info">
                        <div class="user-avatar-sidebar">
                            <div class="avatar-placeholder">
                                <i class="fas fa-user"></i>
                            </div>
                        </div>
                        <div>
                            <div class="user-review-rating">
                                <span>Tu calificación:</span>
                                ${renderStars(userReview.rating)}
                            </div>
                            <div class="user-review-date">${formatDate(userReview.timestamp)}</div>
                        </div>
                    </div>
                    <button class="delete-review-btn" onclick="deleteUserReview(${addonId})">
                        <i class="fas fa-trash-alt"></i>
                        Eliminar
                    </button>
                </div>
                <p class="user-review-comment">${userReview.comment}</p>
            </div>
        `;
    } else {
        return `
            <div class="add-review-form">
                <h3 class="form-title">Añadir tu reseña</h3>
                <form id="reviewForm">
                    <div class="rating-input">
                        <label>Tu calificación:</label>
                        ${renderStars(0, true)}
                    </div>
                    <div class="comment-input">
                        <label for="reviewComment">Comentario (opcional):</label>
                        <textarea id="reviewComment" placeholder="Comparte tu experiencia con este addon..."></textarea>
                    </div>
                    <div class="review-actions">
                        <button type="submit" class="submit-review-btn">
                            <i class="fas fa-paper-plane"></i>
                            Enviar reseña
                        </button>
                    </div>
                </form>
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
                <h3 class="section-title">Todas las reseñas</h3>
                <div class="no-reviews">
                    <i class="fas fa-comment-slash"></i>
                    <p>Aún no hay reseñas para este addon.</p>
                </div>
            </div>
        `;
    }
    
    return `
        <div class="all-reviews">
            <h3 class="section-title">Todas las reseñas</h3>
            <div class="reviews-list">
                ${otherReviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <div class="review-user-info">
                                <div class="user-avatar-sidebar">
                                    <div class="avatar-placeholder">
                                        <i class="fas fa-user"></i>
                                    </div>
                                </div>
                                <div class="review-user">${review.username}</div>
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
            
            try {
                await addReview(addonId, selectedRating, comment);
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

// Función para eliminar una reseña
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
        
        // Filtrar la reseña del usuario actual
        if (allReviews[addonId]) {
            allReviews[addonId] = allReviews[addonId].filter(
                review => review.userId !== currentUser.id
            );
        }
        
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
        
    } catch (error) {
        console.error('Error deleting review:', error);
        hideLoading();
        showNotification('Error al eliminar la reseña', 'error');
        return false;
    }
}

// Función para descargar el addon
function downloadAddon(addonId) {
    const addon = getAddonById(addonId);
    if (addon && addon.download_link) {
        // Verificar si el usuario está autenticado
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        
        if (!currentUser) {
            if (confirm('Para descargar addons necesitas iniciar sesión con Discord. ¿Quieres iniciar sesión ahora?')) {
                if (window.loginWithDiscord) {
                    window.loginWithDiscord();
                }
            }
            return;
        }
        
        // Simular descarga
        showLoading();
        setTimeout(() => {
            hideLoading();
            window.open(addon.download_link, '_blank');
            showNotification(`¡Addon "${addon.title}" descargado correctamente!`, 'success');
        }, 1500);
    } else {
        alert('Error: No se pudo encontrar el enlace de descarga para este addon.');
    }
}

// Inicializar la página de detalles
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    // Configurar sidebar
    if (typeof setupSidebar === 'function') {
        setupSidebar();
    }
    
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

// Exportar funciones para uso global
window.deleteUserReview = deleteUserReview;
window.downloadAddon = downloadAddon;
