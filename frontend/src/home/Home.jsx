import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MessageContainer from './components/MessageContainer';
import IncomingCallModal from './components/IncomingCallModal';
import ActiveCallScreen from './components/ActiveCallScreen';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setIsSidebarVisible(false);
  };

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
    setSelectedUser(null);
  };

  return (
    <div className="flex w-full h-screen bg-bg-primary overflow-hidden">
      {/* SIDEBAR WRAPPER */}
      <div className={`
        w-full md:w-[380px] md:flex h-full border-r border-border
        ${isSidebarVisible ? 'block' : 'hidden'} 
        ${selectedUser ? 'hidden md:block' : 'block'}
      `}>
        <Sidebar onSelectUser={handleUserSelect} />
      </div>

      {/* MESSAGE CONTAINER WRAPPER */}
      <div className={`
        flex-1 h-full bg-bg-primary
        ${selectedUser ? 'block' : 'hidden md:flex items-center justify-center'}
      `}>
        <MessageContainer onBackUser={handleShowSidebar} />
      </div>

      {/* ───────────────────────────────────────────────────── */}
      {/* CALL COMPONENTS (Appear on top when needed)          */}
      {/* ───────────────────────────────────────────────────── */}

      {/* Shows when someone calls you */}
      <IncomingCallModal />

      {/* Shows when you're in an active call */}
      <ActiveCallScreen />
    </div>
  );
};

export default Home;
