import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserDataContext } from '../Context/UserContext';
import { useContext } from 'react';
import axiosInstance from '../api/axiosInstance';

function UserProtectWrapper({children}) {
    const navigate = useNavigate();
    const {user,setUser} = useContext(  UserDataContext);
    const token = localStorage.getItem('token');
   useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = (retryCount = 0) => {
      axiosInstance
        .get(`/users/profile`)
        .then((response) => {
          if (response.status === 200) {
            setUser(response.data);
            console.log("this is calling from user protected wrapper", user);
          } else if (response.status === 202 && retryCount < 5) {
            // Profile is pending creation, retry based on Retry-After header (default 1s)
            const retryAfter = response.headers['retry-after'] || 1;
            setTimeout(() => fetchProfile(retryCount + 1), retryAfter * 1000);
          }
        })
        .catch((err) => {
          // 401 Unauthorized or other actual errors
          console.log(err);
          localStorage.removeItem("token");
          navigate("/login");
        });
    };

    fetchProfile();
  }, [token, navigate, setUser]);
  return (
    <div>{children}</div>
  )
}

export default UserProtectWrapper