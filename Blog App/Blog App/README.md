# Multi-User Blog Platform

A modern multi-user blog platform with user authentication, post creation, and management features.

## Features

- User registration and authentication
- Create, edit, and delete blog posts
- View posts from all users
- Responsive design for all devices
- Search functionality for posts

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MySQL
- Authentication: JWT tokens, bcrypt for password hashing

## How to Run the Application

### Prerequisites

- Node.js installed
- MySQL server installed and running

### Setup

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a MySQL database named `blog_platform`
   - Import the schema using the `schema.sql` file:
     ```
     mysql -u root -p blog_platform < schema.sql
     ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=blog_platform
   JWT_SECRET=your_secret_key
   PORT=3000
   ```

### Running the Application

1. Start the development server with automatic restart on file changes:
   ```
   npm run dev
   ```

2. Or run in production mode:
   ```
   npm start
   ```

3. Access the application in your browser:
   ```
   http://localhost:3000
   ```

## Usage

1. Register for a new account or login with existing credentials
2. Browse blog posts from the home or blog pages
3. Create new posts, edit or delete your existing posts
4. Search for specific topics using the search function

## Note for Development

The home page (index.html) is for non-authenticated users.
The dashboard (home.html) is for authenticated users only.
