const mysql = require('mysql2');
const fs = require('fs');

// Create connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '',
  database: 'blog_platform',
  multipleStatements: true // Allow multiple statements
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
  
  // SQL for creating likes table
  const sql = `
  -- Ensure we're using the correct database
  USE blog_platform;
  
  -- Drop the table if it exists
  DROP TABLE IF EXISTS likes;
  
  -- Create the likes table
  CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id)
  );`;
  
  // Execute SQL
  connection.query(sql, (err, result) => {
    if (err) {
      console.error('Error creating likes table:', err);
    } else {
      console.log('Likes table created successfully!');
    }
    
    // Close connection
    connection.end();
  });
}); 