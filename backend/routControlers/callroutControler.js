import Call from "../Models/callSchema.js";

// Fix for CommonJS module (agora-access-token)
import pkg from 'agora-access-token';
const { RtcTokenBuilder, RtcRole } = pkg;
// Generate Agora Token
export const generateAgoraToken = async (req, res) => {
    try {
        const { channelName, userId } = req.body;
        if (!channelName || !userId) {
            return res.status(400).send({ error: 'Channel name and user ID required' });
        }
        const appId = process.env.AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;
        const role = RtcRole.PUBLISHER;
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            userId,
            role,
            privilegeExpiredTs
        );
        res.status(200).send({
            token,
            appId,
            channelName,
            userId
        });
    } catch (error) {
        console.log(`Error generating Agora token: ${error}`);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};

// Save call record
export const saveCallRecord = async (req, res) => {
    try {
        const { callerId, receiverId, callType, status, duration, channelName, startTime, endTime } = req.body;

        if (!callerId || !receiverId || !callType || !channelName) {
            return res.status(400).send({ error: 'Missing required fields' });
        }

        const newCall = new Call({
            caller: callerId,
            receiver: receiverId,
            callType,
            status: status || 'completed',
            duration: duration || 0,
            channelName,
            startTime: startTime || new Date(),
            endTime: endTime || new Date()
        });

        await newCall.save();

        res.status(201).send({
            success: true,
            call: newCall
        });

    } catch (error) {
        console.log(`Error saving call record: ${error}`);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};
export const getCallHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).send({ error: 'User ID required' });
        }
        const calls = await Call.find({
            $or: [
                { caller: userId },
                { receiver: userId }
            ]
        })
            .populate('caller', 'username profilepic')
            .populate('receiver', 'username profilepic')
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).send(calls);
    } catch (error) {
        console.log(`Error fetching call history: ${error}`);
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
};
