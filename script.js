// Check authentication
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

if (sessionStorage.getItem('userRole') !== 'user') {
    window.location.href = 'role-selection.html';
}

const userId = sessionStorage.getItem('userId');
const fullName = sessionStorage.getItem('fullName');

let allWorkers = [];
let currentPage = 1;
const workersPerPage = 6;

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Set user info
    if (fullName) {
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.textContent = fullName.charAt(0).toUpperCase();
        }
    }
    
    // Load workers
    await loadWorkers();
    
    // Setup event listeners
    setupEventListeners();
});

// Load workers from API
async function loadWorkers(filters = {}) {
    try {
        let url = 'api/get_workers.php?';
        
        if (filters.profession) url += `profession=${filters.profession}&`;
        if (filters.location) url += `location=${filters.location}&`;
        if (filters.search) url += `search=${filters.search}&`;
        if (filters.minRate) url += `minRate=${filters.minRate}&`;
        if (filters.maxRate) url += `maxRate=${filters.maxRate}&`;
        if (filters.minExperience) url += `minExperience=${filters.minExperience}&`;
        if (filters.maxExperience) url += `maxExperience=${filters.maxExperience}&`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            allWorkers = result.workers;
            displayWorkers();
            updatePagination();
        } else {
            console.error('Failed to load workers');
            displayNoWorkers();
        }
    } catch (error) {
        console.error('Error loading workers:', error);
        displayNoWorkers();
    }
}

// Display workers
function displayWorkers() {
    const workersGrid = document.querySelector('.workers-grid');
    
    if (!workersGrid) return;
    
    if (allWorkers.length === 0) {
        displayNoWorkers();
        return;
    }
    
    const startIndex = (currentPage - 1) * workersPerPage;
    const endIndex = startIndex + workersPerPage;
    const workersToShow = allWorkers.slice(startIndex, endIndex);
    
    workersGrid.innerHTML = '';
    
    workersToShow.forEach(worker => {
        const workerCard = createWorkerCard(worker);
        workersGrid.appendChild(workerCard);
    });
}

// Create worker card
function createWorkerCard(worker) {
    const card = document.createElement('div');
    card.className = 'worker-card';
    
    const stars = '⭐'.repeat(Math.floor(worker.rating));
    const initial = worker.fullName.charAt(0).toUpperCase();
    
    card.innerHTML = `
        <div class="worker-avatar">
            ${worker.profilePicture ? 
                `<img src="${worker.profilePicture}" alt="${worker.fullName}">` : 
                `<div style="width:100%;height:100%;background:linear-gradient(135deg,#00bcd4,#0097a7);display:flex;align-items:center;justify-content:center;color:white;font-size:32px;font-weight:600;">${initial}</div>`
            }
        </div>
        <h3 class="worker-name">${worker.fullName}</h3>
        <p class="worker-title">${worker.profession}</p>
        <div class="worker-rating">
            <span class="stars">${stars}</span>
            <span class="rating-value">(${worker.rating}) - ${worker.totalReviews} reviews</span>
        </div>
        <p class="worker-experience">Experience: ${worker.experienceYears} years</p>
        <p class="worker-rate">Hourly Rate: ₹${worker.hourlyRate}/hr</p>
        <button class="btn-view-profile" data-worker-id="${worker.workerId}">View Profile</button>
        <button class="btn-hire" data-worker-id="${worker.workerId}">Hire Now</button>
    `;
    
    // Add event listeners
    card.querySelector('.btn-view-profile').addEventListener('click', () => viewWorkerProfile(worker));
    card.querySelector('.btn-hire').addEventListener('click', () => hireWorker(worker));
    
    return card;
}

// Display no workers message
function displayNoWorkers() {
    const workersGrid = document.querySelector('.workers-grid');
    if (workersGrid) {
        workersGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="font-size: 24px; color: #666; margin-bottom: 10px;">No workers found</h3>
                <p style="color: #999;">Try adjusting your filters or search terms</p>
            </div>
        `;
    }
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(function(e) {
            const filters = getFilters();
            filters.search = e.target.value;
            loadWorkers(filters);
        }, 500));
    }
    
    // Filter selects
    const filterSelects = document.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            const filters = getFilters();
            loadWorkers(filters);
        });
    });
    
    // Post job button
    const postJobBtn = document.querySelector('.btn-post-job');
    if (postJobBtn) {
        postJobBtn.addEventListener('click', function() {
            alert('Job posting feature coming soon!');
        });
    }
    
    // Notification button
    const notificationBtn = document.querySelector('.btn-notification');
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            alert('You have 3 new notifications');
        });
    }
    
    // User avatar dropdown
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('dropdownMenu');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    });
    
    // Dropdown items
    const profileItem = document.getElementById('profileItem');
    if (profileItem) {
        profileItem.addEventListener('click', function() {
            alert('User profile page coming soon!');
        });
    }
    
    const settingsItem = document.getElementById('settingsItem');
    if (settingsItem) {
        settingsItem.addEventListener('click', function() {
            alert('Settings page coming soon!');
        });
    }
    
    const logoutItem = document.getElementById('logoutItem');
    if (logoutItem) {
        logoutItem.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                sessionStorage.clear();
                window.location.href = 'login.html';
            }
        });
    }
    
    // Pagination
    const prevBtn = document.querySelector('.pagination-btn:first-child');
    const nextBtn = document.querySelector('.pagination-btn:last-child');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayWorkers();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            const totalPages = Math.ceil(allWorkers.length / workersPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayWorkers();
                updatePagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    }
}

// Get current filters
function getFilters() {
    const filters = {};
    
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter && typeFilter.value) {
        filters.profession = typeFilter.value;
    }
    
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter && locationFilter.value) {
        filters.location = locationFilter.value;
    }
    
    const rateFilter = document.getElementById('rateFilter');
    if (rateFilter && rateFilter.value) {
        const range = rateFilter.value.split('-');
        filters.minRate = parseInt(range[0]) || 0;
        filters.maxRate = parseInt(range[1]) || 999999;
    }
    
    const experienceFilter = document.getElementById('experienceFilter');
    if (experienceFilter && experienceFilter.value) {
        const range = experienceFilter.value.split('-');
        filters.minExperience = parseInt(range[0]) || 0;
        filters.maxExperience = parseInt(range[1]) || 999;
    }
    
    return filters;
}

// Update pagination
function updatePagination() {
    const totalPages = Math.ceil(allWorkers.length / workersPerPage);
    const pageInfo = document.querySelector('.pagination-text');
    
    if (pageInfo) {
        pageInfo.textContent = `${currentPage} of ${totalPages}`;
    }
}

// View worker profile
function viewWorkerProfile(worker) {
    alert(`Viewing profile for ${worker.fullName}\n\nProfession: ${worker.profession}\nExperience: ${worker.experienceYears} years\nRate: ₹${worker.hourlyRate}/hr\nRating: ${worker.rating} (${worker.totalReviews} reviews)\n\nBio: ${worker.bio}\n\nSkills: ${worker.skills}`);
}

// Hire worker
function hireWorker(worker) {
    const confirmed = confirm(`Do you want to hire ${worker.fullName}?\n\nProfession: ${worker.profession}\nRate: ₹${worker.hourlyRate}/hr`);
    
    if (confirmed) {
        alert(`Great! A job request will be sent to ${worker.fullName}.\n\nJob request feature is coming soon!`);
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
