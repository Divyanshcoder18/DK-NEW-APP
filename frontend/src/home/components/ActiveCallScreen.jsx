import React, { useState, useEffect } from 'react';
import { useCallContext } from '../../context/CallContext';
import { useAuth } from '../../context/AuthContext';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';

const ActiveCallScreen = () => {
  const { activeCall, endCall } = useCallContext();
  const { authUser } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [client, setClient] = useState(null);
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState([]);

  useEffect(() => {
    if (!activeCall || !authUser) return;

    let mounted = true;
    let agoraClient = null;
    let tracks = [];

    const initAgora = async () => {
      try {
        const response = await axios.post('/api/call/agora-token', {
          channelName: activeCall.channelName,
          userId: authUser._id
        });

        if (!mounted) return;

        const { token, appId } = response.data;

        agoraClient = AgoraRTC.createClient({
          mode: 'rtc',
          codec: 'vp8'
        });

        setClient(agoraClient);

        agoraClient.on('user-published', async (user, mediaType) => {
          try {
            await agoraClient.subscribe(user, mediaType);

            if (mediaType === 'video') {
              const remoteVideoTrack = user.videoTrack;
              const playerContainer = document.getElementById('remote-video');
              if (playerContainer && remoteVideoTrack) {
                remoteVideoTrack.play(playerContainer);
              }
            }

            if (mediaType === 'audio') {
              const remoteAudioTrack = user.audioTrack;
              if (remoteAudioTrack) {
                remoteAudioTrack.play();
              }
            }

            if (mounted) {
              setRemoteUsers((prev) => [...prev, user]);
            }
          } catch (err) {
            console.error('Error handling user-published:', err);
          }
        });

        agoraClient.on('user-left', (user) => {
          if (mounted) {
            setRemoteUsers((prev) => prev.filter(u => u.uid !== user.uid));
          }
        });

        if (activeCall.callType === 'video') {
          tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        } else {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          tracks = [audioTrack];
        }

        if (!mounted) {
          tracks.forEach(track => track.close());
          return;
        }

        setLocalTracks(tracks);

        await agoraClient.join(appId, activeCall.channelName, token, authUser._id);
        await agoraClient.publish(tracks);

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

    initAgora();

    return () => {
      mounted = false;
      tracks.forEach(track => {
        try {
          track.stop();
          track.close();
        } catch (err) {
          console.error('Error closing track:', err);
        }
      });
      if (agoraClient) {
        try {
          agoraClient.leave();
        } catch (err) {
          console.error('Error leaving channel:', err);
        }
      }
    };
  }, [activeCall, authUser]);

  if (!activeCall) return null;

  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  
  const toggleVideo = async () => {
    if (activeCall.callType === 'video' && localTracks[1]) {
      await localTracks[1].setEnabled(!isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="bg-gray-900 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">
            {activeCall.otherUserName}
          </h2>
          <p className="text-gray-400 text-sm">
            {activeCall.callType === 'video' ? 'Video Call' : 'Voice Call'}
          </p>
        </div>
      </div>

      <div className="flex-1 relative">
        <div
          id="remote-video"
          className="absolute inset-0 bg-gray-900 flex items-center justify-center"
        >
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

        {activeCall.callType === 'video' && (
          <div
            id="local-video"
            className="absolute top-4 right-4 w-32 h-40 bg-gray-800 rounded-lg overflow-hidden shadow-xl border border-gray-700"
          />
        )}
      </div>

      <div className="bg-gray-900 px-6 py-6 flex justify-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <span className="text-2xl text-white">{isMuted ? '🔇' : '🎤'}</span>
        </button>

        {activeCall.callType === 'video' && (
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
          >
            <span className="text-2xl text-white">{isVideoOff ? '📷' : '📹'}</span>
          </button>
        )}

        <button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 p-4 rounded-full transition-colors"
          title="End call"
        >
          <span className="text-2xl text-white">📞</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveCallScreen;
