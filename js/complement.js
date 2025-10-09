// Datos de ejemplo para los addons
const addonsData = [
    {
        id: 1,
        title: "Sistema de Comandos Avanzados",
        description: "Addon que añade comandos personalizados para mejorar la experiencia de juego en servidores de Minecraft.",
        cover_image: "./img/addon1.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/1",
        tags: ["Comandos", "Personalizado", "Servidores"],
        last_updated: "2024-01-15",
        file_size: "2.5 MB"
    },
    {
        id: 2,
        title: "Interfaz de Tienda Moderna",
        description: "Sistema de tienda con interfaz UI moderna para servidores de Minecraft Bedrock.",
        cover_image: "./img/addon2.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/2",
        tags: ["Tienda", "UI", "Economía"],
        last_updated: "2024-01-10",
        file_size: "1.8 MB"
    },
    {
        id: 3,
        title: "Sistema de Rangos Premium",
        description: "Addon completo para gestión de rangos y permisos en servidores de Minecraft.",
        cover_image: "./img/addon3.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/3",
        tags: ["Rangos", "Permisos", "Admin"],
        last_updated: "2024-01-08",
        file_size: "3.2 MB"
    },
    {
        id: 4,
        title: "Módulo de Protección",
        description: "Sistema avanzado de protección de territorios y claims para servidores survival.",
        cover_image: "./img/addon4.jpg",
        version: "1.21.111",
        download_link: "https://example.com/download/4",
        tags: ["Protección", "Survival", "Claims"],
        last_updated: "2024-01-05",
        file_size: "2.1 MB"
    }
];

// Función para obtener un addon por ID
function getAddonById(id) {
    return addonsData.find(addon => addon.id === parseInt(id));
}

// Función para obtener todos los addons
function getAllAddons() {
    return addonsData;
}

// Función para buscar addons
function searchAddons(query) {
    if (!query) {
        return addonsData;
    }
    
    const lowerQuery = query.toLowerCase();
    return addonsData.filter(addon => 
        addon.title.toLowerCase().includes(lowerQuery) ||
        addon.description.toLowerCase().includes(lowerQuery) ||
        addon.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}

// Sistema de carga
function showLoading() {
    // Implementación básica de loading
    console.log("Mostrando loading...");
}

function hideLoading() {
    // Implementación básica de loading
    console.log("Ocultando loading...");
}

// Sistema de reseñas (simulado)
async function getReviewsForAddon(addonId) {
    // Datos de ejemplo para reseñas
    const reviewsData = {
        1: [
            { userId: "user1", rating: 5, comment: "Excelente addon", timestamp: "2024-01-10" },
            { userId: "user2", rating: 4, comment: "Muy útil", timestamp: "2024-01-08" },
            { userId: "user3", rating: 5, comment: "Funciona perfecto", timestamp: "2024-01-12" }
        ],
        2: [
            { userId: "user1", rating: 4, comment: "Buen diseño", timestamp: "2024-01-12" },
            { userId: "user4", rating: 5, comment: "Muy profesional", timestamp: "2024-01-09" }
        ],
        3: [
            { userId: "user2", rating: 5, comment: "Imprescindible", timestamp: "2024-01-11" }
        ],
        4: [
            { userId: "user3", rating: 4, comment: "Muy útil para survival", timestamp: "2024-01-07" },
            { userId: "user1", rating: 5, comment: "Protección excelente", timestamp: "2024-01-06" }
        ]
    };
    
    return reviewsData[addonId] || [];
}

// Calcular promedio de calificaciones
function calculateAverageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
}