import React, { useState, useRef } from 'react';
import { FaTimes, FaFile, FaImage, FaVideo, FaFileAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../services/api';

const FileUpload = ({ onFilesUploaded, onClose, chatId, darkMode }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const dragCounter = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const MAX_FILE_SIZE = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024, // 10MB
    video: 50 * 1024 * 1024 // 50MB
  };

  const ALLOWED_EXTENSIONS = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'],
    document: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'],
    video: ['.mp4', '.mov', '.avi', '.mkv', '.webm']
  };

  const getFileCategory = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (ALLOWED_EXTENSIONS.image.includes(ext)) return 'image';
    if (ALLOWED_EXTENSIONS.document.includes(ext)) return 'document';
    if (ALLOWED_EXTENSIONS.video.includes(ext)) return 'video';
    return 'other';
  };

  const validateFile = (file) => {
    const category = getFileCategory(file);
    
    if (category === 'other') {
      return { valid: false, error: 'File type not supported' };
    }

    const maxSize = MAX_FILE_SIZE[category];
    if (file.size > maxSize) {
      const maxMB = maxSize / (1024 * 1024);
      return { valid: false, error: `File size exceeds ${maxMB}MB limit` };
    }

    return { valid: true, category };
  };

  const handleFileSelect = (files) => {
    const newFiles = [];
    const newPreviews = { ...previews };
    const newErrors = { ...errors };

    Array.from(files).forEach((file) => {
      const validation = validateFile(file);
      
      if (validation.valid) {
        const fileId = Date.now() + Math.random();
        newFiles.push({ file, id: fileId, category: validation.category });
        
        // Create preview for images
        if (validation.category === 'image') {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [fileId]: reader.result }));
          };
          reader.readAsDataURL(file);
        }
      } else {
        newErrors[file.name] = validation.error;
      }
    });

    setSelectedFiles([...selectedFiles, ...newFiles]);
    setErrors(newErrors);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removeFile = (fileId) => {
    setSelectedFiles(selectedFiles.filter(f => f.id !== fileId));
    const newPreviews = { ...previews };
    delete newPreviews[fileId];
    setPreviews(newPreviews);
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const fileObj of selectedFiles) {
        try {
          setUploadProgress(prev => ({ ...prev, [fileObj.id]: 0 }));

          const formData = new FormData();
          formData.append('file', fileObj.file);
          if (chatId) {
            formData.append('chat_id', chatId);
          }

          const response = await api.post('/upload/file', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(prev => ({ ...prev, [fileObj.id]: percentCompleted }));
            },
          });

          if (response.data.success) {
            uploadedFiles.push(response.data.file);
            setUploadProgress(prev => ({ ...prev, [fileObj.id]: 100 }));
          }
        } catch (error) {
          console.error('Failed to upload file:', fileObj.file.name, error);
          setErrors(prev => ({ ...prev, [fileObj.file.name]: 'Upload failed' }));
        }
      }

      // Call callback with uploaded files
      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
      }
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (category) => {
    switch (category) {
      case 'image':
        return <FaImage className="text-blue-500" />;
      case 'document':
        return <FaFileAlt className="text-green-500" />;
      case 'video':
        return <FaVideo className="text-purple-500" />;
      default:
        return <FaFile className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Upload Files
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition`}
            data-testid="close-upload-modal"
          >
            <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : darkMode
                ? 'border-gray-600 hover:border-gray-500'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.mp4,.mov,.avi,.mkv,.webm"
            />
            <div className="flex flex-col items-center space-y-3">
              <FaFile className={`text-5xl ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
              <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Drag and drop files here
              </p>
              <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                data-testid="browse-files-button"
              >
                Browse Files
              </button>
              <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                Images (5MB) • Documents (10MB) • Videos (50MB)
              </p>
            </div>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className={`font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Selected Files ({selectedFiles.length})
              </h3>
              {selectedFiles.map((fileObj) => (
                <div
                  key={fileObj.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  {/* Preview or Icon */}
                  <div className="flex-shrink-0">
                    {previews[fileObj.id] ? (
                      <img
                        src={previews[fileObj.id]}
                        alt={fileObj.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center text-2xl">
                        {getFileIcon(fileObj.category)}
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      {fileObj.file.name}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatFileSize(fileObj.file.size)}
                    </p>
                    {/* Progress Bar */}
                    {uploading && uploadProgress[fileObj.id] !== undefined && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${uploadProgress[fileObj.id]}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status/Remove */}
                  <div className="flex-shrink-0">
                    {uploadProgress[fileObj.id] === 100 ? (
                      <FaCheckCircle className="text-green-500 text-xl" />
                    ) : (
                      <button
                        onClick={() => removeFile(fileObj.id)}
                        disabled={uploading}
                        className={`p-2 rounded ${darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition disabled:opacity-50`}
                        data-testid="remove-file-button"
                      >
                        <FaTimes className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Errors */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-4 space-y-1">
              {Object.entries(errors).map(([filename, error]) => (
                <div
                  key={filename}
                  className="flex items-center space-x-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded"
                >
                  <FaExclamationCircle />
                  <span>
                    {filename}: {error}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
            }`}
            disabled={uploading}
            data-testid="cancel-upload-button"
          >
            Cancel
          </button>
          <button
            onClick={uploadFiles}
            disabled={selectedFiles.length === 0 || uploading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="upload-files-button"
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
