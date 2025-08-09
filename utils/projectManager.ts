import { Room } from '@/types/room';
import { Furniture } from '@/types/furniture';
import { Project, ProjectMetadata, ProjectsData } from '@/types/project';

/**
 * プロジェクト一意IDを生成
 */
export const generateProjectId = (): string => {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 新しいプロジェクトを作成
 */
export const createNewProject = (name: string): Project => {
  const now = new Date().toISOString();
  return {
    id: generateProjectId(),
    name: name.trim() || '新しいプロジェクト',
    rooms: [],
    furniture: [],
    createdAt: now,
    updatedAt: now,
    version: '1.0.0',
  };
};

/**
 * プロジェクトメタデータを取得
 */
export const getProjectMetadata = (project: Project): ProjectMetadata => {
  return {
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    roomCount: project.rooms.length,
    furnitureCount: project.furniture.length,
  };
};

/**
 * 全プロジェクトをローカルファイルに保存
 */
export const saveProjectsToLocal = async (projectsData: ProjectsData): Promise<boolean> => {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectsData),
    });

    if (!response.ok) {
      throw new Error('Failed to save projects');
    }

    return true;
  } catch (error) {
    console.error('Failed to save projects:', error);
    alert('プロジェクトの保存に失敗しました。');
    return false;
  }
};

/**
 * ローカルファイルから全プロジェクトを読み込み
 */
export const loadProjectsFromLocal = async (): Promise<ProjectsData | null> => {
  try {
    const response = await fetch('/api/projects');
    
    if (!response.ok) {
      if (response.status === 404) {
        // ファイルが存在しない場合は空のプロジェクトデータを返す
        return {
          projects: [],
          activeProjectId: null,
          version: '1.0.0',
        };
      }
      throw new Error('Failed to load projects');
    }

    const projectsData: ProjectsData = await response.json();
    return projectsData;
  } catch (error) {
    console.error('Failed to load projects:', error);
    return null;
  }
};

/**
 * プロジェクト内容を更新
 */
export const updateProject = (
  project: Project, 
  rooms: Room[], 
  furniture: Furniture[]
): Project => {
  return {
    ...project,
    rooms,
    furniture,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * 古い座標系の家具データを新しい座標系に変換
 */
export const convertLegacyFurniture = (furniture: Furniture[]): Furniture[] => {
  return furniture.map(item => {
    // Z座標が負の値の場合、古い座標系なので変換
    if (item.position.z < 0) {
      return {
        ...item,
        position: {
          ...item.position,
          z: -item.position.z, // 負の値を正の値に変換
        }
      };
    }
    return item;
  });
};