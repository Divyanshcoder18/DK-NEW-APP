import Room from "../Models/roomSchema.js";
import Message from "../Models/messageSchema.js";
import User from "../Models/userModels.js";

export const createRoom = async (req, res) => {
    try {
        const { name, description, roomType } = req.body;
        const userId = req.user._id;
        if (!name) {
            return res.status(400).json({ error: "Room name is required" });
        }
        const newRoom = new Room({
            name,
            description: description || "",
            roomType: roomType || "public",
            admin: userId,
            members: [userId]
        });
        await newRoom.save();
        await newRoom.populate("admin", "username profilepic");
        res.status(201).json({
            success: true,
            room: newRoom
        });
    } catch (error) {
        console.error("Error in createRoom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// getRoomList - Get all rooms user is member of
export const getRoomList = async (req, res) => {
    try {
        const userId = req.user._id;
        const rooms = await Room.find({
            members: userId
        })
            .populate("admin", "username profilepic")
            .populate("members", "username profilepic")
            .sort({ updatedAt: -1 });
        res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Error in getRoomList:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// user want to join a public room
/*
eGets roomId from URL parameter
Finds the room
Checks if room exists
Checks if user is already a member (prevent duplicates)
Adds user to members array
Saves and returns updated room
*/

export const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (room.members.includes(userId)) {
            return res.status(400).json({ error: "You are already a member of this room" });
        }
        room.members.push(userId);
        await room.save();
        await room.populate("admin", "username profilepic");
        await room.populate("members", "username profilepic");
        res.status(200).json({
            success: true,
            message: "Successfully joined the room",
            room
        });
    } catch (error) {
        console.error("Error in joinRoom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// leave a room 
/*
Finds the room
Checks if user is actually a member
Special rule: Admin cannot leave (must delete room or transfer ownership)
Removes user from members array using filter
*/

export const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (!room.members.includes(userId)) {
            return res.status(400).json({ error: "You are not a member of this room" });
        }
        if (room.admin.toString() === userId.toString()) {  // userId is an ObjectId object, 
            return res.status(400).json({
                error: "Admin cannot leave. Delete the room or transfer ownership first."
            });
        }
        room.members = room.members.filter(
            member => member.toString() !== userId.toString()
        );
        await room.save();
        res.status(200).json({
            success: true,
            message: "Successfully left the room"
        });
    } catch (error) {
        console.error("Error in leaveRoom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// room details 

export const getRoomDetails = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findById(roomId)
            .populate("admin", "username profilepic")
            .populate("members", "username profilepic");
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (!room.members.includes(userId)) {
            return res.status(403).json({ error: "You are not a member of this room" });
        }
        res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        console.error("Error in getRoomDetails:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//Checks user is a member (can't see messages of rooms you're not in)
/*Finds all messages where roomId matches
Populates sender info (username, pic)
Sorts oldest first (chronological order)
Returns messages
*/


//getRoomMessages - Get chat history


export const getRoomMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (!room.members.includes(userId)) {
            return res.status(403).json({ error: "You are not a member of this room" });
        }
        const messages = await Message.find({ roomId })
            .populate("senderId", "username profilepic")
            .sort({ createdAt: 1 });
        res.status(200).json({
            success: true,
            messages
        });
    } catch (error) {
        console.error("Error in getRoomMessages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
/*  // DELETE ROOM 

Checks if room exists
Verifies only admin can delete
Deletes all messages in the room first (deleteMany)
Then deletes the room itself
Confirms deletion
*/
export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (room.admin.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Only room admin can delete the room" });
        }
        await Message.deleteMany({ roomId });
        await Room.findByIdAndDelete(roomId);
        res.status(200).json({
            success: true,
            message: "Room deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteRoom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

//  ADD MEMEBER TO ROOM 

/*
Gets userId from request body (who to add)
Checks only admin can add members
Checks if user exists in database
Checks if already a member
Adds to members array
Returns updated room
*/

export const addMemberToRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { userId: newMemberId } = req.body;
        const adminId = req.user._id;
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        if (room.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ error: "Only room admin can add members" });
        }
        const userExists = await User.findById(newMemberId);
        if (!userExists) {
            return res.status(404).json({ error: "User not found" });
        }
        if (room.members.includes(newMemberId)) {
            return res.status(400).json({ error: "User is already a member" });
        }
        room.members.push(newMemberId);
        await room.save();
        await room.populate("members", "username profilepic");
        res.status(200).json({
            success: true,
            message: "Member added successfully",
            room
        });
    } catch (error) {
        console.error("Error in addMemberToRoom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// GET ALL PUBLIC ROOMS (for joining)
export const getPublicRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ roomType: "public" })
            .populate("admin", "username profilepic")
            .populate("members", "username profilepic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            rooms
        });
    } catch (error) {
        console.error("Error in getPublicRooms:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



