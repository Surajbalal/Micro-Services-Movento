import captainAxiosInstance from '../api/captainAxiosInstance';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

function FinishRide(props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const endRide = async () =>{
    try {
      setIsSubmitting(true);
      const response = await captainAxiosInstance.post(`/rides/end-ride`, {
        rideId: props.rideData._id,
      });
      if(response.status == 200){
        navigate('/captain-home')
      }
    } catch (error) {
      console.error("Error ending ride:", error);
      alert(error.response?.data?.message || "Failed to end ride.");
    } finally {
      setIsSubmitting(false);
    }
  }
   return (
       <div className='p-6 h-full flex flex-col justify-between bg-white'>
         <div className="flex flex-col items-center mb-6 relative">
           <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4 cursor-pointer" onClick={() => {props.setIsFinishRidePanelOpen(false);}}></div>
           <h3 className="text-2xl font-bold text-gray-800">Complete this Ride</h3>
         </div>

         <div className='flex items-center justify-between mt-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl'>
           <div className='flex items-center gap-4'>
               <img className='h-14 w-14 object-cover rounded-full shadow-sm border-2 border-white' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnWUonkf5x2wy51XBChg4J8Ss0hUo0gG2qCg&s" alt="User" />
               <div>
                 <h2 className='text-lg font-bold text-gray-800'>{`${props.rideData?.user?.fullName?.firstName || 'User'} ${props.rideData?.user?.fullName?.lastName || ''}`}</h2>
                 <p className="text-sm text-gray-500 font-medium">Rider</p>
               </div>
           </div>
           <div className="text-right">
             <h5 className='text-xl font-bold text-gray-800'>{props.rideData?.distance ? (props.rideData.distance/1000).toFixed(1) : '0'} KM</h5>
             <p className="text-sm text-gray-500 font-medium">Distance</p>
           </div>
         </div>
   
         <div className="flex flex-col gap-4 mt-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                <i className="text-xl ri-map-pin-line"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Pickup</h3>
                <p className="text-gray-800 font-medium line-clamp-2">
                  {props.rideData?.pickup?.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                <i className="text-xl ri-map-pin-2-fill"></i>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dropoff</h3>
                <p className="text-gray-800 font-medium line-clamp-2">
                  {props.rideData?.destination?.address}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 bg-green-50/50 rounded-2xl border border-green-100 mt-2">
              <div className="bg-green-500 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md">
                <i className="text-2xl ri-bank-card-fill"></i>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-0.5">Collect Cash</h3>
                <h3 className="text-3xl font-black text-gray-900">₹{props.rideData?.fare}</h3>
              </div>
            </div>
         </div>
         
         <div className='mt-auto pt-8 pb-4'>
           <button
             onClick={endRide}
             disabled={isSubmitting}
             className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
               isSubmitting ? 'bg-gray-400 scale-95 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 hover:shadow-xl active:scale-95'
             }`}
           >
             {isSubmitting ? (
               <><i className="ri-loader-4-line animate-spin text-xl"></i> Finishing...</>
             ) : (
               <><i className="ri-check-line text-xl"></i> Complete Ride</>
             )}
           </button>
           <p className='text-xs text-center text-gray-500 mt-4 font-medium'>Please collect payment before completing the ride</p>
         </div>
       </div>
  )

}

export default FinishRide