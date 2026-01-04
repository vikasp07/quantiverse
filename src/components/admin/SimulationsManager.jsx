import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { supabase } from "../utils/supabaseClient";
import { Editor } from "@tinymce/tinymce-react";

// TinyMCE imports for self-hosted GPL mode
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/code";
import "tinymce/plugins/table";
import "tinymce/skins/ui/oxide/skin.min.css";
import "tinymce/skins/content/default/content.min.css";

function numberToWords(n) {
  const words = [
    "Zero",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
  ];
  return words[n] || `${n}`;
}

function SimulationsManager() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [simulations, setSimulations] = useState([]);
  const [selectedSimulation, setSelectedSimulation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [view, setView] = useState(id ? "details" : "grid");
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState({});
  const [deletedTaskIds, setDeletedTaskIds] = useState([]);

  useEffect(() => {
    if (id) {
      setView("details");
      fetchSimulationDetails();
    } else {
      setView("grid");
      fetchSimulations();
    }
  }, [id]);

  // Fetch all simulations for grid view
  const fetchSimulations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("simulations").select(`
          id,
          title,
          description,
          category,
          difficulty,
          duration,
          rating,
          image,
          overview
        `);

      if (error) throw error;
      setSimulations(data || []);
    } catch (err) {
      console.error("Error fetching simulations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single simulation details
  const fetchSimulationDetails = async () => {
    setLoading(true);
    try {
      // Fetch simulation data
      const { data: simulationData, error: simError } = await supabase
        .from("simulations")
        .select("*")
        .eq("id", id)
        .single();

      if (simError) throw simError;
      if (!simulationData) throw new Error("Simulation not found");

      setSelectedSimulation(simulationData);
      setFormState(simulationData);

      // Fetch associated tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("simulation_id", id)
        .order("id", { ascending: true });

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
      }

      setTasks(tasksData || []);
    } catch (err) {
      console.error("Error fetching simulation details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulationClick = (simulationId) => {
    navigate(`/edit-internship/${simulationId}`);
  };

  const handleBackToGrid = () => {
    navigate("/edit-internship");
  };

  const handleDelete = async (simulation) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the simulation "${simulation.title}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      // First delete associated tasks
      const { error: tasksError } = await supabase
        .from("tasks")
        .delete()
        .eq("simulation_id", simulation.id);

      if (tasksError) {
        console.error("Error deleting tasks:", tasksError);
        alert("Warning: Failed to delete some tasks, but continuing...");
      }

      // Then delete the simulation
      const { error: simError } = await supabase
        .from("simulations")
        .delete()
        .eq("id", simulation.id);

      if (simError) throw simError;

      alert("Simulation deleted successfully!");
      // If on grid, just refresh list
      if (!selectedSimulation || selectedSimulation.id !== simulation.id) {
        fetchSimulations();
      } else {
        navigate("/edit-internship");
      }
    } catch (err) {
      console.error("Error deleting simulation:", err);
      alert(`Failed to delete simulation: ${err.message}`);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDeletedTaskIds([]);
    setFormState(selectedSimulation);
    fetchSimulationDetails();
  };

  const handleInputChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      console.log("Starting save operation...");
      console.log("Form state:", formState);
      console.log("Tasks to update/insert:", tasks);
      console.log("Tasks to delete:", deletedTaskIds);

      // 1. Update simulation info
      const { id: simulationId, company, ...simulationUpdateData } = formState;

      const { data: updatedSimulation, error: simError } = await supabase
        .from("simulations")
        .update(simulationUpdateData)
        .eq("id", selectedSimulation.id)
        .select();

      if (simError) {
        console.error("Simulation update error:", simError);
        throw simError;
      }

      if (!updatedSimulation || updatedSimulation.length === 0) {
        console.warn("No simulation rows were updated!");
      }
      setFormState(updatedSimulation?.[0] || {});

      // 2. Delete any tasks marked for deletion
      if (deletedTaskIds.length > 0) {
        const { error: deleteError } = await supabase
          .from("tasks")
          .delete()
          .in("id", deletedTaskIds);

        if (deleteError) {
          console.error("Error deleting tasks:", deleteError);
          throw new Error(`Failed to delete tasks: ${deleteError.message}`);
        }

        console.log("✅ Deleted tasks:", deletedTaskIds);
      }

      // 3. Loop through tasks to update or insert
      for (const task of tasks) {
        const { id: taskId, simulation_id, ...taskData } = task;

        if (taskId) {
          // Update existing task
          const { data: updatedTask, error: taskError } = await supabase
            .from("tasks")
            .update(taskData)
            .eq("id", taskId)
            .select();

          if (taskError) {
            console.error(`Error updating task ${taskId}:`, taskError);
            throw new Error(
              `Failed to update task: ${task.full_title || task.title} - ${
                taskError.message
              }`
            );
          }

          console.log(`Updated task ${taskId}:`, updatedTask);
        } else {
          // Insert new task
          const { data: insertedTask, error: insertError } = await supabase
            .from("tasks")
            .insert({ ...taskData, simulation_id: selectedSimulation.id })
            .select();

          if (insertError) {
            console.error("Error inserting new task:", insertError);
            throw new Error(
              `Failed to add task: ${task.full_title || task.title} - ${
                insertError.message
              }`
            );
          }

          console.log("Inserted new task:", insertedTask);
        }
      }

      // 4. Refresh data and reset states
      await fetchSimulationDetails();
      setIsEditing(false);
      setDeletedTaskIds([]);

      alert("✅ Save operation completed successfully!");
    } catch (err) {
      console.error("Error saving simulation or tasks:", err);
      alert(`❌ Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleAddTask = () => {
    const newTask = {
      simulation_id: selectedSimulation.id,
      title: `Task ${numberToWords(tasks.length + 1)}`,
      full_title: "",
      description: "",
      what_youll_learn: "",
      what_youll_do: "",
      difficulty: "",
      duration: "",
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleDeleteTask = (index) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );
    if (!confirmDelete) return;

    const taskToDelete = tasks[index];

    // Track ID if it's an existing task
    if (taskToDelete?.id) {
      setDeletedTaskIds((prev) => [...prev, taskToDelete.id]);
    }

    // Remove from UI
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);

    const reNumberedTasks = updatedTasks.map((task, i) => ({
      ...task,
      title: `Task ${numberToWords(i + 1)}`,
    }));

    setTasks(reNumberedTasks);
  };

  // PAGE
  if (view === "grid") {
    return (
      <Layout>
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Simulations
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and view all internship simulations (
                  {simulations.length} total)
                </p>
              </div>
              <button
                onClick={() => navigate("/add-internship")}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <span>➕</span>
                Create New Simulation
              </button>
            </div>

            {/* SIMULATION CARDS */}
            {simulations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No simulations found
                </h3>
                <p className="text-gray-500 mb-6">
                  Get started by creating your first simulation
                </p>
                <button
                  onClick={() => navigate("/add-internship")}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Create Simulation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {simulations.map((simulation) => (
                  <div
                    key={simulation.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 relative group"
                    onClick={() => handleSimulationClick(simulation.id)}
                  >
                    {/* Hover Actions Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                      <div className="flex flex-col gap-3 px-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulationClick(simulation.id);
                          }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                        >
                          ✏️ Edit Internship
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/internship/${simulation.id}/candidates`
                            );
                          }}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                          👥 See Candidates
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/internship/${simulation.id}/submissions`
                            );
                          }}
                          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 font-medium transition-colors"
                        >
                          📄 View Submissions
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(simulation);
                          }}
                          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
                        >
                          🗑️ Delete Internship
                        </button>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
                      {simulation.image ? (
                        <img
                          src={simulation.image}
                          alt={simulation.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      ) : (
                        <div className="text-white text-4xl font-bold">
                          {simulation.title?.charAt(0) || "🏢"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                            {simulation.title}
                          </h3>
                        </div>
                      </div>

                      <div
                        className="text-gray-600 text-sm mb-4 line-clamp-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4 [&_li]:text-gray-600 [&_strong]:text-gray-800"
                        dangerouslySetInnerHTML={{
                          __html: simulation.description || simulation.overview,
                        }}
                      />

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {simulation.category && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {simulation.category}
                          </span>
                        )}
                        {simulation.difficulty && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                              simulation.difficulty
                            )
                              .replace("border-", "")
                              .replace(" border", "")}`}
                          >
                            {simulation.difficulty}
                          </span>
                        )}
                        {simulation.duration && (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            ⏱️ {simulation.duration}
                          </span>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs text-gray-500">
                        ID: {simulation.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // INSIDE THE CARD
  if (view === "details" && selectedSimulation) {
    return (
      <Layout>
        <div className="overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex justify-between items-start mb-6">
                <button
                  onClick={handleBackToGrid}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                >
                  ← Back to Simulations
                </button>
                <div className="flex gap-3">
                  {!isEditing ? (
                    <button
                      onClick={handleEditClick}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      disabled={loading}
                    >
                      ✏️ Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        disabled={loading}
                      >
                        {loading ? "⏳ Saving..." : "✅ Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                        disabled={loading}
                      >
                        ❌ Cancel
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                    disabled={loading}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>

              {/* Hero Section */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/3">
                  {selectedSimulation.image ? (
                    <img
                      src={selectedSimulation.image}
                      alt={selectedSimulation.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
                      {selectedSimulation.title?.charAt(0) || "🏢"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formState.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className="text-2xl font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full mb-2"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedSimulation.title}
                    </h1>
                  )}

                  <div className="flex flex-wrap gap-3 mb-4">
                    {isEditing ? (
                      <input
                        type="text"
                        value={formState.category || ""}
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        className="px-3 py-1 border border-blue-200 rounded-full text-sm"
                        placeholder="Category"
                      />
                    ) : (
                      selectedSimulation.category && (
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
                          📂 {selectedSimulation.category}
                        </span>
                      )
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        value={formState.difficulty || ""}
                        onChange={(e) =>
                          handleInputChange("difficulty", e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                        placeholder="Difficulty"
                      />
                    ) : (
                      selectedSimulation.difficulty && (
                        <span
                          className={`px-3 py-1 rounded-full border ${getDifficultyColor(
                            selectedSimulation.difficulty
                          )}`}
                        >
                          🎯 {selectedSimulation.difficulty}
                        </span>
                      )
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        value={formState.duration || ""}
                        onChange={(e) =>
                          handleInputChange("duration", e.target.value)
                        }
                        className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                        placeholder="Duration"
                      />
                    ) : (
                      selectedSimulation.duration && (
                        <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full border border-gray-200">
                          ⏱️ {selectedSimulation.duration}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Sections */}
            <div className="space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  📝 Description
                </h2>
                {isEditing ? (
                  <Editor
                    value={formState.description || ""}
                    onEditorChange={(content) =>
                      handleInputChange("description", content)
                    }
                    init={{
                      license_key: "gpl",
                      base_url: "/tinymce",
                      height: 250,
                      menubar: false,
                      plugins: "lists link code table",
                      toolbar:
                        "undo redo | bold italic underline | bullist numlist | link | code | table",
                      forced_root_block: "p",
                      invalid_elements: "script,style,iframe,object,embed",
                      content_style: `
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                        ul { list-style-type: disc; margin: 0.5em 0; padding-left: 2em; }
                        ol { list-style-type: decimal; margin: 0.5em 0; padding-left: 2em; }
                        li { margin: 0.25em 0; }
                        strong { font-weight: bold; }
                        em { font-style: italic; }
                        u { text-decoration: underline; }
                      `,
                    }}
                  />
                ) : (
                  <div
                    className="text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:text-gray-700 [&_strong]:text-gray-900 [&_em]:text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: selectedSimulation.description,
                    }}
                  />
                )}
              </div>

              {/* Overview */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  🔍 Overview
                </h2>
                {isEditing ? (
                  <Editor
                    value={formState.overview || ""}
                    onEditorChange={(content) =>
                      handleInputChange("overview", content)
                    }
                    init={{
                      license_key: "gpl",
                      base_url: "/tinymce",
                      height: 250,
                      menubar: false,
                      plugins: "lists link code table",
                      toolbar:
                        "undo redo | bold italic underline | bullist numlist | link | code | table",
                      forced_root_block: "p",
                      invalid_elements: "script,style,iframe,object,embed",
                      content_style: `
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
                        ul { list-style-type: disc; margin: 0.5em 0; padding-left: 2em; }
                        ol { list-style-type: decimal; margin: 0.5em 0; padding-left: 2em; }
                        li { margin: 0.25em 0; }
                        strong { font-weight: bold; }
                        em { font-style: italic; }
                        u { text-decoration: underline; }
                      `,
                    }}
                  />
                ) : (
                  <div
                    className="text-gray-700 leading-relaxed [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:text-gray-700 [&_strong]:text-gray-900 [&_em]:text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: selectedSimulation.overview,
                    }}
                  />
                )}
              </div>

              {/* Features */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  ⭐ Features
                </h2>
                {isEditing ? (
                  <textarea
                    value={formState.features || ""}
                    onChange={(e) =>
                      handleInputChange("features", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedSimulation.features}
                  </p>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  🎓 Skills You'll Learn
                </h2>
                {isEditing ? (
                  <textarea
                    value={formState.skills || ""}
                    onChange={(e) =>
                      handleInputChange("skills", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {selectedSimulation.skills}
                  </p>
                )}
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    📋 Tasks ({tasks.length})
                  </h2>
                  {isEditing && (
                    <button
                      onClick={handleAddTask}
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add Task
                    </button>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No tasks found for this simulation
                  </p>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-gray-700 font-semibold">
                                Task #{index + 1}
                              </h3>
                              <button
                                onClick={() => handleDeleteTask(index)}
                                className="text-red-600 text-sm hover:underline"
                              >
                                🗑️ Delete Task
                              </button>
                            </div>
                            <input
                              type="text"
                              value={task.title || ""}
                              disabled
                              className="w-full border rounded p-2 text-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                              placeholder="Title"
                            />
                            <input
                              type="text"
                              value={task.full_title || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "full_title",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded p-2 text-sm"
                              placeholder="Full Title"
                            />
                            <textarea
                              value={task.description || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full col-span-2 border rounded p-2 text-sm min-h-[80px]"
                              placeholder="Description"
                            />
                            <textarea
                              value={task.what_youll_learn || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "what_youll_learn",
                                  e.target.value
                                )
                              }
                              className="w-full col-span-2 border rounded p-2 text-sm min-h-[80px]"
                              placeholder="What you'll learn"
                            />
                            <textarea
                              value={task.what_youll_do || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "what_youll_do",
                                  e.target.value
                                )
                              }
                              className="w-full col-span-2 border rounded p-2 text-sm min-h-[80px]"
                              placeholder="What you'll do"
                            />
                            <select
                              value={task.difficulty || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "difficulty",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded p-2 text-sm"
                            >
                              <option value="">Select Difficulty</option>
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                            </select>
                            <select
                              value={task.duration || ""}
                              onChange={(e) =>
                                handleTaskChange(
                                  index,
                                  "duration",
                                  e.target.value
                                )
                              }
                              className="w-full border rounded p-2 text-sm"
                            >
                              <option value="">Select Duration</option>
                              <option value="15 mins">15 mins</option>
                              <option value="30 mins">30 mins</option>
                              <option value="45 mins">45 mins</option>
                              <option value="1 hour">1 hour</option>
                              <option value="1.5 hours">1.5 hours</option>
                              <option value="2 hours">2 hours</option>
                            </select>
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-semibold text-gray-900">
                                {task.title} - {task.full_title}
                              </h3>
                              <div className="flex gap-2 text-xs">
                                {task.difficulty && (
                                  <span
                                    className={`px-2 py-1 rounded ${getDifficultyColor(
                                      task.difficulty
                                    )}`}
                                  >
                                    {task.difficulty}
                                  </span>
                                )}
                                {task.duration && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    {task.duration}
                                  </span>
                                )}
                              </div>
                            </div>
                            {task.description && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-700 mb-1">
                                  Description:
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {task.description}
                                </p>
                              </div>
                            )}
                            {task.what_youll_learn && (
                              <div className="mb-3">
                                <h4 className="font-medium text-gray-700 mb-1">
                                  What you'll learn:
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {task.what_youll_learn}
                                </p>
                              </div>
                            )}
                            {task.what_youll_do && (
                              <div>
                                <h4 className="font-medium text-gray-700 mb-1">
                                  What you'll do:
                                </h4>
                                <p className="text-gray-600 text-sm">
                                  {task.what_youll_do}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Simulation ID: {selectedSimulation.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return null;
}

export default SimulationsManager;
