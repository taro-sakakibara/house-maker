'use client';

import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { ProjectMetadata } from '@/types/project';

export default function ProjectManager() {
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

  const startEditing = (project: ProjectMetadata) => {
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
    <div className="space-y-4">
      {/* 現在のプロジェクト表示 */}
      {currentProject && (
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900">現在のプロジェクト</h3>
          <p className="text-sm text-blue-700">{currentProject.name}</p>
          <p className="text-xs text-blue-600">
            部屋: {currentProject.rooms.length}個 | 家具: {currentProject.furniture.length}個
          </p>
        </div>
      )}

      {/* 新規プロジェクト作成 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">プロジェクト管理</h3>
          <button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
          >
            {showNewProjectForm ? '閉じる' : '新規作成'}
          </button>
        </div>

        {showNewProjectForm && (
          <form onSubmit={handleCreateProject} className="bg-white p-3 rounded border space-y-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors"
              >
                作成
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProjectForm(false);
                  setNewProjectName('');
                }}
                className="text-sm bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* プロジェクト一覧 */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">プロジェクト一覧 ({projects.length})</h4>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-2 rounded border text-sm ${
                currentProject?.id === project.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {editingProject === project.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRename(project.id)}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      保存
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-xs bg-gray-400 text-white px-2 py-1 rounded hover:bg-gray-500"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        if (currentProject?.id !== project.id) {
                          switchProject(project.id);
                        }
                      }}
                    >
                      <h5 className="font-medium">{project.name}</h5>
                      <p className="text-xs text-gray-600">
                        部屋: {project.roomCount}個 | 家具: {project.furnitureCount}個
                      </p>
                      <p className="text-xs text-gray-500">
                        更新: {formatDate(project.updatedAt)}
                      </p>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(project)}
                        className="text-xs text-blue-500 hover:text-blue-700"
                        title="名前を変更"
                      >
                        編集
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="text-xs text-red-500 hover:text-red-700"
                          title="プロジェクトを削除"
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}