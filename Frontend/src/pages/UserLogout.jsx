import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

function UserLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      try {
        const response = await axiosInstance.get(`/auth/users/logOut`);
        if (response.status === 200) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Even if the server call fails, clear local storage and redirect
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    logout();
  }, []);

  return (
    <div>Logging out...</div>
  );
}

export default UserLogout;