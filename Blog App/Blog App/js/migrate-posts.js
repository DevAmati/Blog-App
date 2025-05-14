/**
 * This script helps migrate existing localStorage posts to the database
 * It should be included in pages where users might have existing posts
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we have already migrated posts
    const migratedFlag = localStorage.getItem('postsMigrated');
    
    // If we've already migrated or there's no token, skip migration
    if (migratedFlag === 'true' || !localStorage.getItem('token') || !localStorage.getItem('isLoggedIn')) {
        return;
    }
    
    // Get posts from localStorage
    const localPosts = JSON.parse(localStorage.getItem('blogPosts')) || [];
    
    // If there are no posts to migrate, mark as migrated and return
    if (localPosts.length === 0) {
        localStorage.setItem('postsMigrated', 'true');
        return;
    }
    
    // Ask user if they want to migrate posts
    if (confirm('We found ' + localPosts.length + ' blog posts in your browser storage. Would you like to migrate them to your account?')) {
        migratePostsToDatabase(localPosts);
    } else {
        // User declined, but mark as migrated to avoid asking again
        localStorage.setItem('postsMigrated', 'true');
    }
});

/**
 * Migrate posts from localStorage to the database
 * @param {Array} posts - Array of posts from localStorage
 */
async function migratePostsToDatabase(posts) {
    const token = localStorage.getItem('token');
    const migrateProgressModal = createMigrationModal(posts.length);
    
    document.body.appendChild(migrateProgressModal);
    
    let successCount = 0;
    let failedCount = 0;
    
    // Process each post
    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const progressBar = document.getElementById('migration-progress');
        const statusText = document.getElementById('migration-status');
        
        // Update UI
        statusText.textContent = `Migrating post ${i + 1} of ${posts.length}: ${post.title}`;
        progressBar.value = ((i + 1) / posts.length) * 100;
        
        try {
            // Create post via API
            const formData = new FormData();
            formData.append('title', post.title);
            formData.append('content', post.content);
            formData.append('category', post.category || 'Uncategorized');
            
            // If there's a coverPhoto that's a data URL, convert it to a file
            if (post.coverPhoto && post.coverPhoto.startsWith('data:image')) {
                const blob = await dataURLtoBlob(post.coverPhoto);
                formData.append('image', blob, 'cover-image.jpg');
            }
            
            // Get the base URL of the site - use localStorage config if available
            const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
            const apiUrl = `${apiBaseUrl}/api/posts`;
            
            // Send the request
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Failed to migrate post: ${post.title}`);
            }
            
            successCount++;
        } catch (error) {
            console.error('Error migrating post:', error);
            failedCount++;
        }
        
        // Slight delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Show completion status
    const progressBar = document.getElementById('migration-progress');
    const statusText = document.getElementById('migration-status');
    const actionButton = document.getElementById('migration-action');
    
    progressBar.value = 100;
    statusText.textContent = `Migration complete! ${successCount} posts migrated successfully, ${failedCount} failed.`;
    actionButton.textContent = 'Close';
    actionButton.onclick = () => {
        document.body.removeChild(migrateProgressModal);
        
        // Mark migration as complete
        localStorage.setItem('postsMigrated', 'true');
        
        // Reload the page to show the updated posts
        window.location.reload();
    };
}

/**
 * Create a modal dialog to show migration progress
 * @param {number} totalPosts - Total number of posts to migrate
 * @returns {HTMLElement} The created modal element
 */
function createMigrationModal(totalPosts) {
    const modal = document.createElement('div');
    modal.className = 'post-modal';
    modal.innerHTML = `
        <div class="post-modal-content" style="max-width: 500px;">
            <h2>Migrating Posts</h2>
            <p id="migration-status">Preparing to migrate ${totalPosts} posts...</p>
            <progress id="migration-progress" value="0" max="100" style="width: 100%; height: 20px;"></progress>
            <p style="margin-top: 20px; color: #666;">Please do not close this page during migration.</p>
            <button id="migration-action" class="primary-btn" style="display: none;">Close</button>
        </div>
    `;
    
    return modal;
}

/**
 * Convert a data URL to a Blob object
 * @param {string} dataURL - The data URL to convert
 * @returns {Blob} A Blob object created from the data URL
 */
async function dataURLtoBlob(dataURL) {
    // Convert base64 to raw binary data held in a string
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const byteString = atob(parts[1]);
    
    // Create an ArrayBuffer with the binary data
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    
    // Return a Blob object
    return new Blob([arrayBuffer], { type: contentType });
} 