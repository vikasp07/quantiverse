import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
      <span className="text-7xl md:text-9xl p-4">🚀</span>

      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-4">
        Well done! You finished your interview with our AI Copilot!
      </h2>

      <button
        className="button button-m mb-5"
        onClick={() => navigate("/internship")}
      >
        Return Home
      </button>

      <div className="w-full max-w-md bg-white border border-gray-200 shadow-lg rounded-xl p-6">
        <p className="text-base font-medium text-gray-800 mb-4">
          1. How likely are you to recommend our Mock Interview to a friend?
        </p>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className="w-6 h-6"
                fill={star <= rating ? "#FF4500" : "none"}
                color={star <= rating ? "#FF4500" : "#e5e7eb"}
              />
            </button>
          ))}
        </div>

        <button
          className="w-full button button-m"
          onClick={() => alert("Next feedback step or submit logic here.")}
        >
          Next
        </button>
      </div>

      {/* <div className="mt-6 text-green-600 text-xs">
        Secured by 256-bit AES and 256-bit SSL/TLS encryption
      </div> */}
    </div>
  );
};

export default Feedback;
