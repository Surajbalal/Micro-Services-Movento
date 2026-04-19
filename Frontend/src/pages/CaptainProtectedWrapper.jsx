import React from 'react'
import { CaptainDataContext } from '../Context/CaptainContext'
import { useNavigate } from 'react-router-dom';
import captainAxiosInstance from '../api/captainAxiosInstance';
import { useState } from 'react';
import { useEffect } from 'react';

function CaptainProtectedWrapper({children}) {
    const navigate = useNavigate();
    const [isloading, setIsloading] = useState(true);
    const {captain, setCaptain} = React.useContext(CaptainDataContext);
    const token = localStorage.getItem("captain-token");
    useEffect(() => {
    if (!token) {
      navigate("/captain-login");
      return;
    }

    const fetchProfile = (retryCount = 0) => {
      captainAxiosInstance
        .get(`/captain/profile`)
        .then((response) => {
          if (response.status === 200) {
            setCaptain(response.data.captain);
            setIsloading(false);
          } else if (response.status === 202 && retryCount < 5) {
            // Profile is pending creation, retry based on Retry-After header (default 1s)
            const retryAfter = response.headers['retry-after'] || 1;
            setTimeout(() => fetchProfile(retryCount + 1), retryAfter * 1000);
          }
        })
        .catch((err) => {
          // 401 Unauthorized or other actual errors
          console.log(err);
          localStorage.removeItem("captain-token");
          navigate("/captain-login");
        });
    };

    fetchProfile();
  }, [token, navigate, setCaptain]);

    
   if(isloading == true){
    return(
        <div>loading... </div>
    )
   }


  return (
    <div>{children}</div>
  )
}

export default CaptainProtectedWrapper