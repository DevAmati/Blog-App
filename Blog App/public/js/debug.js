/**
 * Debug utility for managing blog posts in localStorage
 * This script allows displaying, cleaning up, and fixing any problematic posts
 */

// Display all posts with their IDs
function listAllPosts() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    console.log('===== ALL POSTS =====');
    console.log(`Total posts: ${blogPosts.length}`);
    
    blogPosts.forEach((post, index) => {
        console.log(`${index + 1}. ID: ${post.id}, Title: ${post.title}`);
    });
    
    return blogPosts;
}

// Remove a post by its ID
function removePostById(postId) {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const idToRemove = parseInt(postId);
    
    console.log(`Attempting to remove post with ID: ${idToRemove}`);
    
    const originalLength = blogPosts.length;
    const updatedPosts = blogPosts.filter(post => parseInt(post.id) !== idToRemove);
    
    if (updatedPosts.length < originalLength) {
        localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
        console.log(`Success! Removed post with ID: ${idToRemove}`);
        console.log(`Original count: ${originalLength}, New count: ${updatedPosts.length}`);
        return true;
    } else {
        console.log(`No post found with ID: ${idToRemove}`);
        return false;
    }
}

// Clean up duplicate posts
function removeDuplicatePosts() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // Create a Set to track unique post IDs
    const seenIds = new Set();
    const uniquePosts = [];
    
    for (const post of blogPosts) {
        // Convert ID to string for consistent comparison
        const postId = String(post.id);
        
        if (!seenIds.has(postId)) {
            seenIds.add(postId);
            uniquePosts.push(post);
        }
    }
    
    if (uniquePosts.length < blogPosts.length) {
        localStorage.setItem('blogPosts', JSON.stringify(uniquePosts));
        console.log(`Removed ${blogPosts.length - uniquePosts.length} duplicate posts.`);
    } else {
        console.log('No duplicate posts found.');
    }
    
    return uniquePosts;
}

// Reset all posts
function resetAllPosts() {
    if (confirm('Are you sure you want to delete ALL posts? This cannot be undone.')) {
        localStorage.setItem('blogPosts', JSON.stringify([]));
        console.log('All posts have been deleted.');
        return true;
    }
    return false;
}

// Clean up post data
function cleanUpPostData() {
    const blogPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    let fixedCount = 0;
    
    // Clean up and normalize post data
    const cleanedPosts = blogPosts.map(post => {
        const cleanedPost = { ...post };
        
        // Ensure ID is a number
        if (typeof cleanedPost.id === 'string') {
            cleanedPost.id = parseInt(cleanedPost.id) || Date.now();
            fixedCount++;
        }
        
        // Ensure required fields exist
        if (!cleanedPost.title) {
            cleanedPost.title = 'Untitled Post';
            fixedCount++;
        }
        
        if (!cleanedPost.content) {
            cleanedPost.content = 'No content provided.';
            fixedCount++;
        }
        
        if (!cleanedPost.category) {
            cleanedPost.category = 'Uncategorized';
            fixedCount++;
        }
        
        if (!cleanedPost.date) {
            cleanedPost.date = new Date().toLocaleDateString();
            fixedCount++;
        }
        
        return cleanedPost;
    });
    
    localStorage.setItem('blogPosts', JSON.stringify(cleanedPosts));
    console.log(`Fixed ${fixedCount} issues in post data.`);
    
    return cleanedPosts;
}

// Run the cleanup functions
function runFullCleanup() {
    console.log('=== STARTING FULL CLEANUP ===');
    
    // List all posts before cleanup
    console.log('Posts before cleanup:');
    listAllPosts();
    
    // Clean up post data
    cleanUpPostData();
    
    // Remove duplicates
    removeDuplicatePosts();
    
    // List all posts after cleanup
    console.log('Posts after cleanup:');
    listAllPosts();
    
    console.log('=== CLEANUP COMPLETE ===');
    alert('Cleanup complete! Refresh the page to see changes.');
}

// Expose functions to global scope for console access
window.debugPosts = {
    list: listAllPosts,
    remove: removePostById,
    removeDuplicates: removeDuplicatePosts,
    reset: resetAllPosts,
    cleanup: cleanUpPostData,
    fullCleanup: runFullCleanup
};

console.log('Blog post debug utilities loaded. Use window.debugPosts.* functions to manage posts.');
console.log('Example: window.debugPosts.list() to see all posts');
console.log('Example: window.debugPosts.remove(123) to delete post with ID 123');
console.log('Example: window.debugPosts.fullCleanup() to run a complete cleanup');

// Debug utilities for blog platform issues
console.log('Blog post debug utilities loaded. Use window.debugPosts.* functions to manage posts.');

