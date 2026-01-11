import React, { useState } from "react";
import axios from "axios";
import Layout from "../Layout";

const ResumeForm = () => {
  const [resumeType, setResumeType] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    personal: {
      name: "",
      address: "",
      city_state_zip: "",
      phone: "",
      email: "",
      about: "",
    },
    experience: [{ title: "", company: "", dates: "", bullets: [""] }],
    education: [{ location: "", institution: "", dates: "", details: [""] }],
    projects: [{ name: "", year: "", bullets: [""] }],
    technologies: "",
    skills: "",
  });

  const addProject = () => {
    if (resumeType === "one" && formData.projects.length >= 4) {
      alert("You can only add up to 4 projects for a one-page resume.");
      return;
    }
    setFormData({
      ...formData,
      projects: [...formData.projects, { name: "", year: "", bullets: [""] }],
    });
  };

  const addExperience = () => {
    setFormData({
      ...formData,
      experience: [
        ...formData.experience,
        { title: "", company: "", dates: "", bullets: [""] },
      ],
    });
  };

  const addEducation = () => {
    if (resumeType === "one" && formData.education.length >= 2) {
      alert(
        "You can only add up to 2 education entries for a one-page resume."
      );
      return;
    }
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        { location: "", institution: "", dates: "", details: [""] },
      ],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Phone validation
    if (!/^\d{10}$/.test(formData.personal.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    setProgress(0);

    // Simulate progress increase (not actual file progress)
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 10) + 5;
        return next >= 95 ? 95 : next;
      });
    }, 500);

    try {
      const res = await axios.post(
        "http://localhost:5000/compile",
        { ...formData, resumeType },
        { responseType: "blob" } //blob = Binary Large Object (used for files).
      );

      clearInterval(interval);
      setProgress(100);

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "resume.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Error generating resume. Please try again.");
      console.error(error);
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 2000);
    }
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
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.3s ease-out",
          }}
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

  // LOADER DISPLAY
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
        <CircularProgress progress={progress} />
        <p className="mt-4 text-blue-700 font-semibold text-lg animate-pulse">
          Generating Resume...
        </p>
      </div>
    );
  }

  // SHOW RESUME TYPE POPUP FIRST
  if (showPopup) {
    return (
      <Layout>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_#a1c4fd_0%,_#ffffff_100%)] bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-white p-10 rounded-2xl shadow-2xl text-center space-y-6 border border-blue-300 w-[95%] sm:w-[550px] md:w-[600px] animate-scaleIn">
            <h2 className="text-3xl font-bold text-blue-700">
              Choose Resume Type
            </h2>
            <p className="text-gray-700 text-base leading-relaxed">
              Do you want to generate a <strong>one-page</strong> or{" "}
              <strong>two-page</strong> resume?
            </p>
            <div className="flex justify-center gap-6 flex-wrap mt-4">
              <button
                onClick={() => {
                  setResumeType("one");
                  setShowPopup(false);
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-md"
              >
                One Page
              </button>
              <button
                onClick={() => {
                  setResumeType("two");
                  setShowPopup(false);
                }}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3 rounded-lg transition-all duration-300 shadow hover:shadow-md"
              >
                Two Page
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen w-full bg-[radial-gradient(circle_at_center,_#a1c4fd_0%,_#ffffff_100%)] py-10 px-4">
        <form
          className="max-w-4xl mx-auto p-8 space-y-8 bg-white shadow-2xl rounded-xl"
          onSubmit={handleSubmit}
        >
          <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
            Personal Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="p-3 border border-gray-300 rounded-md"
              placeholder="Full Name"
            onChange={(e) =>
              setFormData({
                ...formData,
                personal: { ...formData.personal, name: e.target.value },
              })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md"
            placeholder="Email"
            onChange={(e) =>
              setFormData({
                ...formData,
                personal: { ...formData.personal, email: e.target.value },
              })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md"
            placeholder="Phone"
            onChange={(e) =>
              setFormData({
                ...formData,
                personal: { ...formData.personal, phone: e.target.value },
              })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md"
            placeholder="Address"
            onChange={(e) =>
              setFormData({
                ...formData,
                personal: { ...formData.personal, address: e.target.value },
              })
            }
          />
          <input
            className="p-3 border border-gray-300 rounded-md"
            placeholder="City, State"
            onChange={(e) =>
              setFormData({
                ...formData,
                personal: {
                  ...formData.personal,
                  city_state_zip: e.target.value,
                },
              })
            }
          />
        </div>

        <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
          Technologies
        </h2>
        <input
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Technologies"
          onChange={(e) =>
            setFormData({ ...formData, technologies: e.target.value })
          }
        />

        <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
          Skills
        </h2>
        <input
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="e.g. Problem Solving, Time Management"
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
        />

        <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
          Experience
        </h2>
        {formData.experience.map((exp, idx) => (
          <div
            key={idx}
            className="space-y-3 border border-blue-200  p-4 rounded-lg shadow-sm"
          >
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Title"
              onChange={(e) => {
                const updated = [...formData.experience];
                updated[idx].title = e.target.value;
                setFormData({ ...formData, experience: updated });
              }}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Company"
              onChange={(e) => {
                const updated = [...formData.experience];
                updated[idx].company = e.target.value;
                setFormData({ ...formData, experience: updated });
              }}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Dates"
              onChange={(e) => {
                const updated = [...formData.experience];
                updated[idx].dates = e.target.value;
                setFormData({ ...formData, experience: updated });
              }}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="What you did/what you learn"
              onChange={(e) => {
                const updated = [...formData.experience];
                updated[idx].bullets = e.target.value
                  .split(",")
                  .map((b) => b.trim());
                setFormData({ ...formData, experience: updated });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 font-medium hover:text-blue-700 transition"
          onClick={addExperience}
        >
          + Add Experience
        </button>

        <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
          Education
        </h2>
        {formData.education.map((edu, idx) => (
          <div
            key={idx}
            className="space-y-3 border border-blue-200  p-4 rounded-lg shadow-sm"
          >
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Institution"
              onChange={(e) => {
                const updated = [...formData.education];
                updated[idx].institution = e.target.value;
                setFormData({ ...formData, education: updated });
              }}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Location"
              onChange={(e) => {
                const updated = [...formData.education];
                updated[idx].location = e.target.value;
                setFormData({ ...formData, education: updated });
              }}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Dates"
              onChange={(e) => {
                const updated = [...formData.education];
                updated[idx].dates = e.target.value;
                setFormData({ ...formData, education: updated });
              }}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Details- board/percentage"
              onChange={(e) => {
                const updated = [...formData.education];
                updated[idx].details = e.target.value
                  .split(",")
                  .map((d) => d.trim());
                setFormData({ ...formData, education: updated });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 font-medium hover:text-blue-700 transition"
          onClick={addEducation}
        >
          + Add Education
        </button>

        <h2 className="text-2xl font-bold text-blue-600 border-b border-blue-200 pb-1">
          Projects
        </h2>
        {formData.projects.map((proj, idx) => (
          <div
            key={idx}
            className="space-y-3 border border-blue-200  p-4 rounded-lg shadow-sm"
          >
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Project Name"
              onChange={(e) => {
                const updated = [...formData.projects];
                updated[idx].name = e.target.value;
                setFormData({ ...formData, projects: updated });
              }}
            />
            <input
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Year"
              onChange={(e) => {
                const updated = [...formData.projects];
                updated[idx].year = e.target.value;
                setFormData({ ...formData, projects: updated });
              }}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Brief about project"
              onChange={(e) => {
                const updated = [...formData.projects];
                updated[idx].bullets = e.target.value
                  .split(",")
                  .map((p) => p.trim());
                setFormData({ ...formData, projects: updated });
              }}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-blue-600 font-medium hover:text-blue-700 transition"
          onClick={addProject}
        >
          + Add Project
        </button>

        <div className="text-center">
          <button
            type="submit"
            className="mt-8 bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-all"
          >
            Generate Resume
          </button>
        </div>
      </form>
    </div>
  </Layout>
  );
};

export default ResumeForm;
