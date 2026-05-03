# 📋 Team Task Manager

A full-stack web application for managing projects and tasks in teams. Admins create projects and assign tasks to team members, while members track their work progress and update task statuses. Built with React, Node.js, Express, and MongoDB.

## 🎯 Features

- **User Authentication**: Secure signup/login with JWT tokens and password hashing
- **Role-Based Access**: Admin and Member roles with different permissions
- **Project Management**: Create, edit, and manage projects with team members
- **Task Management**: Create tasks, assign to team members, set priorities and due dates
- **Dashboard**: Real-time analytics showing task statistics, completion rates, and overdue tasks
- **Task Tracking**: Filter and view tasks by status, priority, and project
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- Express-validator for input validation

**Frontend:**
- React 18 with React Router
- Vite for fast bundling
- Axios for API requests
- Date-fns for date utilities
- React Hot Toast for notifications

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

4. Install dependencies:
```bash
npm install
```

5. Start the server:
```bash
npm start          # Production
npm run dev        # Development with hot reload
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Install dependencies:
```bash
npm install
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGO_URI | MongoDB connection string | mongodb://... |
| JWT_SECRET | Secret key for JWT signing (min 32 chars) | abc123... |
| JWT_EXPIRES_IN | JWT token expiration time | 7d |
| CLIENT_URL | Frontend URL for CORS | http://localhost:5173 |

### Frontend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API base URL | http://localhost:5000/api |

## 🚀 Deployment on Railway

### Backend Deployment

1. Push your project to GitHub
2. Go to [Railway.app](https://railway.app) and sign up
3. Create a new project and select your GitHub repository
4. Add environment variables in Railway:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A strong random string (min 32 characters)
   - `CLIENT_URL`: Your deployed frontend URL
   - `PORT`: Leave empty for Railway's default

5. Railway automatically detects Node.js and runs `npm start`
6. Copy the deployed URL (e.g., `https://your-project.railway.app`)

### Frontend Deployment

1. Create a new Railway project
2. Select your GitHub repository
3. Add environment variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g., `https://backend-project.railway.app/api`)

4. Railway detects Vite and runs `npm run build` → `npm run preview`
5. Your frontend will be available at Railway's assigned URL

## 💡 Usage

### For Admins
1. Sign up with any email and select "Admin"
2. Create projects and invite team members
3. Create tasks and assign them to members
4. Track project progress from the dashboard

### For Members
1. Sign up with any email and select "Member"
2. View assigned tasks on the dashboard
3. Update task status (Pending → In Progress → Completed)
4. Track personal task completion

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Projects (Admin only)
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task (Admin only)
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task (Admin only)

### Dashboard
- `GET /api/dashboard` - Get statistics and recent tasks

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth and validation middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── .env             # Environment variables
│   ├── .env.example     # Example env file
│   ├── server.js        # Express server
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/         # Axios configuration
    │   ├── components/  # Reusable React components
    │   ├── context/     # React Context (Auth state)
    │   ├── pages/       # Page components
    │   ├── App.jsx      # Main router
    │   ├── index.css    # Global styles
    │   └── main.jsx     # Entry point
    ├── .env             # Environment variables
    ├── .env.example     # Example env file
    ├── vite.config.js   # Vite configuration
    └── package.json
```

## 🔐 Security

- **Password Hashing**: Passwords are hashed using bcryptjs before storage
- **JWT Authentication**: Tokens are securely generated and validated
- **CORS Configuration**: Configured to accept requests only from authorized frontend
- **Input Validation**: All inputs are validated using express-validator
- **Protected Routes**: Sensitive endpoints require authentication

## 🧪 Testing

### Test Admin Features
1. Sign up with `Admin` role
2. Create a project "Q1 Planning"
3. Add team members to project
4. Create tasks and assign to members

### Test Member Features
1. Sign up with `Member` role
2. Check dashboard for assigned tasks
3. Update task status to "In Progress"
4. Complete and mark as done

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| 500 error on signup | Check MongoDB connection and ensure .env is configured |
| CORS error | Verify `CLIENT_URL` in backend .env matches frontend URL |
| API calls fail | Ensure backend is running on port 5000 |
| Frontend shows blank page | Check browser console for errors and verify API_URL |

## 📝 License

This project is available for educational and personal use.

## 👨‍💻 Author

Created as a full-stack MERN project. Feel free to fork, modify, and deploy!

---

**Last Updated:** May 2026

For questions or issues, please check the code comments or create an issue on GitHub.
