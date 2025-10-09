// discord.js - Sistema de autenticación con Discord

// Configuración de la aplicación Discord
const DISCORD_CONFIG = {
    clientId: "1419812333768933386", // Reemplaza con tu Client ID de Discord
    redirectUri: window.location.origin + "/auth/discord/callback.html", // URL de callback
    scope: "identify email", // Permisos solicitados
    responseType: "token" // Tipo de respuesta
};

// URLs de la API de Discord
const DISCORD_API = {
    auth: "https://discord.com/api/oauth2/authorize",
    user: "https://discord.com/api/users/@me"
};

// Estado del usuario
let currentUser = null;

// Función para iniciar sesión con Discord
function loginWithDiscord() {
    const authUrl = `${DISCORD_API.auth}?client_id=${DISCORD_CONFIG.clientId}&redirect_uri=${encodeURIComponent(DISCORD_CONFIG.redirectUri)}&response_type=${DISCORD_CONFIG.responseType}&scope=${encodeURIComponent(DISCORD_CONFIG.scope)}`;
    
    // Abrir ventana de autenticación
    const authWindow = window.open(authUrl, 'Discord Auth', 'width=500,height=600,scrollbars=no');
    
    if (!authWindow) {
        alert('Por favor permite ventanas emergentes para iniciar sesión con Discord');
        return;
    }
    
    // Verificar si se completó la autenticación
    const checkAuth = setInterval(() => {
        try {
            if (authWindow.closed) {
                clearInterval(checkAuth);
                checkForToken();
            }
        } catch (e) {
            clearInterval(checkAuth);
        }
    }, 500);
}

// Función para verificar si hay un token en el almacenamiento
function checkForToken() {
    const token = localStorage.getItem('discord_token');
    if (token) {
        getUserInfo(token);
    }
}

// Función para obtener información del usuario
async function getUserInfo(token) {
    try {
        showLoading();
        const response = await fetch(DISCORD_API.user, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            setUserSession(userData, token);
            updateUI(userData);
            hideLoading();
            
            // Cerrar sidebar después de login exitoso
            closeSidebar();
        } else {
            console.error('Error al obtener información del usuario');
            logout();
            hideLoading();
        }
    } catch (error) {
        console.error('Error en la conexión:', error);
        logout();
        hideLoading();
    }
}

// Función para establecer la sesión del usuario
function setUserSession(userData, token) {
    currentUser = {
        id: userData.id,
        username: userData.username,
        discriminator: userData.discriminator,
        avatar: userData.avatar,
        email: userData.email,
        verified: userData.verified,
        premium_type: userData.premium_type || 0
    };
    
    localStorage.setItem('discord_token', token);
    localStorage.setItem('user_data', JSON.stringify(currentUser));
    
    // Mostrar notificación de éxito
    showNotification('¡Sesión iniciada correctamente!', 'success');
}

// Función para actualizar la UI con la información del usuario
function updateUI(userData) {
    const userName = document.getElementById('userName');
    const userStatus = document.getElementById('userStatus');
    const userAvatar = document.querySelector('.user-avatar-sidebar .avatar-placeholder');
    const userInfoSidebar = document.getElementById('userInfoSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userName && userStatus) {
        userName.textContent = userData.username;
        userStatus.textContent = userData.verified ? 'Cuenta verificada' : 'Conectado con Discord';
        
        // Añadir clase para usuario conectado
        if (userInfoSidebar) {
            userInfoSidebar.classList.add('user-connected');
        }
        
        // Mostrar botón de logout
        if (logoutBtn) {
            logoutBtn.style.display = 'flex';
        }
        
        // Actualizar avatar si está disponible
        if (userData.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`;
            userAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            // Avatar por defecto basado en discriminator
            const defaultAvatar = userData.discriminator % 5;
            userAvatar.innerHTML = `<img src="https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
    
    // Actualizar avatar en la barra de navegación
    const navAvatar = document.querySelector('.user-avatar .avatar-placeholder');
    if (navAvatar) {
        if (userData.avatar) {
            const avatarUrl = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=64`;
            navAvatar.innerHTML = `<img src="${avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const defaultAvatar = userData.discriminator % 5;
            navAvatar.innerHTML = `<img src="https://cdn.discordapp.com/embed/avatars/${defaultAvatar}.png" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        }
    }
}

// Función para cerrar sesión
function logout() {
    currentUser = null;
    localStorage.removeItem('discord_token');
    localStorage.removeItem('user_data');
    
    // Restablecer UI
    const userName = document.getElementById('userName');
    const userStatus = document.getElementById('userStatus');
    const userAvatar = document.querySelector('.user-avatar-sidebar .avatar-placeholder');
    const navAvatar = document.querySelector('.user-avatar .avatar-placeholder');
    const userInfoSidebar = document.getElementById('userInfoSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userName && userStatus) {
        userName.textContent = 'Iniciar Sesión';
        userStatus.textContent = 'Haz clic para conectar';
        userInfoSidebar.classList.remove('user-connected');
    }
    
    if (logoutBtn) {
        logoutBtn.style.display = 'none';
    }
    
    if (userAvatar) {
        userAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    if (navAvatar) {
        navAvatar.innerHTML = '<i class="fas fa-user"></i>';
    }
    
    showNotification('Sesión cerrada correctamente', 'info');
    closeSidebar();
}

// Función para verificar el estado de autenticación al cargar la página
function checkAuthStatus() {
    const token = localStorage.getItem('discord_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            updateUI(currentUser);
        } catch (e) {
            console.error('Error al parsear datos de usuario:', e);
            logout();
        }
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos para la notificación
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
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Función para cerrar el sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && sidebarOverlay) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
    }
}

// Añadir estilos CSS para animaciones de notificación
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
`;
document.head.appendChild(notificationStyles);

// Inicializar sistema de Discord
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Manejar clic en la información del usuario para conectar con Discord
    const userInfoSidebar = document.getElementById('userInfoSidebar');
    if (userInfoSidebar) {
        userInfoSidebar.addEventListener('click', function() {
            if (!currentUser) {
                loginWithDiscord();
            }
        });
    }
    
    // Manejar clic en el botón de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Exportar funciones para uso global
window.loginWithDiscord = loginWithDiscord;
window.logout = logout;
window.getCurrentUser = () => currentUser;