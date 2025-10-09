// Función para renderizar los detalles del addon
async function renderAddonDetails(addon) {
    const container = document.getElementById('addonDetails');
    const pageTitle = document.getElementById('pageTitle');
    
    console.log('Renderizando addon:', addon);
    
    if (!addon) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">!</div>
                <h3 class="error-text">Addon no encontrado</h3>
                <p class="error-details">El addon que buscas no existe o ha sido eliminado.</p>
                <a href="index.html" class="back-btn">Volver al inicio</a>
            </div>
        `;
        return;
    }
    
    // Obtener reseñas
    let reviews = [];
    let averageRating = 0;
    let userReview = null;
    
    try {
        reviews = await getReviewsForAddon(addon.id);
        averageRating = calculateAverageRating(reviews);
        userReview = await getUserReviewForAddon(addon.id);
    } catch (error) {
        console.error('Error cargando reseñas:', error);
    }
    
    // Actualizar título de la página
    pageTitle.textContent = `${addon.title} - Developer7452`;
    
    // Renderizar el contenido del addon
    container.innerHTML = `
        <div class="addon-header">
            <img src="${addon.cover_image}" alt="Portada del addon" class="addon-cover" onerror="this.src='./img/addon/default.jpg'">
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
    
    // Configurar el formulario de reseñas si existe
    setupReviewForm(addon.id);
}

// Función para renderizar el formulario de reseña
function renderReviewForm(addonId, userReview) {
    const currentUser = getCurrentUser();
    
    if (userReview) {
        return `
            <div class="user-review">
                <div class="user-review-header">
                    <div class="user-review-info">
                        <img src="${userReview.avatar || getUserProfilePicture()}" alt="Tu foto de perfil" class="profile-picture" onerror="this.src='./img/default-avatar.png'">
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
                <p class="user-review-comment">${userReview.comment || 'Sin comentario'}</p>
            </div>
        `;
    } else if (currentUser) {
        return `
            <div class="add-review-form">
                <h3 class="form-title">Añadir reseña</h3>
                <form id="reviewForm">
                    <div class="rating-input">
                        <label>Calificación:</label>
                        <div class="stars interactive">
                            <span class="star" data-rating="1"><i class="fas fa-star"></i></span>
                            <span class="star" data-rating="2"><i class="fas fa-star"></i></span>
                            <span class="star" data-rating="3"><i class="fas fa-star"></i></span>
                            <span class="star" data-rating="4"><i class="fas fa-star"></i></span>
                            <span class="star" data-rating="5"><i class="fas fa-star"></i></span>
                        </div>
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
                                <img src="${review.avatar || getUserProfilePicture()}" alt="Foto de perfil" class="profile-picture" onerror="this.src='./img/default-avatar.png'">
                                <div class="review-user">${review.username || 'Usuario'}</div>
                            </div>
                            <div class="review-rating">
                                ${renderStars(review.rating, false, 'small')}
                                <span class="review-date">${formatDate(review.timestamp)}</span>
                            </div>
                        </div>
                        <p class="review-comment">${review.comment || 'Sin comentario'}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Configurar el formulario de reseña
function setupReviewForm(addonId) {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;
    
    const stars = document.querySelectorAll('.stars.interactive .star');
    let selectedRating = 0;
    
    // Configurar estrellas interactivas
    stars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.getAttribute('data-rating'));
            
            // Actualizar visualización de estrellas
            stars.forEach((s, index) => {
                if (index < selectedRating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
    
    // Configurar envío del formulario
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
            await addReview(addonId, selectedRating, comment);
            location.reload();
        } catch (error) {
            alert('Error al enviar la reseña. Inténtalo de nuevo.');
        }
    });
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

// =============================================
// SISTEMA DE AUTENTICACIÓN
// =============================================

// Obtener usuario actual
function getCurrentUser() {
    const userData = localStorage.getItem('discordUser');
    return userData ? JSON.parse(userData) : null;
}

// Función para obtener la foto de perfil
function getUserProfilePicture() {
    const currentUser = getCurrentUser();
    return currentUser && currentUser.avatar ? currentUser.avatar : './img/default-avatar.png';
}

// Login con Discord
function loginWithDiscord() {
    localStorage.setItem('returnUrl', window.location.href);
    window.location.href = './auth/discord/callback.html';
}

// Logout
function logout() {
    localStorage.removeItem('discordUser');
    localStorage.removeItem('discordToken');
    updateUserInterface();
    showNotification('Sesión cerrada correctamente', 'success');
}

// Actualizar interfaz de usuario
function updateUserInterface() {
    const currentUser = getCurrentUser();
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userStatus = document.getElementById('userStatus');
    const logoutBtn = document.getElementById('logoutBtn');

    if (currentUser) {
        // Usuario conectado
        if (userAvatar) {
            userAvatar.innerHTML = `
                <img src="${currentUser.avatar}" alt="${currentUser.username}" class="profile-picture" onerror="this.src='./img/default-avatar.png'">
            `;
        }
        if (userName) userName.textContent = currentUser.username;
        if (userStatus) {
            userStatus.textContent = 'Conectado';
            userStatus.style.color = '#10B981';
        }
        if (logoutBtn) logoutBtn.style.display = 'flex';
    } else {
        // Usuario no conectado
        if (userAvatar) {
            userAvatar.innerHTML = `
                <div class="avatar-placeholder">
                    <i class="fas fa-user"></i>
                </div>
            `;
        }
        if (userName) userName.textContent = 'Iniciar Sesión';
        if (userStatus) {
            userStatus.textContent = 'Haz clic para conectar';
            userStatus.style.color = '#94a3b8';
        }
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Configurar sidebar
function setupSidebar() {
    const userAvatar = document.getElementById('userAvatar');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (!userAvatar || !sidebar) return;
    
    function toggleSidebar() {
        const isActive = sidebar.classList.contains('active');
        if (isActive) {
            closeSidebarFunction();
        } else {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            document.body.classList.add('menu-open');
        }
    }
    
    function closeSidebarFunction() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
    }
    
    userAvatar.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebarFunction);
    closeSidebar.addEventListener('click', closeSidebarFunction);
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            closeSidebarFunction();
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebarFunction();
        }
    });
}

// Procesar callback de Discord
function processDiscordCallback(userData) {
    if (userData && userData.id) {
        localStorage.setItem('discordUser', JSON.stringify(userData));
        updateUserInterface();
        
        const returnUrl = localStorage.getItem('returnUrl') || 'index.html';
        localStorage.removeItem('returnUrl');
        window.location.href = returnUrl;
    }
}

// Verificar autenticación al cargar
function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('user');
    
    if (userData) {
        try {
            const user = JSON.parse(decodeURIComponent(userData));
            processDiscordCallback(user);
        } catch (error) {
            console.error('Error procesando datos de usuario:', error);
        }
    }
    
    updateUserInterface();
}

// =============================================
// INICIALIZACIÓN
// =============================================

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando view.html');
    
    // Configurar autenticación
    setupSidebar();
    checkAuth();
    
    // Obtener ID del addon desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const addonId = urlParams.get('id');
    
    console.log('Addon ID desde URL:', addonId);
    
    if (addonId) {
        const addon = getAddonById(addonId);
        console.log('Addon encontrado:', addon);
        renderAddonDetails(addon);
    } else {
        console.log('No se encontró ID de addon en la URL');
        renderAddonDetails(null);
    }
});

// Exportar funciones globales
window.loginWithDiscord = loginWithDiscord;
window.logout = logout;
window.downloadAddon = downloadAddon;
window.deleteUserReview = deleteUserReview;
window.processDiscordCallback = processDiscordCallback;
