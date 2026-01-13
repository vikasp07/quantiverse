import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import Layout from "../Layout";
import { supabase } from "../utils/supabaseClient";

const InternshipSubmissions = () => {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [internshipName, setInternshipName] = useState("");
  const [selectedTask, setSelectedTask] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchSubmissions();
  }, [internshipId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch internship/simulation details
      const { data: simData, error: simError } = await supabase
        .from("simulations")
        .select("title")
        .eq("id", internshipId)
        .single();

      if (simError) throw simError;
      setInternshipName(simData?.title || "Internship");

      // Fetch all tasks for this simulation
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("id, title, full_title")
        .eq("simulation_id", internshipId)
        .order("id", { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

      // Fetch all submissions (user_task_progress) for this simulation
      const { data: progressData, error: progressError } = await supabase
        .from("user_task_progress")
        .select(
          `
          id,
          user_id,
          task_id,
          status,
          confirmation_status,
          uploaded_work_url,
          comment,
          updated_at
        `
        )
        .eq("simulation_id", internshipId)
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      if (progressError) throw progressError;

      // Get unique user IDs
      const userIds = [...new Set(progressData.map((p) => p.user_id))];

      // Fetch user details from auth.users via a workaround
      // We'll use the profiles or just show user_id for now
      // Since we can't directly query auth.users, we'll try to get emails from enrollments

      // Enrich submissions with task info
      const enrichedSubmissions = progressData.map((submission) => {
        const task = tasksData.find((t) => t.id === submission.task_id);
        return {
          ...submission,
          task_title: task?.title || "Unknown Task",
          task_full_title: task?.full_title || "Unknown Task",
        };
      });

      setSubmissions(enrichedSubmissions);
    } catch (err) {
      console.error("Error fetching submissions:", err);
      setError("Failed to load submissions. Please try again.");
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

  const markTaskComplete = async (taskId) => {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  await axios.patch(
    `${API_BASE}/enrollments/${internshipId}/${userId}/tasks/${taskId}`
  );

  // refetch candidates or tasks
  fetchCandidates(); // or fetchTasks()
};


  const getStatusBadge = (confirmationStatus) => {
    switch (confirmationStatus) {
      case "confirmed":
      case "accepted":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  const handleViewFile = (url) => {
    setPreviewUrl(url);
  };

  const handleDownloadFile = (url) => {
    window.open(url, "_blank");
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesTask =
      selectedTask === "all" || sub.task_id.toString() === selectedTask;
    const matchesStatus =
      selectedStatus === "all" || sub.confirmation_status === selectedStatus;
    return matchesTask && matchesStatus;
  });

  if (loading) {
    return (
      <Layout>
        <div className="p-8 flex items-center justify-center min-h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading submissions...</p>
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
            Task Submissions
          </h1>
          <p className="text-gray-600">
            {internshipName} - {submissions.length} submission
            {submissions.length !== 1 ? "s" : ""} total
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Filters:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Task:</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Tasks</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id.toString()}>
                    {task.title} - {task.full_title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="accepted">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-500">
              Showing {filteredSubmissions.length} of {submissions.length}{" "}
              submissions
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            <p className="font-semibold">Error</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && filteredSubmissions.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No submissions found
            </h3>
            <p className="text-gray-500">
              {submissions.length === 0
                ? "Students will appear here once they submit their work."
                : "No submissions match your current filters."}
            </p>
          </div>
        )}

        {/* Submissions Table */}
        {!error && filteredSubmissions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => (
                  <tr
                    key={submission.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div
                            className="text-sm font-medium text-gray-900 truncate max-w-[150px]"
                            title={submission.user_id}
                          >
                            {submission.user_id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {submission.task_title}
                      </div>
                      <div
                        className="text-sm text-gray-500 truncate max-w-[200px]"
                        title={submission.task_full_title}
                      >
                        {submission.task_full_title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(submission.confirmation_status)}
                      {submission.comment && (
                        <div
                          className="text-xs text-gray-500 mt-1 max-w-[150px] truncate"
                          title={submission.comment}
                        >
                          💬 {submission.comment}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {formatDate(submission.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {submission.uploaded_work_url ? (
                          <>
                            <button
                              onClick={() =>
                                handleViewFile(submission.uploaded_work_url)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadFile(submission.uploaded_work_url)
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No file uploaded
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* File Preview Modal */}
        {previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  File Preview
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadFile(previewUrl)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={handleClosePreview}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {previewUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <img
                    src={previewUrl}
                    alt="Submission preview"
                    className="max-w-full h-auto mx-auto"
                  />
                ) : previewUrl.match(/\.pdf$/i) ? (
                  <iframe
                    src={previewUrl}
                    title="PDF Preview"
                    className="w-full h-[70vh]"
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      This file type cannot be previewed directly.
                    </p>
                    <button
                      onClick={() => handleDownloadFile(previewUrl)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      Download File
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
  
};

export default InternshipSubmissions;