// Initialize debugPosts object
window.debugPosts = {
    list: function() {
        // List all posts from localStorage for debugging
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        console.log(`Found ${posts.length} posts in localStorage:`);
        posts.forEach((post, index) => {
            console.log(`[${index}] ID: ${post.id}, Title: "${post.title}"`);
        });
        return posts;
    },

    remove: function(id) {
        // Remove a post by ID
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const initialCount = posts.length;
        const newPosts = posts.filter(post => post.id != id);
        localStorage.setItem('blogPosts', JSON.stringify(newPosts));
        console.log(`Removed post ID ${id}. Posts: ${initialCount} → ${newPosts.length}`);
        
        // Reload the page if we're on the home or blog page
        if (document.getElementById('user-posts-container') || document.querySelector('.blog-posts')) {
            setTimeout(() => location.reload(), 1000);
        }
        return newPosts;
    },

    fullCleanup: function() {
        // Fix various common issues
        this.fixApiUrlConfig();
        this.updateAuthData();
        this.fixImageUrls();
        console.log('Cleanup completed. Reloading page...');
        setTimeout(() => location.reload(), 1000);
    },

    fixApiUrlConfig: function() {
        // Fix API URL to point to the correct server port
        let serverPort = 3000; // The port your server is running on
        
        // Store the server port for future use
        localStorage.setItem('serverPort', serverPort);
        
        // Update the API URL configuration
        localStorage.setItem('apiBaseUrl', `http://localhost:${serverPort}`);
        
        console.log(`API URL configuration updated to use port ${serverPort}`);
        return true;
    },

    updateAuthData: function() {
        // Make sure login data is properly set
        const token = localStorage.getItem('token');
        if (token) {
            localStorage.setItem('isLoggedIn', 'true');
            console.log('Auth data verified: User is logged in with token');
        } else {
            console.log('No auth token found. Login status unchanged.');
        }
    },

    testApi: async function() {
        // Test API connectivity
        try {
            const apiBaseUrl = localStorage.getItem('apiBaseUrl') || window.location.origin;
            console.log(`Testing API connectivity to ${apiBaseUrl}/api/status`);
            
            const response = await fetch(`${apiBaseUrl}/api/status`);
            
            if (!response.ok) {
                throw new Error(`API status check failed: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API status check successful:', data);
            return true;
        } catch (error) {
            console.error('API connectivity test failed:', error);
            return false;
        }
    },
    
    fixImageUrls: function() {
        // Fix image URLs for posts
        const posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        
        // Update image URLs to point to the correct server
        posts.forEach(post => {
            if (post.image_url && post.image_url.startsWith('/uploads/')) {
                post.image_url = `${apiBaseUrl}${post.image_url}`;
                console.log(`Updated image URL: ${post.image_url}`);
            }
            if (post.coverPhoto && post.coverPhoto.startsWith('/uploads/')) {
                post.coverPhoto = `${apiBaseUrl}${post.coverPhoto}`;
                console.log(`Updated cover photo: ${post.coverPhoto}`);
            }
        });
        
        localStorage.setItem('blogPosts', JSON.stringify(posts));
        console.log(`Fixed image URLs for ${posts.length} posts`);
        return posts;
    }
};

// Add utility functions for the specific API issues
window.fixApiIssues = async function() {
    // Get the server port from localStorage or use default
    const serverPort = localStorage.getItem('serverPort') || 3000;
    
    // Update the API base URL in localStorage
    const apiBaseUrl = `http://localhost:${serverPort}`;
    localStorage.setItem('apiBaseUrl', apiBaseUrl);
    
    console.log(`API base URL set to: ${apiBaseUrl}`);
    
    // Create a sample user for testing if needed
    if (!localStorage.getItem('user')) {
        const sampleUser = {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
        };
        localStorage.setItem('user', JSON.stringify(sampleUser));
        console.log('Created sample user for testing');
    }
    
    // Set login status if a token exists
    if (localStorage.getItem('token')) {
        localStorage.setItem('isLoggedIn', 'true');
        console.log('User marked as logged in');
    }
    
    return true;
};

// Diagnostic function for user posts endpoint
window.diagUserPostsEndpoint = async function() {
    const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('No token found. Please log in first.');
        return false;
    }
    
    try {
        console.log(`Testing user posts endpoint at ${apiBaseUrl}/api/posts/user`);
        console.log(`Using token: ${token.substring(0, 10)}...`);
        
        const response = await fetch(`${apiBaseUrl}/api/posts/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response text:', errorText);
            return false;
        }
        
        const responseText = await response.text();
        console.log('Response text (first 100 chars):', responseText.substring(0, 100));
        
        try {
            const data = JSON.parse(responseText);
            console.log('Found', data.length, 'user posts');
            return data;
        } catch (error) {
            console.error('Failed to parse response:', error);
            return false;
        }
    } catch (error) {
        console.error('Diagnostic failed:', error);
        return false;
    }
};

// Run initial checks
(async function() {
    console.log('Running API connectivity check...');
    const apiConnectivity = await window.debugPosts.testApi();
    
    if (!apiConnectivity) {
        console.log('API connectivity issues detected. Use window.fixApiIssues() to fix.');
    }
})(); 