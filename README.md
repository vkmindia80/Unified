# Enterprise Unified Communication & Gamification System 🚀

A best-in-class enterprise platform that combines **real-time communication** with **gamification** to boost employee engagement and productivity.

## ✨ Features

### 🗨️ Communication
- **Real-time Chat**: 1-on-1 and group messaging
- **Video & Voice Calls**: WebRTC-powered video conferencing (UI ready)
- **File Sharing**: Share documents and media with your team
- **Screen Sharing**: Collaborate effectively (planned)

### 🎮 Gamification
- **Points System**: Earn points for every activity
- **Leaderboards**: Compete with colleagues and climb the ranks
- **Achievements**: Unlock badges and showcase your accomplishments
- **Challenges**: Complete quests for bonus rewards
- **Rewards Store**: Redeem points for real-world rewards

### 👥 User Management
- **Multiple Roles**: Admin, Manager, Employee, Team Lead, Department Head
- **JWT Authentication**: Secure login and session management
- **User Profiles**: Track progress, points, and level
- **Status Management**: Online/Offline/Away indicators

## 🛠 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Secure authentication
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - Modern UI library
- **Vite** - Next-generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication

### Infrastructure
- **MongoDB** - Database server
- **Supervisor** - Process management
- **Kubernetes-ready** - Production deployment

## 📁 Project Structure

```
/app
├── backend/                 # FastAPI backend
│   ├── server.py           # Main API application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend environment variables
├── ROADMAP.md            # Development roadmap
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- Yarn package manager

### Installation

1. **Clone the repository** (if needed)
```bash
cd /app
```

2. **Install backend dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Install frontend dependencies**
```bash
cd ../frontend
yarn install
```

4. **Start services**
```bash
# Start all services with supervisor
sudo supervisorctl restart all

# Or start individually:
# Backend
cd /app/backend
python -m uvicorn server:socket_app --host 0.0.0.0 --port 8001 --reload

# Frontend
cd /app/frontend
yarn dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 📖 Usage

### Creating an Account
1. Navigate to the registration page
2. Fill in your details (username, email, password, role, department, team)
3. Click "Create Account"
4. You'll automatically receive 50 welcome points!

### Earning Points
- **Send messages**: +5 points per message
- **Video calls**: +20 points per call
- **Complete challenges**: Up to +500 points
- **Unlock achievements**: Bonus points
- **Daily login**: +10 points

### Using Features

#### Chat
- Click "Chat & Communication" from the dashboard
- Start a new chat or select an existing conversation
- Send messages, create group chats
- (Video/voice calls UI ready, WebRTC integration pending)

#### Leaderboard
- View top performers with podium display
- See your rank and points
- Filter by department or team
- Track weekly, monthly, or all-time standings

#### Achievements
- Browse available achievements
- Track your progress
- Unlock badges by completing activities
- Showcase achievements on your profile

#### Challenges
- View active challenges
- Track progress toward goals
- Complete challenges for bonus points
- Filter by difficulty (Easy, Medium, Hard)

#### Rewards
- Browse the rewards catalog
- Redeem points for real rewards
- Track redemption history
- Check your point balance

## 🎯 Gamification Rules

### Points System
| Activity | Points |
|----------|--------|
| Account Creation | +50 |
| Message Sent | +5 |
| Video Call Attended | +20 |
| File Shared | +10 |
| Challenge Completed | +50-500 |
| Achievement Unlocked | Varies |

### Level System
- Level = Points ÷ 100 + 1
- Each 100 points = 1 level up
- Display level on profile and leaderboard

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user details

### Chat
- `POST /api/chats` - Create new chat
- `GET /api/chats` - Get user's chats
- `GET /api/chats/{id}/messages` - Get chat messages

### Gamification
- `GET /api/leaderboard` - Get leaderboard
- `GET /api/achievements` - Get all achievements
- `GET /api/my-achievements` - Get user's achievements
- `GET /api/challenges` - Get active challenges
- `GET /api/rewards` - Get available rewards

## 🎨 UI Components

### Design System
- **Primary Colors**: Blue gradient (500-600)
- **Secondary Colors**: Purple gradient (500-600)
- **Success**: Green (500)
- **Warning**: Yellow (500)
- **Error**: Red (500)

### Key Components
- Authentication forms with gradient backgrounds
- Dashboard with stats cards
- Chat interface with message bubbles
- Leaderboard with podium visualization
- Achievement cards with unlock status
- Challenge cards with progress bars
- Reward cards with redemption interface

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017/enterprise_comms
JWT_SECRET_KEY=your-super-secret-jwt-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FILE_UPLOAD_MAX_SIZE=10485760
FILE_UPLOAD_DIR=/app/backend/uploads
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📊 Current Status

### ✅ Completed
- User authentication (JWT)
- User roles and permissions
- Chat interface (UI)
- Leaderboard system
- Achievements system
- Challenges system
- Rewards store
- Points calculation
- Level progression

### 🔄 In Progress
- Real-time WebSocket integration
- File upload backend
- Admin dashboard

### 📋 Planned
- WebRTC video/voice calls
- Screen sharing
- Google OAuth integration
- Push notifications
- Mobile responsive design
- Analytics dashboard
- Email notifications

## 🤝 Contributing

This is an enterprise internal platform. For feature requests or bug reports, please contact the development team.

## 📝 License

Proprietary - Internal Use Only

## 👥 Team Roles

### Admin
- Full system access
- User management
- Configure gamification rules
- Create challenges and rewards
- Access analytics

### Manager
- Team oversight
- View team performance
- Assign challenges
- Approve rewards

### Employee
- Use all communication features
- Participate in gamification
- Earn points and rewards
- View leaderboards

### Team Lead
- Team communication
- Monitor team engagement
- Create team challenges

### Department Head
- Department-wide access
- Department analytics
- Cross-team collaboration

## 📞 Support

For technical support or questions:
- Check the roadmap: `ROADMAP.md`
- Review API documentation: http://localhost:8001/docs
- Contact system administrator

---

**Built with ❤️ for enterprise teams**

*Version 1.0.0 - August 2025*
