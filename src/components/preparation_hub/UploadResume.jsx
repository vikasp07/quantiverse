import React, { useState, useRef } from "react";
import axios from "axios";

const UploadResume = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF resume");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_description", "Software Developer");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/upload_resume`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setResult(res.data);
    } catch (err) {
      console.error("Upload Error:", err.response?.data || err.message);
      alert("Upload failed");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">
        Upload Resume for ATS Score
      </h2>
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current.click()}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
      >
        Select Resume
      </button>
      {file && <span className="text-sm text-gray-700">{file.name}</span>}

      {/* Upload button */}
      <div className="mt-4">
        <button
          onClick={handleUpload}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </div>

      {/* <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button> */}

      {result && (
        <div className="mt-4 bg-gray-100 p-4 rounded">
          <strong>Result:</strong>
          {result.score !== undefined ? (
            <div>
              <p className="text-lg font-semibold">
                ATS Score: {result.score}/100
              </p>
              <p>Matched Skills: {result.matched_skills}</p>
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm text-red-500">
              {typeof result === "string"
                ? result
                : JSON.stringify(result, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadResume;
