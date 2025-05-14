const fetch = require('node-fetch');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Test API endpoints
async function testAPI() {
    console.log('Testing API connectivity...');
    
    try {
        // Test status endpoint
        console.log('\n--- Testing /api/status endpoint ---');
        const statusResponse = await fetch('http://localhost:3000/api/status');
        console.log('Status code:', statusResponse.status);
        const statusData = await statusResponse.json();
        console.log('Response:', statusData);
        
        // Test posts endpoint
        console.log('\n--- Testing /api/posts endpoint ---');
        const postsResponse = await fetch('http://localhost:3000/api/posts');
        console.log('Status code:', postsResponse.status);
        const postsText = await postsResponse.text();
        console.log('Response text:', postsText);
        try {
            const postsData = JSON.parse(postsText);
            console.log('Parsed posts:', postsData.length);
        } catch (err) {
            console.error('Failed to parse JSON:', err);
        }
        
        console.log('\nAPI tests completed.');
    } catch (error) {
        console.error('API test failed:', error.message);
    }
}

// Test database connection
async function testDatabase() {
    console.log('\nTesting database connectivity...');
    
    try {
        // Create connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blog_platform'
        });
        
        console.log('Database connection successful');
        
        // Check tables
        console.log('\n--- Checking database tables ---');
        const [tables] = await connection.query('SHOW TABLES');
        console.log('Tables in database:');
        tables.forEach(table => {
            console.log('- ' + Object.values(table)[0]);
        });
        
        // Try to read posts
        console.log('\n--- Checking posts table ---');
        const [posts] = await connection.query('SELECT COUNT(*) as count FROM posts').catch(err => {
            console.error('Error querying posts table:', err.message);
            return [[{ count: 'Error' }]];
        });
        console.log('Posts count:', posts[0].count);
        
        // Check for users
        console.log('\n--- Checking users table ---');
        const [users] = await connection.query('SELECT COUNT(*) as count FROM users').catch(err => {
            console.error('Error querying users table:', err.message);
            return [[{ count: 'Error' }]];
        });
        console.log('Users count:', users[0].count);
        
        // Close connection
        await connection.end();
        console.log('\nDatabase tests completed.');
    } catch (error) {
        console.error('Database test failed:', error.message);
    }
}

// Run all tests
async function runTests() {
    await testAPI();
    await testDatabase();
}

runTests().catch(console.error); 