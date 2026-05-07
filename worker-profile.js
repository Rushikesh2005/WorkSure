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
const email = sessionStorage.getItem('userEmail');
const phone = sessionStorage.getItem('userPhone');

let profileImageBase64 = null;

document.addEventListener('DOMContentLoaded', async function() {
    // Set user avatar
    const userAvatar = document.getElementById('userAvatar');
    if (fullName) {
        userAvatar.textContent = fullName.charAt(0).toUpperCase();
    }
    
    // Load existing profile data
    await loadProfileData();
});

// Load profile data
async function loadProfileData() {
    try {
        const response = await fetch(`api/get_profile.php?userId=${userId}&roleType=worker`);
        const result = await response.json();
        
        if (result.success) {
            // Fill basic info
            document.getElementById('fullName').value = result.user.full_name || fullName || '';
            document.getElementById('email').value = result.user.email || email || '';
            document.getElementById('phone').value = result.user.phone || phone || '';
            
            // Fill profile info if exists
            if (result.profile) {
                const profile = result.profile;
                
                // Personal info
                if (profile.age) document.getElementById('age').value = profile.age;
                if (profile.gender) document.getElementById('gender').value = profile.gender;
                
                // Professional info
                if (profile.profession) document.getElementById('profession').value = profile.profession;
                if (profile.experience_years) document.getElementById('experienceYears').value = profile.experience_years;
                if (profile.hourly_rate) document.getElementById('hourlyRate').value = profile.hourly_rate;
                if (profile.bio) document.getElementById('bio').value = profile.bio;
                if (profile.skills) document.getElementById('skills').value = profile.skills;
                
                // Location info
                if (profile.address) document.getElementById('address').value = profile.address;
                if (profile.city) document.getElementById('city').value = profile.city;
                if (profile.state) document.getElementById('state').value = profile.state;
                if (profile.zip_code) document.getElementById('zipCode').value = profile.zip_code;
                
                // Profile picture
                if (profile.profile_picture) {
                    displayProfilePicture(profile.profile_picture);
                } else {
                    setProfileInitial();
                }
            } else {
                setProfileInitial();
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

// Set profile initial
function setProfileInitial() {
    const preview = document.getElementById('profilePicPreview');
    const initial = document.getElementById('profileInitial');
    const name = document.getElementById('fullName').value || fullName;
    if (name) {
        initial.textContent = name.charAt(0).toUpperCase();
    }
}

// Display profile picture
function displayProfilePicture(imagePath) {
    const preview = document.getElementById('profilePicPreview');
    preview.innerHTML = `<img src="${imagePath}" alt="Profile">`;
}

// Handle profile picture upload
document.getElementById('profilePicture').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image size should be less than 5MB');
            return;
        }
        
        // Check file type
        if (!file.type.match('image.*')) {
            showError('Please select an image file');
            return;
        }
        
        // Read and display image
        const reader = new FileReader();
        reader.onload = function(event) {
            profileImageBase64 = event.target.result;
            const preview = document.getElementById('profilePicPreview');
            preview.innerHTML = `<img src="${profileImageBase64}" alt="Profile">`;
        };
        reader.readAsDataURL(file);
    }
});

// Update profile initial when name changes
document.getElementById('fullName').addEventListener('input', function() {
    const name = this.value.trim();
    const initial = document.getElementById('profileInitial');
    if (name) {
        initial.textContent = name.charAt(0).toUpperCase();
    }
});

// Handle form submission
document.getElementById('profileForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const profileData = {
        userId: userId,
        roleType: 'worker',
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        age: parseInt(document.getElementById('age').value) || null,
        gender: document.getElementById('gender').value,
        profession: document.getElementById('profession').value,
        experienceYears: parseInt(document.getElementById('experienceYears').value) || 0,
        hourlyRate: parseFloat(document.getElementById('hourlyRate').value) || 0,
        bio: document.getElementById('bio').value.trim(),
        skills: document.getElementById('skills').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        profilePicture: profileImageBase64
    };
    
    // Validation
    if (!profileData.fullName || !profileData.email || !profileData.phone || 
        !profileData.age || !profileData.gender || !profileData.profession || 
        !profileData.bio || !profileData.skills || !profileData.address) {
        showError('Please fill all required fields marked with *');
        return;
    }
    
    try {
        // Update profile
        const response = await fetch('api/update_profile.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update session storage with new data
            sessionStorage.setItem('fullName', profileData.fullName);
            
            showSuccess('Profile updated successfully!');
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = 'worker-dashboard.html';
            }, 2000);
        } else {
            showError(result.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('An error occurred while updating profile');
    }
});

// Show success message
function showSuccess(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.classList.add('show');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}
