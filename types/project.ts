import { Room } from './room';
import { Furniture } from './furniture';

export interface Project {
  id: string;
  name: string;
  rooms: Room[];
  furniture: Furniture[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  roomCount: number;
  furnitureCount: number;
}

export interface ProjectsData {
  projects: Project[];
  activeProjectId: string | null;
  version: string;
}