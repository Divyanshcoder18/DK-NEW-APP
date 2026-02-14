import { create } from "zustand";

const userConversation = create((set) => ({
    selectedConversation: null,
    setSelectedConversation: (selectedConversation) => {
        console.log("🔷 [ZUSTAND] setSelectedConversation called with:", selectedConversation);
        set({ selectedConversation });
    },
    messages: [],
    setMessage: (messages) => {
        console.log("🔷 [ZUSTAND] setMessage called with:", messages);
        console.log("🔷 [ZUSTAND] Is it a function?", typeof messages === 'function');
        if (typeof messages === 'function') {
            set((state) => {
                const newMessages = messages(state.messages);
                console.log("🔷 [ZUSTAND] Previous messages:", state.messages);
                console.log("🔷 [ZUSTAND] New messages:", newMessages);
                return { messages: newMessages };
            });
        } else {
            console.log("🔷 [ZUSTAND] Setting messages directly:", messages);
            set({ messages });
        }
    },

    // Rooms list
    rooms: [],
    setRooms: (rooms) => {
        console.log("🏠 [ZUSTAND] setRooms called with:", rooms);
        if (typeof rooms === 'function') {
            set((state) => {
                const newRooms = rooms(state.rooms);
                console.log("🏠 [ZUSTAND] Previous rooms:", state.rooms);
                console.log("🏠 [ZUSTAND] New rooms:", newRooms);
                return { rooms: newRooms };
            });
        } else {
            set({ rooms });
        }
    },

    // Selected room
    selectedRoom: null,
    setSelectedRoom: (selectedRoom) => {
        console.log("🏠 [ZUSTAND] setSelectedRoom called with:", selectedRoom);
        set({ selectedRoom });
    },

    // Room messages
    roomMessages: [],
    setRoomMessages: (roomMessages) => {
        console.log("🏠 [ZUSTAND] setRoomMessages called with:", roomMessages);
        if (typeof roomMessages === 'function') {
            set((state) => {
                const newMessages = roomMessages(state.roomMessages);
                console.log("🏠 [ZUSTAND] Previous room messages:", state.roomMessages);
                console.log("🏠 [ZUSTAND] New room messages:", newMessages);
                return { roomMessages: newMessages };
            });
        } else {
            set({ roomMessages });
        }
    }
}));

export default userConversation;