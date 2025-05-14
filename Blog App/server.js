require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Add better logging for static files
const staticPath = path.join(__dirname, 'public');
console.log('Setting up static files from:', staticPath);

// Create a custom static file middleware with logging
const staticMiddleware = express.static(staticPath);
app.use((req, res, next) => {
    // Record original URL
    const originalUrl = req.url;
    
    // Create a flag to detect if file was served
    let fileWasServed = false;
    
    // Override res.sendFile to detect when a file is sent
    const originalSendFile = res.sendFile;
    res.sendFile = function(path, options, callback) {
        fileWasServed = true;
        return originalSendFile.call(this, path, options, callback);
    };
    
    // Call next middleware (static)
    staticMiddleware(req, res, (err) => {
        if (err) {
            return next(err);
        }
        
        // If no file was found and no response was sent yet
        if (!fileWasServed && !res.headersSent) {
            console.log(`Static file not found: ${originalUrl}`);
        }
        
        next();
    });
});

// Explicitly set up uploads directory as static
const uploadsPath = path.join(__dirname, 'public/uploads');
console.log('Setting up uploads static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

app.use(express.urlencoded({ extended: true }));

// Diagnostic endpoint to verify API is working
app.get('/api/status', (req, res) => {
    console.log('API status check');
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'API is running'
    });
});

// API request logging middleware
app.use('/api', (req, res, next) => {
    console.log(`${new Date().toISOString()} - API Request: ${req.method} ${req.originalUrl}`);
    
    // Keep track of the original send and json methods
    const originalSend = res.send;
    const originalJson = res.json;
    
    // Override send
    res.send = function(body) {
        console.log(`API Response: ${res.statusCode} - ${typeof body === 'string' ? body.substring(0, 100) : '[Object]'}`);
        return originalSend.call(this, body);
    };
    
    // Override json
    res.json = function(obj) {
        const objString = JSON.stringify(obj).substring(0, 100);
        console.log(`API Response: ${res.statusCode} - ${objString}${objString.length === 100 ? '...' : ''}`);
        return originalJson.call(this, obj);
    };
    
    next();
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/blog', (req, res) => {
    res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/add-post', (req, res) => {
    res.sendFile(path.join(__dirname, 'add-post.html'));
});

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'blog_platform'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database successfully');
});

// File upload configuration
const uploadDir = path.join(__dirname, 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('Created uploads directory at:', uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validate input
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    try {
        // Check if user already exists
        const [existingUsers] = await db.promise().query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );

        if (existingUsers.length > 0) {
            if (existingUsers[0].email === email) {
                return res.status(400).json({ message: 'Email already registered' });
            }
            if (existingUsers[0].username === username) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: result.insertId,
                username,
                email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error registering user. Please try again later.' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Create blog post
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, content, category } = req.body;
    const userId = req.user.id;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        // Validate input
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const [result] = await db.promise().query(
            'INSERT INTO posts (title, content, category, image_url, user_id) VALUES (?, ?, ?, ?, ?)',
            [title, content, category || 'Uncategorized', imageUrl, userId]
        );

        return res.status(201).json({ 
            message: 'Post created successfully', 
            postId: result.insertId 
        });
    } catch (error) {
        console.error('Error creating post:', error);
        return res.status(500).json({ message: 'Error creating post' });
    }
});

// Get all posts
app.get('/api/posts', async (req, res) => {
    console.log('Received request to /api/posts with URL:', req.url);
    console.log('Request method:', req.method);
    console.log('Request headers:', req.headers);
    
    try {
        const [posts] = await db.promise().query(`
            SELECT p.*, u.username 
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            ORDER BY p.created_at DESC
        `).catch(err => {
            console.error('Database query error:', err);
            // If there's an error with the JOIN (like missing tables), fallback to simpler query
            console.log('Falling back to simpler query without JOIN');
            return db.promise().query('SELECT * FROM posts ORDER BY created_at DESC');
        });

        console.log(`Found ${posts ? posts.length : 0} posts`);
        console.log('First post (if any):', posts && posts.length > 0 ? JSON.stringify(posts[0]).substring(0, 200) + '...' : 'No posts');
        
        // If we have no posts, return an empty array instead of null
        return res.json(posts || []);
    } catch (error) {
        console.error('Error fetching posts:', error);
        // Return an empty array with a 200 status code instead of an error
        // This helps the client handle the case where there are simply no posts yet
        return res.status(200).json([]);
    }
});

// Get user's posts
app.get('/api/posts/user', authenticateToken, async (req, res) => {
    console.log('Received request to /api/posts/user');
    try {
        // Verify user ID exists
        if (!req.user || !req.user.id) {
            console.log('Invalid user token:', req.user);
            return res.status(401).json({ message: 'Invalid authentication token' });
        }
        
        console.log('User ID:', req.user.id);
        
        const [posts] = await db.promise().query(
            `SELECT p.*, u.username 
             FROM posts p 
             JOIN users u ON p.user_id = u.id 
             WHERE p.user_id = ? 
             ORDER BY p.created_at DESC`,
            [req.user.id]
        ).catch(err => {
            console.error('Database query error:', err);
            return [[]]; // Return empty array on error
        });

        console.log(`Found ${posts ? posts.length : 0} posts for user ${req.user.id}`);
        
        return res.json(posts || []);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        return res.status(200).json([]);
    }
});

