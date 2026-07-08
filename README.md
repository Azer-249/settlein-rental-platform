# SettleIn

SettleIn is a rental matching web application that helps renters find suitable homes and helps property owners manage and share their listings.

## Tech Stack

Frontend: React, Vite  
Backend: Node.js, Express  
Database: MongoDB  
Other services: Cloudinary for image uploads

## How to Run the Project

First, clone the repository:

```bash
git clone <repository-link>
cd settleIn
```

To run the backend, go into the server folder:

```bash
cd server
npm install
```

Create a `.env` file inside the server folder and add the following values:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Then start the backend:

```bash
npm run dev
```

The backend will run on:

```text
http://localhost:5000
```

To run the frontend, open a new terminal and go into the frontend folder:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend folder and add the backend URL:

```env
VITE_API_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

## Backend Connection

The frontend connects to the backend using the `VITE_API_URL` environment variable. Make sure this value matches the backend server URL.

Example:

```env
VITE_API_URL=http://localhost:5000
```

## Team

Zeynep - Frontend  
Azer - Backend
