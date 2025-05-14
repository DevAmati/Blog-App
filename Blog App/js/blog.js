document.addEventListener('DOMContentLoaded', () => {
    // Load all blog posts
    loadAllPosts();
    
    // Set up search functionality
    setupSearch();
});

// Base64 encoded placeholder image (gray rectangle with text)
const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAGQAQMAAABbwG+aAAAABlBMVEX///+AgIBrWbWJAAAB2UlEQVR4nO3VsY3kMAxGYQqH4JCU4tCUotKUopS0EpRCQgppmM34/2VIeXfYXT9EQMgLPM8wRYriB5KAD0mSJEnvEn5Z/yP8J4B/r1iCEWXEJrBiRQYXAgp58JhKPWfFYe6aNNOEAigVtjJWnBjrGBIsTI0BUUZsrMEAiHWMNRrAWhQrXszZkAZEGUO3mOoEVtQigT2zPu5ArjLbSAxZkC61MoCtSGA42YQo46s8sALPqcbPJoSQYbJOYUKU0afVm1qRAAnMiDJY51qcmJJqcJCwYLZWdQaQLsVBojbBWGrHnJhgxYwVTXhOFViZUCmujDVbMSFW1EphxoIVE2acaEIqjEpiwYKJlWJFE7JtwOvCeLIFEyLF7MWKJgSKvQksDIis2FhJTGhCJB1YE4uxoi60nwvMaEJYnNXOqg1RSaxYsCHQirBWVkSKeQlEGdx+LCQWrIhmgclZca3YsOE5VmNFVwKpYsGKQDpjsTI2bEiDgJXFgSojMCpn3nwDImQlEGVEYLFhxYoJmVkRzMysjDgDBT4nVjr/RsSYYEJmDLCiCZHWuQMD6rwDmZE1KmPF22TFjAURJmZ9PB3+TtlYWRkbNmREbcLCiBXRGBs2JEmSJEmSJEmS/ls/+AZPmYz7uYgAAAAASUVORK5CYII=';

// Load all blog posts from API
async function loadAllPosts() {
    const blogPostsContainer = document.querySelector('.blog-posts');
    if (!blogPostsContainer) return;
    
    try {
        // Show loading indicator
        blogPostsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading posts...</p>
            </div>
        `;
        
        console.log('Attempting to fetch posts from /api/posts in blog.js...');
        
        // Fetch blog posts from API
        const response = await fetch('/api/posts');
        
        console.log('Fetch response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
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
        
        // Clear any existing content
        blogPostsContainer.innerHTML = '';
        
        if (blogPosts.length === 0) {
            // Display message if no posts exist
            blogPostsContainer.innerHTML = `
                <div class="no-posts">
                    <p>No blog posts available yet.</p>
                </div>
            `;
            return;
        }
        
        // Create and append blog posts
        blogPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error loading posts:', error);
        blogPostsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load posts: ${error.message}</p>
                <button onclick="loadAllPosts()" class="secondary-btn">Retry</button>
            </div>
        `;
    }
}

