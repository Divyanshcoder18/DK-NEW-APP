import mongoose from "mongoose";
const callSchema = mongoose.Schema({
    caller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    callType: {
        type: String,
        enum: ['voice', 'video'],
        required: true
    },
    status: {
        type: String,
        enum: ['missed', 'answered', 'rejected', 'failed', 'completed'],
        default: 'missed'
    },
    duration: {
        type: Number,
        default: 0
    },
    channelName: {
        type: String,
        required: true
    },
    startTime: {
        type: Date,
        default: null
    },
    endTime: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Call  = mongoose.model('Call',callSchema) ;
export default Call ; 