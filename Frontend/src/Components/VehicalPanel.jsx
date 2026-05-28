import React, { useState } from 'react';

function VehicalPanel(props) {
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  const vehicles = [
    {
      id: "car",
      name: "Go Intercity",
      description: "Affordable outstation rides in compact cars",
      time: "9 mins away",
      duration: "1:14",
      image: "https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png",
      fare: props.fare?.car
    },
    {
      id: "motorcycle",
      name: "Moto",
      description: "Affordable motorcycle rides",
      time: "4 mins away",
      duration: "1:05",
      image: "https://imgs.search.brave.com/vKaXWDgr-kvl59nCEajWGwf4VDH7KTWau9QEsIbzAoY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbi1n/ZW8xLnViZXIuY29t/L2ltYWdlLXByb2Mv/Y3JvcC9yZXNpemVj/cm9wL3VkYW0vZm9y/bWF0PWF1dG8vd2lk/dGg9NTUyL2hlaWdo/dD0zNjgvc3JjYjY0/PWFIUjBjSE02THk5/MFlpMXpkR0YwYVdN/dWRXSmxjaTVqYjIw/dmNISnZaQzkxWkdG/dExXRnpjMlYwY3k4/NU5UTTROVEV5WkMx/bVpHVXhMVFJtTnpN/dFltUTFNUzA1WTJW/bVpqUmxNalUwWmpF/dWNHNW4",
      fare: props.fare?.motorcycle
    },
    {
      id: "auto", 
      name: "Sedan Intercity",
      description: "Outstation rides in comfortable sedans",
      time: "10 mins away", 
      duration: "1:16",
      image: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n",
      fare: props.fare?.auto
    }
  ];

  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle.id);
    props.setVehicleType(vehicle.id);
  };

  const handleConfirm = () => {
    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
    props.setVehicleType(selectedVehicle);
    props.setIsVehicalPanelOpen(false);
    props.setIsVehicleSearchOpen(true);
    // props.setIsSearchingPanelOpen(true);
    props.createRide();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          onClick={() => {
            console.log("Down arrow clicked, closing vehicle panel");
            props.setIsVehicalPanelOpen(false);
          }}
          className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 focus:outline-none"
        >
          <i className="ri-arrow-down-wide-line"></i>
        </button>
        <h3 className="text-lg font-semibold text-gray-900">Choose a ride</h3>
        <div className="w-6"></div> {/* Spacer for centering */}
      </div>

      {/* Subtitle */}
      <div className="px-4 pt-2 pb-4">
        <p className="text-sm text-gray-600">Rides we think you'll like</p>
      </div>

      {/* Vehicle Options */}
      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => handleVehicleSelect(vehicle)}
            className={`flex items-center w-full p-4 mb-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selectedVehicle === vehicle.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:border-black hover:bg-gray-50'
            }`}
          >
            {/* Vehicle Image */}
            <div className="w-20 h-16 shrink-0">
              <img 
                className="w-full h-full object-contain" 
                src={vehicle.image} 
                alt={vehicle.name} 
              />
            </div>

            {/* Vehicle Details */}
            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-gray-900">{vehicle.name}</h4>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{vehicle.fare}</p>
                </div>
              </div>
              
              <div className="flex items-center text-xs text-gray-600 mb-1">
                <i className="ri-time-line mr-1"></i>
                <span>{vehicle.time}</span>
                <span className="mx-2">•</span>
                <span>{vehicle.duration}</span>
              </div>
              
              <p className="text-xs text-gray-500">{vehicle.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Payment Method Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowPaymentDropdown(!showPaymentDropdown)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-money-rupee-circle-line text-gray-700 mr-2"></i>
              <span className="text-sm font-medium text-gray-700">
                {paymentMethod === "cash" ? "Cash" : "Pay Online"}
              </span>
              <i className="ri-arrow-down-s-line text-gray-500 ml-1"></i>
            </button>
            
            {showPaymentDropdown && (
              <div className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setPaymentMethod("cash");
                    setShowPaymentDropdown(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-left"
                >
                  <i className="ri-money-rupee-circle-line text-gray-700 mr-2"></i>
                  <span className="text-sm font-medium text-gray-700">Cash</span>
                </button>
                <button
                  onClick={() => {
                    setPaymentMethod("online");
                    setShowPaymentDropdown(false);
                  }}
                  className="flex items-center px-4 py-2 hover:bg-gray-50 w-full text-left"
                >
                  <i className="ri-bank-card-line text-gray-700 mr-2"></i>
                  <span className="text-sm font-medium text-gray-700">Pay Online</span>
                </button>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            className="bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-transform active:scale-95"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default VehicalPanel;