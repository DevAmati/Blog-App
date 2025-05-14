document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token');
    
    if (!isLoggedIn || !token) {
        window.location.href = 'login.html';
        return;
    }

    // Get the form element
    const addPostForm = document.getElementById('add-post-form');
    
    if (addPostForm) {
        addPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('title').value;
            const content = document.getElementById('content').value;
            const category = document.getElementById('category').value;
            const coverPhotoInput = document.getElementById('cover-photo');
            
            if (!title || !content || !category) {
                alert('Please fill in all required fields');
                return;
            }

            // Show loading indicator
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Publishing...';
            submitBtn.disabled = true;
            
            try {
                // Create form data for multipart/form-data submission (for file upload)
                const formData = new FormData();
                formData.append('title', title);
                formData.append('content', content);
                formData.append('category', category);
                
                // Add image if selected
                if (coverPhotoInput.files.length > 0) {
                    formData.append('image', coverPhotoInput.files[0]);
                }
                
                // Get the base URL of the site - use localStorage config if available
                const apiBaseUrl = localStorage.getItem('apiBaseUrl') || 'http://localhost:3000';
                const apiUrl = `${apiBaseUrl}/api/posts`;
                
                // Send the post data to the server
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                let errorMessage = 'Failed to create post';
                
                if (!response.ok) {
                    // Try to parse error message from response
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorMessage;
                    } catch (parseError) {
                        console.error('Error parsing error response:', parseError);
                        // If can't parse JSON, use status text
                        errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
                    }
                    throw new Error(errorMessage);
                }

                // Try to parse the response
                let data;
                try {
                    const responseText = await response.text();
                    // Only try to parse as JSON if there's content
                    data = responseText ? JSON.parse(responseText) : {};
                    console.log('Post created successfully:', data);
                } catch (parseError) {
                    console.error('Error parsing success response:', parseError);
                    throw new Error('Server returned invalid response format');
                }
                
                // Show success message
                alert('Post published successfully!');
                
                // Redirect to home page
                window.location.href = 'home.html';
                
            } catch (error) {
                console.error('Error publishing post:', error);
                alert('Failed to publish post: ' + error.message);
            } finally {
                // Reset button state regardless of success/failure
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});