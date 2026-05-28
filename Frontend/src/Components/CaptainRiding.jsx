import React, { useContext, useRef, useState, useMemo, useEffect } from 'react'
import logo from "../assets/logo.png";
import { Link, useLocation } from 'react-router-dom';
import FinishRide from './FinishRide';
import { useGSAP } from '@gsap/react';
import gsap from "gsap";
import { SocketContext } from '../Context/SocketContext';
import useRideRoom from '../Hooks/useRideRoom';
import LiveTracking from '../Components/LiveTracking';

function CaptainRiding() {
  const [isFinishRidePanelOpen, setIsFinishRidePanelOpen] = useState(false);
  const finishRidePanelPef = useRef(null);
  const location = useLocation();
  const rideData = location.state?.ride
  const { socket } = useContext(SocketContext);
  const status = rideData?.status;
  const currentLocation = rideData?.currentLocation;

  useRideRoom(socket, rideData?._id)

  const pickup = useMemo(() => {
    if (rideData?.pickup?.location?.coordinates) {
      return {
        lat: Number(rideData.pickup.location.coordinates[1]),
        lng: Number(rideData.pickup.location.coordinates[0]),
      };
    }
    return null;
  }, [rideData]);

  useGSAP(() => {
    if (isFinishRidePanelOpen == true) {
      gsap.to(finishRidePanelPef.current, {
        transform: 'translateY(0)'
      })
    } else {
      gsap.to(finishRidePanelPef.current, {
        transform: 'translateY(100%)'
      })
    }
  }, [isFinishRidePanelOpen])

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden flex flex-col relative bg-gray-50">
      <div className="fixed w-full items-center p-4 top-0 flex justify-between z-20 pointer-events-none">
        <img className="w-16 pointer-events-auto shadow-sm rounded bg-white p-1" src={logo} alt="Uber" />
        <Link
          to="/captain-home"
          className="h-12 w-12 bg-white flex items-center justify-center rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors pointer-events-auto"
        >
          <i className="text-xl font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      <div className="flex-1 h-full relative">
        <LiveTracking rideData={rideData} isCaptain={true} />
        {/* Map Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      {/* Modern Floating Action Panel */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none flex justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur-2xl p-5 rounded-3xl shadow-[0_-5px_40px_rgba(0,0,0,0.2)] border border-white flex justify-between items-center relative pointer-events-auto transition-transform duration-300">
          
          {/* Subtle swipe-up indicator if panel isn't open */}
          {((status === 'accepted' || status === 'ongoing')) && !isFinishRidePanelOpen && (
            <div 
              onClick={() => setIsFinishRidePanelOpen(true)}
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-gray-300/80 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
            ></div>
          )}

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
              <i className="ri-navigation-fill text-2xl"></i>
            </div>
            <div>
              <h4 className='text-2xl font-black text-gray-800 tracking-tight'>Ongoing</h4>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">En route</p>
            </div>
          </div>
          
          {((status === 'accepted' || status === 'ongoing')) && (
            <button 
              onClick={() => setIsFinishRidePanelOpen(true)} 
              className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-lg">End Ride</span>
              <i className="ri-arrow-right-line text-xl"></i>
            </button>
          )}
        </div>
      </div>

      <div
        ref={finishRidePanelPef}
        className='fixed z-30 bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-full max-w-md max-h-[95vh] rounded-t-[2.5rem] overflow-hidden bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.2)]'
      >
        <FinishRide rideData={rideData} setIsFinishRidePanelOpen={setIsFinishRidePanelOpen} />
      </div>
    </div>
  )
}

export default CaptainRiding