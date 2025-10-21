import React from 'react';
import { FaFile, FaFileAlt, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileVideo, FaDownload, FaPlay } from 'react-icons/fa';

const MessageFileAttachment = ({ file, onImageClick, darkMode }) => {
  const getFileIcon = () => {
    const filename = file.filename || '';
    const ext = filename.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FaFilePowerpoint className="text-orange-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return <FaFileVideo className="text-purple-500" />;
      default:
        return <FaFileAlt className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.filename || 'file';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render image
  if (file.category === 'image' || file.mime_type?.startsWith('image/')) {
    return (
      <div className="mt-2">
        <button
          onClick={() => onImageClick && onImageClick(file)}
          className="block max-w-sm rounded-lg overflow-hidden hover:opacity-90 transition"
          data-testid="image-attachment"
        >
          <img
            src={file.url}
            alt={file.filename}
            className="w-full h-auto max-h-64 object-cover"
            loading="lazy"
          />
        </button>
        {file.filename && (
          <p className="text-xs mt-1 opacity-75">{file.filename}</p>
        )}
      </div>
    );
  }

  // Render video
  if (file.category === 'video' || file.mime_type?.startsWith('video/')) {
    return (
      <div className="mt-2 max-w-sm">
        <video
          controls
          className="w-full rounded-lg"
          preload="metadata"
          data-testid="video-attachment"
        >
          <source src={file.url} type={file.mime_type || 'video/mp4'} />
          Your browser does not support the video tag.
        </video>
        {file.filename && (
          <p className="text-xs mt-1 opacity-75">{file.filename}</p>
        )}
      </div>
    );
  }

  // Render document/other files
  return (
    <div
      className={`mt-2 max-w-sm p-3 rounded-lg border flex items-center space-x-3 ${
        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
      }`}
      data-testid="file-attachment"
    >
      <div className="flex-shrink-0 text-3xl">
        {getFileIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          {file.filename || 'Unnamed file'}
        </p>
        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatFileSize(file.size)}
        </p>
      </div>
      <button
        onClick={handleDownload}
        className={`flex-shrink-0 p-2 rounded-lg transition ${
          darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
        }`}
        title="Download"
        data-testid="download-file-button"
      >
        <FaDownload className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
      </button>
    </div>
  );
};

export default MessageFileAttachment;
