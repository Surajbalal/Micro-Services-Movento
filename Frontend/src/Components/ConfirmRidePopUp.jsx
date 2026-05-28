import captainAxiosInstance from '../api/captainAxiosInstance';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

function  ConfirmRidePopUp(props) {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const defaultReasons = ["User not reachable", "Wrong address", "Vehicle issue", "Other"];
  const navigate = useNavigate();
  
  const submitHandler = async (e) =>{
      e.preventDefault()
      setIsLoading(true)
      
      try {
        const response = await captainAxiosInstance.get(`/rides/start-ride`, {
          params: { rideId: props.ride._id, otp: otp },
        });
        if(response.status == 200){
           props.setIsConfirmPopUpOpen(false);
           props.setIsRidePopupOpen(false);
           props.setIsRideAccepted(false);
           navigate('/captain-riding',
             {
              state:{ ride: response.data.ride || { ...props.ride, status: "ongoing" } }
             }
           )
        }
      } catch (error) {
        console.error("Error starting ride:", error);
        alert(error.response?.data?.message || "Failed to start ride. Please check the OTP.");
      } finally {
        setIsLoading(false)
      }
  }
  
  const handleClose = () => {
    props.setIsConfirmPopUpOpen(false);
    // Don't reset ride accepted state - keep the floating button visible
  }

  const cancelRideHandler = async () => {
    try {
      setIsLoading(true);
      const response = await captainAxiosInstance.post(`/rides/cancel`, {
        rideId: props.ride._id,
        reason: cancelReason,
        note: otherReason
      });
      if(response.status === 200){
         setShowCancelModal(false);
         setCancelStep(1);
         setCancelReason("");
         setOtherReason("");
         props.setIsConfirmPopUpOpen(false);
         props.setIsRidePopupOpen(false);
         props.setIsRideAccepted(false);
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
      alert(error.response?.data?.message || "Failed to cancel ride.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setTimeout(() => {
      setCancelStep(1);
      setCancelReason("");
      setOtherReason("");
    }, 300);
  };
  
  return (
    <div className="p-4 sm:p-6">
      <button 
        onClick={handleClose}
        className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 text-xl sm:text-2xl transition-colors duration-200 focus:outline-none"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 text-center">
        Confirm this ride to Start
      </h3>
      
      <div className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 bg-gray-50 rounded-lg sm:rounded-xl mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <img 
            className="h-12 w-12 sm:h-14 sm:w-14 object-cover rounded-full border border-gray-300" 
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnWUonkf5x2wy51XBChg4J8Ss0hUo0gG2qCg&s" 
            alt="User" 
          />
          <div>
            <h2 className="text-base sm:text-lg font-medium text-gray-900">
              {props.ride?.user.fullName.firstName} {props.ride?.user.fullName.lastName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">Customer</p>
          </div>
        </div>
        <div className="text-right">
           <h5 className="text-base sm:text-lg font-semibold text-gray-900">
             {(props.ride?.distance / 1000).toFixed(1)} KM
           </h5>
           <p className="text-xs sm:text-sm text-gray-500">Distance</p>
         </div>
      </div>

      <div className="space-y-1 mb-4 sm:mb-6">
        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100">
          <div className="bg-gray-100 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full shrink-0">
            <i className="text-gray-600 text-sm sm:text-base ri-map-pin-2-fill"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-900">Pickup</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {props.ride?.pickup.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-100">
          <div className="bg-gray-100 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full shrink-0">
            <i className="text-gray-600 text-sm sm:text-base ri-wallet-2-line"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-900">₹{props.ride?.fare}</h3>
            <p className="text-xs sm:text-sm text-gray-500">Cash payment</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
          <div className="bg-gray-100 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full shrink-0">
            <i className="text-gray-600 text-sm sm:text-base ri-map-pin-2-fill"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-medium text-gray-900">Destination</h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {props.ride?.destination.address}
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-xl animate-slide-up relative">
            <button 
              onClick={closeCancelModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 focus:outline-none"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
            
            {cancelStep === 1 ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Ride</h3>
                <p className="text-sm text-gray-500 mb-5">Select reason (required)</p>

                <div className="space-y-3 mb-6">
                  {defaultReasons.map((reason, index) => (
                    <button 
                      key={index} 
                      type="button"
                      onClick={() => {
                        setCancelReason(reason);
                        setCancelStep(2);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 hover:border-black transition-all focus:outline-none text-left"
                    >
                      <span className="text-sm font-medium text-gray-900">{reason}</span>
                      <i className="ri-arrow-right-s-line text-gray-400 text-lg"></i>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <button 
                    type="button"
                    onClick={() => setCancelStep(1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
                  >
                    <i className="ri-arrow-left-line text-gray-600"></i>
                  </button>
                  <h3 className="text-xl font-bold text-gray-900">Add Feedback</h3>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-5 border border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Selected Reason</p>
                  <p className="text-sm font-medium text-gray-900">{cancelReason}</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">
                    {cancelReason === 'Other' ? 'Please specify (required)' : 'Additional notes (optional)'}
                  </p>
                  <textarea 
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder={cancelReason === 'Other' ? "Write your reason here..." : "Tell us more about why you're cancelling..."}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black resize-none h-28 text-sm transition-colors"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={cancelRideHandler}
                    disabled={isLoading || (cancelReason === 'Other' && !otherReason.trim())}
                    className="w-full py-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all focus:outline-none shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? 'Cancelling...' : 'Submit Cancellation'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={submitHandler} className="space-y-4">
        <div>
          <input 
            onChange={(e) => setOtp(e.target.value)}
            value={otp}
            className="w-full px-4 py-3 sm:py-4 text-center font-mono text-lg sm:text-xl border-2 border-gray-300 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-500 transition-all duration-200" 
            type="text" 
            placeholder="Enter OTP"
            maxLength={6}
            required
            disabled={isLoading}
          />
        </div>
        
        <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={isLoading}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm sm:text-base disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm sm:text-base disabled:opacity-50"
          >
            {isLoading ? 'Starting...' : 'Start Ride'}
          </button>
        </div>
      </form>

      {/* Call User button — styled like WaitingForDriver's Call Captain */}
      {props.onCallUser && (
        <button
          type="button"
          onClick={props.onCallUser}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all font-medium text-sm text-gray-900 focus:outline-none"
        >
          <i className="ri-phone-line text-lg"></i>
          Call User
        </button>
      )}
    </div>
  )
}

export default ConfirmRidePopUp