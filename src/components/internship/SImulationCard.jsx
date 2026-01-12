import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../utils/supabaseClient';
import { Clock, BarChart, ArrowRight, CheckCircle, Building2 } from 'lucide-react';

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

  const getDifficultyColor = (diff) => {
    switch(diff?.toLowerCase()) {
      case 'beginner': return 'text-green-600 bg-green-50';
      case 'intermediate': return 'text-amber-600 bg-amber-50';
      case 'advanced': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-indigo-200 transition-all duration-200">
      <Link to={`/simulation/${id}`}>
        <div className="relative h-40 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-white">
              <Building2 className="w-10 h-10 mb-2 opacity-80" />
              <span className="text-lg font-semibold">{company}</span>
            </div>
          )}
          
          {/* Enrolled Badge */}
          {isEnrolled && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white shadow-sm">
                <CheckCircle className="w-3 h-3" />
                Enrolled
              </span>
            </div>
          )}

          {/* New Badge */}
          {isNew && !isEnrolled && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-600 text-white shadow-sm">
                New
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-5">
        {/* Category Tag */}
        {category && (
          <span className="inline-block px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-md mb-3">
            {category}
          </span>
        )}

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-emerald-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Company */}
        <p className="text-sm text-slate-500 mb-4">{company}</p>

        {/* Meta Info */}
        <div className="flex items-center gap-4 mb-4">
          {difficulty && (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(difficulty)}`}>
              <BarChart className="w-3 h-3" />
              {difficulty}
            </span>
          )}
          {duration && (
            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {duration}
            </span>
          )}
        </div>

        {/* CTA Button */}
        <Link 
          to={`/simulation/${id}`}
          className={`
            flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all
            ${isEnrolled 
              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }
          `}
        >
          {isEnrolled ? 'Continue Learning' : 'View Details'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SimulationCard;
