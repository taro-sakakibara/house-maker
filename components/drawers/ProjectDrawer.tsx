'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';

interface ProjectDrawerProps {
  onClose: () => void;
}

export default function ProjectDrawer({ onClose }: ProjectDrawerProps) {
  const { 
    projects, 
    currentProject, 
    createProject, 
    switchProject, 
    deleteProject, 
    renameProject 
  } = useApp();
  
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      alert('プロジェクト名を入力してください');
      return;
    }
    
    await createProject(newProjectName);
    setNewProjectName('');
    setShowNewProjectForm(false);
  };

  const handleRename = async (projectId: string) => {
    if (!editingName.trim()) {
      alert('プロジェクト名を入力してください');
      return;
    }
    
    await renameProject(projectId, editingName);
    setEditingProject(null);
    setEditingName('');
  };

  const startEditing = (project: any) => {
    setEditingProject(project.id);
    setEditingName(project.name);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditingName('');
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (projects.length <= 1) {
      alert('最後のプロジェクトは削除できません');
      return;
    }
    
    const confirmed = window.confirm(`プロジェクト「${projectName}」を削除しますか？\nこの操作は取り消せません。`);
    if (confirmed) {
      await deleteProject(projectId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-[12px]">
      {/* Add Project Button */}
      <button
        onClick={() => setShowNewProjectForm(!showNewProjectForm)}
        className="w-full flex items-center space-x-[8px] px-[8px] py-[4px] bg-purple-500 text-white rounded text-xs hover:bg-purple-600 transition-colors"
      >
        <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>新規プロジェクト</span>
      </button>

      {/* Content */}
      <div className="space-y-[12px]">
        {/* Current Project */}
        {currentProject && (
          <div className="bg-blue-50 p-[8px] rounded border text-xs">
            <div className="flex items-center space-x-[4px] mb-[4px]">
              <div className="w-[4px] h-[4px] bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-900">現在</span>
            </div>
            <div className="text-blue-800 font-semibold mb-[4px]">{currentProject.name}</div>
            <div className="text-blue-600 text-xs">
              部屋:{currentProject.rooms.length} 家具:{currentProject.furniture.length}
            </div>
          </div>
        )}

        {/* New Project Form */}
        {showNewProjectForm && (
          <div className="bg-gray-50 p-[8px] rounded border text-xs">
            <div className="font-medium text-gray-800 mb-[8px]">新しいプロジェクト</div>
            <form onSubmit={handleCreateProject} className="space-y-[8px]">
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="プロジェクト名"
                className="w-full px-[8px] py-[4px] border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <div className="flex space-x-[4px]">
                <button
                  type="submit"
                  className="px-[8px] py-[4px] bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors text-xs"
                >
                  作成
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewProjectForm(false);
                    setNewProjectName('');
                  }}
                  className="px-[8px] py-[4px] bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-xs"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Project List */}
        <div>
          <div className="text-xs text-gray-600 mb-[8px]">プロジェクト一覧 ({projects.length})</div>
          <div className="space-y-[4px]">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-[8px] rounded border cursor-pointer transition-colors text-xs ${
                  currentProject?.id === project.id
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (currentProject?.id !== project.id) {
                    switchProject(project.id);
                  }
                }}
              >
                {editingProject === project.id ? (
                  <div className="space-y-[4px]">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-[4px] py-[4px] border border-gray-300 rounded text-xs"
                      autoFocus
                    />
                    <div className="flex space-x-[4px]">
                      <button
                        onClick={() => handleRename(project.id)}
                        className="px-[4px] py-[4px] bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-[4px] py-[4px] bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-[4px]">
                        <div className="font-medium text-gray-800 text-xs">{project.name}</div>
                        {currentProject?.id === project.id && (
                          <span className="bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-xs">
                            アクティブ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600 mt-[4px]">
                        部屋:{project.roomCount} 家具:{project.furnitureCount}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-[4px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(project);
                        }}
                        className="p-0.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(project.id, project.name);
                          }}
                          className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <svg className="w-[12px] h-[12px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}