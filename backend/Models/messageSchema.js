/*import mongoose from "mongoose";

const messageSchema = mongoose.Schema({
    senderId: [
        {
            type: mongoose.Schema.Types.ObjectId, // ✅ corrected "type" to "Types"
            required: true, // ✅ removed quotes around true
        }
    ],

    recieverId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            default: [] // ✅ this is fine
        }
    ],

    message: {
        type: String, // ✅ corrected "true:String" to "type: String"
        required: true,
    },

    // converstaion id add krni taki pta chlein ki kon se converstaion me jake save ho rhi ye 
    ConversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Converstaion',
        default: [] // ✅ this is fine
    },
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
*/

import mongoose from "mongoose"
const messageSchema = mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    reciverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:false  // ✅ Changed from true to false
    },
    roomId:{  // ✅ NEW FIELD - for group chat messages
        type:mongoose.Schema.Types.ObjectId,
        ref:"Room",
        required:false
    },
    message:{
        type:String,
        required:false,
    },
    fileUrl:{
        type:String,
        default: null ,
    },
    fileName: {
    type: String,
    default: null
},
    fileType:{
        type:String,
        default:null 
    },
    fileSize:{
        type:Number,
        default:null , 
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        default:[]
    },
},{timestamps:true})
const Message = mongoose.model("Message",messageSchema)
export default Message;