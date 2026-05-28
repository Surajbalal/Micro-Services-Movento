import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { CaptainDataContext } from "../Context/CaptainContext";
import captainAxiosInstance from '../api/captainAxiosInstance';

function CaptainSignup() {
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);

    const [email, setEmail] = useState("surajbalal786@gmail.com");
    const [password, setPassword] = useState("Sisussmm786");
    const [firstName, setFirstName] = useState("Suraj");
    const [lastName, setLastName] = useState("Kumar");
    const [vehicleColor, setVehicleColor] = useState("Red");
    const [vehiclePlate, setVehiclePlate] = useState("MH12AB1234");
    const [vehicleCapacity, setVehicleCapacity] = useState("4");
    const [vehicleType, setVehicleType] = useState("car");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { captain, setCaptain } = React.useContext(CaptainDataContext);

    const submitHandler = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const newUser = {
        fullName: {
          firstName: firstName,
          lastName: lastName,
        },
        email: email,
        password: password,
        vehicle: {
          color: vehicleColor,
          plate: vehiclePlate,
          capacity: vehicleCapacity,
          vehicleType: vehicleType,
        },
      }
      
      try {
      const response = await captainAxiosInstance.post(`/auth/captains/register`, newUser);
        if (response.status === 200) {
          alert("OTP has been sent to your email!");
          setStep(2);
        }
      } catch (error) {
        console.error("Signup Error", error);
        alert(error.response?.data?.message || "Signup failed");
      } finally {
        setIsLoading(false);
      }
    };

    const handleOtpChange = (index, value) => {
      if (isNaN(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value.substring(value.length - 1);
      setOtp(newOtp);
      // Move to next input if current one has a value
      if (value && index < 5 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    };

    const handleKeyDown = (index, e) => {
      // Move to previous input on backspace
      if (e.key === "Backspace" && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    };

    const verifyOtpHandler = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      const otpValue = otp.join("");
      if (otpValue.length !== 6) return;
      try {
        const response = await captainAxiosInstance.post(`/auth/captains/verify-email`, {
          email: email,
          otp: otpValue,
        });
        if (response.status === 200) {
          const data = response.data;
          setCaptain(data.captain);
          localStorage.setItem("captain-token", data.token);
          alert("Email verified successfully");
          navigate("/captain-home");
        }
      } catch (error) {
         console.error("Verification Error", error);
         alert(error.response?.data?.message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img className="w-16 mx-auto mb-8" src={logo} alt="Uber Logo" />
        
        {step === 1 ? (
          <form onSubmit={submitHandler} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Captain's Name</h3>
            <div className="flex gap-4">
              <input
                required
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
              <input
                required
                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900">Captain's Email</h3>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <h3 className="text-xl font-semibold text-gray-900">Password</h3>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />

            <h3 className="text-xl font-semibold text-gray-900">Vehicle Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="Vehicle Color"
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
              />
              <input
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="text"
                placeholder="Vehicle Plate"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="number"
                placeholder="Vehicle Capacity"
                value={vehicleCapacity}
                onChange={(e) => {
                  if (e.target.value < 0) {
                    setVehicleCapacity(0);
                  } else {
                    setVehicleCapacity(e.target.value);
                  }
                }}
                min="0"
              />
              <select
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base text-gray-700 transition-all duration-200"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
              >
                <option value="">Select Vehicle Type</option>
                <option value="car">Car</option>
                <option value="motorcycle">Motorcycle</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 text-base disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Captain Account'}
            </button>
            
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/captain-login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                Login
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={verifyOtpHandler} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 text-center">Verify Your Email</h3>
            <p className="text-center text-gray-600 mb-6">We've sent a 6-digit code to {email}</p>
            <div className="flex justify-center gap-3 my-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200 bg-white"
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 text-base disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Email & Login'}
            </button>
          </form>
        )}
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <p className="text-xs text-gray-500 leading-tight text-center">
          This site is protected by reCAPTCHA and the{' '}
          <span className="underline hover:text-gray-700 transition-colors duration-200">Google Privacy Policy</span>
          {' '}and{' '}
          <span className="underline hover:text-gray-700 transition-colors duration-200">Terms of Service apply</span>.
        </p>
      </div>
    </div>
  )
}

export default CaptainSignup

