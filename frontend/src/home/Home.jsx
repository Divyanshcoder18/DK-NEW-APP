import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';
import RoomMessageContainer from './components/RoomMessageContainer';
import IncomingCallModal from './components/IncomingCallModal';
import ActiveCallScreen from './components/ActiveCallScreen';
import userConversation from '../Zustans/useConversation';

const Home = () => {
  const { selectedConversation, selectedRoom, setSelectedConversation, setSelectedRoom } = userConversation();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleUserSelect = (user) => {
    setSelectedConversation(user);
    setSelectedRoom(null); // Clear room selection
    setIsSidebarVisible(false);
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedConversation(null); // Clear user selection
    setIsSidebarVisible(false);
  };

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedConversation(null);
    setSelectedRoom(null);
  };

  return (
    <div className="flex w-full h-screen bg-bg-primary overflow-hidden">
      {/* SIDEBAR WRAPPER */}
      <div className={`
        w-full md:w-[380px] md:flex h-full border-r border-border
        ${isSidebarVisible ? 'block' : 'hidden'} 
        ${(selectedConversation || selectedRoom) ? 'hidden md:block' : 'block'}
      `}>
        <Sidebar
          onSelectUser={handleUserSelect}
          onSelectRoom={handleRoomSelect}
        />
      </div>

      {/* MESSAGE CONTAINER WRAPPER */}
      <div className={`
        flex-1 h-full bg-bg-primary
        ${(selectedConversation || selectedRoom) ? 'block' : 'hidden md:flex items-center justify-center'}
      `}>
        {/* Show RoomMessageContainer if room is selected, otherwise MessageContainer */}
        {selectedRoom ? (
          <RoomMessageContainer onBackToRooms={handleShowSidebar} />
        ) : (
          <MessageContainer onBackUser={handleShowSidebar} />
        )}
      </div>

      {/* Shows when someone calls you */}
      <IncomingCallModal />

      {/* Shows when you're in an active call */}
      <ActiveCallScreen />
    </div>
  );
};

export default Home;
