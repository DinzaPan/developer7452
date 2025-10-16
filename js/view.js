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
    const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
    
    container.innerHTML = `
        <div class="addon-header">
            <img src="${addon.cover_image}" alt="Portada del addon" class="addon-cover-large">
            <h1 class="addon-title-large emoji-content">${processTextWithEmojisInTitles(addon.title)}</h1>
            
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
            
            <p class="addon-description-large emoji-content">${processTextWithEmojis(addon.description)}</p>
            
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
            
            ${renderReviewSection(addon.id, userReview, currentUser)}
            ${renderReviewsList(reviews, userReview)}
        </div>
    `;
    
    setupReviewForm(addon.id);
    processAllEmojis();
}

function renderReviewSection(addonId, userReview, currentUser) {
    if (!currentUser) {
        return `
            <div class="login-prompt">
                <div class="login-prompt-icon">
                    <i class="fab fa-discord"></i>
                </div>
                <h3 class="login-prompt-title">Inicia sesión para dejar una reseña</h3>
                <p class="login-prompt-text">
                    Conecta tu cuenta de Discord para calificar este addon y compartir tu experiencia con la comunidad.
                </p>
                <button class="login-prompt-btn" onclick="loginWithDiscord()">
                    <i class="fab fa-discord"></i>
                    Conectar con Discord
                </button>
            </div>
        `;
    }
    
    return renderReviewForm(addonId, userReview);
}

function renderReviewForm(addonId, userReview) {
    if (userReview) {
        return `
            <div class="user-review">
                <div class="user-review-header">
                    <div class="user-review-info">
                        <img src="${userReview.avatar || getDefaultAvatar()}" 
                             alt="Foto de perfil de ${userReview.username}" 
                             class="profile-picture"
                             onerror="this.src='${getDefaultAvatar()}'">
                        <div>
                            <div class="review-user">${userReview.username}</div>
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
                <p class="user-review-comment emoji-content">${processTextWithEmojis(userReview.comment)}</p>
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
                        <textarea id="reviewComment" placeholder="Comparte tu experiencia con este addon... $1 $2 $3"></textarea>
                        <div class="emoji-help">
                            <small>Usa $1, $2, $3, etc. para añadir emojis</small>
                        </div>
                    </div>
                    <div class="review-actions">
                        <button type="submit" class="submit-review-btn">
                            <i class="fas fa-paper-plane"></i>
                            Enviar reseña
                        </button>
                        <button type="button" class="emoji-picker-toggle" onclick="toggleEmojiPicker('reviewComment')">
                            <i class="fas fa-smile"></i> Añadir Emoji
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
}

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
                                <img src="${review.avatar || getDefaultAvatar()}" 
                                     alt="Foto de perfil de ${review.username}" 
                                     class="profile-picture"
                                     onerror="this.src='${getDefaultAvatar()}'">
                                <div class="review-user">${review.username}</div>
                            </div>
                            <div class="review-rating">
                                ${renderStars(review.rating, false, 'small')}
                                <span class="review-date">${formatDate(review.timestamp)}</span>
                            </div>
                        </div>
                        <p class="review-comment emoji-content">${processTextWithEmojis(review.comment)}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

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

function downloadAddon(addonId) {
    const addon = getAddonById(addonId);
    if (addon && addon.download_link) {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        
        if (!currentUser) {
            if (confirm('Para descargar addons necesitas iniciar sesión con Discord. ¿Quieres iniciar sesión ahora?')) {
                if (window.loginWithDiscord) {
                    window.loginWithDiscord();
                }
            }
            return;
        }
        
        setTimeout(() => {
            window.open(addon.download_link, '_blank');
            showNotification(`¡Addon "${addon.title}" descargado correctamente!`, 'success');
        }, 500);
    } else {
        alert('Error: No se pudo encontrar el enlace de descarga para este addon.');
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

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

function loginWithDiscord() {
    if (window.loginWithDiscord) {
        window.loginWithDiscord();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setupSidebar();
    
    if (typeof window.EmojiSystem !== 'undefined') {
        window.EmojiSystem.initEmojisForAll();
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const addonId = urlParams.get('id');
    
    if (addonId) {
        const addon = getAddonById(addonId);
        renderAddonDetails(addon);
    } else {
        renderAddonDetails(null);
    }
});

window.deleteUserReview = deleteUserReview;
window.downloadAddon = downloadAddon;
window.formatDate = formatDate;
window.renderStars = renderStars;
window.getDefaultAvatar = getDefaultAvatar;
window.toggleEmojiPicker = toggleEmojiPicker;
window.processTextWithEmojis = processTextWithEmojis;
window.processTextWithEmojisInTitles = processTextWithEmojisInTitles;
window.processAllEmojis = processAllEmojis;
window.loginWithDiscord = loginWithDiscord;
