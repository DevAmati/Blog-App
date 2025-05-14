document.addEventListener('DOMContentLoaded', () => {
    // Load all blog posts
    loadAllPosts();
    
    // Set up search functionality
    setupSearch();
});

// Use PLACEHOLDER_IMAGE from main.js instead of redefining it here
// The Base64 encoded placeholder image is now defined only in main.js

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
        
        // Get the base URL of the site - use localStorage config if available
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        const apiUrl = `${apiBaseUrl}/api/posts`;
        console.log('Attempting to fetch posts from:', apiUrl);
        
        // Fetch blog posts from API
        const response = await fetch(apiUrl);
        
        console.log('Fetch response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Response error text:', errorText);
            
            // Fall back to local storage data
            console.log('Falling back to localStorage due to API error');
            const localPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
            
            if (localPosts.length === 0) {
                blogPostsContainer.innerHTML = `
                    <div class="no-posts">
                        <p>No blog posts available yet. (Using local data due to API error)</p>
                    </div>
                `;
                return;
            }
            
            // Display posts from localStorage
            renderPostsFromLocalStorage(localPosts, blogPostsContainer);
            return;
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
    // Handle both image_url (from API) and coverPhoto (from localStorage)
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
    let imageSrc = PLACEHOLDER_IMAGE;
    
    if (post.image_url) {
        // If image_url is a relative path, prepend the API base URL
        imageSrc = post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}${post.image_url}`;
    } else if (post.coverPhoto) {
        imageSrc = post.coverPhoto;
    }
    
    // Format the date if available
    const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                          post.date ? post.date : 'Unknown date';
    
    // Get category or use default
    const category = post.category || 'Uncategorized';
    
    article.innerHTML = `
        <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="post-content">
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${category}</span>
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
                const baseUrl = window.location.origin;
                const commentsUrl = `${baseUrl}/api/posts/${postId}/comments`;
                console.log('Fetching comments from:', commentsUrl);
                
                const response = await fetch(commentsUrl);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch comments: ${response.status} ${response.statusText}`);
                }
                
                // Display the full post in a modal
                await displayFullPost(post);
            } catch (error) {
                console.error('Error fetching comments:', error);
                alert('Failed to fetch comments.');
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
    
    // Live search as user types (optional)
    searchInput.addEventListener('input', () => {
        performSearch(searchInput.value);
    });
}

// Perform search on posts
function performSearch(searchTerm) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const blogPostsContainer = document.querySelector('.blog-posts');
    
    if (!blogPostsContainer) return;
    
    // Clear existing content
    blogPostsContainer.innerHTML = '';
    
    // If search term is empty, show all posts
    if (!searchTerm.trim()) {
        loadAllPosts();
        return;
    }
    
    // Filter posts based on search term
    const searchTermLower = searchTerm.toLowerCase();
    const filteredPosts = blogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTermLower) ||
        post.content.toLowerCase().includes(searchTermLower) ||
        post.category.toLowerCase().includes(searchTermLower)
    );
    
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
}

// Helper function to render posts from localStorage
function renderPostsFromLocalStorage(posts, container) {
    // Clear any existing content
    container.innerHTML = '';
    
    // Create and append blog posts
    posts.forEach(post => {
        const postElement = createLocalPostElement(post);
        container.appendChild(postElement);
    });
}

// Create a blog post element from localStorage data
function createLocalPostElement(post) {
    const article = document.createElement('article');
    article.className = 'blog-post';
    
    // Make sure we have an image, or use a placeholder
    const imageSrc = post.image_url || post.coverPhoto || PLACEHOLDER_IMAGE;
    
    // Format the date if available
    const formattedDate = post.created_at ? new Date(post.created_at).toLocaleDateString() : 
                          post.date ? post.date : 'Unknown date';
    
    // Get category or use default
    const category = post.category || 'Uncategorized';
    
    article.innerHTML = `
        <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
        <div class="post-content">
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${category}</span>
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
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Display post in a modal
            displayFullPost(post);
        });
    }
    
    return article;
}

