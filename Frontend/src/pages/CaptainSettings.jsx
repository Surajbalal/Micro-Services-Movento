import React, { useState, useContext, useEffect } from 'react';
import { CaptainDataContext } from '../Context/CaptainContext';
import captainAxiosInstance from '../api/captainAxiosInstance';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function CaptainSettings() {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();


  // Personal Information State
  const [firstName, setFirstName] = useState(captain?.fullName?.firstName || '');
  const [lastName, setLastName] = useState(captain?.fullName?.lastName || '');
  const [email, setEmail] = useState(captain?.email || '');
  const [phone, setPhone] = useState(captain?.phone || '');

  // Vehicle Information State
  const [vehicleType, setVehicleType] = useState(captain?.vehicle?.vehicleType || '');
  const [vehicleColor, setVehicleColor] = useState(captain?.vehicle?.color || '');
  const [vehiclePlate, setVehiclePlate] = useState(captain?.vehicle?.plate || '');
  const [vehicleCapacity, setVehicleCapacity] = useState(captain?.vehicle?.capacity || '');

  // Status State
  const [isAvailable, setIsAvailable] = useState(captain?.isActive !== false);

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Update captain profile
 const updateProfile = async (e) => {
  e.preventDefault();
  setIsUpdating(true);
  setMessage("");

  try {
    const updateData = {};

    // 🔹 Personal Info (partial update)
    if (firstName !== captain?.fullName?.firstName) {
      updateData.fullName = { ...updateData.fullName, firstName };
    }

    if (lastName !== captain?.fullName?.lastName) {
      updateData.fullName = { ...updateData.fullName, lastName };
    }

    // 🔹 Simple fields
    if (email !== captain?.email) {
      updateData.email = email;
    }

    if (phone !== captain?.phone && phone !== "") {
      updateData.phone = phone;
    }

    // 🔹 Vehicle (send FULL object if ANY field changes)
    const vehicleChanged =
      vehicleType !== captain?.vehicle?.vehicleType ||
      vehicleColor !== captain?.vehicle?.color ||
      vehiclePlate !== captain?.vehicle?.plate ||
      vehicleCapacity !== captain?.vehicle?.capacity;

    if (vehicleChanged) {
      updateData.vehicle = {
        vehicleType,
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
      };
    }

    // 🔹 Availability
    if (isAvailable !== (captain?.isActive !== false)) {
      updateData.isActive = isAvailable;
    }

    // 🔴 No changes
    if (Object.keys(updateData).length === 0) {
      setMessage("No changes detected");
      setMessageType("error");
      setIsUpdating(false);
      return;
    }

    const response = await captainAxiosInstance.put(
      `/captain/update-profile`,
      updateData
    );

    if (response.status === 200) {
      setCaptain(response.data.captain);
      setMessage("Profile updated successfully!");
      setMessageType("success");
    }
  } catch (error) {
    setMessage("Failed to update profile. Please try again.");
    setMessageType("error");
    console.error("Update profile error:", error);
  } finally {
    setIsUpdating(false);
  }
};
  // Toggle availability status
  const toggleAvailabilityStatus = async () => {
    setIsUpdating(true);
    setMessage('');
    
    try {
      console.log('Updating captain availability to:', !isAvailable);
      
      const response = await captainAxiosInstance.put(
        `/captain/status`,
        { isActive: isAvailable }
      );

      console.log('API Response:', response);
      
      if (response.status === 200) {
        setIsAvailable(!isAvailable);
        setCaptain(prev => ({ ...prev, isActive: !isAvailable }));
        
        // Update local state immediately for better UX
        localStorage.setItem('captainStatus', JSON.stringify(!isAvailable));
        
        setMessage(`Successfully ${!isAvailable ? 'activated' : 'deactivated'} your availability!`);
        setMessageType('success');
        
        // Show success notification
        if (!isAvailable) {
          // Show notification for deactivation
          console.log('Captain is now unavailable');
        } else {
          // Show notification for activation
          console.log('Captain is now available for rides');
        }
      } else {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      
      // More detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update status. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsUpdating(false);
    }
  };

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img className="w-10 sm:w-12" src={logo} alt="Uber Logo" />
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            </div>
            <button
              onClick={() => navigate('/captain-home')}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Toggle */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability Status</h2>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">
                {isAvailable ? 'Available for Rides' : 'Unavailable for Rides'}
              </h3>
              <p className="text-sm text-gray-500">
                {isAvailable 
                  ? 'You will receive ride requests' 
                  : 'You won\' receive ride requests'}
                
              </p>
            </div>
            <button
              onClick={toggleAvailabilityStatus}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <i className="ri-information-line"></i>
              <span>
                {isAvailable 
                  ? '✓ You are currently available and will receive ride requests' 
                  : '⚠️ You are currently unavailable and won\' receive ride requests'}
                
              </span>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            messageType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium">{message}</p>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={updateProfile} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Vehicle Information</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Color</label>
                <input
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="White"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Plate</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="MH-01-AB-1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                  placeholder="4"
                  min="1"
                  max="6"
                  required
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/captain-home')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CaptainSettings;
