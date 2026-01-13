import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, User, Mail, Calendar } from "lucide-react";
import Layout from "../Layout";

const InternshipCandidates = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internshipName, setInternshipName] = useState("");

  useEffect(() => {
    fetchCandidates();

    // Set up auto-refresh interval to poll for progress updates
    const refreshInterval = setInterval(() => {
      fetchCandidates();
    }, 3000); // Refresh every 3 seconds

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [internshipId]);

  const fetchCandidates = async () => {
    setError(null);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.get(
        `${API_BASE}/admin/internships/${internshipId}/candidates`
      );
      setCandidates(response.data.candidates || []);
      setInternshipName(response.data.internship_name || "Internship");
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading candidates...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/edit-internship")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Internships</span>
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Enrolled Candidates
          </h1>
          <p className="text-gray-600">
            {internshipName} - {candidates.length} student
            {candidates.length !== 1 ? "s" : ""} enrolled
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && candidates.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No enrollments yet
            </h3>
            <p className="text-gray-500">
              Students will appear here once they enroll in this internship.
            </p>
          </div>
        )}

        {/* Candidates Table */}

        {!error && candidates.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Enrolled Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {candidates.map((candidate, index) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/user/${candidate.user_id}/profile`)
                    }
                    title="Click to view student profile"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {candidate.user_name || "Unknown User"}
                          </div>
                          <div className="text-xs text-blue-500">
                            Click to view profile
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        {candidate.user_email || "No email"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(candidate.enrolled_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-40">
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${candidate.progress || 0}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600">
                          {candidate.completed_tasks || 0}/
                          {candidate.total_tasks || 0} (
                          {candidate.progress || 0}%)
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InternshipCandidates;
