// API endpoint
const API_URL = 'http://localhost:3000/api';

// DOM Elements
const authForm = document.querySelector('.auth-form');
const errorMessage = document.querySelector('.error-message');
const successMessage = document.querySelector('.success-message');

// Show error message
function showError(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        if (successMessage) {
            successMessage.style.display = 'none';
        }
    }
}

// Show success message
function showSuccess(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }
}

// Handle form submission
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(authForm);
        const data = Object.fromEntries(formData.entries());
        
        try {
            const endpoint = window.location.pathname.includes('login') ? '/login' : '/register';
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'An error occurred');
            }
            
            if (endpoint === '/login') {
                // Store token and user info
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                localStorage.setItem('isLoggedIn', 'true'); // Set isLoggedIn flag for compatibility
                
                // Show success message and redirect to home.html
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = 'home.html'; // Redirect to home.html
                }, 1500);
            } else {
                // Show success message and redirect to login
                showSuccess('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            showError(error.message);
        }
    });
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user) {
        // Update navigation based on auth status
        const authLinks = document.querySelectorAll('.auth-link');
        authLinks.forEach(link => {
            if (link.classList.contains('login-link')) {
                link.textContent = `Welcome, ${user.username}`;
                link.href = '#';
            } else if (link.classList.contains('register-link')) {
                link.textContent = 'Logout';
                link.href = '#';
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                });
            }
        });
    }
}

// Run auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    // Login form is already handled by the main form handler above
    // Registration form is already handled by the main form handler above
    
    // Helper function to show error messages
    function showError(message) {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 3000);
        } else {
            alert(message);
        }
    }
    
    // Check if user is already logged in using token (not just isLoggedIn flag)
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (token && user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = 'home.html';
    }
});