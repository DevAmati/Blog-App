/**
 * Auth Debugging Tool
 * Add this script to your HTML pages to help debug authentication issues
 */

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('Auth Debug Helper loaded');
    checkAuthStatus();
    
    // Add debug button to the page
    addDebugButton();
});

// Check current authentication status
function checkAuthStatus() {
    console.log('=== Authentication Status ===');
    console.log('Token exists:', localStorage.getItem('token') ? 'Yes' : 'No');
    console.log('isLoggedIn flag:', localStorage.getItem('isLoggedIn'));
    console.log('User data:', localStorage.getItem('user'));
    
    // If token exists, verify its format
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.warn('⚠️ Token doesn\'t have 3 parts (not a valid JWT format)');
            } else {
                console.log('Token format appears valid (has 3 parts)');
                try {
                    // Try to decode the payload (middle part)
                    const payload = JSON.parse(atob(parts[1]));
                    console.log('Token payload:', payload);
                    
                    // Check expiration
                    if (payload.exp) {
                        const expiryDate = new Date(payload.exp * 1000);
                        const now = new Date();
                        if (expiryDate < now) {
                            console.warn('⚠️ Token has expired on', expiryDate.toLocaleString());
                        } else {
                            console.log('Token expires on', expiryDate.toLocaleString());
                        }
                    }
                } catch (e) {
                    console.warn('⚠️ Error decoding token payload:', e);
                }
            }
        } catch (e) {
            console.warn('⚠️ Error analyzing token:', e);
        }
    }
}

// Add a quick login helper button
function addDebugButton() {
    // Create login helper button
    const button = document.createElement('button');
    button.textContent = 'Auth Debug Tools';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '9999';
    button.style.padding = '8px 12px';
    button.style.backgroundColor = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    
    // Add click event
    button.addEventListener('click', showDebugMenu);
    
    // Add to page
    document.body.appendChild(button);
}

// Show debug menu with options
function showDebugMenu() {
    // Create menu element
    const menu = document.createElement('div');
    menu.style.position = 'fixed';
    menu.style.bottom = '50px';
    menu.style.right = '10px';
    menu.style.backgroundColor = 'white';
    menu.style.border = '1px solid #ccc';
    menu.style.borderRadius = '4px';
    menu.style.padding = '10px';
    menu.style.zIndex = '10000';
    menu.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    
    // Add options
    menu.innerHTML = `
        <h4 style="margin-top: 0; margin-bottom: 10px;">Auth Debug Tools</h4>
        <button id="debug-login" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px;">Quick Login (cozmorry)</button>
        <button id="debug-logout" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px;">Clear All Auth Data</button>
        <button id="debug-check" style="display: block; width: 100%; margin-bottom: 5px; padding: 5px;">Check Auth Status</button>
        <button id="debug-close" style="display: block; width: 100%; padding: 5px;">Close</button>
    `;
    
    // Add to page
    document.body.appendChild(menu);
    
    // Add event listeners
    document.getElementById('debug-login').addEventListener('click', quickLogin);
    document.getElementById('debug-logout').addEventListener('click', clearAuth);
    document.getElementById('debug-check').addEventListener('click', checkAuthStatus);
    document.getElementById('debug-close').addEventListener('click', () => document.body.removeChild(menu));
}

// Quick login without API
function quickLogin() {
    // Create fake data
    const user = {
        id: 2,
        username: 'cozmorry',
        email: 'cozmorry@gmail.com'
    };
    
    // Generate a simple token (this is just for testing, not a real JWT)
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJjb3ptb3JyeUBnbWFpbC5jb20iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTk5OTk5OTk5OX0.f4iKEjqL1GbDv63YxIS-rHmqTMXA7RHEOHy1PL6W-R0';
    
    // Store in localStorage
    localStorage.setItem('token', fakeToken);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('Quick login completed. Auth data set for cozmorry.');
    
    // Reload page
    window.location.reload();
}

// Clear all auth data
function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    console.log('All authentication data cleared.');
    
    // Reload page
    window.location.reload();
}

// Log a message to show the script is loaded
console.log('Auth Debug Helper loaded. Use the button in the bottom-right corner for debugging options.'); 