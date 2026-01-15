import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Bell, 
  Search, 
  Menu, 
  X,
  ChevronDown,
  LogOut,
  User,
  Settings,
  HelpCircle
} from "lucide-react";
import { supabase } from "./utils/supabaseClient";

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const [fullName, setFullName] = useState("User");
  const [email, setEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user) {
        setFullName(user.user_metadata?.display_name || user.email?.split('@')[0] || "User");
        setEmail(user.email || "");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/internship") return "Internships";
    if (path === "/preparation-hub") return "Preparation Hub";
    if (path === "/land") return "Resume Builder";
    if (path === "/document-center") return "Document Center";
    if (path === "/ats-checker") return "ATS Scanner";
    if (path === "/progress") return "My Progress";
    if (path === "/admin") return "Question Bank";
    if (path === "/confirmation") return "Task Confirmation";
    if (path === "/edit-internship") return "Manage Internships";
    if (path.includes("/simulation/")) return "Simulation Details";
    if (path.includes("/internship/") && path.includes("/task/")) return "Task";
    if (path.includes("/practicing-questions")) return "Practice Questions";
    return "Dashboard";
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 relative">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? (
            <X className="w-5 h-5 text-slate-600" />
          ) : (
            <Menu className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Page Title */}
        <div>
          <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
        </div>
      </div>

      {/* Center - Search (Desktop) */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5 text-slate-600" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Help */}
        <button className="hidden sm:flex p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <HelpCircle className="w-5 h-5 text-slate-600" />
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-sm font-medium text-indigo-700">
                {fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900 truncate max-w-[120px]">{fullName}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-20">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">{fullName}</p>
                  <p className="text-xs text-slate-500 truncate">{email}</p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      // Navigate to profile if needed
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </button>
                  <button
                    onClick={() => setShowDropdown(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                
                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (Expandable) */}
      {showMobileSearch && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 p-4 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
