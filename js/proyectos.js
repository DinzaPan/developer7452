// Función para renderizar proyectos
function renderProjects() {
    const container = document.getElementById('projectsContainer');
    const projects = getAllProjects();
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="no-projects">
                <i class="fas fa-folder-open"></i>
                <h3>No hay proyectos disponibles</h3>
                <p>Próximamente se agregarán nuevos proyectos.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" onclick="viewProject(${project.id})">
            <img src="${project.image}" alt="${project.title}" class="project-image" onerror="this.src='../img/prueba.jpg'">
            <div class="project-content">
                <h3 class="project-title">
                    ${project.title}
                    <span class="project-status status-${project.status}">
                        <i class="fas fa-${getStatusIcon(project.status)}"></i>
                        ${getStatusText(project.status)}
                    </span>
                </h3>
                
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="project-tag">${tag}</span>`).join('')}
                </div>
                
                <p class="project-description">${project.shortDescription}</p>
                
                <div class="project-meta">
                    <span class="project-date">${formatProjectDate(project.date)}</span>
                    <a href="#" class="read-more-btn" onclick="event.stopPropagation(); viewProject(${project.id})">
                        <i class="fas fa-arrow-right"></i>
                        Ver más
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para ver proyecto
function viewProject(id) {
    window.location.href = `post.html?id=${id}`;
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
    renderProjects();
    setupSidebar();
});

// Exportar funciones globales
window.viewProject = viewProject;
