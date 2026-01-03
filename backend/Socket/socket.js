/*import {Server} from 'socket.io';
import http from 'http';
import express from 'express';

const app = express();

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
       origin:['https://slrtech-chatapp.onrender.com'],
    // origin:[ "http://localhost:3000"] , 
        methods:["GET","POST"]
    }
});

export const getReciverSocketId = (receverId)=>{
    return userSocketmap[receverId];
};

const userSocketmap={}; //{userId,socketId}
io.on('connection',(socket)=>{
    const userId = socket.handshake.query.userId;

    if(userId !== "undefine") userSocketmap[userId] = socket.id;
    io.emit("getOnlineUsers",Object.keys(userSocketmap))

    socket.on('disconnect',()=>{
        delete userSocketmap[userId],
        io.emit('getOnlineUsers',Object.keys(userSocketmap))
    });
});

export {app , io , server}
*/
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "https://divyansh-chat-app-tkuh.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

const userSocketMap = {}; // userId -> socket.id

export const getReciverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Redis setup
async function startRedis() {
  const pubClient = createClient({
    url: "redis://localhost:6379",
  });

  const subClient = pubClient.duplicate();

  await pubClient.connect();
  await subClient.connect();

  console.log("✅ Redis connected");

  io.adapter(createAdapter(pubClient, subClient));
}

// Call Redis setup
startRedis().catch((err) => {
  console.error("❌ Redis connection failed:", err);
});

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  console.log("🔥 User connected:", socket.id, "UserId:", userId);

  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 📩 LISTEN FOR MESSAGE FROM SENDER
  socket.on("sendMessage", (data) => {
    console.log("📩 Received sendMessage:", data);

    const receiverSocketId = userSocketMap[data.receiverId];

    console.log("➡️ Receiver socket:", receiverSocketId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", data);
      console.log("📨 Forwarded to receiver:", receiverSocketId);
    }
  });

  // ❌ USER DISCONNECTED
  socket.on("disconnect", () => {
    console.log("⚠️ User disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, io, server };