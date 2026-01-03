/*import express from 'express'
import{sendMessage} from "../routControlers/messageroutControler.js"
import isLogin from '../middleware/isLogin.js';

const router = express.Router();

router.post('/send/:id',isLogin , sendMessage) // ye id jo hogi reciever id 
//The receiver ID is passed in the route (/send/:id) so you know who the message is going to.
// data base pe bhej dia ahi hmne 
// ab mess recieve krna hai  ab frontened me msg get krna hai 
router.get('/:id',isLogin,getMessages)  ; 

export default router 
*/

import express from "express"
import { getMessages, sendMessage, sendFileMessage } from "../routControlers/messageroutControler.js";
import isLogin from "../middleware/isLogin.js";
import upload from "../utils/fileUpload.js";

const router = express.Router();

router.post('/send/:id',isLogin , sendMessage)

router.get('/:id',isLogin , getMessages);
router.post('/upload/:id', isLogin, upload.single('file'), sendFileMessage); // ye frontend se data lega vo yhan aayega mess container.jsx dekh lio 
// sendFileMessage is a function that handles the file upload and sends the file to the receiver
export default router
// HOW MIDDLEWARE WORKS 
//Request → isLogin (auth check) → upload.single('file') (save file) → sendFileMessage (save to DB)