import React, { useState, useEffect } from "react";
import {
  Video,
  VideoOff,
  Sun,
  Moon,
  Settings,
  Mic,
  MicOff,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Feedback from "./Feedback";

const VideoCallContent = () => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state || {};

  const commonButtonStyles =
    "h-8 w-8 flex items-center justify-center rounded transition-all duration-200 hover:scale-105";

  // Microphone permission
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setHasMicPermission(true);
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch(() => {
        setHasMicPermission(false);
      });
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (secs % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const handleLeave = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (!user) {
      alert("User not authenticated");
      return;
    }

    const { role, interviewType, date, time, timezone, resume_url } = formData;

    await supabase.from("interview").insert([
      {
        user_id: user.id,
        interview: role || null,
        position: interviewType || null,
        status: "Completed",
        appointment: 'N/A',
        created_at: new Date().toISOString(),
        resume_url: resume_url || null,
      },
    ]);

    setShowFeedback(true);
  };

  if (hasMicPermission === false) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center shadow-lg">
          <h2 className="text-lg font-semibold mb-2 text-red-600">
            Microphone Access Required
          </h2>
          <p className="text-sm text-gray-700 mb-4">
            Please enable microphone access in your browser settings to
            continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (hasMicPermission === null) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        <p>Requesting microphone access...</p>
      </div>
    );
  }

  if (showFeedback) {
    return <Feedback />;
  }

  return (
    <div
      className={`flex-1 min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="px-6 pt-6 flex justify-between items-center">
        <h2
          className={`text-3xl font-bold ${
            isDarkMode ? "text-white" : "text-blue-950"
          }`}
        >
          Mock Interview
        </h2>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`${commonButtonStyles} ${
              isVideoOn
                ? isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200"
                : "bg-red-600 text-white"
            }`}
          >
            {isVideoOn ? (
              <Video className="w-4 h-4" />
            ) : (
              <VideoOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`${commonButtonStyles} ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200"
            }`}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          <button
            className={`${commonButtonStyles} ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-200"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`${commonButtonStyles} ${
              isMicOn
                ? isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-200"
                : "bg-red-600 text-white"
            }`}
          >
            {isMicOn ? (
              <Mic className="w-4 h-4" />
            ) : (
              <MicOff className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={handleLeave}
            className="h-8 px-3 flex items-center justify-center rounded bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-all"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Leave
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 h-[calc(100vh-6rem)] px-6 pb-6">
        {/* Video Feed */}
        <div className="bg-black rounded-xl overflow-hidden relative h-full p-4">
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideoOn ? (
              <div>{/* Placeholder for actual video stream */}</div>
            ) : (
              <div className="w-48 h-48 rounded-full bg-gray-700 flex items-center justify-center border-4 border-white">
                <VideoOff className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Interview Content */}
        <div
          className={`rounded-xl p-6 flex flex-col h-full ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          } shadow-sm`}
        >
          <div className="mb-6">
            <div className="text-blue-600 text-sm font-semibold mb-2">
              {formatTime(secondsElapsed)}
            </div>
            <h2
              className={`text-lg font-semibold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Welcome to your mock interview! Let's get started and focus on
              showcasing your strengths.
            </h2>
          </div>

          <div
            className={`flex-1 rounded-lg p-4 overflow-y-auto ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-600"
            }`}
          >
            <div className="text-sm">
              Interview content and questions will appear here...
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                All services are online
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallContent;

