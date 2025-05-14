document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Load user posts
    loadUserPosts();
});

// Use PLACEHOLDER_IMAGE from main.js instead of redefining it here
// The Base64 encoded placeholder image is now defined only in main.js

// Load user posts from API
async function loadUserPosts() {
    const postsContainer = document.getElementById('user-posts-container');
    if (!postsContainer) return;

    try {
        // Show loading indicator
        postsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading your posts...</p>
            </div>
        `;
        
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found. Please log in again.');
        }
        
        // Get the base URL of the site - use localStorage config if available
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        const apiUrl = `${apiBaseUrl}/api/posts/user`;
        console.log('Attempting to fetch user posts from:', apiUrl);
        
        // First, try to diagnose if the API is available
        try {
            const statusResponse = await fetch(`${apiBaseUrl}/api/status`);
            if (!statusResponse.ok) {
                console.error('API server appears to be unavailable:', statusResponse.status);
            } else {
                console.log('API server is available, proceeding with request');
            }
        } catch (statusError) {
            console.error('Could not connect to API server:', statusError);
        }
        
        // Fetch posts from API
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                // Try to get error details from response
                let errorMessage;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || `Status ${response.status}: ${response.statusText}`;
                } catch (parseError) {
                    errorMessage = `Status ${response.status}: ${response.statusText}`;
                }
                
                console.error(`API error: ${errorMessage}`);
                throw new Error(errorMessage);
            }
            
            // Get response as text first for debugging
            const responseText = await response.text();
            console.log('Response text (first 100 chars):', responseText.substring(0, 100));
            
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
                postsContainer.innerHTML = `
                    <div class="no-posts">
                        <p>You haven't created any posts yet.</p>
                        <a href="add-post.html" class="cta-button"><i class="fas fa-plus"></i> Create Your First Post</a>
                    </div>
                `;
                return;
            }
            
            // Generate HTML for each post
            postsContainer.innerHTML = '';
            
            blogPosts.forEach(post => {
                const postEl = document.createElement('article');
                postEl.className = 'blog-post';
                
                // Make sure we have an image, or use a placeholder
                let imageSrc = PLACEHOLDER_IMAGE;
                
                if (post.image_url) {
                    // If image_url is a relative path, prepend the API base URL
                    imageSrc = post.image_url.startsWith('/') ? `${apiBaseUrl}${post.image_url}` : 
                              (post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}/${post.image_url}`);
                } else if (post.coverPhoto) {
                    imageSrc = post.coverPhoto;
                }
                
                // Format the date if available
                const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                                     post.date ? post.date : 'Unknown date';
                
                // Get category or use default
                const category = post.category || 'Uncategorized';
                
                postEl.innerHTML = `
                    <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                    <div class="post-content">
                        <div class="post-meta">
                            <span class="date">${formattedDate}</span>
                            <span class="category">${category}</span>
                            <span class="author">By: ${post.username || post.author || 'Anonymous'}</span>
                        </div>
                        <h3>${post.title}</h3>
                        <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                        <div class="post-actions">
                            <a href="#" class="read-more">Read More</a>
                            <div class="edit-actions">
                                <button class="edit-btn" data-id="${post.id}"><i class="fas fa-edit"></i> Edit</button>
                                <button class="delete-btn" data-id="${post.id}"><i class="fas fa-trash"></i> Delete</button>
                            </div>
                        </div>
                    </div>
                `;
                postsContainer.appendChild(postEl);
            });
            
            // Add event listeners for edit and delete buttons
            setupEditButtons();
            setupDeleteButtons();
            setupReadMoreButtons();
            
        } catch (apiError) {
            console.error('API error, falling back to general posts:', apiError);
            
            // If user-specific posts fail, try to load all posts
            try {
                const allPostsResponse = await fetch(`${apiBaseUrl}/api/posts`);
                if (!allPostsResponse.ok) {
                    throw new Error(`Failed to fetch general posts: ${allPostsResponse.status}`);
                }
                
                const allPosts = await allPostsResponse.json();
                
                // Use user info to filter posts if possible
                const currentUser = JSON.parse(localStorage.getItem('user')) || {};
                let userPosts = allPosts;
                
                if (currentUser && currentUser.id) {
                    userPosts = allPosts.filter(post => post.user_id === currentUser.id);
                }
                
                if (userPosts.length === 0) {
                    postsContainer.innerHTML = `
                        <div class="no-posts">
                            <p>You haven't created any posts yet.</p>
                            <a href="add-post.html" class="cta-button"><i class="fas fa-plus"></i> Create Your First Post</a>
                        </div>
                    `;
                    return;
                }
                
                // Render the posts
                renderUserPosts(userPosts, postsContainer);
                
                // Set up interaction buttons
                setupEditButtons();
                setupDeleteButtons();
                setupReadMoreButtons();
            } catch (fallbackError) {
                console.error('Fallback error:', fallbackError);
                throw fallbackError;
            }
        }
    } catch (error) {
        console.error('Error loading user posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <p>An error occurred while loading your posts: ${error.message}</p>
                <a href="add-post.html" class="cta-button"><i class="fas fa-plus"></i> Create Your First Post</a>
            </div>
        `;
    }
}

// Set up edit buttons
function setupEditButtons() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = e.target.closest('.edit-btn').dataset.id;
            
            // Store the post ID to edit in localStorage
            localStorage.setItem('editPostId', postId);
            
            // Redirect to edit page
            window.location.href = 'edit-post.html';
        });
    });
}

// Set up delete buttons
function setupDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const postId = parseInt(e.target.closest('.delete-btn').dataset.id);
            
            if (confirm('Are you sure you want to delete this post?')) {
                // Remove post from localStorage
                const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
                const updatedPosts = blogPosts.filter(post => parseInt(post.id) !== postId);
                
                console.log('Original post count:', blogPosts.length);
                console.log('Updated post count:', updatedPosts.length);
                console.log('Removed post ID:', postId);
                
                localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
                
                // Reload posts
                loadUserPosts();
            }
        });
    });
}

// Set up read more buttons
function setupReadMoreButtons() {
    document.querySelectorAll('.read-more').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Find the parent blog post element
            const postElement = e.target.closest('.blog-post');
            if (!postElement) return;
            
            // Find the post ID (from the edit button)
            const editButton = postElement.querySelector('.edit-btn');
            if (!editButton) return;
            
            const postId = editButton.dataset.id;
            if (!postId) return;
            
            // Get the post data
            try {
                // Get the base URL of the site - use localStorage config if available
                const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
                const token = localStorage.getItem('token');
                
                if (!token) {
                    alert('You must be logged in to view full posts');
                    return;
                }
                
                // Fetch the specific post data
                const response = await fetch(`${apiBaseUrl}/api/posts/${postId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    // Try to get the post from the page data instead
                    console.log('Failed to fetch post from API, using page data');
                    const title = postElement.querySelector('h3').textContent;
                    const content = postElement.querySelector('p').textContent;
                    const imageSrc = postElement.querySelector('img').src;
                    const date = postElement.querySelector('.date').textContent;
                    const category = postElement.querySelector('.category').textContent;
                    const author = postElement.querySelector('.author').textContent.replace('By: ', '');
                    
                    // Display the post with available data
                    displayFullPost({
                        id: postId,
                        title: title,
                        content: content,
                        image_url: imageSrc,
                        created_at: date,
                        category: category,
                        username: author
                    });
                    return;
                }
                
                const post = await response.json();
                
                // Display the full post
                displayFullPost(post);
            } catch (error) {
                console.error('Error fetching full post:', error);
                alert('Failed to load full post. Please try again.');
            }
        });
    });
}

