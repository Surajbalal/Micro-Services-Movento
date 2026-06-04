import React, { useContext, useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { SocketContext } from '../Context/SocketContext';
import { joinCall, leaveCall } from '../services/agora.service';

const Call = forwardRef(({ rideId, callerId, receiverId, renderTrigger }, ref) => {
  const { sendMessage, receiveMessage,socket } = useContext(SocketContext);
  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'connected'
  // Using a universally supported mp3 ringtone URL
  const audioRef = useRef(new Audio("https://actions.google.com/sounds/v1/alarms/phone_ringing.ogg"));

  useEffect(() => {
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=classic-phone-ringtone-5660.mp3");
    audioRef.current.loop = true;
    
    // Safety check - join socket room for signaling
    console.log("rideId", rideId);
    console.log("sendMessage", sendMessage);
    if (rideId && sendMessage) {
      console.log("join-ride-room", rideId);
      sendMessage("join-ride-room", rideId);
    }

    return () => {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    };
  }, [rideId, sendMessage]);

  const stopAudio = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };


  useEffect(() => {
    if (!receiveMessage) return;
    const unsubs = [];
    // socket.on("incoming-call", (data) => {
    //   console.log("incoming-call", data);
    // })

    // When someone calls me
    unsubs.push(
      receiveMessage("incoming-call", (data) => {
        console.log("incoming-call", data);
        if (data.rideId === rideId && data.receiverId === callerId) {
          setCallState('incoming');
          audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
        }
      })
    );

    // When someone accepts my call
    unsubs.push(
      receiveMessage("call-accepted", (data) => {
        if (data.rideId === rideId && (data.callerId === callerId || data.receiverId === callerId)) {
          stopAudio();
          setCallState('connected');
          joinCall(`ride_${rideId}`, callerId);
        }
      })
    );

    // When call is rejected
    unsubs.push(
      receiveMessage("call-rejected", (data) => {
        console.log("call-rejected", data);
        if (data.rideId === rideId && data.callerId === receiverId) {
          stopAudio();
          setCallState('idle');
          // Optional: Show toast here, alert may block UI
        }
      })
    );

    // When call is ended
    unsubs.push(
      receiveMessage("call-ended", (data) => {
        if (data.rideId === rideId) {
          stopAudio();
          leaveCall();
          setCallState('idle');
        }
      })
    );

    return () => {
      unsubs.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      stopAudio();
    };
  }, [receiveMessage, rideId, callerId]);

  const initiateCall = () => {
    console.log("inside initiateCall",rideId,callerId,receiverId);
    if (!rideId || !callerId || !receiverId) return console.warn("Missing Call Data");
    setCallState('calling');
  
    audioRef.current.play().catch(e => console.log("Audio blocked by browser:", e));
    sendMessage("call-user",  rideId);
     sendMessage("debug-room", rideId);
    // Auto hangup after 30 seconds of ringing
    setTimeout(() => {
      setCallState((current) => {
        if (current === 'calling') {
          stopAudio();
          sendMessage("end-call", rideId);
          return 'idle';
        }
        return current;
      });
    }, 30000);
  };

  // Expose initiateCall so parent (CaptainHome) can trigger it via ref
  useImperativeHandle(ref, () => ({ initiateCall }));

  const acceptCall = () => {
    stopAudio();
    sendMessage("accept-call", rideId);
    setCallState('connected');
    joinCall(`ride_${rideId}`, callerId);
  };

  const rejectCall = () => {
    stopAudio();
    sendMessage("reject-call",  rideId);
    setCallState('idle');
  };

  const endCall = () => {
    stopAudio();
    leaveCall();
    sendMessage("end-call", rideId);
    setCallState('idle');
  };

  // UI Render
  if (callState === 'idle') {
    if (renderTrigger) return renderTrigger(initiateCall);
    return (
      <button 
        onClick={initiateCall} 
        className="flex items-center justify-center p-3 sm:p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        title="Voice Call"
      >
        <i className="ri-phone-fill text-xl sm:text-2xl"></i>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-11/12 max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden animate-fade-in-up">
        
        {/* Animated Background Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-blue-50/50 z-0"></div>
        
        <div className="relative z-10 w-full flex flex-col items-center">
          
          <div className="mb-6 relative">
             {/* Pulse Ring for Calling and Incoming */}
             {(callState === 'calling' || callState === 'incoming') && (
               <>
                 <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
                 <div className="absolute -inset-4 bg-green-100 rounded-full animate-pulse opacity-50"></div>
               </>
             )}
             <div className={`relative flex items-center justify-center w-24 h-24 rounded-full shadow-inner ${callState === 'connected' ? 'bg-blue-100 text-blue-500' : 'bg-green-100 text-green-500'}`}>
                <i className={`text-4xl ${callState === 'connected' ? 'ri-voiceprint-fill' : 'ri-user-smile-line'}`}></i>
             </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {callState === 'calling' ? 'Calling...' : 
             callState === 'incoming' ? 'Incoming Call' : 
             'In Call'}
          </h2>
          
          <p className="text-gray-500 mb-8 text-center text-sm font-medium">
             {callState === 'connected' ? 'Secured with Agora.io' : 'Waiting for response...'}
          </p>

          <div className="w-full flex justify-center gap-6">
            
            {callState === 'incoming' && (
              <button 
                onClick={acceptCall}
                className="flex flex-col items-center group"
              >
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-green-500/30 group-hover:bg-green-600 transition-all hover:scale-110 active:scale-95">
                  <i className="ri-phone-fill animate-pulse"></i>
                </div>
                <span className="mt-2 text-sm font-semibold text-gray-600">Accept</span>
              </button>
            )}

            {(callState === 'calling' || callState === 'incoming' || callState === 'connected') && (
              <button 
                onClick={callState === 'incoming' ? rejectCall : endCall}
                className="flex flex-col items-center group"
              >
                <div className="bg-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-red-500/30 group-hover:bg-red-600 transition-all hover:scale-110 active:scale-95">
                  <i className="ri-phone-camera-fill transform rotate-[135deg]"></i>
                </div>
                <span className="mt-2 text-sm font-semibold text-gray-600">
                  {callState === 'incoming' ? 'Decline' : 'End'}
                </span>
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
});

export default Call;