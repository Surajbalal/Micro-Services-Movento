import React from "react";

function LookingForDriver(props) {
  const vehicleImages = {
    car: "https://www.pngplay.com/wp-content/uploads/8/Uber-PNG-Photos.png",
    motorcycle:
      "https://imgs.search.brave.com/vKaXWDgr-kvl59nCEajWGwf4VDH7KTWau9QEsIbzAoY/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jbi1n/ZW8xLnViZXIuY29t/L2ltYWdlLXByb2Mv/Y3JvcC9yZXNpemVj/cm9wL3VkYW0vZm9y/bWF0PWF1dG8vd2lk/dGg9NTUyL2hlaWdo/dD0zNjgvc3JjYjY0/PWFIUjBjSE02THk5/MFlpMXpkR0YwYVdN/dWRXSmxjaTVqYjIw/dmNISnZaQzkxWkdG/dExXRnpjMlYwY3k4/NU5UTTROVEV5WkMx/bVpHVXhMVFJtTnpN/dFltUTFNUzA1WTJW/bVpqUmxNalUwWmpF/dWNHNW4",
    auto: "https://cn-geo1.uber.com/image-proc/crop/resizecrop/udam/format=auto/width=552/height=368/srcb64=aHR0cHM6Ly90Yi1zdGF0aWMudWJlci5jb20vcHJvZC91ZGFtLWFzc2V0cy8xZGRiOGM1Ni0wMjA0LTRjZTQtODFjZS01NmExMWEwN2ZlOTgucG5n",
  };
  const vehicleImg = vehicleImages[props.vehicleType] || vehicleImages.car;

  return (
    <div className="p-4 sm:p-6 relative">
      {/* Close button */}
      <button
        onClick={() =>
          props.setIsVehicleSearchOpen?.(false) ||
          props.setIsSearchingPanelOpen?.(false)
        }
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl transition-colors focus:outline-none"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      {/* Drag handle */}
      <div className="flex justify-center mb-4">
        <div className="w-9 h-1 bg-gray-200 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
          Searching nearby
        </p>
        <h3 className="text-xl font-bold text-gray-900">
          Looking for a Driver…
        </h3>
      </div>

      {/* Animated vehicle */}
      <div className="flex flex-col items-center py-4 mb-5">
        <div className="relative">
          {/* Pulsing rings */}
          <span className="absolute inset-0 rounded-full animate-ping bg-gray-100 opacity-60"></span>
          <div className="relative bg-gray-50 rounded-full p-4 border border-gray-100">
            <img
              className="h-16 object-contain"
              src={vehicleImg}
              alt="Vehicle"
            />
          </div>
        </div>
        {/* Animated searching dots */}
        <div className="flex gap-1.5 mt-5">
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Connecting you with a captain
        </p>
      </div>

      {/* Trip summary card */}
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {/* Pickup row */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-100">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
              Pickup
            </p>
            <p className="text-sm font-medium text-gray-900 leading-snug break-words">
              {props.pickup}
            </p>
          </div>
        </div>

        {/* Destination row */}
        <div className="flex items-start gap-3 p-4 border-b border-gray-100">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
              Destination
            </p>
            <p className="text-sm font-medium text-gray-900 leading-snug break-words">
              {props.destination}
            </p>
          </div>
        </div>

        {/* Fare row */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <i className="ri-wallet-3-line text-gray-400 text-base"></i>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-0.5">
                Fare
              </p>
              <p className="text-sm text-gray-500">Cash payment</p>
            </div>
          </div>
          <p className="text-lg font-bold text-gray-900">
            ₹{props.fare?.[props.vehicleType]}
          </p>
        </div>
      </div>
    </div>
  );
}

export default LookingForDriver;
