import React, { useRef, useState, useEffect, useContext } from "react";
import logo from "../assets/logo.png";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../Components/locationSearchPanel";
import VehicalPanel from "../Components/VehicalPanel";
import Searching from "../Components/Searching";
import LookingForDriver from "../Components/LookingForDriver";
import WaitingForDriver from "../Components/WaitingForDriver";
import { UserDataContext } from "../Context/UserContext";
import { SocketContext } from "../Context/SocketContext";
import { Link, useNavigate } from "react-router-dom";
import LiveTracking from "../Components/LiveTracking";
import axiosInstance from "../api/axiosInstance";

function Home() {
  const [pickup, setpickup] = useState("");
  const [destination, setDestination] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [addressList, setAddressList] = useState([]);

  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const vehicalPanelRef = useRef(null);
  const searchingPanelRef = useRef(null);
  const vehicleSearchRef = useRef(null);
  const driverWaitingRef = useRef(null);
  const [isRideAccepted, setIsRideAccepted] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [isLocationSelected, setIsLocationSelected] = useState(false);
  const [fare, setfare] = useState({});
  const [rideData, setRideData] = useState({});
  const [vehicleType, setVehicleType] = useState("car");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(UserDataContext);
  const { sendMessage, socket } = useContext(SocketContext);

  const token = localStorage.getItem("token");

  const [isVehicalPanelOpen, setIsVehicalPanelOpen] = useState(false);
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await axiosInstance.get("/rides/get-ride");
        if (!response.data?._id) return;

        if (response.data.status === "ongoing") {
          setIsDriverWaitingOpen(false);
          setIsRideAccepted(false);

          navigate("/riding", { state: { ride: response.data } });
          return;
        }
        if (response.data && response.data._id) {
          setRideData(response.data);
          setIsDriverWaitingOpen(true);
          setIsRideAccepted(true);
        }
      } catch (error) {
        console.log("No active ride found");
      }
    };

    fetchRide();
  }, []);

  useEffect(() => {
    if (!socket || !rideData?._id) return;

    const joinRoom = () => {
      sendMessage("join-ride-room", rideData._id, (response) => {
        console.log("Joined room:", response);
      });
      // setTimeout(() => {
      //   sendMessage("debug-room", rideData._id);
      // }, 500);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [socket, rideData?._id]);

  // Debug log for state changes
  useEffect(() => {
    console.log("isVehicalPanelOpen changed to:", isVehicalPanelOpen);
  }, [isVehicalPanelOpen]);
  const [isSearchingPanelOpen, setIsSearchingPanelOpen] = useState(false);
  const [isVehicleSearchOpen, setIsVehicleSearchOpen] = useState(false);
  const [isDriverWaitingOpen, setIsDriverWaitingOpen] = useState(false);

  // Debug log for Searching panel state changes
  useEffect(() => {
    console.log("isSearchingPanelOpen changed to:", isSearchingPanelOpen);
  }, [isSearchingPanelOpen]);

  // Debug log for Driver Waiting panel state changes
  useEffect(() => {
    console.log("isDriverWaitingOpen changed to:", isDriverWaitingOpen);
  }, [isDriverWaitingOpen]);
  // ------ Now Iam doing this from backend automatically when socket connect call from socket context-------
  // useEffect(() => {
  //   if (user && user._id && socket) {
  //     const joinUser = () => {
  //       sendMessage("join", { userType: "user", userId: user._id });
  //     };

  //     if (socket.connected) {
  //       joinUser();
  //     }

  //     socket.on("connect", joinUser);

  //     return () => {
  //       socket.off("connect", joinUser);
  //     };
  //   }
  // }, [user, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRideConfirm = (ride) => {
      console.log(" ride-confirm received", ride);

      // set ride data
      setRideData(ride);

      // close all other panels
      setIsVehicalPanelOpen(false);
      setIsSearchingPanelOpen(false);
      setIsVehicleSearchOpen(false);

      // open waiting panel
      setIsRideAccepted(true);
      setIsDriverWaitingOpen(true);
    };

    const handleRideStarted = (ride) => {
      console.log(" ride-started received", ride);

      setIsDriverWaitingOpen(false);
      setIsRideAccepted(false);

      navigate("/riding", { state: { ride } });
    };

    const handleRideCancelled = (data) => {
      console.log("ride-cancelled received", data);
      setRideData({});
      setIsDriverWaitingOpen(false);
      setIsRideAccepted(false);
      setIsPanelOpen(false);
      alert(`Ride cancelled because of: ${data.reason}` || `Ride Cancelled`);
    };

    // attach listeners
    // socket.on("ride-confirm", (data)=>{
    //   console.log("🔥 ride-confirm received", data);

    //   // set ride data
    //   setRideData(data);

    //   // close all other panels
    //   setIsVehicalPanelOpen(false);
    //   setIsSearchingPanelOpen(false);
    //   setIsVehicleSearchOpen(false);

    //   // open waiting panel
    //   setIsRideAccepted(true);
    //   setIsDriverWaitingOpen(true);
    // });
    socket.on("ride-ended", (data) => {
      console.log(" ride-ended received", data);
      setRideData({});
      setIsDriverWaitingOpen(false);
      setIsRideAccepted(false);
      setIsPanelOpen(false);
      alert(data.message);
    });
    socket.on("ride-confirm", handleRideConfirm);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-cancelled", handleRideCancelled);

    // cleanup (VERY IMPORTANT)
    return () => {
      socket.off("ride-confirm", handleRideConfirm);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket, navigate]);
  const getfare = async () => {
    console.log(
      "getfare called with pickup:",
      pickup,
      "destination:",
      destination,
    );
    try {
      const response = await axiosInstance.get(`/rides/get-fare`, {
        params: { pickup: pickup, destination: destination },
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("getfare response:", response.status, response.data);
      if (response.status === 200) {
        setfare(response.data);
        console.log("Setting setIsVehicalPanelOpen to true");
        setIsVehicalPanelOpen(true);
        setIsPanelOpen(false);
        setIsLocationSelected(false);
      }
    } catch (error) {
      console.error("Error fetching fare:", error);
    }
  };

  const [isCreatingRide, setIsCreatingRide] = useState(false);
  const createRide = async () => {
    try {
      setIsCreatingRide(true);
      const response = await axiosInstance.post(`/rides/create`, {
        pickup: pickup,
        destination: destination,
        vehicleType: vehicleType,
      });
      if (response.status === 200) {
        setRideData(response.data);
        setIsVehicleSearchOpen(true);
        setIsSearchingPanelOpen(false);
      }
    } catch (error) {
      console.error("Error creating ride:", error);
      setIsVehicleSearchOpen(false);
      setIsVehicalPanelOpen(true);
    } finally {
      setIsCreatingRide(false);
    }
  };
  useEffect(() => {
    console.log("🔥 STATE CHECK → isDriverWaitingOpen:", isDriverWaitingOpen);
  }, [isDriverWaitingOpen]);

  // useEffect(() => {
  //   const handleSelection = async () => {
  //     if (isLocationSelected && pickup && destination) {
  //       await getfare();
  //     }
  //   };
  //   handleSelection();
  // }, [pickup, destination, isLocationSelected]);

  const submitHandler = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!isPanelOpen) {
        setAddressList([]);
        return;
      }
      const input = activeField === "pickup" ? pickup : destination;
      if (!input || input.trim().length < 3) {
        setAddressList([]);
        return;
      }
      try {
        setIsLoading(true);
        const response = await axiosInstance.get(
          `/rides/maps/get-suggestions`,
          {
            params: { input },
            skipGlobalError: true,
          },
        );
        setAddressList(response.data);
        setIsLoading(false);
      } catch (error) {
        console.log("error", error);
      }
    };
    const timeout = setTimeout(fetchSuggestions, 400);
    return () => clearTimeout(timeout);
  }, [pickup, destination, activeField, isPanelOpen]);

  return (
    <div className="h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {/* Universal Header replacing absolute logo */}
      <header className="absolute md:static top-0 w-full z-50 bg-white md:bg-white shadow-none md:shadow-sm items-center justify-between px-6 py-4 md:border-b border-gray-100 hidden md:flex">
        <div className="flex items-center gap-8">
          <img className="w-16" src={logo} alt="Uber Logo" />
          <nav className="hidden md:flex gap-6 font-medium text-sm text-gray-900">
            <Link
              to="/home"
              className="hover:bg-gray-100 py-2 px-3 rounded-full transition-colors"
            >
              Ride
            </Link>
            <Link
              to="/captain-login"
              className="hover:bg-gray-100 py-2 px-3 rounded-full transition-colors"
            >
              Drive
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/user/logout"
            className="text-sm font-medium hover:bg-gray-100 py-2 px-3 rounded-full transition-colors"
          >
            Log in
          </Link>
          <div className="bg-black text-white text-sm font-medium py-2 px-4 rounded-full">
            Sign up
          </div>
        </div>
      </header>

      {/* Mobile Logo */}
      <img
        className="w-16 absolute z-30 left-5 top-5 md:hidden"
        src={logo}
        alt=""
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1920px] mx-auto z-10 pointer-events-none md:pointer-events-auto h-full">
        {/* Map Background for Mobile; Handled by Grid on Desktop */}
        <div className="absolute inset-0 z-0 md:hidden bg-gray-100">
          <LiveTracking rideData={rideData} isCaptain={false} />
        </div>

        {/* Left Side: Search Panel */}
        <div className="w-full md:w-[450px] lg:w-[500px] h-full flex flex-col justify-end md:justify-start pointer-events-none md:pt-16 md:pl-16 z-20">
          <div className="bg-white rounded-t-3xl md:rounded-none w-full p-5 md:p-0 pointer-events-auto transition-all shadow-[0_-10px_30px_rgba(0,0,0,0.1)] md:shadow-none pb-8 md:pb-0 relative">
            <button
              ref={panelCloseRef}
              onClick={() => setIsPanelOpen(false)}
              className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-900 focus:outline-none"
            >
              <i className="ri-arrow-down-wide-line text-2xl"></i>
            </button>

            {/* Desktop Headline */}
            <h1 className="hidden md:block text-5xl lg:text-[54px] font-bold tracking-tight mb-8 text-black leading-[1.1]">
              Request a ride for now or later
            </h1>

            {/* Mobile Headline */}
            <h4 className="md:hidden text-2xl font-bold mb-5 text-gray-900">
              Where to?
            </h4>

            <form onSubmit={submitHandler} className="w-full relative">
              <div className="flex flex-col gap-3 w-full relative">
                {/* Connecting Line (Only spans between the two inputs) */}
                <div className="absolute left-[20px] md:left-[22px] top-6 bottom-6 w-[2px] bg-black z-20 hidden md:block"></div>
                <div className="md:hidden absolute left-[20px] top-6 bottom-6 w-0.5 bg-gray-300 z-10"></div>

                {/* Pickup Field */}
                <div className="relative w-full group">
                  <div className="absolute left-4 md:left-4 top-1/2 transform -translate-y-1/2 z-30">
                    <div className="w-2 md:w-3 h-2 md:h-3 bg-black rounded-full shadow-sm"></div>
                  </div>
                  <input
                    value={pickup}
                    onClick={() => {
                      setIsPanelOpen(true);
                      setActiveField("pickup");
                      setIsLocationSelected(false);
                    }}
                    onChange={(e) => setpickup(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-100 rounded-lg md:rounded-xl text-base placeholder-black focus:bg-gray-200 focus:outline-none transition-all duration-200"
                    type="text"
                    placeholder="Pickup location"
                    autoComplete="off"
                  />
                </div>

                {/* Destination Field */}
                <div className="relative w-full group">
                  <div className="absolute left-4 md:left-4 top-1/2 transform -translate-y-1/2 z-30">
                    <div className="w-2 md:w-3 h-2 md:h-3 bg-black rounded-sm shadow-sm"></div>
                  </div>
                  <input
                    onClick={() => {
                      setIsPanelOpen(true);
                      setActiveField("destination");
                      setIsLocationSelected(false);
                    }}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-gray-100 rounded-lg md:rounded-xl text-base placeholder-black focus:bg-gray-200 focus:outline-none transition-all duration-200"
                    type="text"
                    placeholder="Dropoff location"
                    autoComplete="off"
                  />
                </div>

                {/* Desktop Native Search Button styled seamlessly */}
                {!fare.car ? (
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "See Price button clicked, pickup:",
                        pickup,
                        "destination:",
                        destination,
                      );
                      if (pickup && destination) {
                        console.log(
                          "Both pickup and destination exist, calling getfare",
                        );
                        getfare();
                        setIsLocationSelected(true);
                      } else {
                        console.log("Missing pickup or destination");
                      }
                    }}
                    className="hidden md:flex mt-4 items-center justify-center bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-transform active:scale-95 w-32"
                  >
                    See prices
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      console.log(
                        "Choose Vehicle button clicked, reopening vehicle panel",
                      );
                      setIsVehicalPanelOpen(true);
                    }}
                    className="hidden md:flex mt-4 items-center justify-center bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-lg transition-transform active:scale-95 w-40"
                  >
                    Choose vehicle
                  </button>
                )}
              </div>
            </form>

            {/* Location Panel - Dropdown on web, bottom-sheet slide on mobile */}
            {isPanelOpen && (
              <div
                ref={panelRef}
                className="bg-white rounded-t-3xl md:rounded-2xl shadow-[0_-5px_40px_rgba(0,0,0,0.15)] md:shadow-xl md:border border-gray-100 overflow-hidden md:mt-4 md:absolute md:w-[120%] z-40"
              >
                <LocationSearchPanel
                  setIsVehicalPanelOpen={setIsVehicalPanelOpen}
                  setIsPanelOpen={setIsPanelOpen}
                  setIsLocationSelected={setIsLocationSelected}
                  addressList={addressList}
                  isLoading={isLoading}
                  setFieldValue={(value) => {
                    if (activeField === "pickup") setpickup(value);
                    else setDestination(value);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Massive Rounded Map (Desktop Only) */}
        <div className="hidden md:block flex-1 p-6 md:pl-12 pb-12 z-0">
          <div className="w-full h-[85vh] rounded-3xl overflow-hidden shadow-sm relative">
            <LiveTracking rideData={rideData} isCaptain={false} />
          </div>
        </div>
      </div>

      {/* Side Panels - React state controls visibility (no GSAP to avoid conflicts) */}

      {/* Vehicle Selection Panel */}
      <div
        style={{ display: isVehicalPanelOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 md:left-12 md:right-auto md:bottom-auto md:top-[120px] md:h-fit md:max-h-[calc(100vh-140px)] md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.2)] md:shadow-2xl overflow-y-auto w-full md:border border-gray-100"
      >
        <VehicalPanel
          fare={fare}
          setVehicleType={setVehicleType}
          setIsVehicalPanelOpen={setIsVehicalPanelOpen}
          setIsVehicleSearchOpen={setIsVehicleSearchOpen}
          // setIsSearchingPanelOpen={setIsSearchingPanelOpen}
          createRide={createRide}
        />
      </div>

      {/* Searching / Confirm Ride Panel */}
      <div
        style={{ display: isSearchingPanelOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 md:left-12 md:right-auto md:bottom-auto md:top-[120px] md:h-fit md:max-h-[calc(100vh-140px)] md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.2)] md:shadow-2xl overflow-y-auto w-full md:border border-gray-100"
      >
        <Searching
          // createRide={createRide}
          isCreatingRide={isCreatingRide}
          pickup={pickup}
          fare={fare}
          vehicleType={vehicleType}
          destination={destination}
          setIsSearchingPanelOpen={setIsSearchingPanelOpen}
          setIsVehicleSearchOpen={setIsVehicleSearchOpen}
        />
      </div>

      {/* Looking for Driver Panel */}
      <div
        style={{ display: isVehicleSearchOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 md:left-12 md:right-auto md:bottom-auto md:top-[120px] md:h-fit md:max-h-[calc(100vh-140px)] md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.2)] md:shadow-2xl md:border border-gray-100 overflow-hidden w-full"
      >
        <LookingForDriver
          pickup={pickup}
          fare={fare}
          vehicleType={vehicleType}
          destination={destination}
          setIsSearchingPanelOpen={setIsSearchingPanelOpen}
          setIsVehicleSearchOpen={setIsVehicleSearchOpen}
        />
      </div>

      {/* Waiting for Driver Panel — always mounted, shown via state */}
      <div
        style={{ display: isDriverWaitingOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 md:left-12 md:right-auto md:bottom-auto md:top-[120px] md:h-fit md:max-h-[calc(100vh-140px)] md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.2)] md:shadow-2xl md:border border-gray-100 overflow-hidden w-full"
      >
        <WaitingForDriver
          socket={socket}
          rideData={rideData}
          setIsDriverWaitingOpen={setIsDriverWaitingOpen}
          setIsRideAccepted={setIsRideAccepted}
        />
      </div>

      {/* Floating button to cehck the curretn ride */}
      {isRideAccepted && !isDriverWaitingOpen && (
        <button
          onClick={() => setIsDriverWaitingOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-black hover:bg-gray-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
          title="Show Ride Info"
        >
          <i className="ri-car-fill text-2xl"></i>
        </button>
      )}
    </div>
  );
}

export default Home;
