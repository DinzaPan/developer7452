// Función para renderizar los addons
async function renderAddons(addons) {
    const container = document.getElementById('addonsContainer');
    
    if (addons.length === 0) {
        container.innerHTML = `
            <div class="no-addons">
                <p>No se encontraron addons.</p>
            </div>
        `;
        return;
    }
    
    const addonsWithRatings = await Promise.all(
        addons.map(async (addon) => {
            const reviews = await getReviewsForAddon(addon.id);
            const averageRating = calculateAverageRating(reviews);
            return {
                ...addon,
                averageRating,
                reviewsCount: reviews.length
            };
        })
    );
    
    container.innerHTML = addonsWithRatings.map(addon => `
        <div class="addon-card" onclick="viewAddon(${addon.id})">
            <img src="${addon.cover_image}" alt="Portada del addon" class="addon-cover">
            <div class="addon-info">
                <h3 class="addon-title">${addon.title}</h3>
                <div class="addon-rating">
                    ${renderStars(addon.averageRating, false, 'small')}
                    <span class="rating-value">${addon.averageRating}</span>
                    <span class="reviews-count">(${addon.reviewsCount})</span>
                </div>
                <p class="addon-description">${addon.description}</p>
                
                <div class="addon-footer">
                    <span class="addon-version">${addon.version}</span>
                    <span class="publish-date">${formatDate(addon.last_updated)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para navegar a la página de detalles del addon
function viewAddon(id) {
    window.location.href = `view.html?id=${id}`;
}

// Función para descargar un addon
function downloadAddon(id) {
    const addon = getAddonById(id);
    if (addon) {
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
            alert(`¡Addon "${addon.title}" descargado correctamente!\n\nSe ha enviado a tu biblioteca de addons.`);
        }, 1500);
    }
}

// Funcionalidad del sidebar lateral
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

// Sistema de búsqueda
function setupSearch() {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    
    if (!searchForm || !searchInput) return;
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        const results = searchAddons(query);
        renderAddons(results);
        
        const pageTitle = document.querySelector('.page-title');
        if (query) {
            pageTitle.textContent = `Resultados para: "${query}"`;
            
            if (!document.querySelector('.clear-search')) {
                const clearBtn = document.createElement('a');
                clearBtn.href = '#';
                clearBtn.className = 'clear-search';
                clearBtn.textContent = 'Mostrar todos';
                clearBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    searchInput.value = '';
                    renderAddons(getAllAddons());
                    pageTitle.textContent = 'Últimos Addons';
                    clearBtn.remove();
                });
                pageTitle.parentNode.insertBefore(clearBtn, pageTitle.nextSibling);
            }
        } else {
            pageTitle.textContent = 'Últimos Addons';
            const clearBtn = document.querySelector('.clear-search');
            if (clearBtn) clearBtn.remove();
        }
    });
    
    // Búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length >= 2 || query.length === 0) {
            const results = searchAddons(query);
            renderAddons(results);
        }
    });
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    // Renderizar addons iniciales
    renderAddons(getAllAddons()).then(() => {
        hideLoading();
    });
    
    // Configurar funcionalidades
    setupSidebar();
    setupSearch();
});

// Exportar funciones para uso global
window.viewAddon = viewAddon;
window.downloadAddon = downloadAddon;
window.renderStars = renderStars;
window.formatDate = formatDate;