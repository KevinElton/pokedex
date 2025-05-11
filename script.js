// Global variables
let currentPokemon = [];
const favoritePokemon = ['charizard', 'pikachu', 'blastoise', 'weedle', 'caterpie'];

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navContent = document.querySelector('.nav-content');
const searchInput = document.getElementById('search-input');
const modal = document.getElementById('pokemon-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
hamburger.addEventListener('click', toggleMenu);
searchInput.addEventListener('keyup', handleSearch);
window.addEventListener('click', handleOutsideClick);

// Initialize Application
async function initializeApp() {
    showLoading();
    await fetchPokemon();
    hideLoading();
}

// Fetch Pokemon Data
async function fetchPokemon() {
    try {
        for (let i = 1; i <= 151; i++) {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
            const data = await response.json();
            currentPokemon.push(data);
            createPokemonCard(data, 'home-container');
        }
    } catch (error) {
        console.error('Error fetching Pokemon:', error);
        showError('Failed to load Pokemon. Please refresh the page.');
    }
}

// Create Pokemon Card
function createPokemonCard(pokemon, containerId, isFavorite = false) {
    const card = document.createElement('div');
    card.className = `pokemon-card ${isFavorite ? 'favorite-card' : ''}`;

    card.innerHTML = `
        <div class="pokemon-number">#${pokemon.id.toString().padStart(3, '0')}</div>
        <img class="pokemon-image" src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h3 class="pokemon-name">${pokemon.name}</h3>
        <div class="stats-container">
            <div class="stat">
                <span>HP</span>
                <span>${pokemon.stats[0].base_stat}</span>
            </div>
            <div class="stat">
                <span>ATK</span>
                <span>${pokemon.stats[1].base_stat}</span>
            </div>
        </div>
        ${isFavorite ? '<div class="favorite-badge"><i class="fas fa-star"></i></div>' : ''}
    `;

    card.addEventListener('click', () => showPokemonDetails(pokemon));
    document.getElementById(containerId).appendChild(card);
}

// Show Pokemon Details
function showPokemonDetails(pokemon) {
    const details = document.getElementById('pokemon-details');
    
    const stats = pokemon.stats.map(stat => {
        const percentage = (stat.base_stat / 255) * 100;
        return `
            <div class="stat-bar">
                <div class="stat-bar-label">
                    <span>${stat.stat.name}</span>
                    <span>${stat.base_stat}</span>
                </div>
                <div class="stat-bar-fill">
                    <div class="stat-bar-value" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');

    details.innerHTML = `
        <div class="pokemon-details-header">
            <h2 class="pokemon-details-name">${pokemon.name}</h2>
            <span class="pokemon-details-number">#${pokemon.id.toString().padStart(3, '0')}</span>
        </div>
        
        <div class="pokemon-details-image">
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            ${pokemon.sprites.back_default ? `<img src="${pokemon.sprites.back_default}" alt="${pokemon.name} back">` : ''}
        </div>
        
        <div class="pokemon-details-stats">
            ${stats}
        </div>
        
        <div class="pokemon-details-info">
            <div class="info-item">
                <div class="info-item-label">Height</div>
                <div class="info-item-value">${pokemon.height / 10}m</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">Weight</div>
                <div class="info-item-value">${pokemon.weight / 10}kg</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">Abilities</div>
                <div class="info-item-value">${pokemon.abilities.map(a => a.ability.name).join(', ')}</div>
            </div>
            <div class="info-item">
                <div class="info-item-label">Base Experience</div>
                <div class="info-item-value">${pokemon.base_experience}</div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Show Favorites
async function showFavorites() {
    document.getElementById('home-container').style.display = 'none';
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.style.display = 'grid';
    favoritesContainer.innerHTML = '';
    
    showLoading();

    try {
        for (const pokemonName of favoritePokemon) {
            let pokemon = currentPokemon.find(p => p.name.toLowerCase() === pokemonName.toLowerCase());
            
            if (!pokemon) {
                try {
                    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
                    pokemon = await response.json();
                } catch (error) {
                    console.error(`Error fetching ${pokemonName}:`, error);
                    continue;
                }
            }

            createPokemonCard(pokemon, 'favorites-container', true);
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        favoritesContainer.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>Failed to load favorite Pokemon. Please try again.</p>
            </div>
        `;
    }

    hideLoading();
    closeMenu();
}

// Handle Search
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.pokemon-card');

    cards.forEach(card => {
        const name = card.querySelector('.pokemon-name').textContent.toLowerCase();
        const number = card.querySelector('.pokemon-number').textContent;

        if (name.includes(searchTerm) || number.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Navigation Functions
function showHome() {
    document.getElementById('favorites-container').style.display = 'none';
    document.getElementById('home-container').style.display = 'grid';
    closeMenu();
}

// Search Pokemon
function searchPokemon() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (!searchTerm) return;

    const cards = document.querySelectorAll('.pokemon-card');
    cards.forEach(card => {
        const name = card.querySelector('.pokemon-name').textContent.toLowerCase();
        const number = card.querySelector('.pokemon-number').textContent;

        if (name.includes(searchTerm) || number.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Utility Functions
function toggleMenu() {
    hamburger.classList.toggle('active');
    navContent.classList.toggle('active');
}

function closeMenu() {
    hamburger.classList.remove('active');
    navContent.classList.remove('active');
}

function handleOutsideClick(e) {
    if (modal.style.display === 'block' && e.target === modal) {
        closeModal();
    }
    if (!navContent.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
    }
}

function closeModal() {
    modal.style.display = 'none';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const container = document.getElementById('home-container');
    container.innerHTML = `
        <div class="error-message">
            <h3>Error</h3>
            <p>${message}</p>
        </div>
    `;
}

// Initialize the app
initializeApp();