// Create a blog post element
function createPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    
    // Make sure we have an image, or use a placeholder
    // Handle image paths properly
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
    let imageSrc = PLACEHOLDER_IMAGE;
    
    if (post.image_url) {
        // If image_url is a relative path, prepend the API base URL
        imageSrc = post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}${post.image_url}`;
    } else if (post.coverPhoto) {
        imageSrc = post.coverPhoto;
    }
    
    // Format the date
    const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                          post.date ? post.date : 'Unknown date';
    
    article.innerHTML = `
        <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="post-content">
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${post.category || 'Uncategorized'}</span>
                <span class="author">By: ${post.username || post.author || 'Anonymous'}</span>
            </div>
            <h3>${post.title}</h3>
            <p>${post.content.substring(0, 150)}${post.content.length > 150 ? '...' : ''}</p>
            <a href="#" class="read-more" data-id="${post.id}">Read More</a>
        </div>
    `;
    
    // Add event listener for "Read More" button
    const readMoreBtn = article.querySelector('.read-more');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                // Fetch post comments
                const postId = post.id;
                const response = await fetch(`/api/posts/${postId}/comments`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch comments');
                }
                
                const comments = await response.json();
                
                // Create comment HTML
                const commentsHtml = comments.length > 0 
                    ? comments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${comment.username}</span>
                                <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <div class="comment-content">${comment.content}</div>
                        </div>
                    `).join('')
                    : '<p>No comments yet.</p>';
                
                // Display full post with comments in a modal
                const modal = document.createElement('div');
                modal.className = 'post-modal';
                modal.innerHTML = `
                    <div class="post-modal-content">
                        <span class="close-button">&times;</span>
                        <h2>${post.title}</h2>
                        <div class="post-meta">
                            <span class="date">${formattedDate}</span>
                            <span class="category">${post.category || 'Uncategorized'}</span>
                            <span class="author">By: ${post.username || 'Anonymous'}</span>
                        </div>
                        <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                        <div class="post-full-content">${post.content}</div>
                        
                        <div class="comments-section">
                            <h3>Comments (${comments.length})</h3>
                            <div class="comments-list">
                                ${commentsHtml}
                            </div>
                            <div class="add-comment-section">
                                <h4>Add a Comment</h4>
                                <textarea placeholder="Write your comment here..."></textarea>
                                <button class="primary-btn">Post Comment</button>
                            </div>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Add event listener for closing the modal
                const closeButton = modal.querySelector('.close-button');
                closeButton.addEventListener('click', () => {
                    document.body.removeChild(modal);
                });
                
                // Add event listener for posting a comment
                const commentButton = modal.querySelector('.add-comment-section button');
                const commentTextarea = modal.querySelector('.add-comment-section textarea');
                
                commentButton.addEventListener('click', async () => {
                    const commentContent = commentTextarea.value.trim();
                    
                    if (!commentContent) {
                        alert('Please enter a comment');
                        return;
                    }
                    
                    // Check if user is logged in
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('You must be logged in to post a comment');
                        return;
                    }
                    
                    try {
                        const response = await fetch('/api/comments', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                content: commentContent,
                                postId: post.id
                            })
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to post comment');
                        }
                        
                        // Refresh comments section
                        commentTextarea.value = '';
                        
                        // Fetch updated comments
                        const updatedCommentsResponse = await fetch(`/api/posts/${postId}/comments`);
                        const updatedComments = await updatedCommentsResponse.json();
                        
                        const commentsListContainer = modal.querySelector('.comments-list');
                        const updatedCommentsHtml = updatedComments.length > 0 
                            ? updatedComments.map(comment => `
                                <div class="comment">
                                    <div class="comment-header">
                                        <span class="comment-author">${comment.username}</span>
                                        <span class="comment-date">${new Date(comment.created_at).toLocaleString()}</span>
                                    </div>
                                    <div class="comment-content">${comment.content}</div>
                                </div>
                            `).join('')
                            : '<p>No comments yet.</p>';
                        
                        commentsListContainer.innerHTML = updatedCommentsHtml;
                        
                        // Update comment count
                        modal.querySelector('.comments-section h3').textContent = `Comments (${updatedComments.length})`;
                        
                    } catch (error) {
                        console.error('Error posting comment:', error);
                        alert('Failed to post comment. Please try again.');
                    }
                });
                
            } catch (error) {
                console.error('Error loading post details:', error);
                alert(`Full post: ${post.title}\n\n${post.content}\n\nFailed to load comments.`);
            }
        });
    }
    
    return article;
}

// Set up search functionality
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.querySelector('.search-container button');
    
    if (!searchInput || !searchButton) return;
    
    // Search when button is clicked
    searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
    });
    
    // Search when Enter key is pressed
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value);
        }
    });
    
    // Debounce function
    let debounceTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 500); // Wait 500ms after user stops typing
    });
}

// Perform search on posts
async function performSearch(searchTerm) {
    const blogPostsContainer = document.querySelector('.blog-posts');
    
    if (!blogPostsContainer) return;
    
    // If search term is empty, show all posts
    if (!searchTerm.trim()) {
        loadAllPosts();
        return;
    }
    
    try {
        // Show loading indicator
        blogPostsContainer.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Searching posts...</p>
            </div>
        `;
        
        // Fetch all posts from API
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }
        
        const blogPosts = await response.json();
        
        // Filter posts based on search term (client-side search for now)
        // In a real app, you would implement server-side search with query parameters
        const searchTermLower = searchTerm.toLowerCase();
        const filteredPosts = blogPosts.filter(post => 
            post.title.toLowerCase().includes(searchTermLower) ||
            post.content.toLowerCase().includes(searchTermLower) ||
            (post.category && post.category.toLowerCase().includes(searchTermLower)) ||
            (post.username && post.username.toLowerCase().includes(searchTermLower))
        );
        
        // Clear existing content
        blogPostsContainer.innerHTML = '';
        
        if (filteredPosts.length === 0) {
            // No matching posts
            blogPostsContainer.innerHTML = `
                <div class="no-posts">
                    <p>No posts found matching "${searchTerm}"</p>
                    <button class="secondary-btn" onclick="loadAllPosts()">Show All Posts</button>
                </div>
            `;
            return;
        }
        
        // Display filtered posts
        filteredPosts.forEach(post => {
            const postElement = createPostElement(post);
            blogPostsContainer.appendChild(postElement);
        });
    } catch (error) {
        console.error('Error searching posts:', error);
        blogPostsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to search posts. Please try again later.</p>
                <button onclick="loadAllPosts()" class="secondary-btn">Show All Posts</button>
            </div>
        `;
    }
}

// Expose loadAllPosts to global scope for buttons to use
window.loadAllPosts = loadAllPosts; 