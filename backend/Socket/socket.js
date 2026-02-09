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
    origin: "http://localhost:5173",  // Only for local development
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

// Redis setup (OPTIONAL - only needed for scaling across multiple servers)
async function startRedis() {
  try {
    const pubClient = createClient({
      url: "redis://localhost:6379",
    });

    const subClient = pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    console.log("✅ Redis connected - Using Redis adapter for horizontal scaling");

    io.adapter(createAdapter(pubClient, subClient));
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    console.log("⚠️  Running without Redis - This is OK for local testing!");
    console.log("💡 For production scaling, install and start Redis server");
  }
}

// Try to connect to Redis (won't crash if it fails)
startRedis();

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
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);
    console.log(`👋 User ${userId} joined room ${roomId}`);

  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    console.log(`👋 User ${userId} left room ${roomId}`);
  });
  socket.on("room-message", (data) => { // listens for room message // frontend must use: socket.emit("room-message", data);
    const { message, roomId } = data;
    io.to(roomId).emit("new-room-message", data);
    console.log(`📨 Message sent to room ${roomId}`);
  });

  socket.on("call-user", ({ to, callType, channelName, callerName }) => {
    console.log(`📞 ${callType} call initiated from ${userId} to ${to}`);

    const receiverSocketId = userSocketMap[to];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incoming-call", {
        from: userId,
        callType,
        channelName,
        callerName
      });
      console.log(`🔔 Incoming call notification sent to ${to}`);
    }
  });

  // User accepts the call
  socket.on("accept-call", ({ to, channelName }) => {
    console.log(`✅ Call accepted by ${userId}, notifying ${to}`);

    const callerSocketId = userSocketMap[to];

    /*
    Take the user ID stored in to (e.g., "Alice_UserID_123")
    Look it up in the userSocketMap object
    Get their socket connection ID (e.g., "socket_abc_connection")
    Store it in the variable callerSocketId  
    */

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-accepted", {
        from: userId,
        channelName
      });
      console.log(`✅ Call acceptance sent to ${to}`);
    }
  });
  // User rejects the call
  socket.on("reject-call", ({ to }) => {
    console.log(`❌ Call rejected by ${userId}, notifying ${to}`);

    const callerSocketId = userSocketMap[to];

    if (callerSocketId) {
      io.to(callerSocketId).emit("call-rejected", {
        from: userId
      });
      console.log(`❌ Call rejection sent to ${to}`);
    }
  });
  // User ends the call
  socket.on("end-call", ({ to }) => {
    console.log(`📴 Call ended by ${userId}, notifying ${to}`);

    const otherUserSocketId = userSocketMap[to];

    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("call-ended", {
        from: userId
      });
      console.log(`📴 Call ended notification sent to ${to}`);
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