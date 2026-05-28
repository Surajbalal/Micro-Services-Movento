import React, { useState } from 'react'
import Call from './Call';
import { useContext } from 'react';
import { SocketContext } from '../Context/SocketContext';
import axiosInstance from '../api/axiosInstance';
import PaymentButton from './PaymentButton';

function WaitingForDriver(props) {
  const [paymentMode, setPaymentMode] = useState('cash'); // 'cash' | 'online'
  const [showPaymentModal, setShowPaymentModal] = useState(false);
 const { sendMessage, socket } = useContext(SocketContext);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelStep, setCancelStep] = useState(1);
  const [cancelReason, setCancelReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const defaultReasons = ["Driver is too far", "Changed my mind", "Wait time is too long", "Other"];

  const handleMinimize = () => {
    props.setIsDriverWaitingOpen(false);
  };

  const handleCancelRide = async () => {
    try {
      const response = await axiosInstance.post('/rides/cancel', {
        rideId: props.rideData?._id,
        reason: cancelReason,
        note: otherReason
      });
      if (response.status === 200) {
        setShowCancelModal(false);
        setCancelStep(1);
        setCancelReason("");
        setOtherReason("");
        props.setIsDriverWaitingOpen(false);
        props.setIsRideAccepted(false);
        
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
      alert(error.response?.data?.message || "Failed to cancel ride.");
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
    <div className="p-4 sm:p-6 relative font-sans">

      {/* Drag handle */}
      <div className="flex justify-center mb-4">
        <div className="w-9 h-1 bg-gray-200 rounded-full"></div>
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Captain confirmed</p>
          <h2 className="text-xl font-bold text-gray-900">Driver on the way!</h2>
        </div>
        <button
          onClick={handleMinimize}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none"
          title="Minimize"
        >
          <i className="ri-arrow-down-s-line text-xl text-gray-600"></i>
        </button>
      </div>

      {/* Captain Details Card */}
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
        {/* Captain Info row */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-100">
          <img
            src={`https://picsum.photos/seed/${props.rideData?.captain?._id || 'driver'}/80/80`}
            alt="Captain"
            className="w-11 h-11 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {props.rideData?.captain?.fullName?.firstName} {props.rideData?.captain?.fullName?.lastName}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Your Captain</p>
          </div>
          {/* Plate only on the right */}
          <div className="flex-shrink-0 text-right">
            <p className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md tracking-widest">
              {props.rideData?.captain?.vehicle?.plate}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 text-center uppercase tracking-wider">
              {props.rideData?.captain?.vehicle?.vehicleType}
            </p>
          </div>
        </div>

        {/* OTP row */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Your OTP</p>
            <p className="text-3xl font-bold text-gray-900 tracking-[0.2em]">
              {props.rideData?.otp}
            </p>
          </div>
          <p className="text-xs text-gray-400 max-w-[90px] text-right leading-relaxed">
            Share with driver to start the ride
          </p>
        </div>
      </div>

      {/* Trip Details Card */}
      <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
        {/* Pickup */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-100">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Pickup</p>
            <p className="text-sm font-medium text-gray-900 leading-snug break-words">
              {props.rideData?.pickup?.address || props.rideData?.pickup}
            </p>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-100">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Destination</p>
            <p className="text-sm font-medium text-gray-900 leading-snug break-words">
              {props.rideData?.destination?.address || props.rideData?.destination}
            </p>
          </div>
        </div>

        {/* Fare + Payment row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <i className={`text-base ${paymentMode === 'online' ? 'ri-bank-card-line text-blue-500' : 'ri-wallet-3-line text-gray-400'}`}></i>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">Fare</p>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="text-xs text-blue-600 font-medium hover:underline focus:outline-none flex items-center gap-1"
              >
                <span>{paymentMode === 'cash' ? 'Cash' : 'Online'}</span>
                <i className="ri-arrow-right-s-line text-sm"></i>
              </button>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">₹{props.rideData?.fare}</p>
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
                    onClick={handleCancelRide}
                    disabled={cancelReason === 'Other' && !otherReason.trim()}
                    className="w-full py-4 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all focus:outline-none shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    Submit Cancellation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Payment Mode Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-2xl p-5 shadow-xl animate-slide-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-gray-900">Choose Payment Mode</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-700 text-xl focus:outline-none">
                <i className="ri-close-line"></i>
              </button>
            </div>

            {/* Cash Option */}
            <button
              onClick={() => { setPaymentMode('cash'); setShowPaymentModal(false); }}
              className={`w-full flex items-center gap-4 p-4 mb-3 rounded-xl border-2 transition-all ${paymentMode === 'cash' ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMode === 'cash' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                <i className="ri-wallet-3-line text-lg"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Cash</p>
                <p className="text-xs text-gray-400">Pay in cash to the driver</p>
              </div>
              {paymentMode === 'cash' && <i className="ri-check-line text-black text-lg"></i>}
            </button>

            {/* Online Option */}
            <button
              onClick={() => { setPaymentMode('online'); setShowPaymentModal(false); }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMode === 'online' ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-gray-300'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMode === 'online' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <i className="ri-bank-card-line text-lg"></i>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-900">Online / UPI</p>
                <p className="text-xs text-gray-400">Pay via UPI, card or wallet</p>
              </div>
              {paymentMode === 'online' && <i className="ri-check-line text-blue-500 text-lg"></i>}
            </button>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex gap-3 mt-2 w-full">
        {/* Cancel Ride Button */}
        <button
          onClick={() => setShowCancelModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all font-medium text-sm focus:outline-none border-2 border-red-100"
          title="Cancel Ride"
        >
          <i className="ri-close-circle-line text-lg"></i>
          <span className="hidden sm:inline">Cancel</span>
        </button>

        {/* Call Captain Button */}
        <Call
          rideId={props.rideData?._id}
          callerId={props.rideData?.user}
          receiverId={props.rideData?.captain?._id}
          renderTrigger={(onCall) => (
            <button
              onClick={() => {
                onCall();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-gray-200 hover:border-black hover:bg-gray-50 transition-all font-medium text-sm text-gray-900 focus:outline-none"
            >
              <i className="ri-phone-line text-lg"></i>
              Call Captain
            </button>
          )}
        />

        {/* Pay Now — only shown when online is selected */}
        {paymentMode === 'online' && (
          // <button
          //   className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 transition-all font-semibold text-sm text-white focus:outline-none shadow-sm"
          // >
          //   <i className="ri-bank-card-line text-lg"></i>
          //   Pay ₹{props.rideData?.fare}
          // </button>
          <PaymentButton
   
          rideId={props.rideData?._id}
          userId={props.rideData?.user}
          amount={props.rideData?.fare}
          />
        )}
      </div>

    </div>
  );
}

export default WaitingForDriver