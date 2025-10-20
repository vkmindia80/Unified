import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaHashtag, FaLock, FaGlobe } from 'react-icons/fa';

function SpaceNavigation({ 
  spaces, 
  subspaces, 
  selectedChat, 
  onSelectChat, 
  onCreateSpace, 
  onCreateSubspace,
  onCreateChannel,
  darkMode 
}) {
  const [expandedSpaces, setExpandedSpaces] = useState({});
  const [expandedSubspaces, setExpandedSubspaces] = useState({});

  const toggleSpace = (spaceId) => {
    setExpandedSpaces(prev => ({
      ...prev,
      [spaceId]: !prev[spaceId]
    }));
  };

  const toggleSubspace = (subspaceId) => {
    setExpandedSubspaces(prev => ({
      ...prev,
      [subspaceId]: !prev[subspaceId]
    }));
  };

  const getSpaceIcon = (space) => {
    if (space.type === 'private') return <FaLock className="text-sm" />;
    if (space.type === 'restricted') return <FaHashtag className="text-sm" />;
    return <FaGlobe className="text-sm" />;
  };

  const getSpaceChats = (spaceId, subspaceId = null) => {
    return spaces.find(s => s.id === spaceId)?.chats?.filter(chat => 
      subspaceId ? chat.subspace_id === subspaceId : !chat.subspace_id
    ) || [];
  };

  const getSpaceSubspaces = (spaceId) => {
    return subspaces.filter(sub => sub.space_id === spaceId) || [];
  };

  return (
    <div className="space-y-1">
      {spaces.map((space) => {
        const isExpanded = expandedSpaces[space.id];
        const spaceSubspaces = getSpaceSubspaces(space.id);
        const directChats = space.chats?.filter(chat => !chat.subspace_id) || [];

        return (
          <div key={space.id} className="mb-2">
            {/* Space Header */}
            <div
              className={`flex items-center justify-between p-2 rounded cursor-pointer group ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
              onClick={() => toggleSpace(space.id)}
            >
              <div className="flex items-center space-x-2 flex-1">
                <button className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                </button>
                <span className="text-lg">{space.icon || '📁'}</span>
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {space.name}
                </span>
                {getSpaceIcon(space)}
              </div>
              {space.is_admin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateSubspace(space.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 rounded transition ${
                    darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  }`}
                  title="Add subspace"
                >
                  <FaPlus className="text-xs" />
                </button>
              )}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="ml-4 mt-1 space-y-1">
                {/* Direct Chats in Space (no subspace) */}
                {directChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => onSelectChat(chat)}
                    className={`flex items-center space-x-2 p-2 pl-6 rounded cursor-pointer ${
                      selectedChat?.id === chat.id
                        ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900')
                        : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700')
                    }`}
                  >
                    <FaHashtag className="text-sm" />
                    <span className="text-sm">{chat.name || 'Unnamed Chat'}</span>
                  </div>
                ))}

                {/* Subspaces */}
                {spaceSubspaces.map((subspace) => {
                  const isSubExpanded = expandedSubspaces[subspace.id];
                  const subspaceChats = space.chats?.filter(chat => chat.subspace_id === subspace.id) || [];

                  return (
                    <div key={subspace.id} className="ml-2">
                      {/* Subspace Header */}
                      <div
                        className={`flex items-center justify-between p-2 rounded cursor-pointer group ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                        }`}
                        onClick={() => toggleSubspace(subspace.id)}
                      >
                        <div className="flex items-center space-x-2 flex-1">
                          <button className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isSubExpanded ? <FaChevronDown className="text-xs" /> : <FaChevronRight className="text-xs" />}
                          </button>
                          <span className="text-base">{subspace.icon || '📂'}</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {subspace.name}
                          </span>
                        </div>
                        {space.is_admin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCreateChannel(space.id, subspace.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition ${
                              darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                            }`}
                            title="Add channel"
                          >
                            <FaPlus className="text-xs" />
                          </button>
                        )}
                      </div>

                      {/* Subspace Chats */}
                      {isSubExpanded && (
                        <div className="ml-6 space-y-1">
                          {subspaceChats.map((chat) => (
                            <div
                              key={chat.id}
                              onClick={() => onSelectChat(chat)}
                              className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                                selectedChat?.id === chat.id
                                  ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-900')
                                  : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700')
                              }`}
                            >
                              <FaHashtag className="text-xs" />
                              <span className="text-sm">{chat.name || 'Unnamed Chat'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Channel Button (for space-level channels) */}
                {space.is_admin && (
                  <button
                    onClick={() => onCreateChannel(space.id, null)}
                    className={`flex items-center space-x-2 p-2 pl-6 rounded w-full text-left ${
                      darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <FaPlus className="text-xs" />
                    <span className="text-sm">Add Channel</span>
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Add Space Button */}
      <button
        onClick={onCreateSpace}
        className={`flex items-center space-x-2 p-2 rounded w-full text-left ${
          darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
        }`}
      >
        <FaPlus className="text-sm" />
        <span className="text-sm font-medium">Add Space</span>
      </button>
    </div>
  );
}

export default SpaceNavigation;