// Display full post in a modal
async function displayFullPost(post) {
    console.log('Starting displayFullPost function for post:', post.id);
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.style.display = 'block'; // Ensure the modal is visible
    modal.style.position = 'fixed';
    modal.style.zIndex = '1000';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
    
    // Format the date if available
    const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                          post.date ? post.date : 'Unknown date';
    
    // Get category or use default
    const category = post.category || 'Uncategorized';
    
    // Make sure we have an image, or use a placeholder
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
    let imageSrc = PLACEHOLDER_IMAGE;
    
    if (post.image_url) {
        // If image_url is a relative path, prepend the API base URL
        imageSrc = post.image_url.startsWith('http') ? post.image_url : 
                  (post.image_url.startsWith('/') ? `${apiBaseUrl}${post.image_url}` : `${apiBaseUrl}/${post.image_url}`);
    } else if (post.coverPhoto) {
        imageSrc = post.coverPhoto;
    }
    
    console.log('Creating modal content for post:', post.title);
    
    // Show post content in modal
    modal.innerHTML = `
        <div class="post-modal-content" style="background-color: white; margin: 10% auto; padding: 20px; width: 80%; max-width: 800px;">
            <span class="close-button" style="float: right; font-size: 28px; font-weight: bold; cursor: pointer;">&times;</span>
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${category}</span>
                <span class="author">By: ${post.username || post.author || 'Anonymous'}</span>
            </div>
            <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'" style="max-width: 100%; height: auto; margin: 10px 0;">
            <div class="post-full-content">${post.content}</div>
            
            <div class="post-actions" style="margin-top: 20px;">
                <button class="edit-btn primary-btn" data-id="${post.id}" style="background-color: #4a90e2; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px;">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn danger-btn" data-id="${post.id}" style="background-color: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    console.log('Appending modal to document body');
    document.body.appendChild(modal);
    
    // Add event listener for closing the modal
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        console.log('Close button clicked, removing modal');
        document.body.removeChild(modal);
    });
    
    // Add event listeners for edit and delete buttons in the modal
    const editBtn = modal.querySelector('.edit-btn');
    editBtn.addEventListener('click', () => {
        localStorage.setItem('editPostId', post.id);
        window.location.href = 'edit-post.html';
    });
    
    const deleteBtn = modal.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this post?')) {
            document.body.removeChild(modal);
            
            // Find the delete button in the main page with the same post ID
            const mainDeleteBtn = document.querySelector(`.delete-btn[data-id="${post.id}"]`);
            if (mainDeleteBtn) {
                mainDeleteBtn.click();
            } else {
                // Fallback if button not found
                loadUserPosts();
            }
        }
    });
}

// Helper function to render user posts
function renderUserPosts(posts, container) {
    // Generate HTML for each post
    container.innerHTML = '';
    posts.forEach(post => {
        const postEl = document.createElement('article');
        postEl.className = 'blog-post';
        
        // Make sure we have an image, or use a placeholder
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        let imageSrc = PLACEHOLDER_IMAGE;
        
        if (post.image_url) {
            // If image_url is a relative path, prepend the API base URL
            imageSrc = post.image_url.startsWith('/') ? `${apiBaseUrl}${post.image_url}` : 
                      (post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}/${post.image_url}`);
        } else if (post.coverPhoto) {
            imageSrc = post.coverPhoto;
        }
        
        // Format the date if available
        const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                             post.date ? post.date : 'Unknown date';
        
        // Get category or use default
        const category = post.category || 'Uncategorized';
        
        postEl.innerHTML = `
            <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="post-content">
                <div class="post-meta">
                    <span class="date">${formattedDate}</span>
                    <span class="category">${category}</span>
                    <span class="author">By: ${post.username || post.author || 'Anonymous'}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
                <div class="post-actions">
                    <a href="#" class="read-more">Read More</a>
                    <div class="edit-actions">
                        <button class="edit-btn" data-id="${post.id}"><i class="fas fa-edit"></i> Edit</button>
                        <button class="delete-btn" data-id="${post.id}"><i class="fas fa-trash"></i> Delete</button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(postEl);
    });

    // Add event listeners for edit, delete, and read more buttons
    setupEditButtons();
    setupDeleteButtons();
    setupReadMoreButtons();
}