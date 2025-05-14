// main.js - Main JavaScript file for blog platform

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

// Initialize page transition element
function setupPageTransitions() {
    // Create transition element if it doesn't exist
    if (!document.querySelector('.page-transition')) {
        const transitionEl = document.createElement('div');
        transitionEl.className = 'page-transition';
        document.body.appendChild(transitionEl);
    }

    // Add click event to all internal links for smooth page transitions
    document.querySelectorAll('a').forEach(link => {
        // Skip non-navigation links
        const href = link.getAttribute('href');
        if (!href || 
            href.startsWith('#') || 
            href.startsWith('mailto:') || 
            href.startsWith('tel:') ||
            link.getAttribute('target') === '_blank' ||
            link.getAttribute('onclick')) {
            return;
        }

        link.addEventListener('click', function(e) {
            // Only handle internal page links
            if (href && !href.startsWith('http') && !href.startsWith('#')) {
                e.preventDefault();
                
                // Trigger transition animation
                const transitionEl = document.querySelector('.page-transition');
                transitionEl.classList.add('active');
                
                // Navigate after transition completes
                setTimeout(() => {
                    window.location.href = href;
                }, 500); // Match this with the CSS transition duration
            }
        });
    });
}

// Initialize mobile menu functionality
function initMobileMenu() {
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !hamburger.contains(e.target) && 
            !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

// Call this function on document ready
document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    setupPageTransitions();
    updateNavigation();
    loadPosts();
    setupHomeLinks();
});

// Create a local placeholder image
function createLocalPlaceholder(width = 800, height = 400) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with light gray
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, 0, width, height);
    
    // Add text
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Placeholder Image', width / 2, height / 2 - 15);
    
    ctx.font = '18px Arial';
    ctx.fillText(`${width} × ${height}`, width / 2, height / 2 + 15);
    
    return canvas.toDataURL('image/png');
}

// Generate a placeholder image URL
const PLACEHOLDER_IMAGE = createLocalPlaceholder(800, 400);

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Add animation to post cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.post-card, .blog-post').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
        successMessage.style.backgroundColor = '#d4edda';
        successMessage.style.color = '#155724';
        successMessage.style.padding = '1rem';
        successMessage.style.borderRadius = '4px';
        successMessage.style.marginTop = '1rem';

        // Clear form
        contactForm.reset();

        // Add success message to form
        contactForm.appendChild(successMessage);

        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    });
}

// Search functionality for blog posts
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const blogPosts = document.querySelectorAll('.blog-post');

        blogPosts.forEach(post => {
            const title = post.querySelector('h3').textContent.toLowerCase();
            const content = post.querySelector('p').textContent.toLowerCase();
            const category = post.querySelector('.category').textContent.toLowerCase();

            if (title.includes(searchTerm) || content.includes(searchTerm) || category.includes(searchTerm)) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    });
}

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const addPostBtn = document.getElementById("add-post-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // Check login state
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    // Update login/register visibility
    if (loginLink && registerLink) {
        loginLink.style.display = isLoggedIn ? "none" : "block";
        registerLink.style.display = isLoggedIn ? "none" : "block";
    }

    // Update add post/logout visibility
    if (addPostBtn && logoutBtn) {
        addPostBtn.style.display = isLoggedIn ? "block" : "none";
        logoutBtn.style.display = isLoggedIn ? "block" : "none";
    }

    // For index.html, redirect to home.html if logged in
    if (isLoggedIn && window.location.pathname.endsWith("index.html")) {
        window.location.href = "home.html";
    }

    // For home.html, redirect to index.html if not logged in
    if (!isLoggedIn && window.location.pathname.endsWith("home.html")) {
        window.location.href = "index.html";
    }
}

// Setup home links to redirect to the correct page based on login status
function setupHomeLinks() {
    const homeLinks = document.querySelectorAll("a[id='home-link']");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    homeLinks.forEach(link => {
        // Update href dynamically based on login status
        link.href = isLoggedIn ? "home.html" : "index.html";
    });
}

// Load blog posts from API
async function loadPosts() {
    const postsContainer = document.getElementById("posts-container");
    if (!postsContainer) return;

    try {
        // Show loading indicator
        postsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading posts...</p>
            </div>
        `;
        
        // Get the base URL of the site - use localStorage config if available
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        const apiUrl = `${apiBaseUrl}/api/posts`;
        console.log('Attempting to fetch posts from:', apiUrl);
        
        // Fetch blog posts from API
        const response = await fetch(apiUrl);
        
        console.log('Fetch response status:', response.status, response.statusText);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }

        const blogPosts = await response.json();

        if (blogPosts.length === 0) {
            postsContainer.innerHTML = "<p class='no-posts'>No blog posts available. Be the first to add one!</p>";
            return;
        }

        // Render blog posts
        postsContainer.innerHTML = "";
        blogPosts.forEach((post) => {
            // Handle image paths properly
            let imageSrc = PLACEHOLDER_IMAGE;
            
            if (post.image_url) {
                // If image_url is a relative path (starts with /), prepend the API base URL
                imageSrc = post.image_url.startsWith('/') ? `${apiBaseUrl}${post.image_url}` : post.image_url;
            } else if (post.coverPhoto) {
                imageSrc = post.coverPhoto;
            }
            
            const postElement = document.createElement("article");
            postElement.classList.add("post-card");
            postElement.innerHTML = `
                <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                <div class="post-content">
                    <h4>${post.title}</h4>
                    <p>${post.content.substring(0, 100)}...</p>
                    <a href="blog.html" class="read-more">Read More</a>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = "<p class='no-posts'>Failed to load blog posts. Please try again later.</p>";
    }
}

// Logout function
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // Make sure to remove the token
    console.log('Logged out successfully');
    window.location.href = "index.html";
}

// Make logout function globally available
window.logout = logout;