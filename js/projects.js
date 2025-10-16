// Datos de proyectos
const projectsData = [
    {
        id: 1,
        title: "Sistema de Rangos Avanzado",
        shortDescription: "Sistema completo de rangos para servidores de Minecraft con interfaz moderna y funciones avanzadas.",
        fullDescription: "Este proyecto es un sistema completo de rangos para servidores de Minecraft que incluye interfaz de usuario moderna, sistema de permisos avanzado, y integración con economías de servidor. Desarrollado con JavaScript y APIs de Minecraft Bedrock.\n\nEl sistema permite a los administradores de servidores crear rangos personalizados con permisos específicos, beneficios únicos, y sistemas de progresión. Los jugadores pueden visualizar los rangos disponibles y sus requisitos a través de una interfaz intuitiva.",
        image: "../img/prueba.jpg",
        status: "active",
        tags: ["Minecraft", "JavaScript", "UI/UX", "Addon", "Sistema de Permisos"],
        date: "2025-01-15",
        features: [
            {
                title: "Interfaz de usuario moderna",
                description: "Diseño responsive y atractivo que se adapta a diferentes dispositivos"
            },
            {
                title: "Sistema de permisos granular",
                description: "Control detallado de permisos por rango y por jugador"
            },
            {
                title: "Integración con economía",
                description: "Compatibilidad con sistemas económicos populares de servidores"
            },
            {
                title: "Progresión por niveles",
                description: "Sistema de experiencia y niveles para ascender entre rangos"
            },
            {
                title: "Compatibilidad multiplataforma",
                description: "Funciona en diferentes versiones de Minecraft Bedrock"
            }
        ],
        technologies: ["JavaScript", "Minecraft API", "HTML/CSS", "JSON", "Web Components"],
        githubLink: "https://github.com/developer7452/ranks-system",
        demoLink: "https://demo.ranks-system.com"
    }
];

// Función para obtener proyecto por ID
function getProjectById(id) {
    return projectsData.find(project => project.id === parseInt(id)) || null;
}

// Función para obtener todos los proyectos
function getAllProjects() {
    return projectsData;
}

// Función para obtener icono de estado
function getStatusIcon(status) {
    const icons = {
        'active': 'check-circle',
        'in-progress': 'sync-alt',
        'planned': 'clock'
    };
    return icons[status] || 'circle';
}

// Función para obtener texto de estado
function getStatusText(status) {
    const texts = {
        'active': 'Activo',
        'in-progress': 'En Progreso',
        'planned': 'Planificado'
    };
    return texts[status] || status;
}

// Función para formatear fecha
function formatProjectDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}
