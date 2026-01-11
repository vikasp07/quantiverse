import React, { useState, useEffect } from "react";
import {
  Check,
  ArrowRight,
  Trophy,
  ChevronDown,
  AlertCircle,
  Rows,
  ArrowLeft,
  Award,
} from "lucide-react";
import {
  fetchSimulations,
  fetchTasksForSimulation,
} from "../utils/simulations";
import { UserAuth } from "../Auth/AuthContext";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import Certificate from "./Certificate";

const TaskItem = ({ task, number, onClick, simulationId, onPreviewClick }) => {
  const navigate = useNavigate();

  const getConfirmationStatusColor = (status) => {
    switch (status) {
      case "confirmed":
      case "accepted":
      case "approved":
        return "bg-emerald-100 text-emerald-700";
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getConfirmationStatusText = (status) => {
    switch (status) {
      case "confirmed":
      case "accepted":
      case "approved":
        return "approved";
      case "pending":
        return "pending";
      case "rejected":
        return "rejected";
      default:
        return status;
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case "completed":
        return <Check className="w-5 h-5 text-emerald-500" />;
      case "in_progress":
        return (
          <div className="w-5 h-5 border-2 border-indigo-500 rounded-full animate-pulse" />
        );
      default:
        return (
          <div className="w-5 h-5 border-2 border-slate-300 rounded-full opacity-50" />
        );
    }
  };

  return (
    <div
      className={`flex items-center justify-between py-4 px-4 transition-all duration-200 ${
        task.status !== "locked"
          ? "hover:bg-slate-50 cursor-pointer"
          : "opacity-60"
      }`}
    >
      <div className="flex items-center gap-4">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <p className="font-medium text-slate-900">
              Task {number}: {task.title}
            </p>

            <div className="flex gap-3 text-sm">
              {task.status && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${
                    task.status === "completed"
                      ? "bg-emerald-100 text-emerald-700"
                      : task.status === "in_progress"
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {task.status.replace("_", " ")}
                </span>
              )}

              {task.confirmation_status && (
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getConfirmationStatusColor(
                    task.confirmation_status
                  )}`}
                >
                  {getConfirmationStatusText(task.confirmation_status)}
                </span>
              )}
            </div>
          </div>

          {task.updated_at && (
            <p className="text-xs text-slate-400 mt-1">
              Updated: {new Date(task.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {(task.status === "in_progress" ||
          task.confirmation_status === "rejected") && (
          <button
            className="flex items-center gap-2 text-indigo-600 font-medium hover:text-indigo-800 transition text-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/internship/${simulationId}/task/${number}`);
            }}
          >
            <span>
              {task.confirmation_status === "rejected" ? "Redo" : "Continue"}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const ProgressPage = () => {
  const [simulations, setSimulations] = useState([]);
  const [openSimIds, setOpenSimIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateData, setCertificateData] = useState(null);
  const navigate = useNavigate();

  const { session } = UserAuth();
  const user = session?.user;

  // Get user's first and last name from metadata
  const getUserFullName = () => {
    if (!user) return "";
    const metadata = user.user_metadata || {};
    const firstName = metadata.first_name || "";
    const lastName = metadata.last_name || "";
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    return metadata.display_name || user.email?.split("@")[0] || "User";
  };

  // Check if all tasks are completed AND approved
  const isInternshipFullyApproved = (sim) => {
    if (!sim.tasks || sim.tasks.length === 0) return false;
    return sim.tasks.every(
      (task) =>
        task.status === "completed" &&
        ["confirmed", "accepted", "approved"].includes(task.confirmation_status)
    );
  };

  const handleViewCertificate = (sim) => {
    const completionDate = sim.tasks.reduce((latest, task) => {
      if (task.updated_at && new Date(task.updated_at) > new Date(latest)) {
        return task.updated_at;
      }
      return latest;
    }, sim.tasks[0]?.updated_at || new Date().toISOString());

    setCertificateData({
      userName: getUserFullName(),
      internshipTitle: sim.title,
      companyName: sim.company || "",
      completionDate: completionDate,
    });
  };

  const toggleAccordion = (id) => {
    setOpenSimIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getUserTaskProgress = async (userId) => {
    try {
      const { data: progressData, error } = await supabase
        .from("user_task_progress")
        .select(
          `simulation_id, task_id, status, updated_at, confirmation_status, uploaded_work_url, comment`
        )
        .eq("user_id", userId);

      if (error) throw error;
      return progressData || [];
    } catch (error) {
      console.error("Error in getUserTaskProgress:", error);
      throw error;
    }
  };

  const mergeTasksWithProgress = (tasks, progressData, simulationId) => {
    return tasks.map((task) => {
      const progress = progressData.find(
        (p) => p.task_id === task.id && p.simulation_id === simulationId
      );
      return {
        ...task,
        status: progress?.status || "not_started",
        updated_at: progress?.updated_at || null,
        confirmation_status: progress?.confirmation_status || null,
      };
    });
  };

  useEffect(() => {
    const loadSimulationsWithProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const simData = await fetchSimulations();
        const allUserProgress = await getUserTaskProgress(user.id);

        const userSimulationIds = [
          ...new Set(allUserProgress.map((p) => p.simulation_id)),
        ];

        const userSimulations = simData.filter((sim) =>
          userSimulationIds.includes(sim.id)
        );

        const simulationsWithProgress = await Promise.all(
          userSimulations.map(async (sim) => {
            const allTasks = await fetchTasksForSimulation(sim.id);
            const simProgressData = allUserProgress.filter(
              (p) => p.simulation_id === sim.id
            );

            const userTasks = allTasks.filter((task) =>
              simProgressData.some((p) => p.task_id === task.id)
            );

            const tasksWithProgress = mergeTasksWithProgress(
              userTasks,
              simProgressData,
              sim.id
            );

            const completedTasks = tasksWithProgress.filter(
              (t) => t.status === "completed"
            ).length;
            const inProgressTasks = tasksWithProgress.filter(
              (t) => t.status === "in_progress"
            ).length;
            const totalTasks = tasksWithProgress.length;
            const progress = totalTasks
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;

            let status = "not_started";
            if (completedTasks === totalTasks && totalTasks > 0) {
              status = "completed";
            } else if (completedTasks > 0 || inProgressTasks > 0) {
              status = "in_progress";
            }

            return {
              ...sim,
              tasks: tasksWithProgress,
              completedTasks,
              totalTasks,
              progress,
              status,
            };
          })
        );

        const sortedSimulations = simulationsWithProgress.sort((a, b) => {
          const statusOrder = {
            in_progress: 0,
            completed: 1,
            not_started: 2,
            error: 3,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setSimulations(sortedSimulations);
      } catch (error) {
        setError("Failed to load your progress. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    loadSimulationsWithProgress();
  }, [user]);

  // Polling for real-time progress updates
  useEffect(() => {
    if (!user) return;

    const pollInterval = setInterval(() => {
      const loadSimulationsWithProgress = async () => {
        try {
          const simData = await fetchSimulations();
          const allUserProgress = await getUserTaskProgress(user.id);

          const userSimulationIds = [
            ...new Set(allUserProgress.map((p) => p.simulation_id)),
          ];

          const userSimulations = simData.filter((sim) =>
            userSimulationIds.includes(sim.id)
          );

          const simulationsWithProgress = await Promise.all(
            userSimulations.map(async (sim) => {
              const allTasks = await fetchTasksForSimulation(sim.id);
              const simProgressData = allUserProgress.filter(
                (p) => p.simulation_id === sim.id
              );

              const userTasks = allTasks.filter((task) =>
                simProgressData.some((p) => p.task_id === task.id)
              );

              const tasksWithProgress = mergeTasksWithProgress(
                userTasks,
                simProgressData,
                sim.id
              );

              const completedTasks = tasksWithProgress.filter(
                (t) => t.status === "completed"
              ).length;
              const inProgressTasks = tasksWithProgress.filter(
                (t) => t.status === "in_progress"
              ).length;
              const totalTasks = tasksWithProgress.length;
              const progress = totalTasks
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0;

              let status = "not_started";
              if (completedTasks === totalTasks && totalTasks > 0) {
                status = "completed";
              } else if (completedTasks > 0 || inProgressTasks > 0) {
                status = "in_progress";
              }

              return {
                ...sim,
                tasks: tasksWithProgress,
                completedTasks,
                totalTasks,
                progress,
                status,
              };
            })
          );

          const sortedSimulations = simulationsWithProgress.sort((a, b) => {
            const statusOrder = {
              in_progress: 0,
              completed: 1,
              not_started: 2,
              error: 3,
            };
            return statusOrder[a.status] - statusOrder[b.status];
          });

          setSimulations(sortedSimulations);
        } catch (error) {
          console.error("Error updating progress:", error);
        }
      };

      loadSimulationsWithProgress();
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(pollInterval);
  }, [user]);

  const handleNavigateToTask = (sim) => {
    const inProgressTask = sim.tasks.find((t) => t.status === "in_progress");
    const firstIncompleteTask = sim.tasks.find((t) => t.status !== "completed");
    const targetTask = inProgressTask || firstIncompleteTask || sim.tasks[0];

    if (targetTask) {
      const taskIndex = sim.tasks.findIndex((t) => t.id === targetTask.id) + 1;
      window.location.href = `/internship/${sim.id}/task/${taskIndex}`;
    }
  };

  const getStatusDisplayText = (status) => {
    switch (status) {
      case "not_started":
        return "Not Started";
      case "in_progress":
        return "In Progress";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in_progress":
        return "bg-indigo-100 text-indigo-700";
      case "error":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getButtonClasses = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-600 hover:bg-emerald-700 text-white";
      case "in_progress":
        return "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm";
      default:
        return "bg-slate-700 hover:bg-slate-800 text-white";
    }
  };

  const getButtonText = (status) => {
    switch (status) {
      case "completed":
        return "View Completed Tasks";
      case "in_progress":
        return "Continue Simulation";
      default:
        return "Start Simulation";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-indigo-500" />
          </div>
          <p className="text-slate-700 font-medium">Please sign in to view your progress.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center">
        <div>
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate("/internship")}
          className="inline-flex items-center text-slate-600 hover:text-indigo-600 mb-6 transition-colors group text-sm font-medium"
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to simulations
        </button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Your Progress
          </h1>
          <p className="text-slate-600">Track your learning journey across all simulations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : simulations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No simulations started yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Begin your learning journey by exploring our available simulations.</p>
            <button
              onClick={() => (window.location.href = "/internship")}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              Browse Simulations
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map((sim) => {
              const isOpen = openSimIds.includes(sim.id);
              return (
                <div key={sim.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(sim.id)}
                    className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-semibold text-slate-900">{sim.title}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${getStatusBadgeClasses(sim.status)}`}>
                          {getStatusDisplayText(sim.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1 max-w-xs">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-slate-600">
                              {sim.completedTasks}/{sim.totalTasks} tasks
                            </span>
                            <span className="text-sm font-semibold text-indigo-600">
                              {sim.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                sim.progress === 100
                                  ? "bg-emerald-500"
                                  : "bg-indigo-500"
                              }`}
                              style={{ width: `${sim.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ml-4 flex-shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 border-t border-slate-100">
                      <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 mt-4">
                        {sim.tasks.map((task, index) => (
                          <TaskItem
                            key={`${sim.id}-${task.id}`}
                            task={task}
                            number={index + 1}
                            simulationId={sim.id}
                            onClick={() =>
                              (window.location.href = `/internship/${
                                sim.id
                              }/task/${index + 1}`)
                            }
                          />
                        ))}
                      </div>

                      <div className="flex gap-3 mt-5">
                        <button
                          onClick={() => handleNavigateToTask(sim)}
                          className={`flex-1 py-2.5 rounded-lg font-medium text-sm ${getButtonClasses(
                            sim.status
                          )}`}
                        >
                          {getButtonText(sim.status)}
                        </button>
                        {isInternshipFullyApproved(sim) && (
                          <button 
                            onClick={() => handleViewCertificate(sim)}
                            className="flex items-center gap-2 px-5 py-2.5 border-2 border-emerald-500 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition-colors text-sm"
                          >
                            <Award className="w-4 h-4" />
                            View Certificate
                          </button>
                        )}
                        {sim.status === "completed" && !isInternshipFullyApproved(sim) && (
                          <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Awaiting approval</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {certificateData && (
        <Certificate
          isOpen={!!certificateData}
          onClose={() => setCertificateData(null)}
          userName={certificateData.userName}
          internshipTitle={certificateData.internshipTitle}
          companyName={certificateData.companyName}
          completionDate={certificateData.completionDate}
        />
      )}

    </div>
  );
};

export default ProgressPage;
