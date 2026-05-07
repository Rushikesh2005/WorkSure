// Check authentication
if (sessionStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

if (sessionStorage.getItem('userRole') !== 'worker') {
    window.location.href = 'role-selection.html';
}

// Initialize
const userId = sessionStorage.getItem('userId');
const fullName = sessionStorage.getItem('fullName');

document.addEventListener('DOMContentLoaded', async function() {
    // Set worker name
    document.getElementById('workerName').textContent = fullName || 'Worker';
    
    // Set avatar initial
    const userAvatar = document.getElementById('userAvatar');
    if (fullName) {
        userAvatar.textContent = fullName.charAt(0).toUpperCase();
    }
    
    // Load dashboard data
    await loadDashboardData();
    
    // Check if profile is complete
    await checkProfileCompletion();
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load stats
        await loadStats();
        
        // Load job requests
        await loadJobRequests();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`api/get_worker_stats.php?userId=${userId}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('jobsCompleted').textContent = result.stats.jobsCompleted || 0;
            document.getElementById('averageRating').textContent = result.stats.averageRating || '0.0';
            document.getElementById('totalEarnings').textContent = result.stats.totalEarnings || '₹0';
            document.getElementById('pendingRequests').textContent = result.stats.pendingRequests || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load job requests
async function loadJobRequests() {
    try {
        const response = await fetch(`api/get_job_requests.php?workerId=${userId}`);
        const result = await response.json();
        
        const requestsList = document.getElementById('requestsList');
        const noRequestsMessage = document.getElementById('noRequestsMessage');
        
        if (result.success && result.requests.length > 0) {
            requestsList.innerHTML = '';
            result.requests.forEach(request => {
                const requestCard = createRequestCard(request);
                requestsList.appendChild(requestCard);
            });
            noRequestsMessage.style.display = 'none';
        } else {
            requestsList.innerHTML = '';
            noRequestsMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading job requests:', error);
        document.getElementById('noRequestsMessage').style.display = 'block';
    }
}

// Create request card
function createRequestCard(request) {
    const card = document.createElement('div');
    card.className = 'request-card';
    
    const userInitial = request.userName ? request.userName.charAt(0).toUpperCase() : 'U';
    const timeAgo = getTimeAgo(request.created_at);
    
    card.innerHTML = `
        <div class="request-header">
            <div class="request-user">
                <div class="request-avatar">${userInitial}</div>
                <div class="request-user-info">
                    <h4 class="request-user-name">${request.userName || 'User'}</h4>
                    <p class="request-time">${timeAgo}</p>
                </div>
            </div>
            <span class="request-badge pending">Pending</span>
        </div>
        <h3 class="request-title">${request.title}</h3>
        <p class="request-description">${request.description}</p>
        <div class="request-details">
            <span>📍 ${request.location}</span>
            <span>💰 ₹${request.hourly_rate}/hr</span>
            <span>⏱️ ${request.duration || 'Flexible'}</span>
        </div>
        <div class="request-actions">
            <button class="btn-accept" data-request-id="${request.request_id}">Accept</button>
            <button class="btn-decline" data-request-id="${request.request_id}">Decline</button>
        </div>
    `;
    
    // Add event listeners
    card.querySelector('.btn-accept').addEventListener('click', () => acceptJobRequest(request.request_id));
    card.querySelector('.btn-decline').addEventListener('click', () => declineJobRequest(request.request_id));
    
    return card;
}

// Accept job request
async function acceptJobRequest(requestId) {
    try {
        const response = await fetch('api/accept_job_request.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requestId: requestId,
                workerId: userId
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Job request accepted! The user has been notified.');
            await loadJobRequests();
            await loadStats();
        } else {
            alert('Failed to accept job request: ' + (result.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error accepting job request:', error);
        alert('An error occurred while accepting the job request.');
    }
}

// Decline job request
async function declineJobRequest(requestId) {
    if (confirm('Are you sure you want to decline this job request?')) {
        try {
            const response = await fetch('api/decline_job_request.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requestId: requestId,
                    workerId: userId
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Job request declined.');
                await loadJobRequests();
                await loadStats();
            } else {
                alert('Failed to decline job request: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error declining job request:', error);
            alert('An error occurred while declining the job request.');
        }
    }
}

// Check profile completion
async function checkProfileCompletion() {
    try {
        const response = await fetch(`api/get_profile.php?userId=${userId}&roleType=worker`);
        const result = await response.json();
        
        if (result.success && result.profile) {
            if (!result.profile.is_complete) {
                showProfileIncompleteNotification();
            }
        } else {
            showProfileIncompleteNotification();
        }
    } catch (error) {
        console.error('Error checking profile:', error);
        showProfileIncompleteNotification();
    }
}

function showProfileIncompleteNotification() {
    const notification = document.createElement('div');
    notification.className = 'profile-incomplete-banner';
    notification.innerHTML = `
        <div class="banner-content">
            <span>⚠️ Your profile is incomplete. Complete it to receive more job requests!</span>
            <button onclick="goToProfile()" class="btn-complete-now">Complete Now</button>
        </div>
    `;
    document.body.appendChild(notification);
}

// User avatar dropdown
document.getElementById('userAvatar').addEventListener('click', function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show');
});

// Close dropdown when clicking outside
document.addEventListener('click', function() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.remove('show');
});

// Dropdown actions
document.getElementById('viewProfile').addEventListener('click', function() {
    window.location.href = 'worker-profile.html';
});

document.getElementById('settingsItem').addEventListener('click', function() {
    alert('Settings page coming soon!');
});

document.getElementById('logoutItem').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
});

// Quick action buttons
document.getElementById('completeProfileBtn').addEventListener('click', function() {
    window.location.href = 'worker-profile.html';
});

document.getElementById('viewJobsBtn').addEventListener('click', function() {
    window.location.href = 'worker-jobs.html';
});

document.getElementById('updateAvailabilityBtn').addEventListener('click', function() {
    alert('Availability management coming soon!');
});

// Helper function to navigate to profile
function goToProfile() {
    window.location.href = 'worker-profile.html';
}

// Helper function to format time ago
function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
