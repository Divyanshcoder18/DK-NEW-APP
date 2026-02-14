import { useEffect, useState } from "react";
import { useGetRooms } from "../../hooks/useRoom";
import userConversation from "../../Zustans/useConversation";
import { useSocketContext } from "../../context/SocketContext";

const RoomList = ({ onCreateRoom, onJoinRoom }) => {
    const { getRooms, loading } = useGetRooms();
    const { rooms, selectedRoom, setSelectedRoom } = userConversation();
    const { socket } = useSocketContext();
    const [searchTerm, setSearchTerm] = useState("");

    // 1️⃣ Fetch rooms when component mounts
    useEffect(() => {
        getRooms();
    }, []);

    // 2️⃣ Join socket room when user selects a room
    useEffect(() => {
        if (!socket || !selectedRoom) return;

        // Join the new room
        socket.emit("join-room", { roomId: selectedRoom._id });
        console.log(`🏠 Joined room: ${selectedRoom.name}`);

        // Cleanup: leave room when component unmounts or room changes
        return () => {
            socket.emit("leave-room", { roomId: selectedRoom._id });
            console.log(`🏠 Left room: ${selectedRoom.name}`);
        };
    }, [selectedRoom?._id, socket]); // Only re-run when selectedRoom ID changes

    // 3️⃣ Filter rooms by search term
    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4️⃣ Handle room selection
    const handleRoomClick = (room) => {
        setSelectedRoom(room);
    };

    return (
        <div className="room-list-container">
            {/* Header with action buttons */}
            <div className="room-list-header">
                <h2>Rooms</h2>
                <div className="room-actions">
                    <button
                        className="btn-create-room"
                        onClick={onCreateRoom}
                        title="Create new room"
                    >
                        ➕
                    </button>
                    <button
                        className="btn-join-room"
                        onClick={onJoinRoom}
                        title="Join existing room"
                    >
                        🔍
                    </button>
                </div>
            </div>

            {/* Search bar */}
            <div className="room-search">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="room-search-input"
                />
            </div>

            {/* Loading state */}
            {loading ? (
                <div className="room-list-loading">
                    <span className="loading-spinner"></span>
                    <p>Loading rooms...</p>
                </div>
            ) : (
                /* Rooms list */
                <div className="rooms-scroll">
                    {filteredRooms.length === 0 ? (
                        <div className="no-rooms">
                            <p>No rooms found</p>
                            <button onClick={onCreateRoom} className="btn-create-first">
                                Create your first room
                            </button>
                        </div>
                    ) : (
                        filteredRooms.map((room) => (
                            <div
                                key={room._id}
                                className={`room-item ${selectedRoom?._id === room._id ? "selected" : ""}`}
                                onClick={() => handleRoomClick(room)}
                            >
                                {/* Room avatar */}
                                <div className="room-avatar">
                                    {room.avatar ? (
                                        <img src={room.avatar} alt={room.name} />
                                    ) : (
                                        <div className="room-avatar-placeholder">
                                            {room.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                {/* Room info */}
                                <div className="room-info">
                                    <div className="room-header-info">
                                        <h3 className="room-name">{room.name}</h3>
                                        <span className="room-type-badge">
                                            {room.roomType === "private" ? "🔒" : "🌐"}
                                        </span>
                                    </div>
                                    <p className="room-members">
                                        👥 {room.members?.length || 0} members
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomList;