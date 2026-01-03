import React, { useState, useEffect } from 'react';
import { IoCallSharp, IoMic, IoMicOff, IoVideocam, IoVideocamOff } from 'react-icons/io5';
import { useCallContext } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import AgoraRTC from 'agora-rtc-sdk-ng';  // Agora SDK for video/audio
import axios from 'axios';
const ActiveCallScreen = () => {
  
  // ───────────────────────────────────────────────────────
  // GET DEPENDENCIES
  // ───────────────────────────────────────────────────────
  
  const { activeCall, endCall } = useCallContext();
  const { authUser } = useAuth();
  // ───────────────────────────────────────────────────────
  // STATE VARIABLES
  // ───────────────────────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);         // Is mic muted?
  const [isVideoOff, setIsVideoOff] = useState(false);   // Is camera off?
  const [client, setClient] = useState(null);            // Agora client instance
  const [localTracks, setLocalTracks] = useState([]);    // Your camera/mic tracks
  const [remoteUsers, setRemoteUsers] = useState([]);    // Other user's tracks
  // ───────────────────────────────────────────────────────
  // IF NO ACTIVE CALL, DON'T SHOW
  // ───────────────────────────────────────────────────────
  
  if (!activeCall) return null;
  // ───────────────────────────────────────────────────────
  // INITIALIZE AGORA (Runs when call starts)
  // ───────────────────────────────────────────────────────
  useEffect(() => {
    // Function to set up Agora connection
    const initAgora = async () => {
      
      // ─────────────────────────────────────────────────
      // STEP 1: Get Agora Token from Backend
      // ─────────────────────────────────────────────────
      
      try {
        const response = await axios.post('/api/call/agora-token', {
          channelName: activeCall.channelName,  // Room name
          userId: authUser._id                  // My user ID
        });
        // Backend returns: { token, appId, channelName, userId }
        const { token, appId } = response.data;
        // ───────────────────────────────────────────────
        // STEP 2: Create Agora Client
        // ───────────────────────────────────────────────
        
        const agoraClient = AgoraRTC.createClient({
          mode: 'rtc',      // Real-time communication
          codec: 'vp8'      // Video codec
        });
        setClient(agoraClient);  // Save to state
        // ───────────────────────────────────────────────
        // STEP 3: Set Up Event Listeners
        // ───────────────────────────────────────────────
        // When another user joins the channel
        agoraClient.on('user-published', async (user, mediaType) => {
          // Subscribe to their stream
          await agoraClient.subscribe(user, mediaType);
          // If it's video, display it
          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            const playerContainer = document.getElementById('remote-video');
            
            if (playerContainer) {
              // Play their video in the container
              remoteVideoTrack.play(playerContainer);
            }
          }
          // If it's audio, play it
          if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack.play();  // Audio plays automatically
          }
          // Add to remote users list
          setRemoteUsers((prev) => [...prev, user]);
        });
        // When another user leaves
        agoraClient.on('user-left', (user) => {
          console.log('User left:', user.uid);
          setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid));
        });
        // ───────────────────────────────────────────────
        // STEP 4: Create Local Tracks (Your camera/mic)
        // ───────────────────────────────────────────────
        let tracks = [];
        if (activeCall.callType === 'video') {
          // For video calls, get both camera and mic
          tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
          // tracks[0] = microphone
          // tracks[1] = camera
        } else {
          // For voice calls, only get mic
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          tracks = [audioTrack];
        }
        setLocalTracks(tracks);  // Save to state
        // ───────────────────────────────────────────────
        // STEP 5: Join the Agora Channel
        // ───────────────────────────────────────────────
        await agoraClient.join(
          appId,                      // Your Agora App ID
          activeCall.channelName,     // Channel name (room)
          token,                      // Token from backend
          authUser._id                // Your user ID
        );
        console.log('✅ Joined Agora channel:', activeCall.channelName);
        // ───────────────────────────────────────────────
        // STEP 6: Publish Your Tracks (Let others see/hear you)
        // ───────────────────────────────────────────────
        await agoraClient.publish(tracks);
        console.log('✅ Published local tracks');
        // ───────────────────────────────────────────────
        // STEP 7: Display Your Video (If video call)
        // ───────────────────────────────────────────────
        if (activeCall.callType === 'video' && tracks[1]) {
          const localVideoTrack = tracks[1];
          const localContainer = document.getElementById('local-video');
          
          if (localContainer) {
            localVideoTrack.play(localContainer);
          }
        }
      } catch (error) {
        console.error('Error initializing Agora:', error);
      }
    };
    initAgora();  // Run the function
    // ───────────────────────────────────────────────────
    // CLEANUP (When call ends)
    // ───────────────────────────────────────────────────
    return () => {
      // Stop all local tracks
      localTracks.forEach(track => {
        track.stop();
        track.close();
      });
      // Leave the channel
      if (client) {
        client.leave();
      }
    };
  }, [activeCall]);  // Run when activeCall changes
  // ───────────────────────────────────────────────────────
  // TOGGLE MIC (Mute/Unmute)
  // ───────────────────────────────────────────────────────
  const toggleMic = async () => {
    if (localTracks[0]) {  // localTracks[0] = microphone
      await localTracks[0].setEnabled(!isMuted);
      // If muted (true), this makes it false (unmuted)
      // If unmuted (false), this makes it true (muted)
      
      setIsMuted(!isMuted);  // Update state
    }
  };
  // ───────────────────────────────────────────────────────
  // TOGGLE CAMERA (On/Off)
  // ───────────────────────────────────────────────────────
  const toggleVideo = async () => {
    if (activeCall.callType === 'video' && localTracks[1]) {
      // localTracks[1] = camera
      await localTracks[1].setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };
  // ───────────────────────────────────────────────────────
  // END CALL
  // ───────────────────────────────────────────────────────
  const handleEndCall = () => {
    endCall();  // From CallContext
    // This will:
    // 1. Emit 'end-call' socket event
    // 2. Notify other user
    // 3. Clear activeCall state
    // 4. Agora cleanup happens in useEffect cleanup
  };
  // ───────────────────────────────────────────────────────
  // RENDER UI
  // ───────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-[#0e0e10] z-50 flex flex-col">
      
      {/* ─────────────────────────────────────────────── */}
      {/* TOP BAR: User Info                              */}
      {/* ─────────────────────────────────────────────── */}
      
      <div className="bg-[#1c1c1f]/90 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">
            {activeCall.otherUserName}
          </h2>
          <p className="text-gray-400 text-sm">
            {activeCall.callType === 'video' ? 'Video Call' : 'Voice Call'}
          </p>
        </div>
      </div>
      {/* ─────────────────────────────────────────────── */}
      {/* VIDEO CONTAINERS                                 */}
      {/* ─────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        
        {/* ───────────────────────────────────────────── */}
        {/* REMOTE VIDEO (Other person - Full screen)    */}
        {/* ───────────────────────────────────────────── */}
        
        <div
          id="remote-video"
          className="absolute inset-0 bg-gray-900 flex items-center justify-center"
        >
          {/* Agora will inject video here */}
          {remoteUsers.length === 0 && (
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl text-white">
                  {activeCall.otherUserName[0].toUpperCase()}
                </span>
              </div>
              <p className="text-gray-400">Waiting for {activeCall.otherUserName}...</p>
            </div>
          )}
        </div>
        {/* ───────────────────────────────────────────── */}
        {/* LOCAL VIDEO (You - Small corner)              */}
        {/* ───────────────────────────────────────────── */}
        
        {activeCall.callType === 'video' && (
          <div
            id="local-video"
            className="absolute top-4 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700"
          >
            {/* Agora will inject your video here */}
          </div>
        )}
      </div>
      {/* ─────────────────────────────────────────────── */}
      {/* CONTROL BUTTONS (Bottom)                        */}
      {/* ─────────────────────────────────────────────── */}
      <div className="bg-[#1c1c1f]/90 backdrop-blur-xl px-6 py-6 flex justify-center gap-4">
        
        {/* MIC BUTTON */}
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${
            isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <IoMicOff className="text-2xl text-white" />
          ) : (
            <IoMic className="text-2xl text-white" />
          )}
        </button>
        {/* VIDEO BUTTON (Only for video calls) */}
        {activeCall.callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            {isVideoOff ? (
              <IoVideocamOff className="text-2xl text-white" />
            ) : (
              <IoVideocam className="text-2xl text-white" />
            )}
          </button>
        )}
        {/* END CALL BUTTON */}
        <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 p-4 rounded-full transition-colors"
          title="End call"
        >
          <IoCallSharp className="text-2xl text-white rotate-135" />
        </button>
      </div>
    </div>
  );
};
export default ActiveCallScreen;

