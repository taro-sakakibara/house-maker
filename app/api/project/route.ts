import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { ProjectData } from '@/utils/fileUtils';

const PROJECT_DIR = path.join(process.cwd(), 'data');
const PROJECT_FILE = path.join(PROJECT_DIR, 'project.json');

// データディレクトリが存在しない場合は作成
async function ensureDataDir() {
  if (!existsSync(PROJECT_DIR)) {
    await mkdir(PROJECT_DIR, { recursive: true });
  }
}

// GET: プロジェクトデータを読み込み
export async function GET() {
  try {
    await ensureDataDir();
    
    if (!existsSync(PROJECT_FILE)) {
      // ファイルが存在しない場合は空のプロジェクトを返す
      const emptyProject: ProjectData = {
        rooms: [],
        furniture: [],
        createdAt: new Date().toISOString(),
        version: '1.0.0',
      };
      return NextResponse.json(emptyProject);
    }

    const data = await readFile(PROJECT_FILE, 'utf-8');
    const projectData: ProjectData = JSON.parse(data);
    
    return NextResponse.json(projectData);
  } catch (error) {
    console.error('Failed to load project:', error);
    return NextResponse.json(
      { error: 'Failed to load project data' },
      { status: 500 }
    );
  }
}

// POST: プロジェクトデータを保存
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rooms, furniture } = body;

    const projectData: ProjectData = {
      rooms,
      furniture,
      createdAt: new Date().toISOString(),
      version: '1.0.0',
    };

    await ensureDataDir();
    await writeFile(PROJECT_FILE, JSON.stringify(projectData, null, 2), 'utf-8');

    return NextResponse.json({ success: true, message: 'Project saved successfully' });
  } catch (error) {
    console.error('Failed to save project:', error);
    return NextResponse.json(
      { error: 'Failed to save project data' },
      { status: 500 }
    );
  }
}