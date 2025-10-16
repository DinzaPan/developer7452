function renderAddons(addons) {
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
                <h3 class="addon-title">${replaceEmojis(addon.title)}</h3>
                <div class="addon-rating">
                    ${renderStars(addon.averageRating, false, 'small')}
                    <span class="rating-value">${addon.averageRating}</span>
                    <span class="reviews-count">(${addon.reviewsCount})</span>
                </div>
                <p class="addon-description">${replaceEmojis(addon.description)}</p>
                
                <div class="addon-footer">
                    <span class="addon-version">${addon.version}</span>
                    <span class="publish-date">${formatDate(addon.last_updated)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function viewAddon(id) {
    window.location.href = `view.html?id=${id}`;
}

function downloadAddon(id) {
    const addon = getAddonById(id);
    if (addon) {
        const currentUser = window.getCurrentUser ? window.getCurrentUser() : null;
        
        if (!currentUser) {
            if (confirm('Para descargar addons necesitas iniciar sesión con Discord. ¿Quieres iniciar sesión ahora?')) {
                if (window.loginWithDiscord) {
                    window.loginWithDiscord();
                }
            }
            return;
        }
        
        showLoading();
        setTimeout(() => {
            hideLoading();
            alert(`¡Addon "${addon.title}" descargado correctamente!\n\nSe ha enviado a tu biblioteca de addons.`);
        }, 1500);
    }
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
    
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (query.length >= 2 || query.length === 0) {
            const results = searchAddons(query);
            renderAddons(results);
        }
    });
}

function setupWelcomeNotification() {
    const NOTIFICATION_KEY = 'welcome_notification_shown';
    const NOTIFICATION_COOLDOWN = 6 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const lastShown = localStorage.getItem(NOTIFICATION_KEY);
    
    if (!lastShown || (now - parseInt(lastShown)) > NOTIFICATION_COOLDOWN) {
        setTimeout(() => {
            showWelcomeNotification();
            localStorage.setItem(NOTIFICATION_KEY, now.toString());
        }, 2000);
    }
}

function showWelcomeNotification() {
    const notification = document.createElement('div');
    notification.className = 'welcome-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">Bienvenid@ a la página da click aqui</span>
            <button class="notification-close" onclick="closeWelcomeNotification(this.parentElement.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    const autoCloseTimer = setTimeout(() => {
        closeWelcomeNotification(notification);
    }, 10000);
    
    notification.addEventListener('click', function(e) {
        if (!e.target.closest('.notification-close')) {
            clearTimeout(autoCloseTimer);
            showWelcomeModal();
            closeWelcomeNotification(notification);
        }
    });
}

function closeWelcomeNotification(notification) {
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.className = 'welcome-modal-overlay';
    modal.innerHTML = `
        <div class="welcome-modal">
            <div class="modal-header">
                <h3>¡Hola Querido Usuario!</h3>
                <button class="modal-close" onclick="closeWelcomeModal(this.parentElement.parentElement.parentElement)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-content">
                <p>Te queremos avisar que esta página fue hecha por <span class="megapixel-link" onclick="openMegapixelDiscord()">MegaPixel</span>, cuando le den click al texto "MegaPixel" te debe mandar a esta URL "https://discord.gg/RMfzSyNxjT", Si buscas una web semi profesional puede que seamos tu mejor opción</p>
            </div>
            <div class="modal-footer">
                <button class="modal-ok-btn" onclick="closeWelcomeModal(this.parentElement.parentElement.parentElement)">Entendido</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.classList.add('show');
    }, 100);
}

function closeWelcomeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

function openMegapixelDiscord() {
    window.open('https://discord.gg/RMfzSyNxjT', '_blank');
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.querySelector('.welcome-modal-overlay');
        if (modal) {
            closeWelcomeModal(modal);
        }
    }
});

document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    
    renderAddons(getAllAddons()).then(() => {
        hideLoading();
    });
    
    setupSidebar();
    setupSearch();
    setupWelcomeNotification();
});

window.viewAddon = viewAddon;
window.downloadAddon = downloadAddon;
window.renderStars = renderStars;
window.formatDate = formatDate;
window.closeWelcomeNotification = closeWelcomeNotification;
window.closeWelcomeModal = closeWelcomeModal;
window.openMegapixelDiscord = openMegapixelDiscord;
