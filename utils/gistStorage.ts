interface ProjectData {
  projects: any[];
  activeProjectId: string | null;
  version: string;
}

interface GistConfig {
  gistId: string;
  token: string;
  filename: string;
}

class GistStorage {
  private config: GistConfig | null = null;
  
  constructor() {
    // 環境変数からGist設定を取得
    if (typeof window !== 'undefined') {
      this.config = {
        gistId: process.env.NEXT_PUBLIC_GIST_ID || '',
        token: process.env.NEXT_PUBLIC_GITHUB_TOKEN || '',
        filename: 'projects.json'
      };
    }
  }

  /**
   * Gist API が利用可能かチェック
   */
  isAvailable(): boolean {
    return !!(this.config?.gistId && this.config?.token);
  }

  /**
   * GistからプロジェクトデータをロードSDSS
   */
  async loadData(): Promise<ProjectData | null> {
    if (!this.isAvailable()) {
      console.warn('Gist API not configured, falling back to local file');
      return null;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.config!.gistId}`, {
        headers: {
          'Authorization': `token ${this.config!.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const gist = await response.json();
      const fileContent = gist.files[this.config!.filename]?.content;
      
      if (!fileContent) {
        throw new Error(`File ${this.config!.filename} not found in gist`);
      }

      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Failed to load data from Gist:', error);
      return null;
    }
  }

  /**
   * プロジェクトデータをGistに保存
   */
  async saveData(data: ProjectData): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn('Gist API not configured, data not saved to cloud');
      return false;
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${this.config!.gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${this.config!.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            [this.config!.filename]: {
              content: JSON.stringify(data, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      console.log('Data successfully saved to Gist');
      return true;
    } catch (error) {
      console.error('Failed to save data to Gist:', error);
      return false;
    }
  }

  /**
   * 新しいGistを作成（初回セットアップ用）
   */
  async createGist(initialData: ProjectData): Promise<string | null> {
    if (!this.config?.token) {
      console.error('GitHub token not configured');
      return null;
    }

    try {
      const response = await fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Authorization': `token ${this.config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'House Maker - Project Data Storage',
          public: false, // プライベートGist
          files: {
            [this.config.filename]: {
              content: JSON.stringify(initialData, null, 2)
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const gist = await response.json();
      console.log('New Gist created:', gist.id);
      return gist.id;
    } catch (error) {
      console.error('Failed to create Gist:', error);
      return null;
    }
  }
}

// シングルトンインスタンス
export const gistStorage = new GistStorage();

// 開発環境判定ヘルパー
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};

// ローカルファイルフォールバック
export const loadFromLocalFile = async (): Promise<ProjectData | null> => {
  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) {
      throw new Error('Local file not found');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load local file:', error);
    return null;
  }
};