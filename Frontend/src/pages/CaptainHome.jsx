import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import CaptainDetails from "../Components/CaptainDetails";
import RidePopUp from "../Components/RidePopUp";
import ConfirmRidePopUp from "../Components/ConfirmRidePopUp";
import { SocketContext } from "../Context/SocketContext";
import { CaptainDataContext } from "../Context/CaptainContext";
import LiveTracking from "../Components/LiveTracking";
import captainAxiosInstance from "../api/captainAxiosInstance";
import Call from "../Components/Call";

function CaptainHome() {
  const [captainLocation, setCaptainLocation] = useState(null);
  const [ride, setRide] = useState(null);
  const [isRidePopupOpen, setIsRidePopupOpen] = useState(false);
  const [isConfirmPopUpOpen, setIsConfirmPopUpOpen] = useState(false);
  const [isRideAccepted, setIsRideAccepted] = useState(false);
  const confirmPopupPanelRef = useRef(null);
  const ridePopupPanelRef = useRef(null);
  const { sendMessage, socket } = useContext(SocketContext);
  const { captain } = useContext(CaptainDataContext);
  const [captainStats, setCaptainStats] = useState({});
  const [isCaptainDetailLoading, setIsCaptainDetailLoading] = useState(false);

  const [isAcceptingRide, setIsAcceptingRide] = useState(false);
  const callRef = useRef(null); // ref to Call component to trigger initiateCall from captain side

  const confirm = async () => {
    try {
      setIsAcceptingRide(true);
      const response = await captainAxiosInstance.post(`/rides/confirm`, {
        rideId: ride._id,
        captainId: captain._id,
      });
      if (response.status == 200) {
        setIsRidePopupOpen(false);
        setIsConfirmPopUpOpen(true);
        setIsRideAccepted(true);
        // Ensure captain joins the ride room for call signaling
        if (sendMessage && ride._id) {
          sendMessage("join-ride-room", ride._id);
        }
      }
    } catch (error) {
      console.error("Error accepting ride:", error);
    } finally {
      setIsAcceptingRide(false);
    }
  };
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const response = await captainAxiosInstance.get("/rides/get-ride");

        if (!response.data?._id) return;
         console.log("captain home rideee",response.data);

        if (response.data.status === "ongoing") {
          console.log("navigating");
           setRide(response.data);
          
          navigate("/captain-riding", {
            state: { ride: response.data },
          });

          return;
        }

        setRide(response.data);
        setIsConfirmPopUpOpen(true);
        setIsRideAccepted(true);
      } catch (error) {
        console.log("No active ride found");
      }
    };

    fetchRide();
  }, []);
  useEffect(() => {
    if (!socket || !ride?._id) return;

    const joinRoom = () => {
      sendMessage("join-ride-room", ride._id, (response) => {
        console.log("Joined room:", response);
      });
      // setTimeout(() => {
      //   sendMessage("debug-room", ride._id);
      // }, 500);
    };

    if (socket.connected) {
      joinRoom();
    }

    socket.on("connect", joinRoom);

    return () => {
      socket.off("connect", joinRoom);
    };
  }, [socket, ride?._id]);

  useEffect(() => {
    const fetchCaptainStats = async () => {
      setIsCaptainDetailLoading(true);
      const response = await captainAxiosInstance.get(
        "/rides/get-captain-stats",
      );
      if (response.status == 200) {
        setCaptainStats(response.data);
      }
      setIsCaptainDetailLoading(false);
      console.log("captain stats", response.data);
    };
    fetchCaptainStats();
  }, [captain?._id]);

  useEffect(() => {
    if (!captain || !sendMessage) return;
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    console.log("Requesting captain location...");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log(" Captain location updated:", location);
        setCaptainLocation(location);
        sendMessage("update-captain-location", {
          captainId: captain._id,
          location,
        });
      },
      (error) => {
        console.error(" Error getting captain location:", error.message);
        alert(
          `Location Error: ${error.message}. Please enable location services in your browser!`,
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [captain?._id, sendMessage]);

  useEffect(() => {
    if (!socket) return;

    const handleNewRide = (data) => {
      setRide({ ...data.ride, user: data.user });
      setIsRidePopupOpen(true);
    };

    const handleRideCancelled = (data) => {
      console.log(" ride-cancelled received", data);
      setRide(null);
      setIsRidePopupOpen(false);
      setIsConfirmPopUpOpen(false);
      setIsRideAccepted(false);
      alert(`Ride cancelled: ${data.reason || "No reason provided"}`);
    };

    socket.on("ride-ended", (data) => {
      console.log("ride-ended received", data);
      setRide({});
      alert(data.message);
    });

    socket.on("new-ride", handleNewRide,(data)=>{
      console.log("new ride received",data);
    });
    socket.on("ride-cancelled", handleRideCancelled);

    return () => {
      socket.off("new-ride", handleNewRide);
      socket.off("ride-cancelled", handleRideCancelled);
    };
  }, [socket]);
  // ------ Now Iam doing this from backend automatically when socket connect call from socket context-------
  // useEffect(()=>{
  //   if (captain && captain._id && socket) {
  //     sendMessage("join",{userType:"captain",userId: captain._id });
  //   }
  // },[captain, socket]);

  // Panels controlled via React inline style — no GSAP needed

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden font-sans">
      {/* Premium Web Header */}
      <header className="fixed md:absolute top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 transition-all duration-300">
        <div className="px-4 md:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img
                className="w-12 md:w-16 drop-shadow-sm"
                src={logo}
                alt="Uber Logo"
              />
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Captain Terminal
              </h1>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 font-medium transition-colors border border-gray-200 shadow-inner">
                <i className="ri-notification-3-fill text-blue-500"></i>
                <span>Status: Online</span>
              </button>
              <Link
                to="/home"
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gray-100 hover:bg-black hover:text-white rounded-full transition-all duration-300 shadow-sm border border-gray-200"
                title="Switch to User"
              >
                <i className="text-lg md:text-xl font-medium ri-user-3-line"></i>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Background Map spanning everything */}
      <div className="absolute inset-0 z-0 bg-blue-50">
        <LiveTracking rideData={ride} isCaptain={true} />
      </div>

      {/* Map Overlay Info - Clean floating badge on Desktop */}
      <div className="absolute top-20 md:top-28 left-4 md:left-8 z-10 pointer-events-none">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg border border-white p-4 inline-flex flex-col gap-3 pointer-events-auto">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">
              {ride
                ? ride.status === "accepted"
                  ? "En Route to Pickup"
                  : ride.status === "started"
                    ? "Driving to Destination"
                    : "Online & Ready"
                : "Online & Ready"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            <i className="ri-map-pin-user-line text-blue-500"></i>
            <span>GPS Active</span>
          </div>
        </div>
      </div>

      {/* Captain Profile Summary - Floating Bottom Left on Desktop, Bottom Sheet on Mobile */}
      <div className="absolute bottom-0 left-0 right-0 md:bottom-8 md:left-8 md:right-auto md:w-[400px] bg-white md:bg-white/95 md:backdrop-blur-xl md:rounded-3xl rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 z-20 overflow-hidden">
        <CaptainDetails
          stats={captainStats}
          isCaptainDetailLoading={isCaptainDetailLoading}
        />
      </div>

      {/* Modals: New Ride Request */}
      {/* On massive screens, this hovers right in the middle or strictly right side */}
      <div
        ref={ridePopupPanelRef}
        style={{ display: isRidePopupOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 top-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] md:border border-white/50 max-h-[92vh] overflow-y-auto"
      >
        <RidePopUp
          ride={ride}
          confirm={confirm}
          isAcceptingRide={isAcceptingRide}
          setIsRidePopupOpen={setIsRidePopupOpen}
          setIsConfirmPopUpOpen={setIsConfirmPopUpOpen}
        />
      </div>

      {/* Modals: Confirm Ride Start */}
      <div
        ref={confirmPopupPanelRef}
        style={{ display: isConfirmPopUpOpen ? "block" : "none" }}
        className="fixed z-50 bottom-0 left-0 right-0 top-auto md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] bg-white rounded-t-3xl md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:shadow-[0_20px_70px_-10px_rgba(0,0,0,0.5)] md:border border-white/50 max-h-[92vh] overflow-y-auto"
      >
        <ConfirmRidePopUp
          captain={captain}
          ride={ride}
          setIsRidePopupOpen={setIsRidePopupOpen}
          setIsConfirmPopUpOpen={setIsConfirmPopUpOpen}
          setIsRideAccepted={setIsRideAccepted}
          onCallUser={() => callRef.current?.initiateCall()}
        />
      </div>

      {/* Floating button for accepted rides */}
      {isRideAccepted && !isConfirmPopUpOpen && (
        <button
          onClick={() => setIsConfirmPopUpOpen(true)}
          className="fixed bottom-28 md:bottom-8 right-6 md:right-8 z-50 bg-black hover:bg-gray-800 text-white p-5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-4 focus:ring-gray-300/50"
          title="Show OTP"
        >
          <i className="ri-key-2-fill text-2xl"></i>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
          </span>
        </button>
      )}

      {/* Call component mounted at root so incoming call popup is always visible above all panels */}
      {ride?._id && captain?._id && (
        <Call
          ref={callRef}
          rideId={ride._id}
          callerId={captain._id}
          receiverId={ride?.user?._id}
        />
      )}
    </div>
  );
}

export default CaptainHome;
