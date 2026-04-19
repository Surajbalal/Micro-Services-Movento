import React, { useState, useEffect, useContext } from 'react';
import { CaptainDataContext } from '../Context/CaptainContext';
import captainAxiosInstance from '../api/captainAxiosInstance';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

function CaptainHistory() {
  const { captain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  // State for rides history
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'cancelled'
  const [dateRange, setDateRange] = useState('7'); // days

  // Fetch rides history
  const fetchRidesHistory = async () => {
    setLoading(true);
    try {
      const response = await captainAxiosInstance.get(
        `/captain/rides/history`,
        { params: { filter, days: dateRange } },
      );

      if (response.status === 200) {
        setRides(response.data.rides || []);
      }
    } catch (error) {
      console.error('Error fetching rides history:', error);
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRidesHistory();
  }, [filter, dateRange]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'ongoing':
        return 'Ongoing';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img className="w-10 sm:w-12" src={logo} alt="Uber Logo" />
              <h1 className="text-xl font-bold text-gray-900">Ride History</h1>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                >
                  <option value="all">All Rides</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
            <button
              onClick={fetchRidesHistory}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              <i className="ri-refresh-line mr-2"></i>
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Rides</p>
                <p className="text-2xl font-bold text-gray-900">
                  {rides.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i className="ri-car-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {rides.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {rides.filter(r => r.status === 'cancelled').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <i className="ri-close-line text-red-600 text-xl"></i>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    rides
                      .filter(r => r.status === 'completed')
                      .reduce((sum, ride) => sum + (ride.fare || 0), 0)
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-rupee-circle-line text-yellow-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Rides List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading rides...</p>
            </div>
          ) : rides.length === 0 ? (
            <div className="p-8 text-center">
              <i className="ri-car-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No rides found</p>
              <p className="text-sm text-gray-400 mt-2">
                Try adjusting the filters or time period
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rides.map((ride) => (
                <div key={ride._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Ride Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <i className="ri-map-pin-2-line text-gray-600"></i>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {ride.pickup?.address || 'Pickup Location'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            To: {ride.destination?.address || 'Destination'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <i className="ri-calendar-line"></i>
                          {formatDate(ride.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-time-line"></i>
                          {ride.duration || 'N/A'} min
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-user-3-line"></i>
                          {ride.user?.fullName?.firstName} {ride.user?.fullName?.lastName}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status and Fare */}
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(ride.status)}`}>
                          {getStatusText(ride.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ride.vehicleType?.charAt(0).toUpperCase() + ride.vehicleType?.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(ride.fare)}
                        </p>
                        <p className="text-xs text-gray-500">Fare</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaptainHistory;
