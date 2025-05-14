const mysql = require('mysql2');

// Create a connection to MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: ''
});

// Create database if it doesn't exist
connection.query(`CREATE DATABASE IF NOT EXISTS blog_platform`, (err) => {
    if (err) {
        console.error('Error creating database:', err);
        connection.end();
        return;
    }
    
    console.log('Database created or already exists');
    
    // Switch to the blog_platform database
    connection.query(`USE blog_platform`, (err) => {
        if (err) {
            console.error('Error switching to database:', err);
            connection.end();
            return;
        }
        
        console.log('Using blog_platform database');
        
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        
        connection.query(createUsersTable, (err) => {
            if (err) {
                console.error('Error creating users table:', err);
                connection.end();
                return;
            }
            
            console.log('Users table created or already exists');
            
            // Create posts table
            const createPostsTable = `
                CREATE TABLE IF NOT EXISTS posts (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    category VARCHAR(50),
                    image_url VARCHAR(255),
                    user_id INT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;
            
            connection.query(createPostsTable, (err) => {
                if (err) {
                    console.error('Error creating posts table:', err);
                    connection.end();
                    return;
                }
                
                console.log('Posts table created or already exists');
                
                // Create comments table
                const createCommentsTable = `
                    CREATE TABLE IF NOT EXISTS comments (
                        id INT PRIMARY KEY AUTO_INCREMENT,
                        content TEXT NOT NULL,
                        user_id INT NOT NULL,
                        post_id INT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
                    )
                `;
                
                connection.query(createCommentsTable, (err) => {
                    if (err) {
                        console.error('Error creating comments table:', err);
                    } else {
                        console.log('Comments table created or already exists');
                    }
                    
                    // Check which tables were created
                    connection.query('SHOW TABLES', (err, results) => {
                        if (err) {
                            console.error('Error showing tables:', err);
                        } else {
                            console.log('Tables in blog_platform database:');
                            results.forEach(row => {
                                console.log('- ' + Object.values(row)[0]);
                            });
                        }
                        
                        // Close the connection
                        connection.end();
                        console.log('Database initialization completed');
                    });
                });
            });
        });
    });
}); 