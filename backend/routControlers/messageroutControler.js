import Conversation from "../Models/conversationModels.js";
import Message from "../Models/messageSchema.js";
import Room from "../Models/roomSchema.js";
import { getReciverSocketId, io } from "../Socket/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { messages } = req.body;
        const { id: reciverId } = req.params;
        const senderId = req.user._id;


        let chats = await Conversation.findOne({
            participants: { $all: [senderId, reciverId] }
        })

        if (!chats) {
            chats = await Conversation.create({
                participants: [senderId, reciverId],
            })
        }

        const newMessages = new Message({
            senderId,
            reciverId,
            message: messages,
            conversationId: chats._id
        })

        if (newMessages) {
            chats.messages.push(newMessages._id);
        }

        await Promise.all([chats.save(), newMessages.save()]);

        //SOCKET.IO function - Emit to BOTH sender and receiver
        const reciverSocketId = getReciverSocketId(reciverId);
        const senderSocketId = getReciverSocketId(senderId.toString());

        // Create message object with string IDs for consistent comparison
        const messageToEmit = {
            _id: newMessages._id,
            senderId: senderId.toString(), // Convert to string!
            reciverId: reciverId.toString(),
            message: newMessages.message,
            fileUrl: newMessages.fileUrl,
            createdAt: newMessages.createdAt,
            conversationId: newMessages.conversationId
        };

        // Emit to receiver
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", messageToEmit);
        }

        // Emit to sender too (so they see their own message)
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", messageToEmit);
        }

        res.status(201).send(newMessages)

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(`error in sendMessage ${error}`);
    }
}


export const getMessages = async (req, res) => {
    try {
        const { id: reciverId } = req.params;
        const senderId = req.user._id;

        const chats = await Conversation.findOne({
            participants: { $all: [senderId, reciverId] }
        }).populate("messages")

        if (!chats) return res.status(200).send([]);
        const message = chats.messages;
        res.status(200).send(message)
    } catch (error) {
        res.status(500).send({
            success: false,
            message: error
        })
        console.log(`error in getMessage ${error}`);
    }
}



export const sendFileMessage = async (req, res) => {
    try {
        const { id: reciverId } = req.params;
        const senderId = req.user._id;

        if (!req.file) {
            return res.status(400).send({ error: 'No file uploaded' });
        }

        let chats = await Conversation.findOne({
            participants: { $all: [senderId, reciverId] }
        });

        if (!chats) {
            chats = await Conversation.create({
                participants: [senderId, reciverId],
            });
        }

        const newMessage = new Message({
            senderId,
            reciverId,
            message: null,
            fileUrl: `/uploads/${req.file.filename}`,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,
            conversationId: chats._id
        });

        if (newMessage) {
            chats.messages.push(newMessage._id);
        }

        await Promise.all([chats.save(), newMessage.save()]);

        const reciverSocketId = getReciverSocketId(reciverId);
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).send(newMessage);

    } catch (error) {
        console.log(`Error in sendFileMessage: ${error}`);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};

// 🏠 SEND ROOM MESSAGE
export const sendRoomMessage = async (req, res) => {
    try {
        // 1️⃣ Get data from request
        const { roomId } = req.params;           // Room ID from URL
        const { message } = req.body;            // Message text from request body
        const senderId = req.user._id;  // Logged-in user's ID

        // 2️⃣ Validate message
        if (!message || message.trim() === "") {
            return res.status(400).json({ error: "Message cannot be empty" });
        }

        // 3️⃣ Check if room exists and user is a member
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        // Check if user is a member of the room
        if (!room.members.includes(senderId)) {
            return res.status(403).json({ error: "You are not a member of this room" });
        }

        // 4️⃣ Create the new message
        const newMessage = new Message({
            senderId,
            message,
            roomId: roomId,
            conversationId: null
        });

        await newMessage.save();

        // 5️⃣ Get sender info to send with message
        await newMessage.populate("senderId", "username profilepic");

        // 6️⃣ Emit to all users in the room via Socket.io
        io.to(roomId).emit("new-room-message", {
            message: newMessage,
            roomId
        });

        console.log(`📨 Room message sent to room ${roomId} by ${senderId}`);

        // 7️⃣ Send response back to sender
        res.status(201).json({
            success: true,
            message: newMessage
        });

    } catch (error) {
        console.error("❌ Error in sendRoomMessage:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};





/*import Message from "../Models/messageSchema.js";
import Conversation from "../Models/conversationModels.js";

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        let chats = await Conversation.findOne({
            participants: { $all: [senderId, recieverId] }
        });

        if (!chats) {
            chats = await Conversation.create({
                participants: [senderId, recieverId],
                messages:[] 
            });
        }

        const newMessages = new Message({
            senderId,
            recieverId,
            message,
            ConversationId: chats._id,
        });

        if (newMessages) {
            chats.message.push(newMessages._id);
        }

        // SOCKET
        await Promise.all([chats.save(),newMessages.save()]) ; 

    } catch (error) {
        console.error("Error in sendMessage:", error.message);
    }
};

export const getMessages = async (req,res,next)=>{
    try{
        const { id: recieverId } = req.params;
        const senderId = req.user._id;

        const chats = await Conversation.findOne({
             participants: {$all: [senderId, recieverId]}    
        }).populate("messages") 
        // hme message chahiye na isiliye populate kia or ye dono id dekh ke 
     if(!chats){
      return   res.status(200).send([]);

     }
    const message = chats.messages ;
    res.status(200).send(message) ; 
    
    }
    catch (error) {
        console.error("Error in sendMessage:", error.message);
    }
    

}*/
/*


✅ YOUR LINES
chats.messages.push(newMessage._id);

await Promise.all([chats.save(), newMessage.save()]);

res.status(201).send(newMessage);

🔹 1️⃣ chats.messages.push(newMessage._id);
✅ What it literally does:

It adds the ID of the new message into the conversation’s message list.

✅ What is chats?

chats is your Conversation document, something like this in MongoDB:

{
  _id: 101,
  participants: [userA, userB],
  messages: []   // empty before
}

✅ What is newMessage._id?

When you create:

const newMessage = new Message({...});


MongoDB automatically gives it an ID like:

ObjectId("777abc")

✅ After this line runs:
chats.messages.push(newMessage._id);


Your conversation becomes:

{
  _id: 101,
  participants: [userA, userB],
  messages: ["777abc"] ✅
}

*/



