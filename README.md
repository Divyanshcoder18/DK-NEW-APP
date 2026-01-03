# 💬 Real-Time Chat Application with Video Calling

A modern, full-stack chat application built with the MERN stack (MongoDB, Express, React, Node.js) featuring real-time messaging, file sharing, and video/voice calling capabilities powered by Agora.

## ✨ Features

### 🔐 **Authentication**
- User registration and login
- JWT-based authentication
- Password hashing with bcrypt

### 💬 **Real-Time Messaging**
- Instant messaging with Socket.IO
- Message history
- Online/offline status indicators
- Read receipts

### 📎 **File Sharing**
- Upload and share images
- Share documents (PDF, DOC, DOCX)
- File preview for images
- Download links for documents

### 📞 **Video & Voice Calling**
- One-on-one video calls
- Voice-only calls
- Real-time video/audio streaming with Agora
- Call controls (mute, camera toggle, end call)
- Incoming call notifications
- Call accept/reject functionality

### 🎨 **Modern UI**
- Beautiful dark-themed interface
- Responsive design (mobile & desktop)
- Smooth animations and transitions
- Glassmorphism effects

---

## 🛠️ Tech Stack

### **Frontend**
- ⚛️ React 18
- 🎨 Tailwind CSS
- 🔌 Socket.IO Client
- 📹 Agora RTC SDK
- 🔄 Axios
- 🎯 React Router DOM
- 🍞 React Toastify
- 🎭 React Icons

