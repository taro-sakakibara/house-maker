import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ProjectsData } from '@/types/project';

const PROJECTS_DIR = path.join(process.cwd(), 'data');
const PROJECTS_FILE = path.join(PROJECTS_DIR, 'projects.json');

// POSTメソッド: プロジェクトデータを保存
export async function POST(request: NextRequest) {
  try {
    const projectsData: ProjectsData = await request.json();

    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(PROJECTS_DIR)) {
      fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    }

    // プロジェクトデータをJSONファイルに保存
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projectsData, null, 2));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error saving projects:', error);
    return NextResponse.json(
      { error: 'Failed to save projects' },
      { status: 500 }
    );
  }
}

// GETメソッド: プロジェクトデータを読み込み
export async function GET() {
  try {
    // ファイルが存在しない場合
    if (!fs.existsSync(PROJECTS_FILE)) {
      return NextResponse.json(
        { error: 'Projects file not found' },
        { status: 404 }
      );
    }

    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    const projectsData: ProjectsData = JSON.parse(data);

    return NextResponse.json(projectsData, { status: 200 });
  } catch (error) {
    console.error('Error loading projects:', error);
    return NextResponse.json(
      { error: 'Failed to load projects' },
      { status: 500 }
    );
  }
}