// Display full post in a modal
async function displayFullPost(post) {
    console.log('Starting displayFullPost function for post:', post.id);
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    
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
        imageSrc = post.image_url.startsWith('http') ? post.image_url : `${apiBaseUrl}${post.image_url}`;
    } else if (post.coverPhoto) {
        imageSrc = post.coverPhoto;
    }
    
    console.log('Creating modal content for post:', post.title);
    // Show loading state initially
    modal.innerHTML = `
        <div class="post-modal-content">
            <span class="close-button">&times;</span>
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="date">${formattedDate}</span>
                <span class="category">${category}</span>
                <span class="author">By: ${post.username || post.author || 'Anonymous'}</span>
            </div>
            <img src="${imageSrc}" alt="${post.title}" onerror="this.src='${PLACEHOLDER_IMAGE}'">
            <div class="post-full-content">${post.content}</div>
            
            <div class="post-interactions">
                <div class="like-section">
                    <button class="like-button" data-post-id="${post.id}">
                        <i class="far fa-heart"></i> <span class="like-count">0</span>
                    </button>
                </div>
            </div>
            
            <div class="comments-section">
                <h3>Comments <span class="comment-count">(Loading...)</span></h3>
                <div class="comments-list">
                    <p><i class="fas fa-spinner fa-spin"></i> Loading comments...</p>
                </div>
                <div class="add-comment-section">
                    <h4>Add a Comment</h4>
                    <textarea class="form-control" placeholder="Write your comment here..."></textarea>
                    <button class="submit-btn comment-submit-btn">Post Comment</button>
                </div>
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
    
    try {
        // Fetch comments
        const commentsUrl = `${apiBaseUrl}/api/posts/${post.id}/comments`;
        console.log('Fetching comments from:', commentsUrl);
        
        // Fetch likes
        const likesUrl = `${apiBaseUrl}/api/posts/${post.id}/likes`;
        console.log('Fetching likes from:', likesUrl);
        
        // Fetch both comments and likes in parallel
        console.log('Starting parallel fetch for comments and likes');
        const [commentsResponse, likesResponse] = await Promise.all([
            fetch(commentsUrl),
            fetch(likesUrl)
        ]);
        console.log('Completed parallel fetch');
        
        if (!commentsResponse.ok) {
            throw new Error(`Failed to fetch comments: ${commentsResponse.status}`);
        }
        
        const comments = await commentsResponse.json();
        console.log('Comments loaded:', comments.length);
        
        // Update comment count
        const commentCountElement = modal.querySelector('.comment-count');
        commentCountElement.textContent = `(${comments.length})`;
        
        // Render comments
        const commentsListElement = modal.querySelector('.comments-list');
        if (comments.length === 0) {
            commentsListElement.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        } else {
            commentsListElement.innerHTML = comments.map(comment => `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">${comment.username || 'Anonymous'}</span>
                        <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>
            `).join('');
        }
        
        // Handle likes if the response was successful
        if (likesResponse.ok) {
            console.log('Processing likes response');
            const likeData = await likesResponse.json();
            console.log('Like data:', likeData);
            
            const likeButton = modal.querySelector('.like-button');
            const likeCountElement = modal.querySelector('.like-count');
            
            console.log('Found like button:', likeButton !== null);
            console.log('Found like count element:', likeCountElement !== null);
            
            // Update like count
            likeCountElement.textContent = likeData.count;
            
            // Update button appearance based on whether user has liked the post
            if (likeData.userLiked) {
                likeButton.classList.add('liked');
                likeButton.setAttribute('data-liked', 'true');
                likeButton.querySelector('i').classList.remove('far');
                likeButton.querySelector('i').classList.add('fas');
            }
            
            // Add event listener for like button
            console.log('Adding click event listener to like button');
            likeButton.addEventListener('click', async () => {
                console.log('Like button clicked');
                try {
                    // Get token - requires authentication
                    const token = localStorage.getItem('token');
                    if (!token) {
                        alert('You must be logged in to like posts');
                        return;
                    }
                    
                    console.log('Sending like request to API');
                    const likeResponse = await fetch(`${apiBaseUrl}/api/posts/${post.id}/like`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (!likeResponse.ok) {
                        throw new Error(`Failed to process like: ${likeResponse.status} ${likeResponse.statusText}`);
                    }
                    
                    // Parse response as text first for debugging
                    const responseText = await likeResponse.text();
                    console.log('Like response text:', responseText);
                    
                    // Parse as JSON if possible
                    let result;
                    try {
                        result = JSON.parse(responseText);
                        console.log('Parsed like response:', result);
                    } catch (parseError) {
                        console.error('Error parsing like response:', parseError);
                        // If we can't parse as JSON, create a default response based on the status
                        result = {
                            liked: likeResponse.status === 201, // Created = new like
                            message: responseText || (likeResponse.status === 201 ? 'Post liked' : 'Post unliked')
                        };
                    }
                    
                    // Toggle like UI based on response or status code
                    if (result.liked || likeResponse.status === 201) {
                        likeButton.classList.add('liked');
                        likeButton.setAttribute('data-liked', 'true');
                        likeButton.querySelector('i').classList.remove('far');
                        likeButton.querySelector('i').classList.add('fas');
                        likeCountElement.textContent = parseInt(likeCountElement.textContent) + 1;
                    } else {
                        likeButton.classList.remove('liked');
                        likeButton.setAttribute('data-liked', 'false');
                        likeButton.querySelector('i').classList.remove('fas');
                        likeButton.querySelector('i').classList.add('far');
                        likeCountElement.textContent = parseInt(likeCountElement.textContent) - 1;
                    }
                } catch (error) {
                    console.error('Error processing like:', error);
                    // Don't show alert to avoid disrupting user experience, just log the error
                    // Instead, manually refresh likes to show current state
                    try {
                        const refreshResponse = await fetch(`${apiBaseUrl}/api/posts/${post.id}/likes`);
                        if (refreshResponse.ok) {
                            const refreshData = await refreshResponse.json();
                            likeCountElement.textContent = refreshData.count;
                            
                            if (refreshData.userLiked) {
                                likeButton.classList.add('liked');
                                likeButton.setAttribute('data-liked', 'true');
                                likeButton.querySelector('i').classList.remove('far');
                                likeButton.querySelector('i').classList.add('fas');
                            } else {
                                likeButton.classList.remove('liked');
                                likeButton.setAttribute('data-liked', 'false');
                                likeButton.querySelector('i').classList.remove('fas');
                                likeButton.querySelector('i').classList.add('far');
                            }
                        }
                    } catch (refreshError) {
                        console.error('Failed to refresh like status:', refreshError);
                    }
                }
            });
        }
        
        // Add event listener for posting a comment
        console.log('Setting up comment submission');
        const commentButton = modal.querySelector('.comment-submit-btn');
        const commentTextarea = modal.querySelector('.add-comment-section textarea');
        
        commentButton.addEventListener('click', async () => {
            console.log('Comment button clicked');
            const commentContent = commentTextarea.value.trim();
            
            if (!commentContent) {
                alert('Please enter a comment');
                return;
            }
            
            // Get token - requires authentication
            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to post comments');
                return;
            }
            
            try {
                console.log('Sending comment to API');
                const response = await fetch(`${apiBaseUrl}/api/comments`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: commentContent,
                        post_id: post.id
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to post comment');
                }
                
                // Clear textarea
                commentTextarea.value = '';
                
                // Refresh comments
                const updatedCommentsResponse = await fetch(commentsUrl);
                const updatedComments = await updatedCommentsResponse.json();
                
                // Update comment count
                commentCountElement.textContent = `(${updatedComments.length})`;
                
                // Render updated comments
                if (updatedComments.length === 0) {
                    commentsListElement.innerHTML = '<p>No comments yet.</p>';
                } else {
                    commentsListElement.innerHTML = updatedComments.map(comment => `
                        <div class="comment">
                            <div class="comment-header">
                                <span class="comment-author">${comment.username || 'Anonymous'}</span>
                                <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="comment-content">${comment.content}</div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Error posting comment:', error);
                alert('Error posting comment. Please try again.');
            }
        });
    } catch (error) {
        console.error('Error loading post details:', error);
        
        // Update with error state
        const commentsListElement = modal.querySelector('.comments-list');
        commentsListElement.innerHTML = '<p>Error loading comments. Please try again later.</p>';
        
        // Still allow commenting
        const commentButton = modal.querySelector('.comment-submit-btn');
        commentButton.addEventListener('click', () => {
            alert('Unable to post comments at this time. Please try again later.');
        });
    }
}

// ... existing code ...