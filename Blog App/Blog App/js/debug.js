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