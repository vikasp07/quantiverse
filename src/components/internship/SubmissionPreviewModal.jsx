import React, { useState } from 'react';
import { X, Download, Upload, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const SubmissionPreviewModal = ({ task, isOpen, onClose, onReuploadSuccess }) => {
  const [isReuploading, setIsReuploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!isOpen) return null;

  // Helper to get file type from URL
  const getFileTypeFromUrl = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    return extension;
  };

  // Helper to get file name from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return 'submission';
    return url.split('/').pop().split('?')[0] || 'submission';
  };

  // Check if URL is a PDF or image
  const isPreviewable = (url) => {
    const fileType = getFileTypeFromUrl(url);
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType);
  };

  const handleDownload = async () => {
    try {
      if (task.uploaded_work_url) {
        // Open in new tab for viewing/downloading
        window.open(task.uploaded_work_url, '_blank');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file');
    }
  };

  const handleReupload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReuploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload new file to submissions bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `task-submissions/${task.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('submissions')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('submissions')
        .getPublicUrl(fileName);

      const publicUrl = publicUrlData?.publicUrl || '';

      // Update user_task_progress with new URL
      const { error: updateError } = await supabase
        .from('user_task_progress')
        .update({
          uploaded_work_url: publicUrl,
          confirmation_status: 'pending', // Reset to pending for re-review
          comment: null, // Clear admin comments
        })
        .eq('task_id', task.id)
        .eq('user_id', task.user_id);

      if (updateError) {
        throw updateError;
      }

      setSuccess('File reuploaded successfully! Admin will review your submission again.');
      setTimeout(() => {
        onReuploadSuccess();
      }, 2000);
    } catch (err) {
      console.error('Error reuploading file:', err);
      setError(err.message || 'Failed to reupload file');
    } finally {
      setIsReuploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const fileType = getFileTypeFromUrl(task.uploaded_work_url);
  const fileName = getFileNameFromUrl(task.uploaded_work_url);
  const isPreview = isPreviewable(task.uploaded_work_url);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Submission Preview - {task.full_title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Submission Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  task.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {task.status.replace('_', ' ')}
              </span>
            </div>
            {task.confirmation_status && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Admin Review:</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    task.confirmation_status === 'confirmed' ||
                    task.confirmation_status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : task.confirmation_status === 'pending'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {task.confirmation_status}
                </span>
              </div>
            )}
          </div>

          {/* Admin Comment */}
          {task.comment && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-5">
              <h3 className="font-bold text-base text-blue-900 mb-3">📋 Admin Feedback</h3>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">{task.comment}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <div>
                <h3 className="font-semibold text-green-900">Success</h3>
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            </div>
          )}

          {/* File Preview/Display */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            {task.uploaded_work_url ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">{fileName}</p>
                    <p className="text-sm text-gray-500">File type: {fileType.toUpperCase()}</p>
                  </div>
                </div>

                {/* Preview for PDFs and Images */}
                {isPreview && (
                  <div className="bg-gray-100 rounded-lg overflow-hidden" style={{ maxHeight: '400px' }}>
                    {fileType === 'pdf' ? (
                      <embed src={task.uploaded_work_url} type="application/pdf" width="100%" height="400" />
                    ) : (
                      <img
                        src={task.uploaded_work_url}
                        alt="Preview"
                        className="w-full h-auto object-contain"
                      />
                    )}
                  </div>
                )}

                {/* File Information */}
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <p className="text-gray-600">
                    Uploaded on:{' '}
                    <span className="font-medium">
                      {new Date(task.updated_at).toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No file uploaded yet</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            {task.uploaded_work_url && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}

            {/* Show reupload button if rejected or no file */}
            {task.confirmation_status === 'rejected' || !task.uploaded_work_url ? (
              <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition cursor-pointer">
                <Upload className="w-4 h-4" />
                {isReuploading ? 'Uploading...' : 'Reupload'}
                <input
                  type="file"
                  onChange={handleReupload}
                  disabled={isReuploading}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.jpg,.jpeg,.png,.gif"
                  className="hidden"
                />
              </label>
            ) : null}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              Close
            </button>
          </div>

          {/* Info Message */}
          {task.confirmation_status === 'rejected' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                Your submission was rejected. Please review the admin's feedback above and reupload an improved version.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPreviewModal;
