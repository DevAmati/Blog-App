-- Ensure we're using the correct database
USE blog_platform;

-- Drop the table if it exists (to avoid errors when running the script multiple times)
DROP TABLE IF EXISTS likes;

-- Create the likes table
CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id) -- Prevent duplicate likes from the same user
); 