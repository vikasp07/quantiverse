import React, { useState, useRef } from "react";
import {
  FileText,
  Briefcase,
  Scan,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";
import { supabase } from "./utils/supabaseClient.js";
import { UserAuth } from "./Auth/AuthContext";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ATSScanner = () => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescFile, setJobDescFile] = useState(null);
  const [jobDescText, setJobDescText] = useState("");
  const [inputMethod, setInputMethod] = useState("text");
  const [isScanning, setIsScanning] = useState(false);
  const [errors, setErrors] = useState({});

 
  const [showDocCenterModal, setShowDocCenterModal] = useState({ for: null }); // "resume" only here
  const [docFiles, setDocFiles] = useState([]);
  const [docCenterLoading, setDocCenterLoading] = useState(false);

  const resumeInputRef = useRef(null);
  const jobDescInputRef = useRef(null);


  const { session } = UserAuth();
  const userId = session?.user?.id;


  const validateFile = (file, maxSize = 5 * 1024 * 1024) => {
    if (!file) return "File is required";
    if (file.type !== "application/pdf") return "Only PDF files are allowed";
    if (file.size > maxSize) return "File size must be less than 5MB";
    return null;
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    const error = validateFile(file);
    setResumeFile(error ? null : file);
    setErrors((prev) => ({ ...prev, resume: error }));
    setShowDocCenterModal({ for: null });
  };

  const handleJobDescUpload = (e) => {
    const file = e.target.files[0];
    const error = validateFile(file);
    setJobDescFile(error ? null : file);
    setErrors((prev) => ({ ...prev, jobDesc: error }));
  };

  const removeFile = (type) => {
    if (type === "resume") {
      setResumeFile(null);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
      setErrors((prev) => ({ ...prev, resume: null }));
    } else {
      setJobDescFile(null);
      if (jobDescInputRef.current) jobDescInputRef.current.value = "";
      setErrors((prev) => ({ ...prev, jobDesc: null }));
    }
  };

  const handleUploadAreaClick = (which) => {
    if (which === "resume") {
      setShowDocCenterModal({ for: which });
      setDocCenterLoading(true);
      if (userId) {
        supabase
          .storage
          .from("resumes")
          .list(`${userId}/`)
          .then(({ data, error }) => {
            setDocFiles(data?.filter(f => f.name && !f.name.endsWith("/")) || []);
          }).finally(() => setDocCenterLoading(false));
      } else {
        setDocFiles([]);
        setDocCenterLoading(false);
      }
    }
  };

  const handleSelectDocCenterFile = async (fileName) => {
    if (!userId || !fileName) return;
    setDocCenterLoading(true);
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(`${userId}/${fileName}`, 60);
    if (data?.signedUrl && !error) {
      const res = await fetch(data.signedUrl);
      const blob = await res.blob();
      const fileObj = new File([blob], fileName, { type: "application/pdf" });
      setResumeFile(fileObj);
      setErrors(prev => ({ ...prev, resume: null }));
    }
    setShowDocCenterModal({ for: null });
    setDocCenterLoading(false);
  };

  const handleScan = async () => {
    const newErrors = {};
    if (!resumeFile) newErrors.resume = "Resume is required";
    if (inputMethod === "text" && !jobDescText.trim())
      newErrors.jobDescText = "Job description is required";
    else if (inputMethod === "file" && !jobDescFile)
      newErrors.jobDesc = "Job description file is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("file", resumeFile);
      formData.append(
        "job_description",
        inputMethod === "text"
          ? jobDescText
          : "JD from file not implemented"
      );

      const response = await fetch(`${BASE_URL}/upload_resume`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      navigate("/results", { state: result });
    } catch (error) {
      console.error("Scan failed:", error);
      alert("An error occurred while scanning.");
    } finally {
      setIsScanning(false);
    }
  };

  const FileUploadArea = ({
    title,
    icon: Icon,
    file,
    onUpload,
    inputRef,
    error,
    description = "Upload PDF file (Max 5MB)",
    which, 
    disableDocCenter = false,
  }) => (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={onUpload}
        className="hidden"
      />
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 ${
          file
            ? "border-green-400 bg-green-50"
            : error
            ? "border-red-400 bg-red-50"
            : "border-gray-300 bg-gray-50"
        }`}
        onClick={() =>
          disableDocCenter
            ? inputRef.current?.click()
            : handleUploadAreaClick(which)
        }
      >
        <div className="flex flex-col items-center space-y-4">
          <div
            className={`p-3 rounded-full ${
              file ? "bg-green-100" : error ? "bg-red-100" : "bg-blue-100"
            }`}
          >
            {file ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : error ? (
              <AlertCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Icon className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
            {file ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(which);
                  }}
                  className="inline-flex items-center space-x-1 text-sm text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-600">{description}</p>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );

  
  const DocumentCenterPopover = () =>
    showDocCenterModal.for === "resume" ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-6 rounded-xl shadow-2xl border max-w-md w-full relative animate-fade-in">
          <button
            aria-label="Close"
            className="absolute top-2 right-4 text-gray-400 hover:text-gray-700"
            onClick={() => setShowDocCenterModal({ for: null })}
          >
            <X className="h-6 w-6" />
          </button>
          <h3 className="text-lg font-bold mb-3 text-gray-800">Upload Resume</h3>
          <div className="grid gap-3">
            <button
              onClick={() => {
                if (showDocCenterModal.for === "resume")
                  resumeInputRef.current?.click();
              }}
              className="flex items-center gap-3 justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm font-medium text-base transition"
            >
              <Scan className="h-5 w-5" />
              Upload from device
            </button>
          </div>
          <p className="text-sm text-slate-500 my-2 text-center">
            Or, choose from your Document Center
          </p>
          <div className="bg-slate-50 rounded-lg border p-3 max-h-56 overflow-y-auto">
            {docCenterLoading ? (
              <div className="text-sm text-gray-400 text-center py-6">
                Loading files...
              </div>
            ) : docFiles.length === 0 ? (
              <div className="text-xs text-gray-400 italic text-center py-6">
                No files found in your Document Center.
              </div>
            ) : (
              <ul>
                {docFiles.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center gap-3 cursor-pointer rounded p-2 hover:bg-slate-100 transition"
                    onClick={() => handleSelectDocCenterFile(file.name)}
                  >
                    <FileText className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-slate-800 truncate flex-1">
                      {file.name}
                    </span>
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
        </div>
      </div>
    ) : null;

  return (
    <Layout>
      {DocumentCenterPopover()}
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-indigo-600 rounded-xl mb-4">
              <Scan className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">
              ATS Resume Scanner
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Upload your resume and job description to get comprehensive ATS
              compatibility analysis and optimization suggestions.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <FileUploadArea
                  title="Upload Resume"
                  icon={FileText}
                  file={resumeFile}
                  onUpload={handleResumeUpload}
                  inputRef={resumeInputRef}
                  error={errors.resume}
                  which="resume"
                />

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Job Description
                  </h3>
                  <div className="flex space-x-4 mb-4">
                    <button
                      onClick={() => setInputMethod("text")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        inputMethod === "text"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Text Input
                    </button>
                    <button
                      onClick={() => setInputMethod("file")}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        inputMethod === "file"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Upload PDF
                    </button>
                  </div>

                  {inputMethod === "text" ? (
                    <>
                      <textarea
                        value={jobDescText}
                        onChange={(e) => {
                          setJobDescText(e.target.value);
                          if (errors.jobDescText) {
                            setErrors((prev) => ({
                              ...prev,
                              jobDescText: null,
                            }));
                          }
                        }}
                        placeholder="Paste the job description here..."
                        className={`w-full h-48 p-4 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.jobDescText ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {errors.jobDescText && (
                        <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.jobDescText}</span>
                        </p>
                      )}
                    </>
                  ) : (
                    <FileUploadArea
                      title="Upload Job Description"
                      icon={Briefcase}
                      file={jobDescFile}
                      onUpload={handleJobDescUpload}
                      inputRef={jobDescInputRef}
                      error={errors.jobDesc}
                      which="job"
                      disableDocCenter={true} // disables document center modal
                    />
                  )}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleScan}
                  disabled={isScanning}
                  className={`inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                    isScanning
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  }`}
                >
                  {isScanning ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Scan className="w-6 h-6" />
                      <span>Start ATS Scan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ATSScanner;
