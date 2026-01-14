import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Target,
  FileText,
  BookOpen,
  Cpu,
  Zap,
  User,
  BarChart3,
  PlusCircle,
  ClipboardList,
  Settings,
  Check,
  Scan,
  GraduationCap,
  Layers,
  LogOut,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { supabase } from "./utils/supabaseClient";

const Sidebar = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("User");
  const [email, setEmail] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) return setRole("user");

      setFullName(user.user_metadata?.display_name || user.email?.split('@')[0] || "User");
      setEmail(user.email || "");

      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError || !roleData) {
        setRole("user");
      } else {
        setRole(roleData.role);
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="w-64 h-screen bg-white border-r border-slate-200 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userMenuItems = [
    //{ icon: Target, label: "Mock Interview", path: "/home" },
    //{ icon: BookOpen, label: "Preparation Hub", path: "/preparation-hub" },
    { icon: Briefcase, label: "Internships", path: "/internship" },
    //{ icon: FileText, label: "Resume Builder", path: "/land" },
    //{ icon: Layers, label: "Document Center", path: "/document-center" },
    //{ icon: Scan, label: "ATS Scanner", path: "/ats-checker" },
  ];

  const adminMenuItems = [
    // { icon: PlusCircle, label: "Question Bank", path: "/admin" }, // Disabled
    { icon: Check, label: "Task Confirmation", path: "/confirmation" },
    { icon: GraduationCap, label: "Manage Internships", path: "/edit-internship" },
  ];

  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Q</span>
          </div>
          <div>
            <span className="font-semibold text-slate-900">Quantiverse</span>
            <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-medium rounded">
              {role === "admin" ? "ADMIN" : "AI"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="mb-2 px-3">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            {role === "admin" ? "Administration" : "Main Menu"}
          </span>
        </div>
        
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.path !== "/internship" && location.pathname.startsWith(item.path));
            
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${isActive 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className="flex-1 text-left">{item.label}</span>
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </div>

        {/* Internships Quick Link for Users */}
        {role !== "admin" && (
          <>
            <div className="mt-6 mb-2 px-3">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Quick Actions
              </span>
            </div>
            <button
              onClick={() => navigate("/progress")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              <BarChart3 className="w-5 h-5 text-slate-400" />
              <span className="flex-1 text-left">My Progress</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </>
        )}
      </nav>

      {/* User Section */}
      <div className="p-3 border-t border-slate-100">
        {/* User Info */}
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-sm font-medium text-emerald-700">
              {fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{fullName}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
