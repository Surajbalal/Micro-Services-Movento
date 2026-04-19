import React from 'react'
import logo from "../assets/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import UserSignup from './userSignup';
import { useState } from 'react';

import { useContext } from 'react';
import { UserDataContext } from '../Context/UserContext';
import axiosInstance from '../api/axiosInstance';
function UserLogin() {
  const [email, setEmail] = useState('surajbalal786@gmail.com');
  const [password,setPassword] = useState('test_password');
  const [isLoading, setIsLoading] = useState(false);
  const {user,setUser} = useContext(UserDataContext);
  const navigate = useNavigate();
  const submitHandler = async (e)=>{
     e.preventDefault();
     setIsLoading(true);
     const user = {
      email : email,
      password : password
     }
     
     try {
       const response = await axiosInstance.post(`/auth/users/login`,user);
       if(response.status == 200){
        const data = response.data;
        setUser(data.user);
            localStorage.setItem("token",data.token);
        navigate('/home');
       }
     } catch (error) {
       console.error("Login Error", error);
       alert(error.response?.data?.message || "Login failed");
     } finally {
       setIsLoading(false);
     }
    setEmail('');
    setPassword('');
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
       <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <img className="w-16 mx-auto mb-8" src={logo} alt="Uber Logo" />
        <form onSubmit={submitHandler} className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">What's your email?</h3>
            <input 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-base placeholder-gray-500 transition-all duration-200"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
             />
             <h3 className="text-xl font-semibold text-gray-900">Enter Password</h3>
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
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
           <p className="text-center text-gray-600">
                New here?{' '}
                <Link to='/signup' className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200'>
                  Create new Account
                </Link>
              </p>
        </form>
       </div>
       <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to='/captain-login' 
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-300 text-base flex justify-center items-center"
        >
          Sign in as Captain
        </Link>
       </div>
    </div>
  )
}

export default UserLogin