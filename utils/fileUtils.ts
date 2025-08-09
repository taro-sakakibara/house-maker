import { Room } from '@/types/room';
import { Furniture } from '@/types/furniture';

export interface ProjectData {
  rooms: Room[];
  furniture: Furniture[];
  createdAt: string;
  version: string;
}

/**
 * プロジェクトデータをローカルファイルに保存
 */
export const saveProjectToLocal = async (rooms: Room[], furniture: Furniture[]): Promise<boolean> => {
  try {
    const response = await fetch('/api/project', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ rooms, furniture }),
    });

    if (!response.ok) {
      throw new Error('Failed to save project');
    }

    return true;
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('プロジェクトの保存に失敗しました。');
    return false;
  }
};

/**
 * ローカルファイルからプロジェクトデータを読み込み
 */
export const loadProjectFromLocal = async (): Promise<ProjectData | null> => {
  try {
    const response = await fetch('/api/project');
    
    if (!response.ok) {
      throw new Error('Failed to load project');
    }

    const projectData: ProjectData = await response.json();
    return projectData;
  } catch (error) {
    console.error('Failed to load project:', error);
    alert('プロジェクトの読み込みに失敗しました。');
    return null;
  }
};