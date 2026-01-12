import React, { useEffect, useState } from 'react';
import { 
  Download, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  MessageSquare,
  Clock,
  AlertCircle,
  Loader2,
  X,
  ChevronRight,
  Award,
  BookOpen
} from 'lucide-react';
import Layout from '../Layout';
import { supabase } from '../utils/supabaseClient';

function Confirmation() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [signedUrls, setSignedUrls] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_task_progress')
      .select(`
        *,
        simulations (
          title
        ),
        tasks (
          title,
          description
        )
      `)
      .eq('confirmation_status', 'pending')
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching user_task_progress:', error);
    } else {
      setProgressData(data);
      generateSignedUrls(data);
    }
    setLoading(false);
  };

  const generateSignedUrls = async (data) => {
    const urlMap = {};

    for (const item of data) {
      if (item.uploaded_work_url) {
        const path = item.uploaded_work_url.split('/submissions/')[1];
        if (!path) continue;

        const { data: signed, error } = await supabase.storage
          .from('submissions')
          .createSignedUrl(path, 3600);

        if (!error && signed?.signedUrl) {
          urlMap[item.id] = signed.signedUrl;
        }
      }
    }

    setSignedUrls(urlMap);
  };

const handleDecision = async (id, decision) => {
  const comment = comments[id];

  if (!comment || comment.trim() === '') {
    alert('Please enter a comment.');
    return;
  }

  setProcessingIds(prev => new Set(prev).add(id));

  const updateFields = {
    confirmation_status: decision,
    comment: comment
  };

  if (decision === 'rejected') {
    updateFields.status = 'rejected';
  }

  const { error } = await supabase
    .from('user_task_progress')
    .update(updateFields)
    .eq('id', id);

  setProcessingIds(prev => {
    const newSet = new Set(prev);
    newSet.delete(id);
    return newSet;
  });

  if (error) {
    console.error('Update failed:', error);
    alert('Failed to update status');
  } else {
    alert(`Task ${decision === 'accepted' ? 'accepted' : 'rejected'} successfully`);
    setComments((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
    setModalOpen(false);
    setSelectedTask(null);
    fetchProgressData();
  }
};


  const downloadFileFromBucket = async (item) => {
    if (!item.uploaded_work_url) return;

    const path = item.uploaded_work_url.split('/submissions/')[1];
    if (!path) {
      alert("Invalid file path");
      return;
    }

    const { data, error } = await supabase.storage
      .from('submissions')
      .download(path);

    if (error) {
      console.error('Download error:', error);
      alert("Download failed");
      return;
    }

    const blobUrl = window.URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = path.split('/').pop();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
  };

  // Grouping data by user_id + simulation_id
  const groupedData = progressData.reduce((acc, item) => {
    const key = `${item.user_id}__${item.simulation_id}`;
    if (!acc[key]) {
      acc[key] = {
        user_id: item.user_id,
        simulation_id: item.simulation_id,
        simulation_name: item.simulations?.title || `Program ${item.simulation_id}`,
        tasks: []
      };
    }
    acc[key].tasks.push(item);
    return acc;
  }, {});

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  return (
    <Layout>
      <div className="p-8 bg-gradient-to-br from-slate-50 to-emerald-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Task Confirmation</h1>
            </div>
            <p className="text-gray-600">Review and approve submitted tasks from users</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-lg">Loading submissions...</span>
              </div>
            </div>
          ) : Object.keys(groupedData).length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Submissions</h3>
              <p className="text-gray-600">All tasks have been reviewed and processed.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.values(groupedData).map((group) => (
                <div key={`${group.user_id}-${group.simulation_id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Group Header */}
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-emerald-600" />
                        <span className="font-semibold text-gray-700">User:</span>
                        <span className="font-mono text-emerald-700 bg-emerald-100 px-3 py-1 rounded text-sm font-medium">
                          {group.user_id.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-teal-600" />
                        <span className="font-semibold text-gray-700">Program:</span>
                        <span className="text-teal-700 font-medium bg-teal-50 px-3 py-1 rounded">
                          {group.simulation_name}
                        </span>
                      </div>
                      <div className="ml-auto">
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {group.tasks.length} {group.tasks.length === 1 ? 'Task' : 'Tasks'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List View */}
                  <div className="p-6">
                    <div className="space-y-3">
                      {group.tasks.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openTaskModal(item)}
                          className="flex items-center justify-between p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md group"
                        >
                          {/* Task Info */}
                          <div className="flex-1 flex items-center gap-4">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-all">
                                <BookOpen className="h-6 w-6 text-emerald-600" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                                {item.tasks?.title || `Task ${item.task_id}`}
                              </h4>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                                  <Clock className="h-3 w-3" />
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Action Indicator */}
                          <div className="flex items-center gap-3 ml-4">
                            {item.uploaded_work_url && (
                              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded">
                                <Download className="h-3 w-3" />
                                File
                              </div>
                            )}
                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Details Modal */}
      {modalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedTask.tasks?.title || `Task ${selectedTask.task_id}`}
                </h2>
                <p className="text-sm text-gray-600">Review and approve this submission</p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedTask(null);
                }}
                className="ml-4 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Task Description Section */}
              {selectedTask.tasks?.description && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-5 border border-emerald-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Task Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                    {selectedTask.tasks.description}
                  </p>
                </div>
              )}

              {/* User Submission Section */}
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  User Submission
                </h3>
                
                {selectedTask.uploaded_work_url ? (
                  <div className="space-y-3">
                    <div className="bg-white border border-gray-300 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-3">
                        <strong>Uploaded File:</strong>
                      </p>
                      <button
                        onClick={() => downloadFileFromBucket(selectedTask)}
                        className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors font-medium"
                      >
                        <Download className="h-4 w-4" />
                        Download Submission
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Submitted at: {new Date(selectedTask.updated_at).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <span className="text-yellow-800">No file has been uploaded by the user</span>
                  </div>
                )}
              </div>

              {/* Admin Review Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  Admin Review & Comment
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="Enter your review comment... (This will be visible to the user)"
                    rows={4}
                    value={comments[selectedTask.id] || ''}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [selectedTask.id]: e.target.value
                      }))
                    }
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDecision(selectedTask.id, 'accepted')}
                  disabled={processingIds.has(selectedTask.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-base"
                >
                  {processingIds.has(selectedTask.id) ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="h-5 w-5" />
                  )}
                  {processingIds.has(selectedTask.id) ? 'Processing...' : 'Accept Task'}
                </button>
                <button
                  onClick={() => handleDecision(selectedTask.id, 'rejected')}
                  disabled={processingIds.has(selectedTask.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white px-4 py-3 rounded-lg font-semibold transition-colors text-base"
                >
                  {processingIds.has(selectedTask.id) ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  {processingIds.has(selectedTask.id) ? 'Processing...' : 'Reject Task'}
                </button>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="px-6 py-3 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Confirmation;

//     const path = item.uploaded_work_url.split('/submissions/')[1];
//     if (!path) {
//       alert("Invalid file path");
//       return;
//     }

//     const { data, error } = await supabase.storage
//       .from('submissions')
//       .download(path);

//     if (error) {
//       console.error('Download error:', error);
//       alert("Download failed");
//       return;
//     }

//     const blobUrl = window.URL.createObjectURL(data);
//     const a = document.createElement('a');
//     a.href = blobUrl;
//     a.download = path.split('/').pop();
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(blobUrl);
//   };

//   // Grouping data by user_id + simulation_id
//   const groupedData = progressData.reduce((acc, item) => {
//     const key = `${item.user_id}__${item.simulation_id}`;
//     if (!acc[key]) {
//       acc[key] = {
//         user_id: item.user_id,
//         simulation_id: item.simulation_id,
//         simulation_name: item.simulations?.title || `Program ${item.simulation_id}`,
//         tasks: []
//       };
//     }
//     acc[key].tasks.push(item);
//     return acc;
//   }, {});

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <Sidebar />
//       <div className="flex-1 ml-64 p-6 overflow-y-auto">
//         <h1 className="text-2xl font-semibold mb-4">Confirmation Page</h1>

//         {loading ? (
//           <p>Loading...</p>
//         ) : Object.keys(groupedData).length === 0 ? (
//           <p>No pending submissions.</p>
//         ) : (
//           Object.values(groupedData).map((group) => (
//             <div key={`${group.user_id}-${group.simulation_id}`} className="mb-8">
//               <h2 className="text-lg font-medium mb-2">
//                 User: <span className="font-mono">{group.user_id}</span> — Program: <span className="font-semibold">{group.simulation_name}</span>
//               </h2>
//               <div className="flex flex-wrap gap-4 pl-2">
//                 {group.tasks.map((item) => (
//                   <div
//                     key={item.id}
//                     className="w-[300px] bg-white p-4 rounded shadow border flex flex-col"
//                   >
//                     <p className="text-sm font-semibold">Task: {item.tasks?.name || `Task ${item.task_id}`}</p>
//                     <p className="text-xs text-gray-600 mb-1">Status: {item.status}</p>

//                     {signedUrls[item.id] ? (
//                       <button
//                         onClick={() => downloadFileFromBucket(item)}
//                         className="text-blue-600 text-sm underline mt-1"
//                       >
//                         Download Submitted Work
//                       </button>
//                     ) : (
//                       <p className="text-gray-500 text-sm">No uploaded file.</p>
//                     )}

//                     <textarea
//                       className="mt-2 w-full border rounded p-2 text-sm"
//                       placeholder="Enter your comment..."
//                       value={comments[item.id] || ''}
//                       onChange={(e) =>
//                         setComments((prev) => ({
//                           ...prev,
//                           [item.id]: e.target.value
//                         }))
//                       }
//                     />

//                     <div className="flex gap-2 mt-2">
//                       <button
//                         onClick={() => handleDecision(item.id, 'accepted')}
//                         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Accept
//                       </button>
//                       <button
//                         onClick={() => handleDecision(item.id, 'rejected')}
//                         className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
//                       >
//                         Reject
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

// export default Confirmation;

// ----------------------------------------------------------------------------------------------------------
// import React, { useEffect, useState } from 'react';
// import Sidebar from '../Sidebar';
// import { supabase } from '../utils/supabaseClient';

// function Confirmation() {
//   const [progressData, setProgressData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [comments, setComments] = useState({});
//   const [signedUrls, setSignedUrls] = useState({});

//   useEffect(() => {
//     fetchProgressData();
//   }, []);

//   const fetchProgressData = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('user_task_progress')
//       .select('*')
//       .eq('confirmation_status', 'pending')
//       .eq('status', 'completed');

//     if (error) {
//       console.error('Error fetching user_task_progress:', error);
//     } else {
//       setProgressData(data);
//       generateSignedUrls(data);
//     }
//     setLoading(false);
//   };

//   const generateSignedUrls = async (data) => {
//     const urlMap = {};

//     for (const item of data) {
//       if (item.uploaded_work_url) {
//         // Extract the path inside the bucket
//         const urlParts = item.uploaded_work_url.split('/submissions/')[1];
//         if (!urlParts) continue;

//         const { data: signed, error } = await supabase.storage
//           .from('submissions')
//           .createSignedUrl(urlParts, 60 * 60); // valid for 1 hour

//         if (!error && signed?.signedUrl) {
//           urlMap[item.id] = signed.signedUrl;
//         }
//       }
//     }

//     setSignedUrls(urlMap);
//   };

//     const handleDecision = async (id, decision) => {
//     const comment = comments[id];

//     if (!comment || comment.trim() === '') {
//         alert("Please enter a comment.");
//         return;
//     }

//     const { error } = await supabase
//         .from('user_task_progress')
//         .update({ confirmation_status: decision, comment })
//         .eq('id', id);

//     if (error) {
//         console.error('Error updating confirmation_status:', error);
//         alert('Failed to update status');
//     } else {
//         alert(`Task ${decision === 'accepted' ? 'accepted' : 'rejected'} successfully`);
        
//         // Remove the comment from state
//         setComments((prev) => {
//         const newState = { ...prev };
//         delete newState[id];
//         return newState;
//         });

//         // Refresh list to hide confirmed tasks
//         fetchProgressData();
//     }
//     };

//     const downloadFileFromBucket = async (item) => {
//     if (!item.uploaded_work_url) return;

//     // Extract the path after /submissions/
//     const filePath = item.uploaded_work_url.split('/submissions/')[1];
//     if (!filePath) {
//         alert("Invalid file path");
//         return;
//     }

//     const { data, error } = await supabase.storage
//         .from('submissions')
//         .download(filePath);

//     if (error) {
//         console.error('Download error:', error);
//         alert("Failed to download file.");
//         return;
//     }

//     const blobUrl = window.URL.createObjectURL(data);
//     const a = document.createElement('a');
//     a.href = blobUrl;
//     a.download = filePath.split('/').pop(); // extract filename
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(blobUrl);
//     };


//     return (
//         <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <div className="flex-1 ml-64 p-6 overflow-y-auto">
//             <h1 className="text-2xl font-semibold mb-4">Confirmation Page</h1>

//             {loading ? (
//             <p>Loading...</p>
//             ) : progressData.length === 0 ? (
//             <p>No pending submissions.</p>
//             ) : (
//             <div className="space-y-6">
//                 {progressData.map((item) => (
//                 <div key={item.id} className="bg-white p-4 rounded shadow-md border">
//                     <p><strong>User ID:</strong> {item.user_id}</p>
//                     <p><strong>Simulation ID:</strong> {item.simulation_id}</p>
//                     <p><strong>Task ID:</strong> {item.task_id}</p>
//                     <p><strong>Status:</strong> {item.status}</p>

//                     {signedUrls[item.id] ? (
//                     <button
//                         onClick={() => downloadFileFromBucket(item)}

//                         // onClick={() => forceDownload(signedUrls[item.id], `submission_${item.id}`)}
//                         className="text-blue-600 underline mt-2 inline-block"                   
//                     >
//                             Download Submitted Work
//                     </button>

//                     ) : (
//                     <p className="text-gray-500">No uploaded file.</p>
//                     )}

//                     <textarea
//                         className="mt-3 w-full border rounded p-2"
//                         placeholder="Enter your comment..."
//                         value={comments[item.id] || ''}
//                         onChange={(e) =>
//                             setComments((prev) => ({
//                             ...prev,
//                             [item.id]: e.target.value
//                             }))}
//                     />

//                     <div className="flex gap-2 mt-3">
//                     <button
//                         onClick={() => handleDecision(item.id, 'accepted')}
//                         className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
//                     >
//                         Accept 
//                     </button>
//                     <button
//                         onClick={() => handleDecision(item.id, 'rejected')}
//                         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
//                     >
//                         Reject
//                     </button>
//                     </div>

//                 </div>
//                 ))}
//             </div>
//             )}
//         </div>
//         </div>
//     );
// }

// export default Confirmation;
