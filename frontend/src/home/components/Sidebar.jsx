import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";
import { BiLogOut } from "react-icons/bi";
import userConversation from "../../Zustans/useConversation";
import { useSocketContext } from "../../context/SocketContext";
import RoomList from "./RoomList";
import CreateRoomModal from "./CreateRoomModal";
import JoinRoomModal from "./JoinRoomModal";

const Sidebar = ({ onSelectUser, onSelectRoom }) => {
  const navigate = useNavigate();
  const { authUser, setAuthUser } = useAuth();

  const [searchInput, setSearchInput] = useState("");
  const [searchUser, setSearchUser] = useState([]);
  const [chatUser, setChatUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageUsers, setNewMessageUsers] = useState("");

  // Room states
  const [activeTab, setActiveTab] = useState("chats"); // "chats" or "rooms"
  const [isCreateRoomModalOpen, setIsCreateRoomModalOpen] = useState(false);
  const [isJoinRoomModalOpen, setIsJoinRoomModalOpen] = useState(false);

  const { selectedConversation, setSelectedConversation, messages } =
    userConversation();
  const { onlineUser, socket } = useSocketContext();

  const normalize = (id) => String(id);

  // 🚀 NEW MESSAGE LISTENER
  useEffect(() => {
    if (!socket) return;
    const handleNewMessage = (data) => {
      setNewMessageUsers(data);
    };
    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket]);

  // 🚀 LOAD CHAT USERS
  useEffect(() => {
    const loadChatters = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/user/currentchatters`);
        setChatUser(res.data);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };
    loadChatters();
  }, [messages?.length]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/user/search?search=${searchInput}`);
      setSearchUser(res.data);
      if (res.data.length === 0) toast.info("User Not Found");
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const handleUserClick = (user) => {
    onSelectUser(user);
    setSelectedConversation(user);
    setSelectedUserId(user._id);
    setNewMessageUsers("");
  };

  const handleSearchBack = () => {
    setSearchUser([]);
    setSearchInput("");
  };

  const handleLogout = async () => {
    const confirm = window.confirm("Are you sure you want to logout?");
    if (!confirm) return;

    try {
      await axios.post("/api/auth/logout");
      localStorage.removeItem("chatapp");
      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="
      h-full w-full md:w-[380px]
      bg-gradient-to-b from-[#111827] via-[#1f2937] to-[#111827]
      border-r border-gray-800
      flex flex-col
      shadow-2xl
    ">
      {/* 🎨 HEADER - Premium Dark */}
      <div className="
        px-5 py-6
        bg-gradient-to-r from-[#1f2937] to-[#111827]
        border-b border-gray-800/50
        backdrop-blur-xl
        shadow-lg
      ">
        {/* Profile & Title */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <img
                onClick={() => toast.info("Profile settings coming soon!")}
                src={authUser?.profilepic}
                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${authUser?.username || 'User'}`; }}
                className="
                  h-12 w-12 rounded-full object-cover
                  border-2 border-blue-500/50
                  cursor-pointer
                  transition-all duration-300
                  hover:border-blue-400
                  hover:scale-105
                  shadow-lg shadow-blue-500/20
                "
                alt="Profile"
              />
              <span className="
                absolute bottom-0 right-0
                w-3.5 h-3.5
                bg-green-500
                border-2 border-[#1f2937]
                rounded-full
                animate-pulse
              "></span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {activeTab === "chats" ? "Chats" : "Rooms"}
              </h2>
              <p className="text-xs text-gray-400">
                {authUser?.username}
              </p>
            </div>
          </div>
        </div>

        {/* 📑 TABS */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("chats")}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
              ${activeTab === "chats"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-[#374151]/30 text-gray-400 hover:bg-[#374151]/50"
              }
            `}
          >
            💬 Chats
          </button>
          <button
            onClick={() => setActiveTab("rooms")}
            className={`
              flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all
              ${activeTab === "rooms"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                : "bg-[#374151]/30 text-gray-400 hover:bg-[#374151]/50"
              }
            `}
          >
            🏠 Rooms
          </button>
        </div>

        {/* 🔍 SEARCH BAR - Only show for chats tab */}
        {activeTab === "chats" && (
          <form onSubmit={handleSearchSubmit} className="relative group">
            <div className="
              absolute left-4 top-1/2 -translate-y-1/2
              text-white
              transition-colors duration-200
              group-focus-within:text-blue-400
            ">
              <FaSearch size={16} />
            </div>
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder="Search users..."
              className="
                w-full
                bg-[#374151]/90
                backdrop-blur-md
                border border-gray-600
                rounded-xl
                py-3 pl-11 pr-4
                text-sm text-white
                placeholder:text-gray-200
                outline-none
                transition-all duration-300
                focus:bg-[#374151]/100
                focus:border-blue-500
                focus:shadow-lg focus:shadow-blue-500/20
                hover:border-gray-500
              "
            />
          </form>
        )}
      </div>
      {/* 📋 CONTENT - Chats or Rooms */}
      {activeTab === "chats" ? (
        <div className="
          flex-1
          overflow-y-auto
          px-3 py-2
          scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
        ">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400">Loading chats...</p>
              </div>
            </div>
          )}

          {!loading &&
            (searchUser.length > 0 ? searchUser : chatUser).map((user) => (
              <div
                key={user._id}
                onClick={() => handleUserClick(user)}
                className={`
                  group
                  flex items-center gap-3
                  p-3 mb-1.5
                  rounded-xl
                  cursor-pointer
                  transition-all duration-200
                  ${selectedUserId === user._id
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 scale-[1.02]"
                    : "hover:bg-[#374151]/40 active:scale-[0.98]"
                  }
                `}
              >
                {/* Avatar with Status */}
                <div className="relative flex-shrink-0">
                  <img
                    src={user.profilepic}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`; }}
                    className={`
                      w-12 h-12 rounded-full object-cover
                      transition-all duration-200
                      ${selectedUserId === user._id
                        ? "ring-2 ring-white/30"
                        : "ring-1 ring-gray-700/50 group-hover:ring-gray-600"
                      }
                    `}
                    alt="User"
                  />
                  {/* Online Status Indicator */}
                  {(onlineUser.some((id) => id.toString() === user._id.toString()) ||
                    onlineUser.map(normalize).includes(normalize(user._id))) && (
                      <span
                        className={`
                          absolute bottom-0 right-0
                          w-3.5 h-3.5
                          bg-green-500
                          rounded-full
                          ${selectedUserId === user._id
                            ? "ring-2 ring-white"
                            : "ring-2 ring-[#1f2937]"
                          }
                          animate-pulse
                        `}
                      ></span>
                    )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`
                        font-semibold text-sm truncate
                        ${selectedUserId === user._id
                          ? "text-white"
                          : "text-gray-200"
                        }
                      `}
                    >
                      {user.username}
                    </p>

                    {/* New Message Badge */}
                    {newMessageUsers?.senderId === user._id && (
                      <span
                        className={`
                          flex items-center justify-center
                          w-5 h-5
                          text-[10px] font-bold
                          rounded-full
                          ${selectedUserId === user._id
                            ? "bg-white text-blue-600"
                            : "bg-green-500 text-white"
                          }
                          shadow-md
                          animate-bounce
                        `}
                      >
                        1
                      </span>
                    )}
                  </div>

                  {/* Status Text */}
                  <p
                    className={`
                      text-xs truncate
                      ${selectedUserId === user._id
                        ? "text-blue-100"
                        : "text-gray-400"
                      }
                    `}
                  >
                    {(onlineUser.some((id) => id.toString() === user._id.toString()) ||
                      onlineUser.map(normalize).includes(normalize(user._id)))
                      ? "Online"
                      : "Offline"}
                  </p>
                </div>
              </div>
            ))}

          {/* Empty State */}
          {!loading && chatUser.length === 0 && searchUser.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="
                w-20 h-20 mb-4
                rounded-full
                bg-gradient-to-br from-blue-500/20 to-purple-500/20
                flex items-center justify-center
                backdrop-blur-sm
              ">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-2">
                No conversations yet
              </h3>
              <p className="text-sm text-gray-500 max-w-[200px]">
                Search for users to start chatting
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Rooms Tab Content */
        <div className="flex-1 overflow-hidden">
          <RoomList
            onCreateRoom={() => setIsCreateRoomModalOpen(true)}
            onJoinRoom={() => setIsJoinRoomModalOpen(true)}
          />
        </div>
      )}

      {/* 🚪 FOOTER - Action Buttons */}
      <div className="
        p-4
        bg-gradient-to-r from-[#1f2937] to-[#111827]
        border-t border-gray-800/50
        backdrop-blur-xl
      ">
        <button
          onClick={searchUser.length > 0 ? handleSearchBack : handleLogout}
          className="
            flex items-center justify-center gap-3
            w-full
            px-4 py-3
            bg-[#374151]/40
            hover:bg-[#374151]/60
            active:bg-[#374151]/80
            border border-gray-700/50
            rounded-xl
            text-gray-300
            hover:text-white
            font-medium text-sm
            transition-all duration-200
            hover:shadow-lg
            active:scale-[0.98]
          "
        >
          {searchUser.length > 0 ? (
            <>
              <IoArrowBackSharp size={18} />
              <span>Back to chats</span>
            </>
          ) : (
            <>
              <BiLogOut size={18} />
              <span>Sign out</span>
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={isCreateRoomModalOpen}
        onClose={() => setIsCreateRoomModalOpen(false)}
      />
      <JoinRoomModal
        isOpen={isJoinRoomModalOpen}
        onClose={() => setIsJoinRoomModalOpen(false)}
      />
    </div>
  );
};

export default Sidebar;
