import React, { useState, useContext, useEffect } from "react";
import RatingPopup from "./RatingPopup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SocketContext } from "../Context/SocketContext";
import LiveTracking from "../Components/LiveTracking";
import useRideRoom from "../Hooks/useRideRoom";
import PaymentButton from "./PaymentButton";

function Riding() {
  const location = useLocation();
  const rideData = location.state?.ride;
  const { socket, receiveMessage } = useContext(SocketContext);
  const navigate = useNavigate();
  const [showRatingPopup, setShowRatingPopup] = useState(false);

  useEffect(() => {
    const cleanup = receiveMessage("ride-ended", () => {
      setShowRatingPopup(true);
      console.log(" ride-ended received");
    });

    return cleanup;
  }, [socket, receiveMessage]);

  useRideRoom(socket, rideData?._id);

  return (
    <div className='h-screen flex flex-col md:flex-row bg-gray-50 overflow-hidden relative'>
        <Link to="/home" className='fixed right-4 top-4 z-50 h-12 w-12 bg-white flex items-center justify-center rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition-colors'>
            <i className="text-xl font-medium ri-home-5-line"></i>
        </Link>
        
        <div className='flex-1 h-1/2 md:h-full relative w-full'>
             <LiveTracking rideData={rideData}/>
             
             {/* Map Gradient Overlay */}
             <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 md:from-transparent to-transparent pointer-events-none"></div>
        </div>

        <div className='h-1/2 md:h-full w-full md:w-96 lg:w-[450px] bg-white rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.1)] px-6 py-8 flex flex-col justify-between relative z-10 overflow-y-auto'>
          <div>
            {/* Driver Profile Bar */}
            <div className='flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100'>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    className="h-14 w-14 rounded-full object-cover shadow-sm border-2 border-white"
                    src="https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png"
                    alt="Driver"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h2 className='text-xl font-bold text-gray-800'>{rideData?.captain?.fullName?.firstName || 'Driver'}</h2>
                  <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
                    <i className="ri-star-fill text-yellow-500"></i>
                    <span>4.9</span>
                  </div>
                </div>
              </div>
              <div className='text-right'>
                  <h4 className='text-2xl font-black text-gray-800 uppercase tracking-wider'>{rideData?.captain?.vehicle?.plate || 'MH12 AB 1234'}</h4>
                  <p className='text-sm text-gray-500 font-medium capitalize'>{rideData?.captain?.vehicle?.vehicleType || 'Car'}</p>
              </div>
            </div>
          
            <div className="flex flex-col mt-6 gap-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                    <i className="text-xl ri-map-pin-2-fill"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Destination</h3>
                    <p className="text-gray-800 font-medium line-clamp-2">
                    {rideData?.destination?.address || 'Loading destination...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                    <i className="text-xl ri-wallet-2-fill"></i>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Fare</h3>
                    <h3 className="text-2xl font-bold text-gray-800">₹{rideData?.fare}</h3>
                  </div>
                </div>
              </div>
          </div>

          <button className="w-full mt-6 bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-colors text-lg">
            <PaymentButton
    paymentStatus={rideData.payment?.status}
    rideId={rideData._id}
    userId={rideData.user}
    amount={rideData.fare}
/>
          </button>
        </div>

        {/* Rating Popup Modal */}
        {showRatingPopup && (
          <RatingPopup 
            rideData={rideData} 
            onClose={() => setShowRatingPopup(false)} 
          />
        )}
    </div>
  );
}

export default Riding;
