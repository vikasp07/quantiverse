import { useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { UserAuth } from '../Auth/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/**
 * Activity Tracker Component
 * Tracks user activity including:
 * - Session start/end times
 * - Page/screen visit durations
 * - Total time on website
 * - Active vs idle time
 */
const ActivityTracker = () => {
  const { session } = UserAuth();
  const location = useLocation();
  const user = session?.user;
  
  // Refs to track timing
  const sessionStartRef = useRef(null);
  const pageStartRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const isActiveRef = useRef(true);
  const currentPageRef = useRef(location.pathname);
  const heartbeatIntervalRef = useRef(null);
  
  // Idle timeout (5 minutes)
  const IDLE_TIMEOUT = 5 * 60 * 1000;
  // Heartbeat interval (30 seconds)
  const HEARTBEAT_INTERVAL = 30 * 1000;

  // Send activity update to backend
  const sendActivityUpdate = useCallback(async (eventType, data = {}) => {
    if (!user?.id) return;
    
    try {
      await axios.post(`${API_BASE}/activity/track`, {
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.display_name || user.email?.split('@')[0],
        event_type: eventType,
        timestamp: new Date().toISOString(),
        page_path: location.pathname,
        ...data
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }, [user, location.pathname]);

  // Track page duration when leaving a page
  const trackPageDuration = useCallback(async (pagePath) => {
    if (!user?.id || !pageStartRef.current) return;
    
    const duration = Math.floor((Date.now() - pageStartRef.current) / 1000); // in seconds
    
    try {
      await axios.post(`${API_BASE}/activity/page-duration`, {
        user_id: user.id,
        page_path: pagePath,
        duration_seconds: duration,
        started_at: new Date(pageStartRef.current).toISOString(),
        ended_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to track page duration:', error);
    }
  }, [user]);

  // Initialize session tracking
  useEffect(() => {
    if (!user?.id) return;
    
    // Start session
    sessionStartRef.current = Date.now();
    pageStartRef.current = Date.now();
    
    sendActivityUpdate('session_start', {
      session_started_at: new Date().toISOString()
    });

    // Setup heartbeat to track active time
    heartbeatIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      if (timeSinceLastActivity < IDLE_TIMEOUT) {
        sendActivityUpdate('heartbeat', {
          is_active: true,
          session_duration: Math.floor((now - sessionStartRef.current) / 1000)
        });
      } else {
        isActiveRef.current = false;
      }
    }, HEARTBEAT_INTERVAL);

    // Handle beforeunload - session end
    const handleBeforeUnload = () => {
      // Track final page duration
      if (currentPageRef.current) {
        const duration = Math.floor((Date.now() - pageStartRef.current) / 1000);
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
          user_id: user.id,
          event_type: 'session_end',
          timestamp: new Date().toISOString(),
          session_duration: Math.floor((Date.now() - sessionStartRef.current) / 1000),
          last_page: currentPageRef.current,
          last_page_duration: duration
        });
        navigator.sendBeacon(`${API_BASE}/activity/session-end`, data);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      // Send session end on component unmount
      sendActivityUpdate('session_end', {
        session_duration: Math.floor((Date.now() - sessionStartRef.current) / 1000)
      });
    };
  }, [user?.id, sendActivityUpdate]);

  // Track page changes
  useEffect(() => {
    if (!user?.id) return;
    
    // Track duration of previous page
    if (currentPageRef.current && currentPageRef.current !== location.pathname) {
      trackPageDuration(currentPageRef.current);
    }
    
    // Start tracking new page
    currentPageRef.current = location.pathname;
    pageStartRef.current = Date.now();
    
    sendActivityUpdate('page_view', {
      page_path: location.pathname,
      previous_page: currentPageRef.current
    });
  }, [location.pathname, user?.id, sendActivityUpdate, trackPageDuration]);

  // Track user activity (mouse, keyboard, scroll)
  useEffect(() => {
    if (!user?.id) return;
    
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        sendActivityUpdate('activity_resume');
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
    
    // Throttle the activity updates
    let throttleTimer = null;
    const throttledUpdate = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          updateActivity();
          throttleTimer = null;
        }, 1000);
      }
    };

    events.forEach(event => {
      window.addEventListener(event, throttledUpdate, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledUpdate);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [user?.id, sendActivityUpdate]);

  // This component doesn't render anything
  return null;
};

export default ActivityTracker;
