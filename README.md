# Task-Management-Backend (Assignment)

Backend assignment implementation using **Node.js**, **Express**, **MongoDB**, **JWT**, **Role based access**, **Teams**, **Redis (caching)**, **Queue system using BullMQ**, **Socket.io for real-time updates**, **pm2 for clustering, load balancer**, **Twilio Sendgrid** .

## Features

- User registration & login with JWT
- Secure logout using `tokenVersion`
- Role-Based Access: `admin`, `manager`, `user`
- **Teams**
  - `Team` model with `manager` and `users`
  - Admin can create teams and assign a manager
  - Admin/Manager can add members to a team
  - Manager can view their own team (`GET /api/teams/me`)
- Task Management
  - CRUD operations for tasks
  - Tasks linked to `owner` and optional `assignedTo`
  - Search, filtering and sorting by status, priority, due dates, text search
- Task Assignment
  - **Admin**: can assign tasks to any one
  - **Manager**: can assign tasks only to its **team members**
  - **User**: can self-assign its own tasks only
- Analytics
  - `GET /api/tasks/analytics/summary` – completed, pending, overdue
- Caching with Redis
  - Task list endpoint cached per user & query for 60 seconds
  - Simple invalidation after writes using `flushall` (ok for assignment)
- Real-Time Updates with Socket.io
  - Events: `task_created`, `task_updated`, `task_deleted`, `task_assigned`, `email_sent`
- Queue System BULLMQ
  - Implemented queue system for notification service
- Process Manager (pm2)
  - Can start with the process manager in clustering mode 

## 1. Setup

####  Clone the repository
```bash
git clone https://github.com/harshitHash2/task-management-backend-scalable.git
cd task-management-backend-scalable
```

#### Install dependencies

```bash
npm install
```

## 2. Setup Environment Variables
Create a new file or rename env.example to .env `/.env` with:

```env

PORT=4000
MONGO_URI=mongodb://localhost:27017
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=1d
# REDIS CREDENTIALS

REDIS_HOST=your_redis.cloud.redislabs.com
REDIS_PORT=12345
REDIS_USERNAME=default
REDIS_PASSWORD=your_password
REDIS_TLS=false

QUEUE_NAME=task-import-queue
WORKER_CONCURRENCY=1
BATCH_SIZE=20
JOB_ATTEMPTS=3
JOB_BACKOFF_MS=1000
ENABLE_REALTIME=true

# Twilio Send grid API Key
SENDGRID_API_KEY=your_send_grid_API_Key

# For process manager ( if running with npm run dev then keep it false otherwise true)
ENABLE_PM=false
```




## 3. Run the server


Without Process manager (`ENABLE_PM` env variable must be `false` in this case)
```bash
npm run dev
```

With Process manager (`ENABLE_PM` env variable must be `true` in this case)
```bash
pm2 start ecosystem.config.cjs
```


Server: `http://localhost:4000`  
Swagger: `http://localhost:4000/api/docs`

## Main Endpoints

### Auth
- `POST /api/auth/register` - Create USer
- `POST /api/auth/login` - Login User
- `POST /api/auth/logout` - Logout User

### Users
- `GET /api/users/me` - My info

### Teams
- `POST /api/teams` (admin) – create team with manager
- `POST /api/teams/:teamId/add-member` (admin/manager)
- `GET /api/teams/me` (manager) – get manager's team and members

### Tasks
- `POST /api/tasks`
- `GET /api/tasks`
- `PATCH /api/tasks/:id` 
- `DELETE /api/tasks/:id`
- `POST /api/tasks/:id/assign`
- `GET /api/tasks/assigned/me`
- `GET /api/tasks/analytics/summary`

Auth: use Bearer token in `Authorization` header:

```http
Authorization: Bearer <JWT>
```

## Socket.io can be tested with Frontend like

```js
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("task_created", (task) => {
  console.log("Task created:", task);
});

socket.on("email_sent", (task) => {
  console.log("Email sent:", task);
});
```

## Assumptions, Features and Instructions

- Each manager can manages only one team.
- Caching strategy is global flush on change.
- "Twilio Send Grid" is used to send the emails through queue system using BullMQ and spawning a worker for it to process the reuest based on FIFO principal.
- This is structured with controllers, routes, models, middleware, services, utils, workers, queue.
- The project can run in two modes i.e., Dev Mode (`npm run dev`) and Cluster Mode (`pm2 start ecosystem.config.cjs`)
- If Running in dev mode make sure env variable ENABLE_PM must be false and if running in clustering mode then it must be true.
