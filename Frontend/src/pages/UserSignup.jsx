import { useState, useContext, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { UserDataContext } from "../Context/UserContext";
import axiosInstance from '../api/axiosInstance';

function UserSignup() {
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, setUser } = useContext(UserDataContext);
  const navigate = useNavigate();

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
    };
    
    try {
      const response = await axiosInstance.post(`/auth/users/register`, newUser);
      if (response.status === 201) {
        alert("OTP has been sent to your email!");
        setStep(2); // Move to OTP verification step
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
      const response = await axiosInstance.post(`/auth/users/verify-email`, {
        email: email,
        otp: otpValue,
      });
      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        alert("Email verified successfully");
        navigate("/home");
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
            <h3 className="text-xl font-semibold text-gray-900">What's your name?</h3>
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
            <h3 className="text-xl font-semibold text-gray-900">What's your email?</h3>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <h3 className="text-xl font-semibold text-gray-900">Enter Password</h3>
            <input
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 text-base disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p className="text-center text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                Login here
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
  );
}

export default UserSignup;
