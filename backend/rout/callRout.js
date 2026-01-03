import express from "express";
import { generateAgoraToken, saveCallRecord, getCallHistory } from "../routControlers/callroutControler.js";
import isLogin from "../middleware/isLogin.js";

const router = express.Router();

router.post('/agora-token', isLogin, generateAgoraToken);
router.post('/save', isLogin, saveCallRecord);
router.get('/history/:userId', isLogin, getCallHistory);
// router.get('/history/:userId', ...)
// Server knows exactly whose history from the URL!

export default router;
