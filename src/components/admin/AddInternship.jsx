import React, { useState } from "react";
import Layout from "../Layout";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import CategoryAutocomplete from '../CategoryAutocomplete';

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

function capitalizeWords(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

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

function AddInternship() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // TinyMCE editor configuration for GPL self-hosted mode
  const editorConfig = {
    license_key: "gpl",
    base_url: "/tinymce",
    height: 250,
    menubar: false,
    plugins: 'lists link table',  // Removed 'code' plugin for security
    toolbar: 'undo redo | bold italic underline | bullist numlist | link | table',
    forced_root_block: 'p',
    
    // Security: Block dangerous elements
    invalid_elements: 'script,style,iframe,object,embed,form,input,button',
    
    // Security: Block dangerous attributes
    invalid_styles: 'position,top,left,right,bottom',
    
    // Security: URL validation
    allow_script_urls: false,
    convert_urls: false,
    
    // Security: Paste filtering
    paste_as_text: false,
    paste_block_drop: false,
    paste_data_images: false,  // Block base64 images
    paste_preprocess: function(plugin, args) {
      // Strip dangerous content from pasted HTML
      args.content = args.content
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '');
    },
    
    // Security: Link validation
    link_assume_external_targets: true,
    link_target_list: [
      {title: 'None', value: ''},
      {title: 'New window', value: '_blank'}
    ],
    
    // Security: URL converter to block dangerous protocols
    urlconverter_callback: function(url, node, on_save, name) {
      if (url.startsWith('javascript:') || url.startsWith('data:') || url.startsWith('vbscript:')) {
        return '';  // Block dangerous protocols
      }
      return url;
    },
    
    // Security: Content filtering on load
    setup: function(editor) {
      editor.on('BeforeSetContent', function(e) {
        // Additional sanitization before content is set
        e.content = e.content
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
      });
    },
    
    content_style: `
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
      ul { list-style-type: disc; margin: 0.5em 0; padding-left: 2em; }
      ol { list-style-type: decimal; margin: 0.5em 0; padding-left: 2em; }
      li { margin: 0.25em 0; }
      strong { font-weight: bold; }
      em { font-style: italic; }
      u { text-decoration: underline; }
    `,
  };

  const [simulation, setSimulation] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    duration: "",
    rating: null, // will always be null
    image: "",
    overview: "",
    features: "",
    skills: "",
  });

  const [tasks, setTasks] = useState([
    {
      title: "",
      full_title: "",
      duration: "",
      difficulty: "",
      description: "",
      what_youll_learn: "",
      what_youll_do: "",
      materialFile: null,
      material_url: "",
    },
  ]);

  const durationOptions = ["1-2 hours", "3-4 hours", "1-2 weeks", "1-2 months"];
  const taskDurationOptions = ["15-30 mins", "30-60 mins", "1-2 hours"];
  const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

  const handleSimulationChange = (e) => {
    const { name, value } = e.target;
    setSimulation((prev) => ({ ...prev, [name]: value }));
  };

  const stripHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  };

  const handleSimulationEditorChange = (name, value) => {
    setSimulation((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...tasks];
    updated[index][name] = value;
    setTasks(updated);
  };

  const handleTaskEditorChange = (index, name, value) => {
    const updated = [...tasks];
    updated[index][name] = value;
    setTasks(updated);
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        title: "",
        full_title: "",
        duration: "",
        difficulty: "",
        description: "",
        what_youll_learn: "",
        what_youll_do: "",
      },
    ]);
  };

  const removeTask = (index) => {
    if (tasks.length === 1) {
      alert("At least one task is required.");
      return;
    }

    const updatedTasks = tasks.filter((_, idx) => idx !== index);
    setTasks(updatedTasks);
  };

  const isFormValid = () => {
    // Check simulation fields (excluding rating)
    for (const [key, value] of Object.entries(simulation)) {
      if (key !== "rating" && value.trim() === "") {
        alert(
          `Please fill in the '${key.replace(/_/g, " ")}' field in Simulation`
        );
        return false;
      }
    }

    // Check tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      for (const [key, value] of Object.entries(task)) {
        if (
          key !== "title" &&
          key !== "material_url" &&
          key !== "materialFile" &&
          (typeof value !== "string" || value.trim() === "")
        ) {
          alert(
            `Please fill in the '${key.replace(/_/g, " ")}' field in Task ${
              i + 1
            }`
          );
          return false;
        }
      }
    }

    // Validate rich text lengths (max 500 chars) for key description fields
    const richFields = ["description", "overview", "features", "skills"];
    for (const field of richFields) {
      const raw = stripHtml(simulation[field] || "");
      if (raw.length > 500) {
        alert(`${field.replace(/_/g, " ")} must not exceed 500 characters.`);
        return false;
      }
    }

    // Tasks rich fields
    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      const taskRich = ["description", "what_youll_learn", "what_youll_do"];
      for (const f of taskRich) {
        const raw = stripHtml(t[f] || "");
        if (raw.length > 500) {
          alert(
            `Task ${i + 1} '${f.replace(
              /_/g,
              " "
            )}' must not exceed 500 characters.`
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!isFormValid()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // ===== SEND HTML DIRECTLY TO BACKEND FOR SANITIZATION & VALIDATION =====
      // Frontend sends:
      // - HTML from TipTap editor (not plain text)
      // - Backend handles: sanitization, plain-text extraction, validation, storage
      const cleanedSimulation = {
        title: capitalizeWords(simulation.title),
        description: simulation.description, // Send HTML, not plain text
        category: capitalizeWords(simulation.category),
        difficulty: simulation.difficulty,
        duration: simulation.duration,
        image: simulation.image,
        overview: simulation.overview, // Send HTML, not plain text
        features: simulation.features, // Send HTML, not plain text
        skills: simulation.skills, // Send HTML, not plain text
        rating: null,
      };

      const formattedTasks = [];

      for (let idx = 0; idx < tasks.length; idx++) {
        const task = tasks[idx];
        let materialUrl = "";

        if (task.materialFile) {
          const fileExt = task.materialFile.name.split(".").pop();
          const fileName = `task-${idx + 1}-${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from("task-materials")
            .upload(fileName, task.materialFile);

          if (uploadError) {
            console.error(`❌ Upload error for Task ${idx + 1}:`, uploadError);
            alert(`Upload failed for Task ${idx + 1}`);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from("task-materials")
            .getPublicUrl(fileName);

          materialUrl = publicUrlData?.publicUrl || "";
        }

        // Send HTML directly to backend, not plain text
        formattedTasks.push({
          title: `Task ${numberToWords(idx + 1)}`,
          full_title: capitalizeWords(task.full_title),
          duration: task.duration,
          difficulty: task.difficulty,
          description: task.description, // Send HTML, not plain text
          what_youll_learn: task.what_youll_learn, // Send HTML, not plain text
          what_youll_do: task.what_youll_do, // Send HTML, not plain text
          material_url: materialUrl,
        });
      }

      // ===== SEND TO BACKEND ENDPOINT FOR SANITIZATION & VALIDATION =====
      // Backend endpoint: POST /admin/internships
      // This endpoint handles:
      // 1. HTML sanitization (removes scripts, events, unsafe tags)
      // 2. Plain text extraction
      // 3. Character validation (max 500 chars on plain text)
      // 4. Storage in Supabase (HTML in column, plain text in *_plain column)
      // 5. DB CHECK constraints enforce final validation

      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/admin/internships`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: capitalizeWords(simulation.title),
          category: capitalizeWords(simulation.category),
          difficulty: simulation.difficulty,
          duration: simulation.duration,
          image: simulation.image,
          description: simulation.description, // Send raw HTML from TipTap
          overview: simulation.overview,
          features: simulation.features,
          skills: simulation.skills,
          tasks: formattedTasks,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Backend error:", result);
        alert(`❌ ${result.error}`);
        setIsSubmitting(false);
        return;
      }

      alert("✅ Simulation and tasks saved successfully!");

      setSimulation({
        company: "",
        title: "",
        description: "",
        category: "",
        difficulty: "",
        duration: "",
        rating: null,
        image: "",
        overview: "",
        about_company: "",
        features: "",
        skills: "",
      });

      setTasks([
        {
          title: "",
          full_title: "",
          duration: "",
          difficulty: "",
          description: "",
          what_youll_learn: "",
          what_youll_do: "",
          materialFile: null,
          material_url: "",
        },
      ]);
      setFileResetKey(Date.now());
      setIsSubmitting(false);
      navigate("/edit-internship");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
      const errorMsg = error.message || "Unknown error";
      alert(`❌ An unexpected error occurred:\n${errorMsg}`);
      setIsSubmitting(false);
    }
  };
  const [fileResetKey, setFileResetKey] = useState(Date.now());

  //     image: simulation.image,
  //     overview: capitalizeWords(simulation.overview),
  //     about_company: capitalizeWords(simulation.about_company),
  //     features: capitalizeWords(simulation.features),
  //     skills: capitalizeWords(simulation.skills),
  //     rating: null,
  //     };

  //     console.log('✅ Inserting simulation:', cleanedSimulation);

  //     // Insert simulation
  //     const { data: simData, error: simError } = await supabase
  //     .from('simulations')
  //     .insert([cleanedSimulation])
  //     .select()
  //     .single();

  //     if (simError) {
  //     console.error('❌ Simulation insert error:', simError);
  //     alert('❌ Failed to insert simulation.');
  //     return;
  //     }

  //     const simulation_id = simData.id;

  //     // Prepare tasks data
  //     const formattedTasks = tasks.map((task, idx) => ({
  //     simulation_id,
  //     title: `Task ${numberToWords(idx + 1)}`,
  //     full_title: capitalizeWords(task.full_title),
  //     duration: task.duration,
  //     difficulty: task.difficulty,
  //     description: capitalizeWords(task.description),
  //     what_youll_learn: capitalizeWords(task.what_youll_learn),
  //     what_youll_do: capitalizeWords(task.what_youll_do),
  //     }));

  //     console.log('✅ Inserting tasks:', formattedTasks);

  //     // Insert all tasks
  //     const { data: taskData, error: taskError } = await supabase
  //     .from('tasks')
  //     .insert(formattedTasks)
  //     .select();

  //     if (taskError) {
  //     console.error('❌ Task insert error:', taskError);
  //     alert('⚠️ Simulation saved, but task insert failed.');
  //     return;
  //     }

  //     console.log('✅ Tasks inserted:', taskData);
  //     alert('✅ Simulation and tasks saved successfully!');

  //     // Reset form
  //     setSimulation({
  //     company: '',
  //     title: '',
  //     description: '',
  //     category: '',
  //     difficulty: '',
  //     duration: '',
  //     rating: null,
  //     image: '',
  //     overview: '',
  //     about_company: '',
  //     features: '',
  //     skills: '',
  //     });

  //     setTasks([{
  //     title: '',
  //     full_title: '',
  //     duration: '',
  //     difficulty: '',
  //     description: '',
  //     what_youll_learn: '',
  //     what_youll_do: '',
  //     }]);

  // } catch (error) {
  //     console.error('❌ Unexpected error:', error);
  //     alert('❌ An unexpected error occurred.');
  // }
  // };

  return (
    <Layout>
      <div className="overflow-y-auto p-10">
        <button
          className="button button-l !bg-black absolute top-4 right-4"
          onClick={() => navigate("/edit-internship")}
        >
          Edit Simulation
        </button>

        <form onSubmit={handleSubmit}>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Add New Simulation
          </h2>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3 mt-2">
              Simulation Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(simulation).map(([key, value]) => {
                if (key === "rating") return null;

                if (key === "difficulty" || key === "duration") {
                  const isDifficulty = key === "difficulty";
                  const options = isDifficulty
                    ? difficultyOptions
                    : durationOptions;

                  return (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2">
                        {isDifficulty ? "Difficulty" : "Duration"}
                      </label>
                      <select
                        name={key}
                        value={value}
                        onChange={handleSimulationChange}
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="">
                          Select {isDifficulty ? "difficulty" : "duration"}
                        </option>
                        {options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                // Use CategoryAutocomplete for category field
                if (key === 'category') {
                  return (
                    <div key={key}>
                      <label className="block text-sm font-semibold mb-2 capitalize">
                        Category
                      </label>
                      <CategoryAutocomplete
                        name="category"
                        value={value}
                        onChange={handleSimulationChange}
                        placeholder="Enter category"
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      />
                    </div>
                  );
                }

                // use TinyMCE editor ONLY for description and overview
                if (key === "description" || key === "overview") {
                  const plain = stripHtml(value || "");
                  return (
                    <div key={key} className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 capitalize">
                        {key.replace(/_/g, " ")}
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                        <Editor
                          value={value}
                          onEditorChange={(content) =>
                            handleSimulationEditorChange(key, content)
                          }
                          init={editorConfig}
                        />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {plain.length} / 500 chars
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Maximum 500 characters (plain text).
                      </div>
                    </div>
                  );
                }

                // use textarea for features and skills
                if (key === "features" || key === "skills") {
                  return (
                    <div key={key} className="md:col-span-2">
                      <label className="block text-sm font-semibold mb-2 capitalize">
                        {key.replace(/_/g, " ")}
                      </label>
                      <textarea
                        name={key}
                        value={value}
                        onChange={handleSimulationChange}
                        rows="4"
                        className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                      />
                      <div className="text-sm text-gray-600 mt-1">
                        {value.length} / 500 chars
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key}>
                    <label className="block text-sm font-semibold mb-2 capitalize">
                      {key.replace(/_/g, " ")}
                    </label>
                    <input
                      name={key}
                      value={value}
                      onChange={handleSimulationChange}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder={`Enter ${key.replace(/_/g, " ")}`}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y mt-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-700 mb-3 mt-2">
                Tasks
              </h2>
              <button
                type="button"
                onClick={addTask}
                className="button button-l"
              >
                + Add Task
              </button>
            </div>

            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="p-6 border border-gray-200 rounded-xl bg-gray-50 space-y-6 shadow-sm mb-5"
              >
                <h4 className="text-lg font-semibold text-gray-700">
                  Task {numberToWords(idx + 1)}
                </h4>
                <div className="relative">
                  <div className="flex items-center justify-between">
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(idx)}
                        className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* {Object.entries(task).map(([key, value]) => {
            if (key === 'title') return null;

            if (key === 'difficulty' || key === 'duration') {
              const isDifficulty = key === 'difficulty';
              const options = isDifficulty ? difficultyOptions : taskDurationOptions;

              return (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-2">
                    {isDifficulty ? 'Difficulty' : 'Duration'}
                  </label>
                  <select
                    name={key}
                    value={value}
                    onChange={(e) => handleTaskChange(idx, e)}
                    className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  >
                    <option value="">Select {isDifficulty ? 'difficulty' : 'duration'}</option>
                    {options.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <div key={key}>
                <label className="block text-sm font-semibold mb-2 capitalize">
                  {key.replace(/_/g, ' ')}
                </label>
                <input
                  name={key}
                  value={value}
                  onChange={(e) => handleTaskChange(idx, e)}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                />
              </div>
            );
          })} */}

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Full Title
                    </label>
                    <input
                      name="full_title"
                      value={task.full_title}
                      onChange={(e) => handleTaskChange(idx, e)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                      placeholder="Enter full title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={task.duration}
                      onChange={(e) => handleTaskChange(idx, e)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                    >
                      <option value="">Select duration</option>
                      {taskDurationOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Difficulty
                    </label>
                    <select
                      name="difficulty"
                      value={task.difficulty}
                      onChange={(e) => handleTaskChange(idx, e)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                    >
                      <option value="">Select difficulty</option>
                      {difficultyOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Description
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                      <Editor
                        value={task.description}
                        onEditorChange={(content) =>
                          handleTaskEditorChange(idx, "description", content)
                        }
                        init={editorConfig}
                      />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {stripHtml(task.description || "").length} / 500 chars
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Maximum 500 characters (plain text).
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      What You'll Learn
                    </label>
                    <textarea
                      value={task.what_youll_learn}
                      onChange={(e) =>
                        handleTaskEditorChange(
                          idx,
                          "what_youll_learn",
                          e.target.value
                        )
                      }
                      rows="4"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter what you'll learn"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      {task.what_youll_learn.length} / 500 chars
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      What You'll Do
                    </label>
                    <textarea
                      value={task.what_youll_do}
                      onChange={(e) =>
                        handleTaskEditorChange(
                          idx,
                          "what_youll_do",
                          e.target.value
                        )
                      }
                      rows="4"
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="Enter what you'll do"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                      {task.what_youll_do.length} / 500 chars
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">
                      Upload Material
                    </label>
                    {/* <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                onChange={(e) => {
                  const updated = [...tasks];
                  updated[idx].materialFile = e.target.files[0];
                  setTasks(updated);
                }}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg"
              /> */}
                    <input
                      key={fileResetKey} // ✅ this resets the input on re-render
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                      onChange={(e) => {
                        const updated = [...tasks];
                        updated[idx].materialFile = e.target.files[0];
                        setTasks(updated);
                      }}
                      className="w-full border border-gray-300 px-4 py-2 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </section>

          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`button button-l !bg-green-500 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Simulation"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddInternship;
