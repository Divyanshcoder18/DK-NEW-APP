import mongoose from "mongoose";
const roomSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ""
    },
    roomType: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    avatar: {
        type: String,
        default: null
    },
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
            default: []
        }
    ]
}, { timestamps: true });
const Room = mongoose.model('Room', roomSchema);
export default Room;



