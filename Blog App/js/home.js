document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    
    if (!isLoggedIn || !token) {
        window.location.href = 'index.html';
        return;
    }

    // Load user posts
    loadUserPosts();
});

// Base64 encoded placeholder image (gray rectangle with text)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAGQAQMAAABbwG+aAAAABlBMVEX///+AgIBrWbWJAAAB2UlEQVR4nO3VsY3kMAxGYQqH4JCU4tCUotKUopS0EpRCQgppmM34/2VIeXfYXT9EQMgLPM8wRYriB5KAD0mSJEnvEn5Z/yP8J4B/r1iCEWXEJrBiRQYXAgp58JhKPWfFYe6aNNOEAigVtjJWnBjrGBIsTI0BUUZsrMEAiHWMNRrAWhQrXszZkAZEGUO3mOoEVtQigT2zPu5ArjLbSAxZkC61MoCtSGA42YQo46s8sALPqcbPJoSQYbJOYUKU0afVm1qRAAnMiDJY51qcmJJqcJCwYLZWdQaQLsVBojbBWGrHnJhgxYwVTXhOFViZUCmujDVbMSFW1EphxoIVE2acaEIqjEpiwYKJlWJFE7JtwOvCeLIFEyLF7MWKJgSKvQksDIis2FhJTGhCJB1YE4uxoi60nwvMaEJYnNXOqg1RSaxYsCHQirBWVkSKeQlEGdx+LCQWrIhmgclZca3YsOE5VmNFVwKpYsGKQDpjsTI2bEiDgJXFgSojMCpn3nwDImQlEGVEYLFhxYoJmVkRzMysjDgDBT4nVjr/RsSYYEJmDLCiCZHWuQMD6rwDmZE1KmPF22TFjAURJmZ9PB3+TtlYWRkbNmREbcLCiBXRGBs2JEmSJEmSJEmS/ls/+AZPmYz7uYgAAAAASUVORK5CYII=';

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
        
        // Fetch posts from API
        const response = await fetch('/api/posts/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        let errorMessage = 'Failed to fetch posts';
        
        if (!response.ok) {
            // Try to parse error response
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        // Try to parse the response
        let posts;
        try {
            const responseText = await response.text();
            posts = responseText ? JSON.parse(responseText) : [];
        } catch (parseError) {
            console.error('Error parsing posts response:', parseError);
            throw new Error('Server returned invalid response format');
        }
        
        if (posts.length === 0) {
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
        posts.forEach(post => {
            const postEl = document.createElement('article');
            postEl.className = 'blog-post';
            
            // Make sure we have an image, or use a placeholder
            const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
            let imageSrc = PLACEHOLDER_IMAGE;
            
            if (post.image_url) {
                // If image_url is a relative path, prepend the API base URL
                imageSrc = post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}${post.image_url}`;
            } else if (post.coverPhoto) {
                imageSrc = post.coverPhoto;
            }
            
            // Format the date, handle invalid dates gracefully
            let formattedDate = 'Unknown date';
            try {
                formattedDate = new Date(post.created_at).toLocaleDateString();
            } catch (e) {
                console.error('Error formatting date:', e);
            }
            
            postEl.innerHTML = `
                <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                <div class="post-content">
                    <div class="post-meta">
                        <span class="date">${formattedDate}</span>
                        <span class="category">${post.category || 'Uncategorized'}</span>
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
    } catch (error) {
        console.error('Error loading posts:', error);
        postsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load posts: ${error.message}</p>
                <button onclick="loadUserPosts()" class="secondary-btn">Retry</button>
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
        btn.addEventListener('click', async (e) => {
            const postId = parseInt(e.target.closest('.delete-btn').dataset.id);
            
            if (confirm('Are you sure you want to delete this post?')) {
                try {
                    const token = localStorage.getItem('token');
                    
                    // Delete post through API
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to delete post');
                    }
                    
                    // Reload posts
                    loadUserPosts();
                } catch (error) {
                    console.error('Error deleting post:', error);
                    alert('Failed to delete post: ' + error.message);
                }
            }
        });
    });
}