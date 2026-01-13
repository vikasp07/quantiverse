import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchSimulations,
  fetchTasksForSimulation,
  updateTaskProgress,
  getTasksWithUserProgress,
} from "../utils/simulations";
import {
  CheckCircle,
  PlayCircle,
  Briefcase,
  Check,
  AlertCircle,
  Upload,
  FileText,
  Clock,
  ArrowLeft,
  Eye,
} from "lucide-react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "../utils/supabaseClient";
import WorkUpload from "./WorkUpload";
import SubmissionPreviewModal from "./SubmissionPreviewModal";

const TaskStepper = ({ tasks, currentTaskIndex, simulationId, simulation }) => {
  const navigate = useNavigate();

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-slate-200 p-5 hidden md:block">
      <button
        onClick={() => navigate(`/simulation/${simulationId}`)}
        className="flex items-center gap-2 mb-6 cursor-pointer hover:bg-slate-50 p-2.5 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
      >
        <ArrowLeft className="text-indigo-600 w-4 h-4" />
        <span className="text-sm font-semibold text-slate-900 truncate">
          {simulation?.title?.split(":")[0] || "Simulation"}
        </span>
      </button>

      <div className="mb-4">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Tasks</span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => {
          const isCompleted = task.status === "completed";
          const isCurrent = index === currentTaskIndex;
          const isInProgress = task.status === "in_progress";
          const isPending = task.confirmation_status === "pending";

          return (
            <button
              key={task.id}
              onClick={() =>
                navigate(`/internship/${simulationId}/task/${index + 1}`)
              }
              className={`w-full text-left p-3 rounded-xl transition-all duration-150 flex items-start gap-3 ${
                isCurrent
                  ? "bg-indigo-50 border border-indigo-200"
                  : isCompleted
                  ? "bg-emerald-50 border border-emerald-200 hover:bg-emerald-100"
                  : "hover:bg-slate-50 border border-transparent"
              }`}
            >
              <div
                className={`w-7 h-7 text-xs rounded-lg flex items-center justify-center font-semibold flex-shrink-0 ${
                  isCompleted
                    ? "bg-emerald-600 text-white"
                    : isCurrent || isInProgress
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-indigo-700' : isCompleted ? 'text-emerald-700' : 'text-slate-700'}`}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {task.duration} • {task.difficulty}
                </p>
                {isCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium mt-1">
                    <CheckCircle size={12} />
                    Completed
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

const TaskOverview = ({ task }) => {
  // Normalize learn points: handle comma-separated string or array
  const learnPoints =
    typeof task.what_youll_learn === "string"
      ? task.what_youll_learn
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : Array.isArray(task.what_youll_learn)
      ? task.what_youll_learn.filter(Boolean)
      : [];

  // Normalize do points: same as above
  const doPoints =
    typeof task.what_youll_do === "string"
      ? task.what_youll_do
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : Array.isArray(task.what_youll_do)
      ? task.what_youll_do.filter(Boolean)
      : [];

  return (
    <section className="grid md:grid-cols-2 gap-5">
      {/* What You'll Learn */}
      <div className="bg-emerald-50 p-5 rounded-xl border border-emerald-100">
        <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          What You'll Learn
        </h3>
        {learnPoints.length > 0 ? (
          <ul className="space-y-2 text-slate-700 text-sm">
            {learnPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic text-sm">
            No learning objectives provided.
          </p>
        )}
      </div>

      {/* What You'll Do */}
      <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
        <h3 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          What You'll Do
        </h3>
        {doPoints.length > 0 ? (
          <ul className="space-y-2 text-slate-700 text-sm">
            {doPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic text-sm">
            No actions defined for this task.
          </p>
        )}
      </div>
    </section>
  );
};

const VideoMessage = ({ url }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
          <PlayCircle className="w-5 h-5 text-indigo-600" />
          Company Message
        </h3>
      </div>
      {url ? (
        <div className="p-4">
          <video
            controls
            className="w-full rounded-lg"
            poster="/video-poster.jpg"
          >
            <source src={url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <div className="text-sm text-slate-500 italic p-8 text-center">
          No video available for this task.
        </div>
      )}
    </div>
  );
};

const SimulationTaskPage = () => {
  const { id, taskId } = useParams();
  const navigate = useNavigate();
  const hookUser = useUser();

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentChecked, setEnrollmentChecked] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();
        if (error) {
          console.error("Auth error:", error);
        }

        const finalUser = hookUser || authUser;
        setCurrentUser(finalUser);
        setUserLoaded(true);

        console.log("Final user set:", finalUser);
        console.log("Hook user:", hookUser);
        console.log("Direct user:", authUser);
      } catch (error) {
        console.error("Error getting user:", error);
        setUserLoaded(true);
      }
    };

    getCurrentUser();
  }, [hookUser]);

  // Check enrollment status before allowing access to tasks
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!userLoaded || !currentUser || !id) {
        setEnrollmentChecked(true);
        return;
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        const response = await axios.get(`${API_BASE}/enrollment-status`, {
          params: {
            user_id: currentUser.id,
            internship_id: id
          }
        });

        if (response.data && response.data.is_enrolled) {
          setIsEnrolled(true);
          setEnrollmentChecked(true);
        } else {
          setError('You must enroll in this program before accessing tasks.');
          setIsEnrolled(false);
          setEnrollmentChecked(true);
          // Redirect to simulation detail page
          setTimeout(() => {
            navigate(`/simulation/${id}`, { replace: true });
          }, 2000);
        }
      } catch (err) {
        console.error('Error checking enrollment:', err);
        // Allow access anyway - don't block users if backend is down
        // but log the error for debugging
        setIsEnrolled(true);
        setEnrollmentChecked(true);
      }
    };

    checkEnrollment();
  }, [userLoaded, currentUser, id, navigate]);

  const loadTasksWithProgress = useCallback(
    async (simulationId) => {
      try {
        console.log("Loading tasks for simulation:", simulationId);
        console.log("Current user for progress:", currentUser);

        const allTasks = await fetchTasksForSimulation(simulationId);
        console.log("All tasks loaded:", allTasks);

        if (!currentUser) {
          console.log("No user, returning tasks as not started");
          return allTasks.map((task) => ({
            ...task,
            status: "not_started",
            confirmation_status: null,
            updated_at: null,
            uploaded_work_url: null,
            comment: progress?.comment || null,
          }));
        }

        console.log("Fetching progress for user:", currentUser.id);
        const { data: progressData, error: progressError } = await supabase
          .from("user_task_progress")
          .select(
            "task_id, status, updated_at, confirmation_status, uploaded_work_url,comment"
          )
          .eq("user_id", currentUser.id)
          .eq("simulation_id", simulationId);

        if (progressError) {
          console.error("Progress fetch error:", progressError);
          return allTasks.map((task) => ({
            ...task,
            status: "not_started",
            confirmation_status: null,
            updated_at: null,
            uploaded_work_url: null,
          }));
        }

        console.log("Progress data from DB:", progressData);

        // Create a map for faster lookup
        const progressMap = new Map();
        if (progressData) {
          progressData.forEach((progress) => {
            console.log(
              `Mapping task ${progress.task_id} with status ${progress.status}`
            );
            progressMap.set(progress.task_id, progress);
          });
        }

        // Map tasks with progress data
        const tasksWithProgress = allTasks.map((task) => {
          const progress = progressMap.get(task.id);
          console.log(`Task ${task.id} mapped with progress:`, progress);

          return {
            ...task,
            status: progress?.status || "not_started",
            confirmation_status: progress?.confirmation_status || null,
            uploaded_work_url: progress?.uploaded_work_url || null,
            updated_at: progress?.updated_at || null,
            comment: progress?.comment || null,
          };
        });

        console.log("Final tasks with progress:", tasksWithProgress);
        return tasksWithProgress;
      } catch (error) {
        console.error("Error loading task progress:", error);
        throw error;
      }
    },
    [currentUser]
  );

  const handleUpdateTaskProgress = useCallback(
    async (taskId, status) => {
      if (!currentUser) {
        setError("Please sign in to continue with the simulation.");
        return false;
      }

      try {
        const result = await updateTaskProgress(
          currentUser.id,
          id,
          taskId,
          status
        );

        if (result) {
          // Update local state optimistically
          setTasks((prevTasks) =>
            prevTasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: status,
                    updated_at: new Date().toISOString(),
                  }
                : task
            )
          );
          return true;
        } else {
          throw new Error("Failed to update task progress");
        }
      } catch (error) {
        setError(
          `Error updating progress: ${error.message || "Unknown error"}`
        );
        return false;
      }
    },
    [currentUser, id]
  );

  // Handle successful upload
  const handleUploadSuccess = useCallback(
    (uploadUrl) => {
      const taskIndex = parseInt(taskId) - 1;
      const currentTask = tasks[taskIndex];

      if (!currentTask) {
        console.error("Current task not found for index:", taskIndex);
        return;
      }

      console.log("Updating task after upload:", {
        taskId: currentTask.id,
        uploadUrl,
        status: "completed",
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                status: "completed",
                confirmation_status: "pending",
                uploaded_work_url: uploadUrl,
                updated_at: new Date().toISOString(),
                comment: null,
              }
            : task
        )
      );

      setError(null);
    },
    [taskId, tasks]
  );

  // Main data loading effect - now waits for userLoaded
  useEffect(() => {
    const loadSimulation = async () => {
      try {
        setLoading(true);
        setError(null);

        const sims = await fetchSimulations();
        const sim = sims.find((s) => s.id === id);

        if (!sim) {
          setError("Simulation not found.");
          return;
        }

        setSimulation(sim);

        // Load tasks with user progress
        const tasksWithProgress = await loadTasksWithProgress(sim.id);
        setTasks(tasksWithProgress);

        // Mark current task as in_progress if user is logged in and task is not started
        if (currentUser && tasksWithProgress.length > 0) {
          const currentTaskIndex = parseInt(taskId) - 1;
          const currentTask = tasksWithProgress[currentTaskIndex];

          if (currentTask && currentTask.status === "not_started") {
            handleUpdateTaskProgress(currentTask.id, "in_progress").catch(
              console.error
            );
          }
        }
      } catch (error) {
        setError("Failed to load simulation. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    // Only load simulation after user data is loaded
    if (userLoaded) {
      loadSimulation();
    }
  }, [
    id,
    taskId,
    currentUser,
    userLoaded,
    loadTasksWithProgress,
    handleUpdateTaskProgress,
  ]);

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Check if enrollment is being verified
  if (!enrollmentChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Loading simulation...</p>
        </div>
      </div>
    );
  }

  // If not enrolled, show error message
  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 mb-6">
            You must enroll in this program before accessing the tasks. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const index = parseInt(taskId) - 1;
  const currentTask = tasks[index];
  const currentTaskIndex = index;
  const nextTask = tasks[currentTaskIndex + 1];
  const isLastTask = currentTaskIndex === tasks.length - 1;

  if (!simulation || !currentTask) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Task not found
          </h2>
          <p className="text-slate-600 mb-6">
            The requested task could not be found.
          </p>
          <button
            onClick={() => navigate(`/internship/${id}`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
          >
            Back to Simulation
          </button>
        </div>
      </div>
    );
  }

  const handleProceedToNext = () => {
    if (nextTask) {
      navigate(`/internship/${id}/task/${currentTaskIndex + 2}`);
    } else {
      navigate(`/progress`);
    }
  };

  const handleSkipToNext = () => {
    if (nextTask) {
      navigate(`/internship/${id}/task/${currentTaskIndex + 2}`);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <TaskStepper
        key={simulation?.id}
        tasks={tasks}
        currentTaskIndex={currentTaskIndex}
        simulationId={id}
        simulation={simulation}
      />

      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-5xl">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Header */}
        <header className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium">
                  Task {parseInt(taskId)} of {tasks.length}
                </span>
                {currentTask.difficulty && (
                  <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-medium">
                    {currentTask.difficulty}
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {currentTask.title}
              </h1>
            {/* {currentTask.status === 'completed' && (
              <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
                <Check size={16} />
                <span className="text-sm">Task Completed</span>
                {currentTask.confirmation_status === 'pending' && (
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full ml-2">
                    Pending Review
                  </span>
                )}

                {currentTask.confirmation_status === 'accepted' && (
                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full ml-2">
                    Accepted
                  </span>
                )}

                {currentTask.confirmation_status === 'rejected' && (
                  <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full ml-2">
                    Rejected
                  </span>
                )}
                {(currentTask.confirmation_status === 'rejected' || currentTask.confirmation_status === 'accepted') && currentTask.comment && (
                  <div className="mt-3">
                    <div className="bg-blue-50 border-l-4 border-blue-300 text-gray-900 p-3 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-700">Feedback</span>
                      </div>
                      <div className="mt-1 text-gray-800">{currentTask.comment}</div>
                    </div>
                  </div>
                )}


              </div>
            )} */}

            {currentTask.status === "completed" && (
              <>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                    <Check size={14} />
                    Task Completed
                  </span>
                  {currentTask.confirmation_status === "pending" && (
                    <span className="inline-flex items-center px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium">
                      Pending Review
                    </span>
                  )}
                  {currentTask.confirmation_status === "accepted" && (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                      Accepted
                    </span>
                  )}
                  {currentTask.confirmation_status === "rejected" && (
                    <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
                      Rejected
                    </span>
                  )}
                </div>

                {(currentTask.confirmation_status === "rejected" ||
                  currentTask.confirmation_status === "accepted") &&
                  currentTask.comment && (
                    <div className="mt-4">
                      <div className="bg-indigo-50 border-l-4 border-indigo-400 text-slate-900 p-4 rounded-r-lg text-sm leading-relaxed">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-indigo-700">Feedback</span>
                        </div>
                        <div className="text-slate-700">{currentTask.comment}</div>
                      </div>
                    </div>
                  )}
              </>
            )}
            </div>

          {currentTask.material_url && (
            <button
              onClick={() => {
                const link = document.createElement("a");
                link.href = currentTask.material_url;
                link.download = "";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-all self-start"
            >
              <FileText className="w-4 h-4" />
              Download Materials
            </button>
          )}
          </div>
        </header>

        <TaskOverview task={currentTask} />
        <VideoMessage url={currentTask.videoUrl} />

        {/* Work Upload Section */}
        <WorkUpload
          task={currentTask}
          onUploadSuccess={handleUploadSuccess}
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          currentUser={currentUser}
        />

        {/* View Previous Submission */}
        {currentTask.status === "completed" && currentTask.uploaded_work_url && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-indigo-900 flex items-center gap-2 mb-1">
                  <FileText className="w-5 h-5" />
                  Your Submission
                </h3>
                <p className="text-sm text-indigo-700">
                  View and reupload your submitted work
                </p>
                {currentTask.confirmation_status === "rejected" && (
                  <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Submission rejected. Please review feedback and reupload.
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Preview & Reupload
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-2 flex gap-3">
          {currentTask.status === "completed" ? (
            <button
              onClick={handleProceedToNext}
              disabled={isCompleting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg shadow-sm transition-all font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check size={18} />
              {isLastTask
                ? "Complete Simulation"
                : `Next: ${nextTask?.title || "Continue"}`}
            </button>
          ) : (
            nextTask && (
              <button
                onClick={handleSkipToNext}
                className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-5 py-3 rounded-lg transition-all"
              >
                Skip to Next
              </button>
            )
          )}
        </div>

        {/* Submission Preview Modal */}
        {isPreviewModalOpen && (
          <SubmissionPreviewModal
            task={{
              ...currentTask,
              user_id: currentUser?.id,
            }}
            isOpen={isPreviewModalOpen}
            onClose={() => setIsPreviewModalOpen(false)}
            onReuploadSuccess={() => {
              setIsPreviewModalOpen(false);
              // Reload page to refresh submission data
              window.location.reload();
            }}
          />
        )}
      </main>
    </div>
  );
};

export default SimulationTaskPage;
