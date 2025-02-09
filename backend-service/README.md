Node.js Backend for MEV Logging

📌 Project Description

This is a Node.js backend for handling user authentication and MEV (Maximal Extractable Value) transaction logs. It uses PostgreSQL for database management and follows a modular architecture for maintainability.

📁 Project Structure

/Backend-services
│── /config
│   ├── db.js          # Database configuration
│   ├── env.js         # Environment variables setup
│── /models
│   ├── User.js        # User model
│   ├── MevLog.js      # MEV Log model
│── /middlewares
│   ├── auth.js        # Authentication middleware
│── /routes
│   ├── authRoutes.js  # User authentication routes
│   ├── mevLogRoutes.js # MEV log routes
│── /controllers
│   ├── authController.js  # Authentication controller
│   ├── mevLogController.js # MEV log controller
│── server.js         # Main server file
│── .env              # Environment variables file
│── package.json      # Dependencies and scripts

🛠 Technologies Used

Node.js - Backend framework
Express.js - Server framework
PostgreSQL - Database
JWT - Token-based authentication
bcrypt - Password hashing
Helmet & CORS - Security enhancements

📦 Installation Guide

1️⃣ Clone the repository:

git clone https://github.com/.git
cd Backend-services

2️⃣ Install dependencies:

npm install

3️⃣ Setup Environment Variables:

Create a .env file in the root directory and add:

PORT=5000
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=5432

4️⃣ Start the server:

npm server.js

Server runs on http://localhost:5000

🔐 API Endpoints

Authentication

Method  Endpoint    Description

POST    /register   Register a new user
POST    /login      User login (returns JWT token)

MEV Logs (Requires API Key Authentication)

Method  Endpoint    Description

GET     /logs       Fetch all MEV logs
POST    /logs       Add a new MEV log

✅ Features

✔️ User authentication (JWT-based login & password hashing)✔️ API key-based authentication for secure access✔️ PostgreSQL database integration with automatic table creation✔️ Modular architecture for better maintainability✔️ Security enhancements with CORS & Helmet
