import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FilePlus, UploadCloud, Loader2, FileText } from "lucide-react";
import Layout from "../Layout";
import { supabase } from "../utils/supabaseClient";
import { UserAuth } from "../Auth/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LandingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showUploadChoice, setShowUploadChoice] = useState(false);
  const [docFiles, setDocFiles] = useState([]);
  const [docCenterLoading, setDocCenterLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fileInputRef = useRef();

  const { session } = UserAuth();
  const userId = session?.user?.id;

  
  useEffect(() => {
    if (showUploadChoice && userId) {
      setDocCenterLoading(true);
      supabase
        .storage
        .from("resumes")
        .list(`${userId}/`)
        .then(({ data, error }) => {
          if (!error && data) {
            const files = data.filter((f) => f.name && !f.name.endsWith("/"));
            setDocFiles(files);
          } else {
            setDocFiles([]);
          }
        })
        .finally(() => setDocCenterLoading(false));
    }
  }, [showUploadChoice, userId]);

  
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowedTypes = [".pdf", ".docx", ".doc"];
    const isValidType = allowedTypes.some(ext => file.name && file.name.toLowerCase().endsWith(ext));
    if (!isValidType || file.size > 5 * 1024 * 1024) {
      alert("Only PDF, DOCX or DOC files under 5MB are allowed.");
      return;
    }
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    setShowUploadChoice(false);
    try {
      const res = await fetch(`${BASE_URL}/api/parse-resume`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Parsing failed");
      const parsed = await res.json();
      navigate("/resume", { state: { parsedData: parsed } });
    } catch (err) {
      alert("Resume parsing failed.");
    } finally {
      setLoading(false);
    }
  };


  const handleParseSelectedDoc = async () => {
    if (!selectedDoc || !userId) return;
    setLoading(true);
    setShowUploadChoice(false);

    
    const { data, error } = await supabase
      .storage
      .from("resumes")
      .createSignedUrl(`${userId}/${selectedDoc}`, 60);

    if (!data?.signedUrl || error) {
      alert("Failed to load file from Document Center.");
      setLoading(false);
      return;
    }

    try {
      const fileRes = await fetch(data.signedUrl);
      const blob = await fileRes.blob();
      const file = new File([blob], selectedDoc);
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch(`${BASE_URL}/api/parse-resume`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Parsing failed");
      const parsed = await res.json();
      navigate("/resume", { state: { parsedData: parsed } });
    } catch (err) {
      alert("Resume parsing failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDocCenterSelect = (filename) => setSelectedDoc(filename);

  return (
    <Layout>
      <div className="min-h-full flex bg-gradient-to-br from-gray-100 via-white to-gray-100">
    
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc"
        style={{ display: "none" }}
        onChange={handleResumeUpload}
      />

      {/* Modal: Only shown if not loading */}
      {showUploadChoice && !loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 transition-all">
          <div className="bg-white max-w-md w-full p-6 px-7 rounded-xl shadow-2xl border relative animate-fade-in space-y-5">
            <button
              onClick={() => setShowUploadChoice(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
              aria-label="Close"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <h3 className="text-xl font-bold mb-1 text-gray-800">Upload Resume</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { fileInputRef.current?.click(); setShowUploadChoice(false); }}
                className="flex items-center gap-3 justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium text-base transition"
              >
                <UploadCloud className="h-5 w-5" />
                Upload from device
              </button>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2 text-center">Or, choose from your Document Center</p>

              <div className="bg-slate-50 rounded-lg border p-3 max-h-52 overflow-y-auto transition">
                {docCenterLoading ? (
                  <div className="text-sm text-gray-400 text-center py-8">Loading files...</div>
                ) : docFiles.length === 0 ? (
                  <div className="text-xs text-gray-400 italic text-center py-8">No files found in your Document Center.</div>
                ) : (
                  <ul>
                    {docFiles.map((file) => (
                      <li
                        key={file.name}
                        onClick={() => setSelectedDoc(file.name)}
                        className={`
                          flex items-center gap-3 cursor-pointer rounded p-2 transition
                          ${selectedDoc === file.name
                            ? "bg-blue-100 border-l-4 border-blue-500"
                            : "hover:bg-slate-100"
                          }
                        `}
                      >
                        <FileText className="h-5 w-5 text-blue-500 shrink-0" />
                        <span className="text-sm text-slate-800 truncate flex-1">{file.name}</span>
                        {file.metadata?.size !== undefined && (
                          <span className="text-xs text-slate-500 ml-2">
                            {(Math.round(file.metadata.size / 1024) || 1)} KB
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium transition disabled:opacity-50"
                onClick={handleParseSelectedDoc}
                disabled={!selectedDoc || docCenterLoading || loading}
              >
                <FileText className="h-5 w-5" /> Use selected document
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-screen-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to Resume Builder</h1>
            <p className="text-gray-500">Choose an option to get started</p>
          </div>

          {/* Loading replaces card grid and modal */}
          {loading ? (
            <LoadingAnimation />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div
                onClick={() => navigate("/resume-from-scratch")}
                className="cursor-pointer border border-gray-300 bg-white p-6 rounded-xl hover:shadow-xl hover:border-blue-500 transition group"
              >
                <FilePlus className="mx-auto h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Start from Scratch</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Build your resume step-by-step with our guided editor
                </p>
              </div>
              {/* Card 2: Triggers modal */}
              <div
                onClick={() => { setShowUploadChoice(true); setSelectedDoc(null); }}
                className="cursor-pointer border border-gray-300 bg-white p-6 rounded-xl hover:shadow-xl hover:border-blue-500 transition group"
              >
                <UploadCloud className="mx-auto h-12 w-12 text-blue-600 group-hover:scale-110 transition-transform" />
                <h2 className="mt-4 text-xl font-semibold text-gray-700">Upload Resume</h2>
                <p className="text-gray-500 text-sm mt-1">
                  Let us extract your details from a PDF, DOCX or DOC resume
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 mt-6">
            Your data is processed locally and never stored.
          </p>
        </div>
      </div>
    </div>
  </Layout>
  );
};

export default LandingPage;

const LoadingAnimation = () => {
  const steps = [
    "Uploading your resume...",
    "Parsing content intelligently...",
    "Extracting contact details...",
    "Identifying your education...",
    "Analyzing your work experience...",
    "Highlighting your top skills...",
    "Structuring everything beautifully...",
    "Almost done. Hang tight..."
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 5000); // show each step every 2.5 seconds
    return () => clearInterval(interval);
  }, []);

  const percentage = ((index + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col items-center space-y-6">
      <CircularProgress progress={percentage} />
      <p className="text-blue-700 text-lg font-medium transition-opacity duration-1000 ease-in-out">
        {steps[index]}
      </p>
    </div>
  );
};

const CircularProgress = ({ progress }) => {
  const radius = 45;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#E5E7EB"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#3B82F6"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="14"
        fill="#1E3A8A"
        className="font-semibold"
      >
        {Math.round(progress)}%
      </text>
    </svg>
  );
};



