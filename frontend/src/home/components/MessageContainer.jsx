import React, { useEffect, useState, useRef } from "react";
import userConversation from "../../Zustans/useConversation";
import { useAuth } from "../../context/AuthContext";
import { TiMessages } from "react-icons/ti";
import { IoArrowBackSharp, IoSend } from "react-icons/io5";
import { IoAttach } from "react-icons/io5";
import axios from "axios";
import { useSocketContext } from "../../context/SocketContext";
import notify from "../../assets/sound/notification.mp3";
import { IoCall, IoVideocam } from "react-icons/io5";  // Call icons
import { useCallContext } from "../../context/CallContext";

const MessageContainer = ({ onBackUser }) => {
  const { messages, selectedConversation, setMessage } = userConversation();
  const { socket } = useSocketContext();
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendData, setSendData] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);  //selectedFile - Stores the file user picks
  const fileInputRef = useRef(null); //fileInputRef - Reference to the hidden <input type="file"> so we can trigger it with a button click
  const [imageModal, setImageModal] = useState({ open: false, url: '', name: '' }); // Image modal state
  const [shouldScroll, setShouldScroll] = useState(true); // Control auto-scroll

  const lastMessageRef = useRef();

  const { startCall } = useCallContext();

  // call handlers


  const handleVoiceCall = () => {
    startCall(
      selectedConversation._id,        // Who to call (their ID)
      selectedConversation.username,   // Their name
      'voice'                          // Call type
    );
  };

  const handleVideoCall = () => {
    startCall(
      selectedConversation._id,        // Who to call (their ID)
      selectedConversation.username,   // Their name
      'video'                          // Call type
    );
  };

  // 🔌 Socket Listener
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (newMessage) => {
      if (newMessage.senderId !== authUser._id) {
        const sound = new Audio(notify);
        sound.play();
      }
      setMessage((prev) => [...prev, newMessage]);
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, authUser?._id, setMessage]);

  // 📜 Auto Scroll - only when user sends a message
  useEffect(() => {
    if (shouldScroll) {
      setTimeout(() => {
        lastMessageRef?.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      setShouldScroll(false); // Reset after scrolling
    }
  }, [messages, shouldScroll]);

  // 📥 Fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation?._id) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/message/${selectedConversation._id}`);
        setMessage(res.data);
      } catch (err) {
        console.log(err);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [selectedConversation?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!sendData.trim()) return;

    setSending(true);
    const receiverId = selectedConversation?.userId || selectedConversation?._id;

    try {
      const res = await axios.post(
        `/api/message/send/${selectedConversation._id}`,
        { messages: sendData }
      );
      const sentMessage = res.data;

      socket?.emit("sendMessage", {
        senderId: authUser._id,
        receiverId,
        message: sendData,
        _id: sentMessage._id,
        createdAt: sentMessage.createdAt,
      });

      setMessage((prev) => [...prev, sentMessage]);
      setSendData("");
      setShouldScroll(true); // Enable scroll when user sends a message
    } catch (err) {
      console.log(err);
    }
    setSending(false);
  };

  const handleFileupload = async (file = null) => {
    const fileToUpload = file || selectedFile;
    if (!fileToUpload) {
      return;
    }
    setSending(true);

    /*
    Gets the receiver's ID from the selected conversation
    Why: Backend needs to know WHO you're sending the file to
    The ?.: Safe navigation - if selectedConversation is null, doesn't crash
    The ||: Tries userId first, if not exists uses _id
    */
    const receiverId = selectedConversation?.userId || selectedConversation?._id;


    // Creates a special container for file data
    // Files can't be sent as regular JSON - they need FormData

    try {
      // form sata bna file uploads ke liye 
      const formData = new FormData();
      formData.append('file', fileToUpload);
      const res = await axios.post(
        `/api/message/upload/${selectedConversation._id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      /*
  URL: /api/message/upload/12345 (12345 is conversation ID)
  Data: The FormData with your file
  Headers: Tells server "this is a file upload, not JSON"
      */
      const sentMessage = res.data;

      socket.emit('sendMessage', {
        senderId: authUser._id,
        receiverId,
        message: sentMessage,


      });

      setMessage(prev => [...prev, sentMessage]);
      setSelectedFile(null);
      setShouldScroll(true); // Enable scroll when user sends a file
    }
    catch (err) {
      console.log(err);
    }
    setSending(false);

  }
  const rendermessage = (msg) => {
    if (msg.fileUrl) {
      if (msg.fileType && msg.fileType.startsWith('image/')) {
        return (
          <img
            src={msg.fileUrl}
            alt={msg.fileName}
            className="max-w-[200px] rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setImageModal({ open: true, url: msg.fileUrl, name: msg.fileName })}
          />
        );
      }
      else {
        // NO - It's a PDF/doc, show download link
        return (
          <a
            href={msg.fileUrl}
            download={msg.fileName}
            className="flex items-center gap-2 underline"
          >
            📎 {msg.fileName}
          </a>
        );



      }

    }
    else {
      return <p>{msg.message}</p>;
    }
  }



  if (!selectedConversation) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#111] text-gray-200">
        <div className="px-4 text-center flex flex-col items-center gap-4">
          <p className="text-3xl font-bold tracking-tighter">
            Welcome, {authUser.username}
          </p>
          <p className="text-lg text-gray-400">
            Select a conversation to start chatting.
          </p>
          <div className="mt-4 p-4 rounded-full border border-gray-700">
            <TiMessages className="text-4xl text-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    // 🌙 CLASSY PREMIUM DARK BACKGROUND
    <div className="flex flex-col h-full 
      bg-gradient-to-b 
      from-[#1c1c1f] via-[#141416] to-[#0e0e10] 
      text-white">

      {/* 🟢 TOP HEADER (Frosted Glass) */}
      <div className="flex items-center justify-between 
        px-6 py-4 
        border-b border-gray-800 
        bg-[#1c1c1f]/70 backdrop-blur-xl 
        sticky top-0 z-10 shadow-md">

        <div className="flex items-center gap-4">
          {/* BACK BUTTON */}
          <button
            onClick={() => onBackUser(true)}
            className="bg-[#2a2a2d] p-2 rounded-full text-gray-200 hover:bg-[#3a3a3d] transition-colors"
          >
            <IoArrowBackSharp size={20} />
          </button>

          <img
            className="w-10 h-10 rounded-full object-cover border border-gray-700 shadow-sm"
            src={selectedConversation?.profilepic}
            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedConversation?.username}`; }}
            alt="Profile"
          />

          <div className="flex flex-col">
            <span className="text-white font-bold text-lg leading-tight">
              {selectedConversation?.username}
            </span>
            <span className="text-green-400 text-xs font-medium">
              Online
            </span>
          </div>
        </div>

        {/* 📞 CALL BUTTONS */}
        <div className="flex items-center gap-2">
          {/* Voice Call Button */}
          <button
            onClick={handleVoiceCall}
            className="p-3 bg-[#2a2a2d] rounded-full text-gray-200 hover:bg-green-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-green-600/50"
            title="Voice Call"
          >
            <IoCall size={20} />
          </button>

          {/* Video Call Button */}
          <button
            onClick={handleVideoCall}
            className="p-3 bg-[#2a2a2d] rounded-full text-gray-200 hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-md hover:shadow-blue-600/50"
            title="Video Call"
          >
            <IoVideocam size={20} />
          </button>
        </div>
      </div>


      {/* 💬 MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="loading loading-spinner text-white"></div>
          </div>
        )}

        {!loading && messages?.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400 opacity-60">
            <p>No messages yet.</p>
          </div>
        )}

        {!loading &&
          Array.isArray(messages) &&
          messages.map((msg, index) => {
            const isMe = msg.senderId === authUser._id;
            return (
              <div
                key={msg?._id || index}
                ref={index === messages.length - 1 ? lastMessageRef : null}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[75%] px-4 py-2 text-sm font-medium shadow-md transition-all
                    ${isMe
                      ? "bg-blue-600 text-white rounded-2xl rounded-tr-md shadow-blue-900/50"
                      : "bg-[#1f1f22] text-gray-200 rounded-2xl rounded-tl-md border border-gray-700"
                    }
                  `}
                >
                  {rendermessage(msg)}


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
            );
          })}
      </div>

      {/* ✍️ INPUT AREA (Glass Dark Bar) */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-[#1a1a1d]/70 border-t border-gray-800 backdrop-blur-xl shadow-inner"
      >





        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setSelectedFile(file);
                handleFileupload(file); // Auto-upload when file is selected
              }
            }}
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 bg-[#2a2a2d] rounded-xl text-gray-200 hover:bg-[#3a3a3d] transition-colors"
            title="Attach file"
          >
            <IoAttach size={18} />
          </button>

          <input
            value={sendData}
            onChange={(e) => setSendData(e.target.value)}
            type="text"
            placeholder="Type a message..."
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

      {/* 🖼️ IMAGE MODAL */}
      {imageModal.open && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModal({ open: false, url: '', name: '' })}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setImageModal({ open: false, url: '', name: '' })}
              className="absolute -top-10 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
            <img
              src={imageModal.url}
              alt={imageModal.name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
