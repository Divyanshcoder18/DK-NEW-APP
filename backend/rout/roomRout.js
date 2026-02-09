import express from "express";
import protectedRout from "../middleware/isLogin.js";
import {
    createRoom,
    getRoomList,
    joinRoom,
    leaveRoom,
    getRoomDetails,
    getRoomMessages,
    deleteRoom,
    addMemberToRoom,
    getPublicRooms
} from "../routControlers/roomroutControler.js";
const router = express.Router();
// All routes require authentication
router.post("/create", protectedRout, createRoom);
router.get("/list", protectedRout, getRoomList);
router.get("/public", protectedRout, getPublicRooms);
router.post("/join/:roomId", protectedRout, joinRoom);
router.post("/leave/:roomId", protectedRout, leaveRoom);
router.get("/:roomId", protectedRout, getRoomDetails);
router.get("/:roomId/messages", protectedRout, getRoomMessages);
router.delete("/:roomId", protectedRout, deleteRoom);
router.post("/:roomId/add-member", protectedRout, addMemberToRoom);
export default router;


