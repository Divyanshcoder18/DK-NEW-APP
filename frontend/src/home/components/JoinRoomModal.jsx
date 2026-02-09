import { useState, useEffect } from "react";
import { useJoinRoom } from "../../hooks/useRoom";
import API from "../../api";
import { toast } from "react-toastify";
import userConversation from "../../Zustans/useConversation";

const JoinRoomModal = ({ isOpen, onClose }) => {
    const { joinRoom, loading: joiningRoom } = useJoinRoom();
    const { rooms: myRooms } = userConversation();

    const [availableRooms, setAvailableRooms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // 1️⃣ Fetch all public rooms when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchPublicRooms();
        }
    }, [isOpen]);

    // 2️⃣ Fetch public rooms from API
    const fetchPublicRooms = async () => {
        setLoading(true);
        try {
            // Note: We need to create this endpoint in backend
            const response = await API.get("/room/public");

            // Filter out rooms user is already a member of
            const myRoomIds = myRooms.map(room => room._id);
            const filteredRooms = response.data.rooms.filter(
                room => !myRoomIds.includes(room._id)
            );

            setAvailableRooms(filteredRooms);
        } catch (error) {
            console.error("Error fetching public rooms:", error);
            toast.error("Failed to load rooms");
        } finally {
            setLoading(false);
        }
    };

    // 3️⃣ Handle joining a room
    const handleJoinRoom = async (roomId) => {
        const result = await joinRoom(roomId);

        if (result) {
            // Remove from available rooms list
            setAvailableRooms(prev =>
                prev.filter(room => room._id !== roomId)
            );
            toast.success("Joined room successfully!");
        }
    };

    // 4️⃣ Filter rooms by search
    const filteredRooms = availableRooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 5️⃣ Handle close
    const handleClose = () => {
        setSearchTerm("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop" onClick={handleClose}></div>

            {/* Modal */}
            <div className="modal-container">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header">
                        <h2>Join Public Room</h2>
                        <button
                            className="modal-close-btn"
                            onClick={handleClose}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Search */}
                    <div className="modal-search">
                        <input
                            type="text"
                            placeholder="Search rooms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-input"
                        />
                    </div>

                    {/* Rooms List */}
                    <div className="join-room-list">
                        {loading ? (
                            <div className="join-room-loading">
                                <span className="loading-spinner"></span>
                                <p>Loading rooms...</p>
                            </div>
                        ) : filteredRooms.length === 0 ? (
                            <div className="no-rooms">
                                <p>
                                    {searchTerm
                                        ? "No rooms match your search"
                                        : "No public rooms available"
                                    }
                                </p>
                            </div>
                        ) : (
                            filteredRooms.map((room) => (
                                <div key={room._id} className="join-room-item">
                                    {/* Room Avatar */}
                                    <div className="room-avatar">
                                        {room.avatar ? (
                                            <img src={room.avatar} alt={room.name} />
                                        ) : (
                                            <div className="room-avatar-placeholder">
                                                {room.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Room Info */}
                                    <div className="join-room-info">
                                        <div className="join-room-header">
                                            <h3>{room.name}</h3>
                                            <span className="room-type-badge">🌐</span>
                                        </div>
                                        {room.description && (
                                            <p className="join-room-description">
                                                {room.description}
                                            </p>
                                        )}
                                        <p className="room-members">
                                            👥 {room.members?.length || 0} members
                                        </p>
                                    </div>

                                    {/* Join Button */}
                                    <button
                                        onClick={() => handleJoinRoom(room._id)}
                                        disabled={joiningRoom}
                                        className="btn-join"
                                    >
                                        {joiningRoom ? "..." : "Join"}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default JoinRoomModal;
