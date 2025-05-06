# Project Management System

A full-stack project management system built with Node.js, React, and Prisma. The system includes features for project tracking, team collaboration, task management, and audit logging.

## Features

- **Project Management**
  - Create, update, and delete projects
  - Assign teams and managers to projects
  - Track project progress and deadlines

- **Team Collaboration**
  - Team creation and management
  - Role-based access control (Admin, Manager, User)
  - Team invitations and member management

- **Task Management**
  - Create and assign tasks
  - Track task status and progress
  - Task comments and notifications
  - Recurring tasks support

- **Audit Logging**
  - Comprehensive activity tracking
  - Log rotation and compression
  - Searchable audit history

- **Security**
  - JWT-based authentication
  - Role-based authorization
  - Secure password handling

## Tech Stack

### Backend
- Node.js
- Express.js
- Prisma (ORM)
- PostgreSQL
- WebSocket (Socket.io)
- Winston (Logging)
- Jest (Testing)

### Frontend
- React
- Redux Toolkit (State Management)
- Material-UI (Component Library)
- RTK Query (API Integration)
- Tailwind CSS

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd project-management
```

2. Install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# In server directory
cp .env.example .env
# Update .env with your database credentials and JWT secret

# In client directory
cp .env.example .env
# Update .env with your API URL
```

4. Set up the database
```bash
# In server directory
npx prisma migrate dev
npx prisma db seed
```

5. Start the development servers
```bash
# Start backend server (from server directory)
npm run dev

# Start frontend server (from client directory)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Documentation: http://localhost:8000/api-docs

## API Documentation

The API documentation is available through Swagger UI at `/api-docs` endpoint when running the server. It includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Example requests

## Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
