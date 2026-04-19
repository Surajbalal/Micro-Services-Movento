import React from 'react'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";
import captainAxiosInstance from '../api/captainAxiosInstance';
import { CaptainDataContext } from '../Context/CaptainContext';
function CaptainLogin() {
    const [email, setEmail] = useState('surajbalal786@gmail.com');
    const [password,setPassword] = useState('Sisussmm786');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const {captain,setCaptain} = React.useContext(CaptainDataContext);

    const submitHandler = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  const user = {
    email: email,
    password: password
  };

  try {
    const response = await captainAxiosInstance.post(`/auth/captains/login`, user);

    if (response.status === 200) {
      const data = response.data;
      setCaptain(data.captain);
      localStorage.setItem("captain-token", data.token);
      alert("Captain logged in successfully");
      navigate("/captain-home");
    }

  } catch (error) {
    console.log(error);
    alert(error.response?.data?.message || "Login failed");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
       <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="w-16 mx-auto mb-8" src={logo} alt="Uber Logo" />
        <form onSubmit={submitHandler} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Captain's Email</h3>
            <input 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
             />
             <h3 className="text-xl font-semibold text-gray-900">Password</h3>
             <input 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
                type="password"
                placeholder="Password"
                autoComplete="current-password"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-black text-white font-semibold py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 text-base disabled:opacity-50"
              >
                {isLoading ? 'Logging in...' : 'Login as Captain'}
              </button>
           <p className="text-center text-gray-600">
                Join a fleet?{' '}
                <Link to='/captain-signup' className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200'>
                  Register as a Captain
                </Link>
              </p>
        </form>
       </div>
       <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to='/login' 
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-orange-300 text-base flex justify-center items-center"
        >
          Sign in as User
        </Link>
       </div>
    </div>
  )
}

export default CaptainLogin