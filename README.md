# Team Task Manager

A full-stack task management app for teams. Admins can create projects and assign tasks, members track their work. Built with React, Node.js, Express, and MongoDB.

## Features

- User auth with JWT + password hashing
- Admin and Member roles with different perms
- Create projects and manage team tasks
- Task assignment, priority levels, due dates
- Dashboard with task stats and completion tracking
- Filter tasks by status, priority, project
- Mobile responsive

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- JWT auth
- bcryptjs for passwords
- Express-validator

**Frontend:**
- React 18 + React Router
- Vite
- Axios
- Date-fns
- React Hot Toast

## Getting Started

### Requirements
- Node.js (v16+)
- MongoDB (Atlas or local)
- npm/yarn

### Backend

```bash
cd team-task-manager
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Runs on `http://localhost:5173`

## Environment Variables

### Backend

```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend

```env
VITE_API_URL=http://localhost:5000/api
```

## Deployment

### Railway Backend

1. Push to GitHub
2. Connect repo to Railway
3. Set the backend root directory to the folder that contains `server.js`
4. Add these Railway Variables exactly:
   - `MONGO_URI` - MongoDB Atlas connection string
   - `JWT_SECRET` - Long random secret, at least 32 characters
   - `JWT_EXPIRES_IN=7d`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://team-task-manager-kappa-five.vercel.app`
5. Deploy automatically on push

Important: Railway does not use your local `.env` or `.env.production` file unless you manually add those values in Railway Variables. If `JWT_SECRET` is missing, the backend exits during startup and the browser may show a misleading CORS error because requests never reach Express.

After deploy, verify the backend URL directly:

```text
https://your-railway-domain.up.railway.app/api/health
```

Expected response:

```json
{"status":"ok","service":"team-task-manager-api","environment":"production"}
```

### Vercel Frontend

1. Connect the `frontend` folder to Vercel
2. Set env var:
   - `VITE_API_URL=https://your-railway-domain.up.railway.app/api`
3. Deploy

Important: Vite bakes `VITE_API_URL` into the production JavaScript bundle. If you change the Railway backend domain, redeploy Vercel after updating this variable.

## How to Use

**Admin:**
- Sign up as Admin
- Create projects
- Assign tasks to team members
- View dashboard stats

**Members:**
- Sign up as Member
- See your assigned tasks
- Update task status
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
