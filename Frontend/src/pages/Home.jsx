import React, { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import car from "../assets/car.png";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../Components/locationSearchPanel";
import VehicalPanel from "../Components/VehicalPanel";
import ConfirmRide from "../Components/ConfirmRide";
import LookingForDriver from "../Components/LookingForDriver";
import WaitingForDriver from "../Components/WaitingForDriver";
import { UserDataContext } from "../Context/UserContext";
import { SocketContext } from "../Context/SocketContext";
import { Socket } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import LiveTracking from "../Components/LiveTracking";
import axiosInstance from "../api/axiosInstance";

function Home() {
  const [pickup, setpickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [addressList, setAddressList] = useState([]); // State to store suggestions

  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehicalPanelRef = useRef(null);
  const confirmRidePanelRef = useRef(null);
  const vehicleSearchRef = useRef(null);
  const driverWaitingRef = useRef(null);

  const [isVehicalPanelOpen, setIsVehicalPanelOpen] = useState(false);
  const [isConfirmRidePanelOpen, setIsConfirmRidePanelOpen] = useState(false);
  const [isVehicleSearchOpen, setIsVehicleSearchOpen] = useState(false);
  const [isDriverWaitingOpen, setIsDriverWaitingOpen] = useState(false);
  const [isRideAccepted, setIsRideAccepted] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [fare, setfare] = useState({});
  const [rideData, setRideData] = useState({});
  const [vehicleType, setVehicleType] = useState('');
  
  const navigate = useNavigate();
  const {user} = useContext(UserDataContext);
  const {sendMessage, socket} = useContext(SocketContext);

  const token = localStorage.getItem("token");

  useEffect(()=>{


    console.log(user);
    sendMessage("join",{userType:"user", userId: user._id})

   
  },[user])

useEffect(() => {
  
  if(!socket){
    return;
  }
 socket.on('ride-confirm', (ride) => {
    console.log("ride confirmed", ride);
    setRideData(ride);
    setIsVehicalPanelOpen(false);
    setIsConfirmRidePanelOpen(false);
    setIsVehicleSearchOpen(false);
    setIsDriverWaitingOpen(true);
    setIsRideAccepted(true);
});
socket.on('ride-started', (ride) => {
    console.log("ride-started", ride);
    setIsDriverWaitingOpen(false);
    setIsRideAccepted(false);
   navigate('/riding',{
    state:{ride:ride}
   })
})
}, [socket]);



  const getfare = async () => {
    try {
    
      const response = await axiosInstance.get(
        `/rides/get-fare`,
        {
          params: { pickup: pickup, destination: destination },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setfare(response.data);
    } catch (error) {
      console.error("Error fetching fare:", error);
    }
  };
  const [isCreatingRide, setIsCreatingRide] = useState(false);

  const createRide = async () => {
    try {
      setIsCreatingRide(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/create`,
        
           {
            pickup: pickup,
            destination: destination,
            vehicleType: vehicleType,
          },{
          headers: {
            Authorization: `Bearer ${token}`,
          },
          }
      );
      setRideData(response.data);
      // Only open the waiting panel after ride creation is successful
      setIsVehicleSearchOpen(true);
      setIsConfirmRidePanelOpen(false);
    } catch (error) {
      console.error("Error creating ride:", error);
      alert(error.response?.data?.message || "Failed to create ride.");
    } finally {
      setIsCreatingRide(false);
    }
  };
  useEffect(() => {
    const handleSelection = async () => {
      if (isLocationSelected && pickup && destination) {
        await getfare();
        setIsVehicalPanelOpen(true);
        setIsPanelOpen(false);
        setIsLocationSelected(false);
      }
    };

    handleSelection();
  }, [pickup, destination, isLocationSelected]);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  // Fetch suggestions based on input
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (isPanelOpen && (pickup.length >= 3 || destination.length >= 3)) {
        try {
          const input = activeField === "pickup" ? pickup : destination;

          const response = await axios.get(
            `${import.meta.env.VITE_BASE_URL}/rides/maps/get-suggestions`,
            {
              params: { input },
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          setAddressList(response.data);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        }
      } else {
        setAddressList([]);
      }
    };

    const delay = setTimeout(fetchSuggestions, 500); // Debounce API calls
    return () => clearTimeout(delay);
  }, [pickup, destination, isPanelOpen]);

  useGSAP(() => {
    if (isPanelOpen) {
      gsap.to(panelRef.current, {
        height: "70%",
        padding: 24,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 1,
      });
    } else {
      gsap.to(panelRef.current, {
        height: "0%",
        padding: 0,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 0,
      });
    }
  }, [isPanelOpen]);

  useGSAP(() => {
    // Initialize panels in hidden state
    gsap.set(vehicalPanelRef.current, { y: "100%" });
    gsap.set(confirmRidePanelRef.current, { y: "100%" });
    gsap.set(vehicleSearchRef.current, { y: "100%" });
    gsap.set(driverWaitingRef.current, { y: "100%" });
  }, []);

  useGSAP(() => {
    if (isVehicalPanelOpen) {
      gsap.to(vehicalPanelRef.current, {
        y: "0%",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(vehicalPanelRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isVehicalPanelOpen]);
  useGSAP(() => {
    if (isConfirmRidePanelOpen) {
      gsap.to(confirmRidePanelRef.current, {
        y: "0%",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(confirmRidePanelRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isConfirmRidePanelOpen]);
  useGSAP(() => {
    if (isVehicleSearchOpen) {
      gsap.to(vehicleSearchRef.current, {
        y: "0%",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(vehicleSearchRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isVehicleSearchOpen]);
  useGSAP(() => {
    if (isDriverWaitingOpen) {
      gsap.to(driverWaitingRef.current, {
        y: "0%",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(driverWaitingRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.in"
      });
    }
  }, [isDriverWaitingOpen]);
 
  return (
    <div className="h-screen relative overflow-hidden">
      <img className="w-16 absolute -z-50 left-5 top-5" src={logo} alt="" />
      <div className="absolute inset-0 z-0">
        <LiveTracking rideData={rideData} isCaptain={false} />
      </div>
     <div className="absolute inset-0 flex flex-col justify-end z-10">

        <div className="bg-white relative rounded-t-3xl shadow-lg" style={{ pointerEvents: 'auto' }}>
          <div className="p-3 sm:p-4 lg:p-6">
            <button
              ref={panelCloseRef}
              onClick={() => setIsPanelOpen(false)}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 text-xl sm:text-2xl text-gray-600 hover:text-gray-900 transition-colors duration-200 focus:outline-none"
            >
              <i className="ri-arrow-down-wide-line"></i>
            </button>
            <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Find a trip</h4>
            <form onSubmit={submitHandler} className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-black rounded-full"></div>
                </div>
                <div className="absolute left-3.5 sm:left-5 top-6 sm:top-8 bottom-8 sm:bottom-10 w-0.5 bg-gray-300"></div>
                <input
                  value={pickup}
                  onClick={() => {
                    setIsPanelOpen(true);
                    setActiveField("pickup");
                    setIsLocationSelected(false);
                  }}
                  onChange={(e) => setpickup(e.target.value)}
                  className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 bg-gray-100 rounded-lg sm:rounded-xl text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all duration-200"
                  type="text"
                  placeholder="Add a pick-up location"
                  autoComplete="off"
                />
              </div>
              <div className="relative">
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 border-2 border-black rounded-full"></div>
                </div>
                <input
                  onClick={() => {
                    setIsPanelOpen(true);
                    setActiveField("destination");
                    setIsLocationSelected(false);
                  }}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-4 bg-gray-100 rounded-lg sm:rounded-xl text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all duration-200"
                  type="text"
                  placeholder="Enter your destination"
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
        </div>
       {isPanelOpen && (
  <div
    ref={panelRef}
    className="bg-white  rounded-t-3xl shadow-lg overflow-hidden"
  >
    <LocationSearchPanel
      setIsVehicalPanelOpen={setIsVehicalPanelOpen}
      setIsPanelOpen={setIsPanelOpen}
      setIsLocationSelected={setIsLocationSelected}
      addressList={addressList}
      setFieldValue={(value) => {
        if (activeField === "pickup") {
          setpickup(value);
        } else {
          setDestination(value);
        }
      }}
    />
  </div>
)}

      </div>
      <div
        ref={vehicalPanelRef}
        className="fixed z-50 bottom-0 left-0 right-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl max-h-[80vh] sm:max-h-[70vh] overflow-y-auto"
      >
        <VehicalPanel
          fare={fare}
          setVehicleType={setVehicleType}
          setIsVehicalPanelOpen={setIsVehicalPanelOpen}
          setIsConfirmRidePanelOpen={setIsConfirmRidePanelOpen}
        />
      </div>
      <div
        ref={confirmRidePanelRef}
        className="fixed z-50 bottom-0 left-0 right-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
      >
        <ConfirmRide
        createRide={createRide}
        isCreatingRide={isCreatingRide}
        pickup={pickup}
        fare={fare}
        vehicleType={vehicleType}
        destination={destination}
          setIsConfirmRidePanelOpen={setIsConfirmRidePanelOpen}
          setIsVehicleSearchOpen={setIsVehicleSearchOpen}
        />
      </div>
      <div
        ref={vehicleSearchRef}
        className="fixed z-50 bottom-0 left-0 right-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl"
      >
        <LookingForDriver
         pickup={pickup}
        fare={fare}
        vehicleType={vehicleType}
        destination={destination}
          setIsConfirmRidePanelOpen={setIsConfirmRidePanelOpen}
          setIsVehicleSearchOpen={setIsVehicleSearchOpen}
        />
      </div>
      <div
        ref={driverWaitingRef}
        className="fixed z-50 bottom-0 left-0 right-0 bg-white rounded-t-2xl sm:rounded-t-3xl shadow-2xl"
      >
        <WaitingForDriver 
          socket={socket} 
          rideData={rideData} 
          setIsDriverWaitingOpen={setIsDriverWaitingOpen}
          setIsRideAccepted={setIsRideAccepted}
        />
      </div>
      
      {/* Floating button for accepted rides */}
      {isRideAccepted && !isDriverWaitingOpen && (
        <button
          onClick={() => setIsDriverWaitingOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gray-900 hover:bg-gray-800 text-white p-4 rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
          title="Show Ride Info"
        >
          <i className="ri-car-fill text-xl"></i>
        </button>
      )}
    </div>
  );
}

export default Home;
