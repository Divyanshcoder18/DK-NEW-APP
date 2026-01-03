

import { createContext, useContext, useState, useEffect } from 'react';
// Import socket to listen for call events
import { useSocketContext } from './SocketContext';
// Import auth to know current user
import { useAuth } from './AuthContext';
// ─────────────────────────────────────────────────────────
// CREATE CONTEXT
// ─────────────────────────────────────────────────────────
// Create a context object (like a global storage box)
const CallContext = createContext();
// Custom hook to easily access this context from any component
export const useCallContext = () => {
  return useContext(CallContext);
};
// ─────────────────────────────────────────────────────────
// PROVIDER COMPONENT (Wraps your app)
// ─────────────────────────────────────────────────────────
export const CallContextProvider = ({ children }) => {
  
  // ───────────────────────────────────────────────────────
  // GET DEPENDENCIES
  // ───────────────────────────────────────────────────────
  
  const { socket } = useSocketContext();  // Get socket connection
  const { authUser } = useAuth();         // Get current user info
  // ───────────────────────────────────────────────────────
  // STATE VARIABLES (What we're tracking)
  // ───────────────────────────────────────────────────────
  // Is there an incoming call happening right now?
  const [incomingCall, setIncomingCall] = useState(null);
  // Structure: { from: 'userId', callType: 'video', channelName: 'abc', callerName: 'John' }
  // Are we currently in an active call?
  const [activeCall, setActiveCall] = useState(null);
  // Structure: { channelName: 'abc', callType: 'video', otherUserId: 'xyz', otherUserName: 'Jane' }
  // ───────────────────────────────────────────────────────
  // SOCKET LISTENERS (Listen for events from backend)
  // ───────────────────────────────────────────────────────
  useEffect(() => {
    // If socket doesn't exist, don't listen
    if (!socket) return;
    // ─────────────────────────────────────────────────────
    // LISTENER 1: Someone is calling you
    // ─────────────────────────────────────────────────────
    
    const handleIncomingCall = (data) => {
      // data = { from, callType, channelName, callerName }
      console.log('📞 Incoming call from:', data.callerName);
      
      // Save the incoming call info to state
      setIncomingCall(data);
      
      
    };
    // ─────────────────────────────────────────────────────
    // LISTENER 2: Your call was accepted
    // ─────────────────────────────────────────────────────
    
    const handleCallAccepted = (data) => {
      // data = { from, channelName }
      console.log('✅ Call accepted by:', data.from);
      
      // Clear incoming call popup
      setIncomingCall(null);
      
      // Set this as the active call
      // Note: You'll add user details here
    };
    // ─────────────────────────────────────────────────────
    // LISTENER 3: Your call was rejected
    // ─────────────────────────────────────────────────────
    
    const handleCallRejected = (data) => {
      // data = { from }
      console.log('❌ Call rejected by:', data.from);
      
      // Close everything
      setIncomingCall(null);
      setActiveCall(null);
      
      // Show notification to user
      alert('Call was rejected');
    };
    // ─────────────────────────────────────────────────────
    // LISTENER 4: Other person ended the call
    // ─────────────────────────────────────────────────────
    
    const handleCallEnded = (data) => {
      // data = { from }
      console.log('📴 Call ended by:', data.from);
      
      // Close the call screen
      setActiveCall(null);
      setIncomingCall(null);
    };
    // ─────────────────────────────────────────────────────
    // REGISTER ALL LISTENERS
    // ─────────────────────────────────────────────────────
    
    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    // ─────────────────────────────────────────────────────
    // CLEANUP (Remove listeners when component unmounts)
    // ─────────────────────────────────────────────────────
    
    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
    };
  }, [socket]);  // Re-run when socket changes
  // ───────────────────────────────────────────────────────
  // HELPER FUNCTIONS (Called by components)
  // ───────────────────────────────────────────────────────
  // Function to start a call
  const startCall = (recipientId, recipientName, callType) => {
    // callType = 'video' or 'voice'
    
    // Generate unique channel name using timestamp
    const channelName = `call_${Date.now()}`;
    /*
Hey, I'm calling you!"
My name is: Bob
My ID is: bob123
Your phone saves this info:

javascript
incomingCall = {
  from: "bob123",     // ← Bob's ID saved here!
  callerName: "Bob"
}


Now you need to tell Bob that you accepted.

Question: How do you know Bob's ID?

Answer: You saved it! It's in incomingCall.from

javascript
const acceptCall = () => {
  // Send message back to Bob
  socket.emit('accept-call', {
    to: incomingCall.from  // ← This is Bob's ID ("bob123")
  });
};


incomingCall.from?
javascript
incomingCall.from = "bob123"  // Bob's ID
When you accept, you're saying:

javascript
to: incomingCall.from
// ↓ Replace with actual value
to: "bob123"
    */
    // Send socket event to backend
    socket.emit('call-user', {
      to: recipientId,              // Who we're calling
      callType: callType,           // 'video' or 'voice'
      channelName: channelName,     // Unique room name
      callerName: authUser.username // Our name
    });
    // Backend receives this in socket.js line 108:
    // socket.on("call-user", ({ to, callType, channelName, callerName }) => {
    //   ...sends to recipient...
    // });
    // Set as active call for us
    setActiveCall({
      channelName: channelName,
      callType: callType,
      otherUserId: recipientId,
      otherUserName: recipientName
    });
  };
  // Function to accept incoming call
  const acceptCall = () => {
    if (!incomingCall) return;
    // Tell backend we accepted
    socket.emit('accept-call', {
      to: incomingCall.from,            // Original caller
      channelName: incomingCall.channelName  // Same channel
    });
    // Backend receives this in socket.js line 125:
    // socket.on("accept-call", ({ to, channelName }) => {
    //   ...notifies caller...
    // });
    // Set as active call
    setActiveCall({
      channelName: incomingCall.channelName,
      callType: incomingCall.callType,
      otherUserId: incomingCall.from,
      otherUserName: incomingCall.callerName
    });
    // Clear incoming call popup
    setIncomingCall(null);
  };
  // Function to reject incoming call
  const rejectCall = () => {
    if (!incomingCall) return;
    // Tell backend we rejected
    socket.emit('reject-call', {
      to: incomingCall.from  // Tell the caller
    });
    // Backend receives this in socket.js line 146:
    // socket.on("reject-call", ({ to }) => {
    //   ...notifies caller...
    // });
    // Clear incoming call popup
    setIncomingCall(null);
  };
  // Function to end active call
  const endCall = () => {
    if (!activeCall) return;
    // Tell backend we're ending
    socket.emit('end-call', {
      to: activeCall.otherUserId  // Tell other person
    });
    // Backend receives this in socket.js line 159:
    // socket.on("end-call", ({ to }) => {
    //   ...notifies other user...
    // });
    // Clear active call
    setActiveCall(null);
  };
  // ───────────────────────────────────────────────────────
  // PROVIDE TO APP
  // ───────────────────────────────────────────────────────
  // Make these values available to all child components
  const value = {
    incomingCall,   // Current incoming call data
    activeCall,     // Current active call data
    startCall,      // Function to start a call
    acceptCall,     // Function to accept incoming call
    rejectCall,     // Function to reject incoming call
    endCall         // Function to end active call
  };
  return (
    <CallContext.Provider value={value}>
      {children}
    </CallContext.Provider>
  );
};
/*

After you click "Accept", the incoming call popup disappears.

javascript
setIncomingCall(null);  // ← Popup is gone!
But wait! You still need Bob's info because:

You want to show "Talking to Bob" on screen
When you click "End Call", you need Bob's ID to tell him y


Save Bob's info in a NEW place before deleting the popup!

// STEP 1: Bob's info is here (in the popup):
incomingCall = {
  from: "bob123",
  callerName: "Bob"
}

// STEP 2: You click Accept

// STEP 3: COPY Bob's info to a new place (activeCall):
activeCall = {
  otherUserId: "bob123",    // ← Copied Bob's ID
  otherUserName: "Bob"       // ← Copied Bob's name
}

// STEP 4: Delete the popup:
incomingCall = null  // ← Popup gone, but info is safe in activeCall!


// Accept the call
setIncomingCall(null);  // ← Delete popup

// 5 minutes later, you want to end the call...
// ❌ ERROR! How do we know who we're calling?
// incomingCall is null, we lost Bob's info!

// WHY THIS IS USED !!!



 CallContext.jsx (The Backpack)
   ├── startCall 🔨
   ├── endCall 🪛
   └── activeCall 🔧
        ↓ Available to everyone ↓
📄 User.jsx
   import { useCallContext } from './CallContext';
   
   Grab: startCall 🔨
   Use: <button onClick={startCall}>
📄 CallScreen.jsx
   import { useCallContext } from './CallContext';
   
   Grab: endCall 🪛 and activeCall 🔧
   Use: <button onClick={endCall}>
*/





  
  




