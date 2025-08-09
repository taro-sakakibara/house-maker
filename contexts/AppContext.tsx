'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Room } from '@/types/room';
import { Furniture } from '@/types/furniture';
import { Project, ProjectsData, ProjectMetadata } from '@/types/project';
import { 
  createNewProject, 
  updateProject, 
  getProjectMetadata,
  saveProjectsToLocal, 
  loadProjectsFromLocal,
  convertLegacyFurniture
} from '@/utils/projectManager';
import { saveProjectToLocal, loadProjectFromLocal } from '@/utils/fileUtils';

interface AppContextType {
  // 現在のプロジェクトデータ
  rooms: Room[];
  activeRoomId: string | null;
  furniture: Furniture[];
  activeFurnitureId: string | null;
  
  // プロジェクト管理
  projects: ProjectMetadata[];
  currentProject: Project | null;
  
  // 部屋操作
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, room: Partial<Room>) => void;
  deleteRoom: (roomId: string) => void;
  setActiveRoomId: (roomId: string | null) => void;
  
  // 家具操作
  addFurniture: (furniture: Furniture) => void;
  updateFurniture: (furnitureId: string, furniture: Partial<Furniture>) => void;
  deleteFurniture: (furnitureId: string) => void;
  setActiveFurnitureId: (furnitureId: string | null) => void;
  getFurnitureInRoom: (roomId: string | null) => Furniture[];
  
  // プロジェクト操作
  createProject: (name: string) => Promise<void>;
  switchProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  saveCurrentProject: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // 現在のプロジェクトデータ
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [furniture, setFurniture] = useState<Furniture[]>([]);
  const [activeFurnitureId, setActiveFurnitureId] = useState<string | null>(null);
  
  // プロジェクト管理
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projectsData, setProjectsData] = useState<ProjectsData>({
    projects: [],
    activeProjectId: null,
    version: '1.0.0',
  });

  // アプリ起動時にプロジェクトデータを読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      // 新しいプロジェクト管理システムから読み込み
      const newProjectsData = await loadProjectsFromLocal();
      if (newProjectsData) {
        setProjectsData(newProjectsData);
        setProjects(newProjectsData.projects.map(getProjectMetadata));
        
        // アクティブなプロジェクトがあれば読み込み
        if (newProjectsData.activeProjectId && newProjectsData.projects.length > 0) {
          const activeProject = newProjectsData.projects.find(p => p.id === newProjectsData.activeProjectId);
          if (activeProject) {
            loadProjectIntoCurrentState(activeProject);
            return;
          }
        }
        
        // アクティブなプロジェクトがない場合、最初のプロジェクトを読み込み
        if (newProjectsData.projects.length > 0) {
          loadProjectIntoCurrentState(newProjectsData.projects[0]);
          return;
        }
      }
      
      // 新システムにデータがない場合、旧システムからマイグレーション
      const legacyProjectData = await loadProjectFromLocal();
      if (legacyProjectData && (legacyProjectData.rooms.length > 0 || legacyProjectData.furniture.length > 0)) {
        // 旧データを新プロジェクトとして作成
        const migratedProject = createNewProject('マイグレーションプロジェクト');
        migratedProject.rooms = legacyProjectData.rooms;
        migratedProject.furniture = convertLegacyFurniture(legacyProjectData.furniture);
        
        const newProjectsData: ProjectsData = {
          projects: [migratedProject],
          activeProjectId: migratedProject.id,
          version: '1.0.0',
        };
        
        await saveProjectsToLocal(newProjectsData);
        setProjectsData(newProjectsData);
        setProjects([getProjectMetadata(migratedProject)]);
        loadProjectIntoCurrentState(migratedProject);
      }
    };

    loadInitialData();
  }, []);

  // プロジェクトを現在の状態に読み込む
  const loadProjectIntoCurrentState = (project: Project) => {
    setCurrentProject(project);
    setRooms(project.rooms);
    setFurniture(convertLegacyFurniture(project.furniture));
    setActiveFurnitureId(null);
    
    // 部屋があれば最初の部屋を自動選択
    if (project.rooms.length > 0) {
      setActiveRoomId(project.rooms[0].id);
    } else {
      setActiveRoomId(null);
    }
  };

  const addRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
    setActiveRoomId(room.id);
  };

  const updateRoom = (roomId: string, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, ...updates } : room
      )
    );
  };

  const deleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId));
    // その部屋にある家具も削除
    setFurniture((prev) => prev.filter((item) => item.roomId !== roomId));
    if (activeRoomId === roomId) {
      setActiveRoomId(null);
    }
  };

  const addFurniture = (item: Furniture) => {
    setFurniture((prev) => [...prev, item]);
    setActiveFurnitureId(item.id);
  };

  const updateFurniture = (furnitureId: string, updates: Partial<Furniture>) => {
    setFurniture((prev) =>
      prev.map((item) =>
        item.id === furnitureId ? { ...item, ...updates } : item
      )
    );
  };

  const deleteFurniture = (furnitureId: string) => {
    setFurniture((prev) => prev.filter((item) => item.id !== furnitureId));
    if (activeFurnitureId === furnitureId) {
      setActiveFurnitureId(null);
    }
  };

  const getFurnitureInRoom = (roomId: string | null) => {
    return furniture.filter((item) => item.roomId === roomId);
  };

  // プロジェクト操作関数
  const createProject = async (name: string) => {
    const newProject = createNewProject(name);
    const updatedProjectsData = {
      ...projectsData,
      projects: [...projectsData.projects, newProject],
      activeProjectId: newProject.id,
    };
    
    const success = await saveProjectsToLocal(updatedProjectsData);
    if (success) {
      setProjectsData(updatedProjectsData);
      setProjects(updatedProjectsData.projects.map(getProjectMetadata));
      loadProjectIntoCurrentState(newProject);
      alert('新しいプロジェクトを作成しました。');
    }
  };

  const switchProject = async (projectId: string) => {
    const project = projectsData.projects.find(p => p.id === projectId);
    if (project) {
      // 現在のプロジェクトを静かに保存してから切り替え
      if (currentProject) {
        const updatedProject = updateProject(currentProject, rooms, furniture);
        const updatedProjects = projectsData.projects.map(p =>
          p.id === currentProject.id ? updatedProject : p
        );
        
        const tempProjectsData = {
          ...projectsData,
          projects: updatedProjects,
        };
        
        await saveProjectsToLocal(tempProjectsData);
        setProjectsData(tempProjectsData);
      }
      
      const updatedProjectsData = {
        ...projectsData,
        activeProjectId: projectId,
      };
      
      const success = await saveProjectsToLocal(updatedProjectsData);
      if (success) {
        setProjectsData(updatedProjectsData);
        loadProjectIntoCurrentState(project);
      }
    }
  };

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projectsData.projects.filter(p => p.id !== projectId);
    let newActiveProjectId = projectsData.activeProjectId;
    
    // 削除するプロジェクトがアクティブな場合
    if (projectsData.activeProjectId === projectId) {
      newActiveProjectId = updatedProjects.length > 0 ? updatedProjects[0].id : null;
    }
    
    const updatedProjectsData = {
      ...projectsData,
      projects: updatedProjects,
      activeProjectId: newActiveProjectId,
    };
    
    const success = await saveProjectsToLocal(updatedProjectsData);
    if (success) {
      setProjectsData(updatedProjectsData);
      setProjects(updatedProjectsData.projects.map(getProjectMetadata));
      
      // 新しいアクティブプロジェクトを読み込み
      if (newActiveProjectId) {
        const newActiveProject = updatedProjects.find(p => p.id === newActiveProjectId);
        if (newActiveProject) {
          loadProjectIntoCurrentState(newActiveProject);
        }
      } else {
        // プロジェクトがない場合は空の状態
        setCurrentProject(null);
        setRooms([]);
        setFurniture([]);
        setActiveRoomId(null);
        setActiveFurnitureId(null);
      }
      
      alert('プロジェクトを削除しました。');
    }
  };

  const renameProject = async (projectId: string, newName: string) => {
    const updatedProjects = projectsData.projects.map(project => 
      project.id === projectId 
        ? { ...project, name: newName.trim(), updatedAt: new Date().toISOString() }
        : project
    );
    
    const updatedProjectsData = {
      ...projectsData,
      projects: updatedProjects,
    };
    
    const success = await saveProjectsToLocal(updatedProjectsData);
    if (success) {
      setProjectsData(updatedProjectsData);
      setProjects(updatedProjectsData.projects.map(getProjectMetadata));
      
      // 現在のプロジェクトが変更されたプロジェクトの場合、状態を更新
      if (currentProject && currentProject.id === projectId) {
        setCurrentProject(prev => prev ? { ...prev, name: newName.trim() } : null);
      }
    }
  };

  const saveCurrentProject = async () => {
    if (!currentProject) {
      alert('保存するプロジェクトがありません。');
      return;
    }
    
    const updatedProject = updateProject(currentProject, rooms, furniture);
    const updatedProjects = projectsData.projects.map(project =>
      project.id === currentProject.id ? updatedProject : project
    );
    
    const updatedProjectsData = {
      ...projectsData,
      projects: updatedProjects,
    };
    
    const success = await saveProjectsToLocal(updatedProjectsData);
    if (success) {
      setProjectsData(updatedProjectsData);
      setProjects(updatedProjectsData.projects.map(getProjectMetadata));
      setCurrentProject(updatedProject);
      alert('プロジェクトを保存しました。');
    }
  };


  return (
    <AppContext.Provider
      value={{
        // 現在のプロジェクトデータ
        rooms,
        activeRoomId,
        furniture,
        activeFurnitureId,
        
        // プロジェクト管理
        projects,
        currentProject,
        
        // 部屋操作
        addRoom,
        updateRoom,
        deleteRoom,
        setActiveRoomId,
        
        // 家具操作
        addFurniture,
        updateFurniture,
        deleteFurniture,
        setActiveFurnitureId,
        getFurnitureInRoom,
        
        // プロジェクト操作
        createProject,
        switchProject,
        deleteProject,
        renameProject,
        saveCurrentProject,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}