import { useState } from "react";
import API from "../api";
import { toast } from "react-toastify";
import userConversation from "../Zustans/useConversation";
export const useGetRooms = () => {
    const [loading, setLoading] = useState(false);
    const { setRooms } = userConversation();

    const getRooms = async () => {
        setLoading(true);
        try {
            const response = await API.get("/room/list");
            setRooms(response.data.rooms);
            return response.data.rooms;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch rooms");
            console.error("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    return { getRooms, loading };
};

export const useCreateRoom = () => {
    const [loading, setLoading] = useState(false);  // ✅ Fixed: setloading → setLoading
    const { setRooms } = userConversation();

    const createRoom = async (roomData) => {
        setLoading(true);

        try {
            const response = await API.post("/room/create", roomData);
            toast.success("Room created successfully");
            setRooms((prevRooms) => [response.data.room, ...prevRooms]);
            return response.data.room;  // ✅ Added return
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create room");
            console.error("Error creating room:", error);
        } finally {
            setLoading(false);
        }
    };

    return { createRoom, loading };  // ✅ Added missing return statement
};


export const useJoinRoom = () => {
    const [loading, setLoading] = useState(false);
    const { setRooms } = userConversation();  // ✅ Fixed: useConversation → userConversation

    const joinRoom = async (roomId) => {  // ✅ Changed roomID → roomId for consistency
        setLoading(true);
        try {
            const response = await API.post(`/room/join/${roomId}`);
            toast.success("Room joined successfully");
            setRooms((prevRooms) => [response.data.room, ...prevRooms]);
            return response.data.room;  // ✅ Added return
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to join room");
            console.error("Error joining room:", error);
        } finally {
            setLoading(false);
        }
    };

    return { joinRoom, loading };  // ✅ Added missing return statement
};

export const useLeaveRoom = () => {
    const [loading, setLoading] = useState(false);
    const { setRooms } = userConversation();

    const leaveRoom = async (roomId) => {
        setLoading(true);
        try {
            await API.post(`/room/leave/${roomId}`);

            toast.success("Left room successfully!");

            // Remove the room from the list
            setRooms((prevRooms) => prevRooms.filter(room => room._id !== roomId));

            return true;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to leave room");
            console.error("Error leaving room:", error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { leaveRoom, loading };
};

export const useGetRoomMessages = () => {
    const [loading, setLoading] = useState(false);
    const { setRoomMessages } = userConversation();

    const getRoomMessages = async (roomId) => {
        setLoading(true);
        try {
            const response = await API.get(`/room/${roomId}/messages`);
            setRoomMessages(response.data.messages);
            return response.data.messages;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to fetch messages");
            console.error("Error fetching room messages:", error);
        } finally {
            setLoading(false);
        }
    };

    return { getRoomMessages, loading };
};

export const useSendRoomMessage = () => {
    const [loading, setLoading] = useState(false);  // ✅ Fixed: usestate → useState

    const sendRoomMessage = async (roomId, messageData) => {
        setLoading(true);
        try {
            // Note: This endpoint needs to be added in backend messageRout.js
            const response = await API.post(`/message/send/room/${roomId}`, messageData);
            return response.data;
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to send message");
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    };
    return { sendRoomMessage, loading };
}



