# MERN Stack Project

This is a full-stack MERN (MongoDB, Express, React, Node.js) project structured with separate folders for the frontend and backend.

## 📁 Project Structure

root/
│
├── backend/ # Node.js + Express + MongoDB
├── frontend/ # React frontend
├── package.json # Root-level scripts


## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

npm run build

Install dependencies in backend/

Install dependencies in frontend/

Build the frontend React app

cd backend
touch .env

PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

npm start

Start the Express backend server

If your backend is configured to serve the frontend build, the full app will be accessible in the browser (usually at http://localhost:5000).

npm run build   # Install dependencies and build frontend
npm start       # Start the backend server

Notes
Make sure MongoDB is running locally or provide a MongoDB Atlas connection string.

Frontend is assumed to be built with Vite or CRA.

Adjust the server code to serve frontend static files from the correct build folder if needed.
