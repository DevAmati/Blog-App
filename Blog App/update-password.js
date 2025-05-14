const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
    try {
        // Create a new hashed password
        const newPassword = 'password123';
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        console.log('Generated new hashed password');
        
        // Connect to database
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'blog_platform'
        });
        
        console.log('Connected to database');
        
        // Update user's password
        const [result] = await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            [hashedPassword, 'cozmorry@gmail.com']
        );
        
        console.log(`Password updated for cozmorry@gmail.com to "password123"`);
        console.log(`Rows affected: ${result.affectedRows}`);
        
        // Close connection
        await connection.end();
    } catch (error) {
        console.error('Error updating password:', error);
    }
}

// Run the update function
updatePassword(); 