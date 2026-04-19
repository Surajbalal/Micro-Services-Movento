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
       <div  className='p-4 h-[95vh] ' >
         <h5 onClick={() => {props.setIsFinishRidePanelOpen(false);}}
           className="text-center w-[92%] flex text-3xl text-gray-200 justify-center absolute top-0 p-1"
         ><i className="ri-arrow-down-wide-line"></i></h5>
   
         <h3 className="text-2xl font-semibold mb-5 mt-7">Finish this Ride</h3>
         <div className='flex items-center justify-between mt-4 px-4 py-3  border-2 border-yellow-300 rounded-lg'>
           <div className='flex items-center gap-3'>
               <img className='h-12 w-12 object-cover rounded-full' src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnWUonkf5x2wy51XBChg4J8Ss0hUo0gG2qCg&s" alt="" />
               <h2 className='text-lg font-medium'>{`${props.rideData?.user.fullName.firstName+' '+props.rideData?.user.fullName.lastName}`}</h2>
           </div>
           <h5 className='text-lg font-semibold '>{props.rideData?.distance/1000} KM</h5>
         </div>
   
         <div className="flex gap-2 flex-col justify-between items-center mt-5">
           <div className="w-full">
             <div className="flex items-center gap-5 p-3 border-gray-300 border-b-2">
               <i className="text-lg ri-map-pin-2-fill"></i>
               <div>
                 <h3 className="text-lg font-medium">432/22-B</h3>
                 <p className="text-sm -mt-1 text-gray-600">
                  {props.rideData?.pickup?.address}
                 </p>
               </div>
             </div>
   
             <div className="flex items-center gap-5 border-gray-300 p-3 border-b-2">
               <i className="ri-wallet-2-line"></i>
               <div>
                 <h3 className="text-lg font-medium">₹{props.rideData?.fare}</h3>
                 <p className="text-sm -mt-1 text-gray-600">Cash Cash</p>
               </div>
             </div>
   
             <div className="flex items-center gap-5 p-3">
               <i className="text-lg ri-map-pin-2-fill"></i>
               <div>
                 <h3 className="text-lg font-medium">432/22-B</h3>
                 <p className="text-sm -mt-1 text-gray-600">
                                    {props.rideData?.destination?.address}
                 </p>
               </div>
             </div>
      <div className='mt-6  w-full flex item-center justify-center'>
        {/* <form onSubmit={submitHandler} > */}
           {/* <input onChange={(e)=>{
             setOtp(e.target.value);
           }} 
           value={otp}
           className='bg-[#eee] font-mono px-6 py-4 text-lg rounded-lg w-full mt-3' type="text" placeholder='Enter OTP'/>
           <div className='flex items-center mt-4 justify-between w-full gap-3'> */}
   
   
       <button
       onClick={endRide}
       disabled={isSubmitting}
       className=" bg-green-600 mt-10 mb-4 text-center w-screen  text-white font-medium p-3 px-10 rounded-lg disabled:opacity-50"
     >
       {isSubmitting ? 'Completing Ride...' : 'Complete Ride'}
     </button>
   
   </div>
     <p className=' text-xs text-center'>click on finish ride if you have completed the payment</p>
       {/* </form> */}
      {/* </div> */}
         
           </div>
         </div>
       </div>
  )

}

export default FinishRide