### **Backend**
- 🟢 Node.js
- ⚡ Express.js
- 🔌 Socket.IO
- 🍃 MongoDB with Mongoose
- 🔐 JWT & bcrypt
- 📹 Agora Access Token
- 📤 Multer (file uploads)
- 🔒 Cookie Parser

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Agora Account ([Sign up here](https://console.agora.io))

### **Installation**

#### 1️⃣ **Clone the repository**
```bash
git clone <your-repo-url>
cd Chat-app-1
```

#### 2️⃣ **Backend Setup**

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env` and add your credentials:
```env
PORT=3000
MONGODB_CONNECT=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
SECURE=development
```

**Get Agora Credentials:**
1. Go to [Agora Console](https://console.agora.io)
2. Create a new project
3. Copy your App ID and App Certificate
4. Paste them in your `.env` file

```bash
# Start backend server
npm start
```
Backend runs on `http://localhost:3000`

#### 3️⃣ **Frontend Setup**

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
Chat-app-1/
├── backend/
│   ├── DB/              # Database connection
│   ├── Models/          # Mongoose schemas
│   │   ├── userSchema.js
│   │   ├── messageSchema.js
│   │   └── callSchema.js
│   ├── Socket/          # Socket.IO configuration
│   ├── middleware/      # Auth middleware
│   ├── rout/            # API routes
│   ├── routControlers/  # Route controllers
│   ├── utils/           # Utility functions
│   ├── uploads/         # User uploaded files
│   ├── .env             # Environment variables (not in Git)
│   ├── .env.example     # Example env file
│   └── index.js         # Server entry point
│
└── frontend/
    ├── src/
    │   ├── home/
    │   │   ├── components/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── MessageContainer.jsx
    │   │   │   ├── IncomingCallModal.jsx
    │   │   │   └── ActiveCallScreen.jsx
    │   │   └── Home.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── SocketContext.jsx
    │   │   └── CallContext.jsx
    │   ├── login/
    │   ├── register/
    │   └── App.jsx
    └── package.json
```

---

## 🎮 Usage

### **1. Register an Account**
- Navigate to `/register`
- Create a new account with username, email, and password

### **2. Login**
- Use your credentials to login
- You'll be redirected to the chat interface

### **3. Start Chatting**
- Select a user from the sidebar
- Type messages in the input field
- Upload files using the attachment button 📎

### **4. Make Calls**
- Click the **phone icon** 📞 for voice call
- Click the **camera icon** 📹 for video call
- Wait for the other user to accept
- Use controls to mute, toggle camera, or end call

---

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Environment variables for sensitive data
- ✅ CORS configuration
- ✅ Input validation

---

## 🎨 UI Features

- 🌙 Dark mode design
- 📱 Fully responsive (mobile, tablet, desktop)
- ✨ Smooth animations
- 🎭 Modern icons (React Icons)
- 🖼️ Image previews
- 🔔 Toast notifications
- 💬 Real-time typing indicators

---

## 📝 API Endpoints

### **Authentication**
```
POST /api/auth/register    # Register new user
POST /api/auth/login       # Login user
POST /api/auth/logout      # Logout user
GET  /api/auth/me          # Get current user
```

### **Messages**
```
GET  /api/message/:userId          # Get messages with user
POST /api/message/send/:userId     # Send text message
POST /api/message/upload/:userId   # Upload file
```

### **Users**
```
GET /api/user              # Get all users (for sidebar)
```

### **Calls**
```
POST /api/call/agora-token # Generate Agora token for call
```

---

## 🔌 Socket Events

### **Client → Server**
- `sendMessage` - Send a message
- `call-user` - Initiate a call
- `accept-call` - Accept incoming call
- `reject-call` - Reject incoming call
- `end-call` - End active call

### **Server → Client**
- `newMessage` - Receive new message
- `incoming-call` - Incoming call notification
- `call-accepted` - Call was accepted
- `call-rejected` - Call was rejected
- `call-ended` - Call was ended

---

## 🧪 Testing

### **Test Video Calls Locally**

**Option 1: Two Different Browsers** (Recommended)
1. Open Chrome at `http://localhost:5173` → Login as User A
2. Open Firefox at `http://localhost:5173` → Login as User B
3. User A calls User B
4. User B accepts
5. Both should see video call screen

**Option 2: Different Devices**
1. Find your computer's IP (run `ipconfig` on Windows)
2. On computer: `http://localhost:5173` → Login as User A
3. On phone: `http://YOUR_IP:5173` → Login as User B
4. Make a call and test!

---

## 🐛 Troubleshooting

### **Camera/Microphone not working**
- Grant browser permissions for camera and microphone
- Check browser settings (Privacy → Camera/Microphone)

### **Call not connecting**
- Verify Agora credentials in `.env` are correct
- Check browser console for errors
- Ensure both users are online and socket connected

### **MongoDB connection failed**
- Check your MongoDB connection string
- For MongoDB Atlas: Whitelist your IP address
- Verify username and password are correct

### **Port already in use**
- Change `PORT` in backend `.env` to a different port
- Kill the process using the port

---

## 📦 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "socket.io": "^4.6.1",
  "mongoose": "^7.0.3",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "multer": "^1.4.5-lts.1",
  "agora-access-token": "^2.0.4",
  "cookie-parser": "^1.4.6",
  "dotenv": "^16.0.3",
  "cors": "^2.8.5"
}
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.11.0",
  "socket.io-client": "^4.6.1",
  "agora-rtc-sdk-ng": "^4.19.0",
  "axios": "^1.4.0",
  "tailwindcss": "^3.3.2",
  "react-toastify": "^9.1.3",
  "react-icons": "^4.8.0"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- [Agora](https://www.agora.io) for video calling SDK
- [Socket.IO](https://socket.io) for real-time communication
- [MongoDB](https://www.mongodb.com) for database
- [Tailwind CSS](https://tailwindcss.com) for styling

---

## 🔮 Future Enhancements

- [ ] Group chat functionality
- [ ] Group video calls
- [ ] Screen sharing
- [ ] Message reactions and emojis
- [ ] User profiles with avatars
- [ ] Call history and logs
- [ ] Push notifications
- [ ] Message encryption
- [ ] Voice messages
- [ ] Status updates

---

Made with ❤️ and lots of ☕
