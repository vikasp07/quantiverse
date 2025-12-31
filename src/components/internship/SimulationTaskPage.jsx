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
    <aside className="w-72 min-h-screen bg-white border-r border-gray-200 p-6 shadow-md hidden md:block">
      <button
        onClick={() => navigate(`/simulation/${simulationId}`)}
        className="flex items-center gap-2 mb-6 cursor-pointer hover:bg-gray-100 p-2 rounded transition focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <ArrowLeft className="text-blue-600 w-5 h-5" />
        <span className="text-lg font-semibold text-gray-800">
          {simulation?.title?.split(":")[0] || "Simulation"}
        </span>
      </button>

      <div className="space-y-4">
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
              className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex items-start space-x-3 ${
                isCurrent
                  ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600 font-semibold"
                  : isCompleted
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "hover:bg-gray-100 text-gray-800"
              }`}
            >
              <div
                className={`w-6 h-6 text-sm rounded-full flex items-center justify-center border ${
                  isCompleted
                    ? "bg-green-600 text-white border-green-600"
                    : isCurrent || isInProgress
                    ? "border-blue-600 text-blue-600"
                    : "border-gray-400 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <div>
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-gray-500">
                  {task.duration} • {task.difficulty}
                </p>
                {isCompleted && (
                  <p className="text-xs text-green-600 font-medium">
                    ✓ Completed
                  </p>
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
    <section className="grid md:grid-cols-2 gap-6">
      {/* What You'll Learn */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          What You'll Learn
        </h3>
        {learnPoints.length > 0 ? (
          <ul className="space-y-2 list-disc list-inside text-gray-700 text-sm">
            {learnPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-sm">
            No learning objectives provided.
          </p>
        )}
      </div>

      {/* What You'll Do */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          What You'll Do
        </h3>
        {doPoints.length > 0 ? (
          <ul className="space-y-2 list-disc list-inside text-gray-700 text-sm">
            {doPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic text-sm">
            No actions defined for this task.
          </p>
        )}
      </div>
    </section>
  );
};

const VideoMessage = ({ url }) => {
  return (
    <div className="rounded-lg overflow-hidden shadow-sm border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">Company Message</h3>
      </div>
      {url ? (
        <video
          controls
          className="w-full rounded-lg"
          poster="/video-poster.jpg"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="text-sm text-gray-500 italic p-4 text-center">
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
        const response = await axios.get('http://127.0.0.1:5000/enrollment-status', {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading simulation...</p>
        </div>
      </div>
    );
  }

  // If not enrolled, show error message
  if (!isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Task not found
          </h2>
          <p className="text-gray-600 mb-6">
            The requested task could not be found.
          </p>
          <button
            onClick={() => navigate(`/internship/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
    <div className="min-h-screen flex bg-gray-50">
      <TaskStepper
        key={simulation?.id}
        tasks={tasks}
        currentTaskIndex={currentTaskIndex}
        simulationId={id}
        simulation={simulation}
      />

      <main className="flex-1 p-6 md:p-10 space-y-10">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
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
                <div className="flex items-center gap-2 text-green-600 font-medium mt-1">
                  <Check size={16} />
                  <span className="text-sm">Task Completed</span>
                  {currentTask.confirmation_status === "pending" && (
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full ml-2">
                      Pending Review
                    </span>
                  )}
                  {currentTask.confirmation_status === "accepted" && (
                    <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full ml-2">
                      Accepted
                    </span>
                  )}
                  {currentTask.confirmation_status === "rejected" && (
                    <span className="text-xs text-red-700 bg-red-100 px-2 py-1 rounded-full ml-2">
                      Rejected
                    </span>
                  )}
                </div>

                {(currentTask.confirmation_status === "rejected" ||
                  currentTask.confirmation_status === "accepted") &&
                  currentTask.comment && (
                    <div className="mt-3">
                      <div className="bg-blue-50 border-l-4 border-blue-300 text-gray-900 p-3 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-blue-700">Feedback</span>
                        </div>
                        <div className="mt-1 text-gray-800">{currentTask.comment}</div>
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
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all self-start md:self-auto"
            >
              📦 Download Task Materials
            </button>
          )}
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-blue-900 flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5" />
                  Your Submission
                </h3>
                <p className="text-sm text-blue-700">
                  View and reupload your submitted work
                </p>
                {currentTask.confirmation_status === "rejected" && (
                  <p className="text-sm text-red-600 font-medium mt-2">
                    ⚠️ This submission was rejected. Please review feedback and reupload.
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                title="View and reupload your submission"
              >
                <Eye className="w-5 h-5" />
                <span>Preview & Reupload</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="pt-4 flex gap-3">
          {currentTask.status === "completed" ? (
            <button
              onClick={handleProceedToNext}
              disabled={isCompleting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg shadow transition-all font-semibold text-sm bg-green-600 hover:bg-green-700 text-white"
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
                className="inline-flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-3 rounded-lg transition-all"
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
