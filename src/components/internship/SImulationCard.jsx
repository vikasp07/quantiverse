import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../utils/supabaseClient';

const SimulationCard = ({ simulation }) => {
  const { id, title, company, category, difficulty, duration, image, isNew } = simulation;
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        checkEnrollmentStatus(user.id);
      }
    };
    fetchUser();
  }, [id]);

  const checkEnrollmentStatus = async (userId) => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/enrollment-status`, {
        params: { user_id: userId, internship_id: id }
      });
      setIsEnrolled(response.data.is_enrolled || false);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };



  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link to={`/simulation/${id}`}>
        <div className="h-48 bg-radial-blue rounded-t-lg flex items-center justify-center">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="text-blue-950 text-4xl font-bold">
              {title || '🏢'}
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>

          <p className="text-sm text-gray-600 mb-2">{company}</p>

          <div className="flex flex-wrap gap-2 text-xs text-gray-700 mb-3">
            {category && <span className="bg-gray-100 px-2 py-1 rounded">{category}</span>}
            {difficulty && <span className="bg-gray-100 px-2 py-1 rounded">{difficulty}</span>}
            {duration && <span className="bg-gray-100 px-2 py-1 rounded">{duration}</span>}
          </div>

          {/* Enrollment Status Badge */}
          {isEnrolled && (
            <div className="mb-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Enrolled
              </span>
            </div>
          )}

          {/* View Details Button */}
          <Link 
            to={`/simulation/${id}`}
            className="block w-full py-2 px-4 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 text-center transition-colors"
          >
            View Details
          </Link>
        </div>
    </div>
  );
};

export default SimulationCard;
