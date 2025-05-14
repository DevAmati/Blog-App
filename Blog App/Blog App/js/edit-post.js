document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    
    if (!isLoggedIn || !token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Get the post ID to edit from localStorage
    const postId = localStorage.getItem('editPostId');
    if (!postId) {
        // No post ID found, redirect to home
        alert('No post selected for editing');
        window.location.href = 'home.html';
        return;
    }
    
    // Load the post data for editing
    loadPostForEditing(postId);
    
    // Set up form submission
    const editForm = document.getElementById('edit-post-form');
    if (editForm) {
        editForm.addEventListener('submit', handleFormSubmit);
    }
});

// Load post data for editing
async function loadPostForEditing(postId) {
    try {
        // Show loading message
        document.getElementById('loading-message').style.display = 'flex';
        document.getElementById('edit-post-form').style.display = 'none';
        
        const token = localStorage.getItem('token');
        
        // Get the base URL of the site - use localStorage config if available
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        const apiUrl = `${apiBaseUrl}/api/posts/${postId}`;
        
        // Fetch post data from the API
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
            
            throw new Error(`Failed to fetch post data: ${errorMessage}`);
        }
        
        // Try to parse the response
        let postToEdit;
        try {
            const responseText = await response.text();
            postToEdit = responseText ? JSON.parse(responseText) : null;
        } catch (parseError) {
            console.error('Error parsing post response:', parseError);
            throw new Error('Server returned invalid response format');
        }
        
        if (!postToEdit) {
            throw new Error('Post not found');
        }
        
        // Hide the loading message and show the form
        document.getElementById('loading-message').style.display = 'none';
        document.getElementById('edit-post-form').style.display = 'block';
        
        // Fill the form with post data
        document.getElementById('title').value = postToEdit.title || '';
        document.getElementById('content').value = postToEdit.content || '';
        document.getElementById('post-id').value = postToEdit.id;
        
        // Set the category
        const categorySelect = document.getElementById('category');
        if (postToEdit.category) {
            // Find and select the matching option
            for (let i = 0; i < categorySelect.options.length; i++) {
                if (categorySelect.options[i].value === postToEdit.category) {
                    categorySelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        // Display the current image
        const currentImage = document.getElementById('current-image');
        const imageContainer = document.getElementById('current-image-container');
        
        if (postToEdit.image_url) {
            currentImage.src = postToEdit.image_url;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        document.getElementById('loading-message').innerHTML = `
            <div class="error-message">
                <p>Failed to load post data: ${error.message}</p>
                <button onclick="window.location.href='home.html'" class="secondary-btn">Back to Home</button>
            </div>
        `;
    }
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const category = document.getElementById('category').value;
    const postId = document.getElementById('post-id').value;
    const coverPhotoInput = document.getElementById('cover-photo');
    
    if (!title || !content || !category) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;
        
        const token = localStorage.getItem('token');
        
        // Create form data for multipart/form-data submission
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category', category);
        
        // Check if a new image is being uploaded
        if (coverPhotoInput.files.length > 0) {
            formData.append('image', coverPhotoInput.files[0]);
        }
        
        // Get the base URL of the site - use localStorage config if available
        const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
        const apiUrl = `${apiBaseUrl}/api/posts/${postId}`;
        
        // Update the post via API
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            // Try to parse error message
            let errorMessage = 'Failed to update post';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
                console.error('Error parsing error response:', parseError);
                errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }
        
        // Show success message
        alert('Post updated successfully!');
        
        // Redirect back to home page
        window.location.href = 'home.html';
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update post: ' + error.message);
    } finally {
        // Reset button state regardless of success/failure
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.textContent = originalText || 'Update Post';
            submitBtn.disabled = false;
        }
    }
} 