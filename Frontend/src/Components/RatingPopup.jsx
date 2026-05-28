import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

function RatingPopup({ rideData, onClose }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRating = async () => {
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axiosInstance.post('/rides/rate', {
        rideId: rideData._id,
        rating,
        feedback
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      onClose(); // Hide popup
      navigate('/home'); // Redirect to home
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. You can try again later.");
      onClose();
      navigate('/home');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
    navigate('/home');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-double-line text-3xl font-bold"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Ride Completed!</h2>
          <p className="text-sm text-gray-500 mb-6">How was your ride with {rideData?.captain?.fullName?.firstName || 'your captain'}?</p>
          
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`text-4xl transition-all duration-200 focus:outline-none ${
                  (hoverRating || rating) >= star ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-yellow-200'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <i className={(hoverRating || rating) >= star ? "ri-star-fill" : "ri-star-line"}></i>
              </button>
            ))}
          </div>

          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent resize-none mb-6"
            rows="3"
            placeholder="Add a comment... (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          ></textarea>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRating}
              disabled={isSubmitting || rating === 0}
              className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all duration-300 ${
                isSubmitting || rating === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-black hover:bg-gray-800 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
            
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatingPopup;
