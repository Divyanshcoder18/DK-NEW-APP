import React, { useEffect, useState, useRef } from "react";
import userConversation from "../../Zustans/useConversation";
import { useAuth } from "../../context/AuthContext";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import { useSocketContext } from "../../context/SocketContext";
import { useGetRoomMessages, useSendRoomMessage } from "../../hooks/useRoom";
import notify from "../../assets/sound/notification.mp3";

const RoomMessageContainer = ({ onBackToRooms }) => {
    const { roomMessages, selectedRoom, setRoomMessages } = userConversation();
    const { socket } = useSocketContext();
    const { authUser } = useAuth();
    const { getRoomMessages, loading } = useGetRoomMessages();
    const { sendRoomMessage, loading: sending } = useSendRoomMessage();

    const [messageText, setMessageText] = useState("");
    const [shouldScroll, setShouldScroll] = useState(true);
    const lastMessageRef = useRef();

    // 📥 Fetch room messages when room is selected
    useEffect(() => {
        if (selectedRoom?._id) {
            getRoomMessages(selectedRoom._id);
        }
    }, [selectedRoom?._id]);

    // 🔌 Listen for new room messages via socket
    useEffect(() => {
        if (!socket) return;

        const handleNewRoomMessage = (data) => {
            // Play notification sound if message is from someone else
            const messageSenderId = typeof data.message?.senderId === "object"
                ? data.message?.senderId?._id
                : data.message?.senderId;

            if (messageSenderId && messageSenderId !== authUser?._id) {
                const sound = new Audio(notify);
                sound.play();
            }

            // Add message to state if it's for the current room
            if (data.roomId === selectedRoom?._id) {
                setRoomMessages((prev) => [...prev, data.message]);
                setShouldScroll(true);
            }
        };

        socket.on("new-room-message", handleNewRoomMessage);

        return () => {
            socket.off("new-room-message", handleNewRoomMessage);
        };
    }, [socket, selectedRoom?._id, authUser._id, setRoomMessages]);

    // 📜 Auto scroll to bottom
    useEffect(() => {
        if (shouldScroll) {
            setTimeout(() => {
                lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
            setShouldScroll(false);
        }
    }, [roomMessages, shouldScroll]);

    // 📤 Send message handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!messageText.trim()) return;

        const result = await sendRoomMessage(selectedRoom._id, { message: messageText });

        if (result) {
            // Emit to socket for real-time delivery to all room members
            socket?.emit("room-message", {
                message: result.message,
                roomId: selectedRoom._id,
            });

            // Note: Don't add to local state here - the socket listener will handle it
            // This prevents duplicate messages
            setMessageText("");
            setShouldScroll(true);
        }
    };

    // 🚫 No room selected
    if (!selectedRoom) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-[#111] text-gray-200">
                <div className="px-4 text-center flex flex-col items-center gap-4">
                    <p className="text-3xl font-bold tracking-tighter">
                        Welcome to Rooms, {authUser.username}
                    </p>
                    <p className="text-lg text-gray-400">
                        Select a room to start chatting.
                    </p>
                    <div className="mt-4 p-4 rounded-full border border-gray-700">
                        <TiMessages className="text-4xl text-gray-200" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full w-full max-h-screen bg-gradient-to-b from-[#1c1c1f] via-[#141416] to-[#0e0e10] text-white relative">

            {/* 🟢 TOP HEADER */}
            <div className="fixed md:sticky top-0 left-0 right-0 md:relative flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-800 bg-[#1c1c1f] backdrop-blur-xl z-40 shadow-md flex-shrink-0">
                <div className="flex items-center gap-4">
                    {/* BACK BUTTON */}
                    <button
                        onClick={onBackToRooms}
                        className="bg-[#2a2a2d] p-2 rounded-full text-gray-200 hover:bg-[#3a3a3d] transition-colors"
                    >
                        <IoArrowBackSharp size={20} />
                    </button>

                    {/* Room Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-lg shadow-md">
                        {selectedRoom.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Room Info */}
                    <div className="flex flex-col">
                        <span className="text-white font-bold text-lg leading-tight">
                            {selectedRoom.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            👥 {selectedRoom.members?.length || 0} members
                        </span>
                    </div>
                </div>

                {/* Room Type Badge */}
                <div className="text-2xl">
                    {selectedRoom.roomType === "private" ? "🔒" : "🌐"}
                </div>
            </div>

            {/* 💬 MESSAGES */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 pt-20 md:pt-4 pb-20">
                {loading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="loading loading-spinner text-white"></div>
                    </div>
                )}

                {!loading && roomMessages?.length === 0 && (
                    <div className="flex h-full items-center justify-center text-gray-400 opacity-60">
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                )}

                {!loading &&
                    Array.isArray(roomMessages) &&
                    roomMessages.map((msg, index) => {
                        const messageSenderId = typeof msg.senderId === "object"
                            ? msg.senderId?._id
                            : msg.senderId;
                        const isMe = messageSenderId === authUser?._id;
                        const senderName = typeof msg.senderId === "object"
                            ? msg.senderId?.username
                            : "Unknown";

                        // Safely extract message text
                        const messageText = typeof msg.message === "string"
                            ? msg.message
                            : (typeof msg.message === "object" && msg.message !== null)
                                ? (msg.message.text || msg.message.message || JSON.stringify(msg.message))
                                : "No message";

                        return (
                            <div
                                key={msg?._id || index}
                                ref={index === roomMessages.length - 1 ? lastMessageRef : null}
                                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`max-w-[75%] ${isMe ? "" : "flex flex-col"}`}>
                                    {/* Sender name (only for others) */}
                                    {!isMe && (
                                        <span className="text-xs text-gray-400 mb-1 ml-2">
                                            {senderName}
                                        </span>
                                    )}

                                    {/* Message bubble */}
                                    <div
                                        className={`px-4 py-2 text-sm font-medium shadow-md transition-all ${isMe
                                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-md shadow-blue-900/50"
                                            : "bg-[#1f1f22] text-gray-200 rounded-2xl rounded-tl-md border border-gray-700"
                                            }`}
                                    >
                                        <p>{messageText}</p>
                                        <p
                                            className={`text-[10px] mt-1 text-right opacity-60 ${isMe ? "text-gray-200" : "text-gray-400"
                                                }`}
                                        >
                                            {new Date(msg?.createdAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
            </div>

            {/* ✍️ INPUT AREA */}
            <form
                onSubmit={handleSubmit}
                className="fixed md:relative bottom-0 left-0 right-0 p-3 md:p-4 bg-[#1a1a1d] border-t border-gray-800 shadow-lg z-50"
            >
                <div className="flex items-center gap-2">
                    <input
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        type="text"
                        placeholder={`Message in ${selectedRoom.name}...`}
                        className="flex-1 bg-[#141416] border border-gray-700 px-4 py-3 text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-600 transition-colors text-sm font-medium rounded-xl shadow-sm"
                    />

                    <button
                        type="submit"
                        disabled={sending}
                        className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-blue-800/40 shadow-md"
                    >
                        {sending ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <IoSend size={18} />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RoomMessageContainer;
