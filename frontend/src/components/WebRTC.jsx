import React, { useEffect, useRef, useState } from 'react';
import SimplePeer from 'simple-peer';
import { useSocket } from '../context/SocketContext';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';

function WebRTC({ targetUserId, callType = 'video', onEnd }) {
  const { socket } = useSocket();
  const [peer, setPeer] = useState(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStartTime] = useState(Date.now());
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    if (!socket || !targetUserId) return;

    // Get user media
    const constraints = {
      audio: true,
      video: callType === 'video'
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(mediaStream => {
        setStream(mediaStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStream;
        }

        // Create peer connection (initiator)
        const newPeer = new SimplePeer({
          initiator: true,
          trickle: false,
          stream: mediaStream
        });

        newPeer.on('signal', signal => {
          // Send signal to target user via socket
          socket.emit('webrtc_signal', {
            target_user_id: targetUserId,
            signal: signal,
            call_type: callType
          });
        });

        newPeer.on('stream', remoteStream => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        newPeer.on('error', err => {
          console.error('Peer error:', err);
        });

        // Listen for signal from remote peer
        socket.on('webrtc_signal', data => {
          if (data.from_user_id === targetUserId) {
            newPeer.signal(data.signal);
          }
        });

        setPeer(newPeer);
      })
      .catch(err => {
        console.error('Failed to get user media:', err);
        alert('Failed to access camera/microphone. Please check permissions.');
        onEnd && onEnd();
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (peer) {
        peer.destroy();
      }
      socket.off('webrtc_signal');
    };
  }, [socket, targetUserId, callType]);

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream && callType === 'video') {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    const duration = Math.floor((Date.now() - callStartTime) / 1000);
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    
    onEnd && onEnd({ duration });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col" data-testid="webrtc-call">
      {/* Remote Video */}
      <div className="flex-1 relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local Video (Picture in Picture) */}
        {callType === 'video' && (
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Voice Call Display */}
        {callType === 'voice' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700">
            <div className="text-center text-white">
              <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaMicrophone className="text-6xl" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Voice Call</h2>
              <p className="text-xl text-blue-100">Connected</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 bg-opacity-90 p-6">
        <div className="flex items-center justify-center space-x-4">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
            }`}
            data-testid="toggle-mute-button"
          >
            {isMuted ? <FaMicrophoneSlash className="text-white text-xl" /> : <FaMicrophone className="text-white text-xl" />}
          </button>

          {/* Video On/Off */}
          {callType === 'video' && (
            <button
              onClick={toggleVideo}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition ${
                isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              data-testid="toggle-video-button"
            >
              {isVideoOff ? <FaVideoSlash className="text-white text-xl" /> : <FaVideo className="text-white text-xl" />}
            </button>
          )}

          {/* End Call */}
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition shadow-lg"
            data-testid="end-call-button"
          >
            <FaPhoneSlash className="text-white text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default WebRTC;