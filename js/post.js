// Función para obtener parámetros de URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        id: parseInt(params.get('id')) || null
    };
}

// Función para renderizar detalles del proyecto
function renderProjectDetails() {
    const container = document.getElementById('projectDetails');
    const { id } = getUrlParams();
    
    if (!id) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h2 class="error-text">Proyecto no encontrado</h2>
                <p class="error-details">No se ha especificado un ID de proyecto válido.</p>
                <a href="proyectos.html" class="project-link link-primary">
                    <i class="fas fa-arrow-left"></i>
                    Volver a Proyectos
                </a>
            </div>
        `;
        return;
    }
    
    const project = getProjectById(id);
    
    if (!project) {
        container.innerHTML = `
            <div class="error-message">
                <div class="error-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h2 class="error-text">Proyecto no encontrado</h2>
                <p class="error-details">El proyecto con ID ${id} no existe o ha sido eliminado.</p>
                <a href="proyectos.html" class="project-link link-primary">
                    <i class="fas fa-arrow-left"></i>
                    Volver a Proyectos
                </a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="project-header">
            <img src="${project.image}" alt="${project.title}" class="project-image-large" onerror="this.src='../img/prueba.jpg'">
            
            <h1 class="project-title-large">${project.title}</h1>
            
            <div class="project-meta">
                <div class="meta-item">
                    <i class="fas fa-calendar"></i>
                    <span>Publicado: ${formatProjectDate(project.date)}</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-code"></i>
                    <span>${project.technologies.length} tecnologías</span>
                </div>
                <div class="meta-item">
                    <i class="fas fa-tags"></i>
                    <span>${project.tags.length} categorías</span>
                </div>
            </div>
            
            <div class="project-status-large status-${project.status}">
                <i class="fas fa-${getStatusIcon(project.status)}"></i>
                ${getStatusText(project.status)}
            </div>
            
            <div class="project-tags-large">
                ${project.tags.map(tag => `<span class="project-tag-large">${tag}</span>`).join('')}
            </div>
        </div>
        
        <div class="project-description-full">
            ${project.fullDescription.replace(/\n/g, '<br><br>')}
        </div>
        
        <h2 class="section-title">Características Principales</h2>
        <div class="features-list">
            ${project.features.map((feature, index) => `
                <div class="feature-item">
                    <div class="feature-icon">
                        <i class="fas fa-${index % 2 === 0 ? 'star' : 'check'}"></i>
                    </div>
                    <div class="feature-content">
                        <h3 class="feature-title">${feature.title}</h3>
                        <p class="feature-description">${feature.description}</p>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <h2 class="section-title">Tecnologías Utilizadas</h2>
        <div class="tech-stack">
            ${project.technologies.map(tech => `<span class="tech-item">${tech}</span>`).join('')}
        </div>
        
        <div class="project-links">
            ${project.githubLink ? `
                <a href="${project.githubLink}" target="_blank" class="project-link link-primary">
                    <i class="fab fa-github"></i>
                    Ver en GitHub
                </a>
            ` : `
                <span class="project-link link-disabled">
                    <i class="fab fa-github"></i>
                    Código Privado
                </span>
            `}
            
            ${project.demoLink ? `
                <a href="${project.demoLink}" target="_blank" class="project-link link-secondary">
                    <i class="fas fa-external-link-alt"></i>
                    Ver Demo
                </a>
            ` : `
                <span class="project-link link-disabled">
                    <i class="fas fa-external-link-alt"></i>
                    Demo no disponible
                </span>
            `}
        </div>
    `;
}

// Configurar sidebar
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

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    renderProjectDetails();
    setupSidebar();
});
