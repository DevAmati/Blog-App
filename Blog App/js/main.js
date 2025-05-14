// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        navLinks.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

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

document.addEventListener("DOMContentLoaded", () => {
    updateNavigation();
    loadPosts();
    setupHomeLinks();
});

// Update navigation based on login status
function updateNavigation() {
    const loginLink = document.getElementById("login-link");
    const registerLink = document.getElementById("register-link");
    const addPostBtn = document.getElementById("add-post-btn");
    const logoutBtn = document.getElementById("logout-btn");

    // Check login state
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const token = localStorage.getItem("token");

    // Update login/register visibility
    if (loginLink && registerLink) {
        loginLink.style.display = isLoggedIn && token ? "none" : "block";
        registerLink.style.display = isLoggedIn && token ? "none" : "block";
    }

    // Update add post/logout visibility
    if (addPostBtn && logoutBtn) {
        addPostBtn.style.display = isLoggedIn && token ? "block" : "none";
        logoutBtn.style.display = isLoggedIn && token ? "block" : "none";
    }

    // For index.html, redirect to home.html if logged in
    if (isLoggedIn && token && window.location.pathname.endsWith("index.html")) {
        window.location.href = "home.html";
    }

    // For home.html, redirect to index.html if not logged in
    if ((!isLoggedIn || !token) && window.location.pathname.endsWith("home.html")) {
        window.location.href = "index.html";
    }
}

// Setup home links to redirect to the correct page based on login status
function setupHomeLinks() {
    const homeLinks = document.querySelectorAll("a[id='home-link']");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const token = localStorage.getItem("token");

    homeLinks.forEach(link => {
        // Update href dynamically based on login status
        link.href = isLoggedIn && token ? "home.html" : "index.html";
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
        
        console.log('Attempting to fetch posts from /api/posts...');
        
        // Fetch blog posts from API
        const response = await fetch('/api/posts');
        
        console.log('Fetch response status:', response.status, response.statusText);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }
        
        // Get response as text first for debugging
        const responseText = await response.text();
        console.log('Response text:', responseText);
        
        // Try to parse as JSON
        let blogPosts;
        try {
            blogPosts = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            throw new Error(`Failed to parse posts response: ${parseError.message}`);
        }
        
        console.log('Successfully parsed posts:', blogPosts.length);

        if (blogPosts.length === 0) {
            postsContainer.innerHTML = "<p class='no-posts'>No blog posts available. Be the first to add one!</p>";
            return;
        }

        // Render blog posts
        postsContainer.innerHTML = "";
        
        // Get a random selection of up to 3 posts to show as featured
        const featuredPosts = blogPosts.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        featuredPosts.forEach((post) => {
            // Make sure we have an image, or use a placeholder
            const imageSrc = post.image_url || 'https://via.placeholder.com/800x400';
            
            // Format the date
            const formattedDate = new Date(post.created_at).toLocaleDateString();
            
            const postElement = document.createElement("article");
            postElement.classList.add("post-card");
            postElement.innerHTML = `
                <img src="${imageSrc}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/800x400'">
                <div class="post-content">
                    <div class="post-meta">
                        <span class="date">${formattedDate}</span>
                        <span class="category">${post.category || 'Uncategorized'}</span>
                    </div>
                    <h4>${post.title}</h4>
                    <p>${post.content.substring(0, 100)}...</p>
                    <a href="blog.html" class="read-more">Read More</a>
                </div>
            `;
            postsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load posts: ${error.message}</p>
                <button onclick="loadPosts()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// Make logout function globally available
window.logout = logout;