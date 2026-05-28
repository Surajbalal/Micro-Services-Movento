import React, { useContext } from "react";
import { CaptainDataContext } from "../Context/CaptainContext";
import { useNavigate } from "react-router-dom";

function CaptainDetails(props) {
  const { captain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6">
      {/* Captain Profile Card */}
      {props.isCaptainDetailLoading ? (
        // <div className="h-screen flex items-center justify-center">
          <div className="flex items-center gap-3 text-gray-600">
            <i className="ri-loader-2-line animate-spin text-2xl"></i>
            <span className="text-lg font-medium">
              Loading captain details...
            </span>
          {/* </div> */}
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <img
                    className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-gray-200"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTwWx-yHxLBZw1Gr0DymmtXVDPEDaJIVdRQQ&s"
                    alt="Captain"
                  />
                  <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">
                    {captain.fullName.firstName} {captain.fullName.lastName||0}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500">Captain</p>
                </div>
              </div>
              <div className="text-right">
                <h4 className="text-xl sm:text-2xl font-bold text-gray-900">
                  ₹{props.stats.totalEarnings||0}
                </h4>
                <p className="text-xs sm:text-sm text-gray-500">
                  Today's Earnings
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <i className="text-xl sm:text-2xl text-gray-600 ri-time-line mb-1"></i>
                <h5 className="text-sm sm:text-base font-semibold text-gray-900">
                  8.5
                </h5>
                <p className="text-xs text-gray-500">Hours Online</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <i className="text-xl sm:text-2xl text-gray-600 ri-speed-up-line mb-1"></i>
                <h5 className="text-sm sm:text-base font-semibold text-gray-900">
                  {props.stats.totalRides||0}
                </h5>
                <p className="text-xs text-gray-500">Total Rides</p>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <i className="text-xl sm:text-2xl text-gray-600 ri-star-line mb-1"></i>
                <h5 className="text-sm sm:text-base font-semibold text-gray-900">
                  4.8
                </h5>
                <p className="text-xs text-gray-500">Rating</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <h5 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Your Vehicle
            </h5>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-gray-100 h-12 w-12 sm:h-14 sm:w-14 rounded-lg flex items-center justify-center">
                <i className="text-xl sm:text-2xl text-gray-600 ri-car-line"></i>
              </div>
              <div className="flex-1">
                <h6 className="text-sm sm:text-base font-medium text-gray-900">
                  {captain.vehicle?.vehicleType?.charAt(0).toUpperCase() +
                    captain.vehicle?.vehicleType?.slice(1) || "Car"}
                </h6>
                <p className="text-xs sm:text-sm text-gray-500">
                  {captain.vehicle?.plate || "MH-01-AB-1234"}
                </p>
                <p className="text-xs text-gray-400">
                  {captain.vehicle?.color || "White"}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => navigate("/captain-settings")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <i className="ri-settings-3-line mr-1 sm:mr-2"></i>
              Settings
            </button>
            <button
              onClick={() => navigate("/captain-history")}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <i className="ri-history-line mr-1 sm:mr-2"></i>
              History
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CaptainDetails;
