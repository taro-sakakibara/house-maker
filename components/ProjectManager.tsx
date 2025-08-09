"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import { ProjectMetadata } from "@/types/project";

export default function ProjectManager() {
  const {
    projects,
    currentProject,
    createProject,
    switchProject,
    deleteProject,
    renameProject,
  } = useApp();

  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      alert("プロジェクト名を入力してください");
      return;
    }

    await createProject(newProjectName);
    setNewProjectName("");
    setShowNewProjectForm(false);
  };

  const handleRename = async (projectId: string) => {
    if (!editingName.trim()) {
      alert("プロジェクト名を入力してください");
      return;
    }

    await renameProject(projectId, editingName);
    setEditingProject(null);
    setEditingName("");
  };

  const startEditing = (project: ProjectMetadata) => {
    setEditingProject(project.id);
    setEditingName(project.name);
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditingName("");
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (projects.length <= 1) {
      alert("最後のプロジェクトは削除できません");
      return;
    }

    const confirmed = window.confirm(
      `プロジェクト「${projectName}」を削除しますか？\nこの操作は取り消せません。`
    );
    if (confirmed) {
      await deleteProject(projectId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-[16px]">
      {/* 現在のプロジェクト表示 */}
      {currentProject && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-[16px] rounded-xl border border-indigo-200 mb-[24px]">
          <div className="flex items-center space-x-[8px] mb-[8px]">
            <div className="w-[12px] h-[12px] bg-indigo-500 rounded-full"></div>
            <h3 className="font-semibold text-indigo-900">
              現在のプロジェクト
            </h3>
          </div>
          <p className="text-lg font-medium text-indigo-800 mb-[8px]">
            {currentProject.name}
          </p>
          <div className="flex items-center space-x-[16px] text-sm text-indigo-600">
            <div className="flex items-center space-x-[4px]">
              <svg
                className="w-[16px] h-[16px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span>部屋: {currentProject.rooms.length}</span>
            </div>
            <div className="flex items-center space-x-[4px]">
              <svg
                className="w-[16px] h-[16px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span>家具: {currentProject.furniture.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 新規プロジェクト作成 */}
      <div className="space-y-[12px]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-700">
            プロジェクト操作
          </h3>
          <button
            onClick={() => setShowNewProjectForm(!showNewProjectForm)}
            className="flex items-center space-x-[8px] bg-emerald-500 hover:bg-emerald-600 text-white px-[16px] py-[8px] rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
          >
            <svg
              className="w-[16px] h-[16px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span>{showNewProjectForm ? "閉じる" : "新規作成"}</span>
          </button>
        </div>

        {showNewProjectForm && (
          <form
            onSubmit={handleCreateProject}
            className="bg-slate-50 p-[16px] rounded-xl border border-slate-200 space-y-[16px]"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-[8px]">
                プロジェクト名
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="プロジェクト名を入力してください"
                className="w-full px-[16px] py-[8px] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                作成
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewProjectForm(false);
                  setNewProjectName("");
                }}
                className="flex-1 bg-slate-400 hover:bg-slate-500 text-white py-2 px-4 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
              >
                キャンセル
              </button>
            </div>
          </form>
        )}
      </div>

      {/* プロジェクト一覧 */}
      <div className="space-y-[12px]">
        <h4 className="text-lg font-semibold text-slate-700 flex items-center">
          <svg
            className="w-[20px] h-[20px] mr-[8px] text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          プロジェクト一覧 ({projects.length})
        </h4>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`p-[16px] rounded-xl border transition-all ${
                currentProject?.id === project.id
                  ? "border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
              }`}
            >
              {editingProject === project.id ? (
                <div className="space-y-[12px]">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full px-[16px] py-[8px] border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    autoFocus
                  />
                  <div className="flex space-x-[8px]">
                    <button
                      onClick={() => handleRename(project.id)}
                      className="flex items-center space-x-[4px] bg-emerald-500 hover:bg-emerald-600 text-white px-[12px] py-[8px] rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <svg
                        className="w-[16px] h-[16px]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>保存</span>
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex items-center space-x-[4px] bg-slate-400 hover:bg-slate-500 text-white px-[12px] py-[8px] rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
                    >
                      <svg
                        className="w-[16px] h-[16px]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span>キャンセル</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between space-x-3">
                    <div
                      className="flex-1 cursor-pointer group"
                      onClick={() => {
                        if (currentProject?.id !== project.id) {
                          switchProject(project.id);
                        }
                      }}
                    >
                      <div className="flex items-center space-x-[8px] mb-[8px]">
                        <h5 className="font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                          {project.name}
                        </h5>
                        {currentProject?.id === project.id && (
                          <div className="flex items-center space-x-[4px] bg-indigo-100 text-indigo-700 px-[8px] py-[4px] rounded-full text-xs font-medium">
                            <div className="w-[8px] h-[8px] bg-indigo-500 rounded-full"></div>
                            <span>アクティブ</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-[16px] text-sm text-slate-600 mb-[8px]">
                        <div className="flex items-center space-x-[4px]">
                          <svg
                            className="w-[16px] h-[16px] text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                          <span>部屋: {project.roomCount}個</span>
                        </div>
                        <div className="flex items-center space-x-[4px]">
                          <svg
                            className="w-[16px] h-[16px] text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                          <span>家具: {project.furnitureCount}個</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center space-x-[4px]">
                        <svg
                          className="w-[12px] h-[12px]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>更新: {formatDate(project.updatedAt)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-[4px]">
                      <button
                        onClick={() => startEditing(project)}
                        className="flex items-center justify-center w-[32px] h-[32px] text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="名前を変更"
                      >
                        <svg
                          className="w-[16px] h-[16px]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="flex items-center justify-center w-[32px] h-[32px] text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="プロジェクトを削除"
                        >
                          <svg
                            className="w-[16px] h-[16px]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
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
