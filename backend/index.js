import express from "express";
import dotenv from "dotenv";
import dbConnect from "./DB/dbConnect.js";
import authRouter from "./rout/authUser.js";
import messageRouter from "./rout/messageRout.js";
import userRouter from "./rout/userRout.js";
import callRouter from "./rout/callRout.js";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

import { app, server } from "./Socket/socket.js";

dotenv.config();

const __dirname = path.resolve();

// Allow requests from frontend (both local and production)
const allowedOrigins = [
  "http://localhost:5173",  // Local development
  process.env.FRONTEND_URL  // Production URL from Render
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));


// Middlewares
app.use(express.json());
app.use(cookieParser());

// API ROUTES FIRST (VERY IMPORTANT)
app.use("/api/auth", authRouter);
app.use("/api/message", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/call", callRouter);

// FRONTEND STATIC FILES

//app.use(express.static(path.join(__dirname, "frontend", "dist")));

//app.get(/.*/, (req, res) => {
// res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
//});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  dbConnect();
  console.log(`Working at ${PORT}`);
});


/*import express from "express"
import dotenv from 'dotenv'
import dbConnect from "./DB/dbConnect.js";
import authRouter from  './rout/authUser.js'
import messageRouter from './rout/messageRout.js'
import userRouter from './rout/userRout.js'
import cookieParser from "cookie-parser";
import path from "path";

import {app , server} from './Socket/socket.js'

const __dirname = path.resolve();

dotenv.config();


app.use(express.json());
app.use(cookieParser())

app.use('/api/auth',authRouter)
app.use('/api/message',messageRouter)
app.use('/api/user',userRouter)

app.use(express.static(path.join(__dirname,"/frontend/dist")))

app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"frontend","dist","index.html"))
})

const PORT = process.env.PORT || 3000

server.listen(PORT,()=>{
    dbConnect();
    console.log(`Working at ${PORT}`);
})
    */
/*
import express from 'express';
import dotenv from 'dotenv';
import dbConnect from './DB/dbconnect.js';
import authRouter from './rout/authUser.js';
import messageRouter from './rout/messageRout.js';
import userRouter from './rout/userRout.js';
import cookieParser from "cookie-parser";
import cors from "cors";   // ✅ ADD THIS

dotenv.config();

const app = express();

// ✅ MIDDLEWARES MUST COME FIRST
app.use(cors({
  origin: "http://localhost:5173",  // ✅ Vite frontend
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// ✅ TEST ROUTE
app.get('/', (req, res) => {
  res.send("server working");
});

// ✅ API ROUTES
app.use('/api/auth', authRouter);
app.use('/api/message', messageRouter);
app.use('/api/user', userRouter);

const PORT = process.env.PORT || 3000;

// ✅ CONNECT DB THEN START SERVER
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running at ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err);
  });

*/