// Get post by ID
app.get('/api/posts/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    
    try {
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [postId, req.user.id]
        );
        
        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.json(posts[0]);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'Error fetching post' });
    }
});

// Update post with image support
app.put('/api/posts/:id', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, content, category } = req.body;
    const postId = req.params.id;

    try {
        // Check if post belongs to user
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [postId, req.user.id]
        );

        if (posts.length === 0) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }
        
        // Check if new image was uploaded
        if (req.file) {
            const imageUrl = `/uploads/${req.file.filename}`;
            
            await db.promise().query(
                'UPDATE posts SET title = ?, content = ?, category = ?, image_url = ? WHERE id = ?',
                [title, content, category, imageUrl, postId]
            );
        } else {
            // Update without changing the image
            await db.promise().query(
                'UPDATE posts SET title = ?, content = ?, category = ? WHERE id = ?',
                [title, content, category, postId]
            );
        }

        res.json({ message: 'Post updated successfully' });
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ message: 'Error updating post' });
    }
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
    const postId = req.params.id;

    try {
        // Check if post belongs to user
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ? AND user_id = ?',
            [postId, req.user.id]
        );

        if (posts.length === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await db.promise().query('DELETE FROM posts WHERE id = ?', [postId]);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// Add API endpoint for comments
app.post('/api/comments', authenticateToken, async (req, res) => {
    const { content, post_id } = req.body;
    const userId = req.user.id;

    if (!content || !post_id) {
        return res.status(400).json({ message: 'Comment content and post ID are required' });
    }

    try {
        const [result] = await db.promise().query(
            'INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)',
            [content, userId, post_id]
        );

        res.status(201).json({ 
            message: 'Comment added successfully',
            commentId: result.insertId
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// Get comments for a post
app.get('/api/posts/:id/comments', async (req, res) => {
    const postId = req.params.id;

    try {
        const [comments] = await db.promise().query(`
            SELECT c.*, u.username
            FROM comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.post_id = ?
            ORDER BY c.created_at DESC
        `, [postId]);

        res.json(comments);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Delete comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
    const commentId = req.params.id;

    try {
        // Check if comment belongs to user
        const [comments] = await db.promise().query(
            'SELECT * FROM comments WHERE id = ? AND user_id = ?',
            [commentId, req.user.id]
        );

        if (comments.length === 0) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        await db.promise().query('DELETE FROM comments WHERE id = ?', [commentId]);

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Error deleting comment' });
    }
});

// Like a post
app.post('/api/posts/:id/like', authenticateToken, async (req, res) => {
    const postId = req.params.id;
    const userId = req.user.id;

    try {
        // Check if post exists
        const [posts] = await db.promise().query(
            'SELECT * FROM posts WHERE id = ?',
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user has already liked the post
        const [existingLikes] = await db.promise().query(
            'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existingLikes.length > 0) {
            // User has already liked the post, so unlike it (remove the like)
            await db.promise().query(
                'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
            return res.json({ 
                message: 'Post unliked successfully',
                liked: false
            });
        }

        // Add new like
        await db.promise().query(
            'INSERT INTO likes (post_id, user_id) VALUES (?, ?)',
            [postId, userId]
        );

        res.status(201).json({ 
            message: 'Post liked successfully',
            liked: true
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Error processing like' });
    }
});

// Get like status and count for a post
app.get('/api/posts/:id/likes', async (req, res) => {
    const postId = req.params.id;
    let userId = null;
    
    // Check if user is authenticated
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
        try {
            // Verify token and extract user id
            const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            userId = user.id;
        } catch (err) {
            console.log('Invalid token in likes request:', err.message);
            // Continue with userId as null
        }
    }

    try {
        // Get total like count
        const [likeCount] = await db.promise().query(
            'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
            [postId]
        );

        // Check if current user has liked the post
        let userLiked = false;
        if (userId) {
            const [userLike] = await db.promise().query(
                'SELECT * FROM likes WHERE post_id = ? AND user_id = ?',
                [postId, userId]
            );
            userLiked = userLike.length > 0;
        }

        res.json({
            count: likeCount[0].count,
            userLiked: userLiked
        });
    } catch (error) {
        console.error('Error getting like information:', error);
        res.status(500).json({ message: 'Error getting like information' });
    }
});

// Catch-all for API routes - returns 404 with JSON for any unmatched API routes
app.all('/api/*', (req, res) => {
    console.log('404 for API route:', req.path);
    res.status(404).json({ 
        message: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Catch-all for HTML pages - returns index.html for any unmatched routes
// This enables client-side routing to work properly
app.get('*', (req, res) => {
    // If the request accepts HTML, send the index page
    if (req.accepts('html')) {
        console.log('Serving index.html for path:', req.path);
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        // Otherwise send 404
        res.status(404).send('Not found');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 