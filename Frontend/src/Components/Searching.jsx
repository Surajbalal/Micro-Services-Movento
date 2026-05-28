import React from "react";

function Searching(props) {
  const vehicleImages = {
    car: "https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png",
    motorcycle: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8yYzdmYTE5NC1jOTU0LTQ5YjItOWM2ZC1hM2I4NjAxMzcwZjUucG5n",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n"
  };

  return (
    <div className="p-6">
      <button
        onClick={() => {
          props.setIsVehicleSearchOpen(false);
        }}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>
      
      <h3 className="text-2xl font-bold mb-6 text-gray-900 text-center">Searching for drivers</h3>
      
      <div className="flex flex-col items-center mt-8">
        {/* Searching Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full border-4 border-gray-200 border-t-black animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <i className="ri-search-line text-2xl text-gray-600"></i>
          </div>
        </div>
        
        <p className="text-gray-600 text-center mb-8">Finding nearby drivers...</p>
        
        <div className="w-full space-y-1">
          <div className="flex items-center gap-4 p-4 border-b border-gray-200">
            <i className="text-xl text-gray-600 ri-map-pin-2-fill"></i>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Pickup</h3>
              <p className="text-sm text-gray-600 mt-1">
                {props.pickup}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 border-b border-gray-200">
            <i className="text-xl text-gray-600 ri-map-pin-2-fill"></i>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">Destination</h3>
              <p className="text-sm text-gray-600 mt-1">
                {props.destination}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4">
            <i className="text-xl text-gray-600 ri-wallet-2-line"></i>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">₹{props.fare[props.vehicleType]}</h3>
              <p className="text-sm text-gray-600 mt-1">Cash payment</p>
            </div>
          </div>
        </div>
        
        {/* <button
          onClick={() => {
            props.createRide();
          }}
          disabled={props.isCreatingRide}
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50"
        >
          {props.isCreatingRide ? 'Searching...' : 'Continue Searching'}
        </button> */}
      </div>
    </div>
  );
}

export default Searching;
