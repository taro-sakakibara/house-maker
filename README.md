# House Maker

3Dで間取りを設計し、家具を配置できる間取りプランニングアプリです。

## 機能

- 🏠 部屋の3D設計（四角形、L字型、U字型）
- 🪑 家具の配置・移動・回転・サイズ変更
- 💾 複数プロジェクトの管理
- 🌐 GitHub Pagesでのオンライン利用
- ☁️ GitHub Gistでのクラウドストレージ

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## GitHub Pagesへのデプロイ

### 1. 環境変数の設定

GitHub Gistを使用してプロジェクトデータを保存するために、環境変数を設定します。

1. **GitHub Personal Access Token の作成**
   - GitHub > Settings > Developer settings > Personal access tokens > Generate new token
   - Scopes: **"gist"** を選択
   - トークンをコピー

2. **リポジトリのSecrets設定**
   - リポジトリ > Settings > Secrets and variables > Actions
   - **New repository secret** をクリック
   - 以下の変数を追加：
     ```
     NEXT_PUBLIC_GITHUB_TOKEN=your_personal_access_token_here
     NEXT_PUBLIC_GIST_ID=your_gist_id_here (初回は空でOK)
     ```

### 2. GitHub Pagesの有効化

1. リポジトリ > Settings > Pages
2. Source: **GitHub Actions** を選択

### 3. デプロイ実行

- `main` ブランチにプッシュすると自動的にビルド・デプロイが実行されます
- 初回実行時にGist IDがコンソールに出力されるので、環境変数に設定してください

### 開発環境 vs 本番環境

- **開発環境**: `data/projects.json` ファイルを使用
- **本番環境**: GitHub Gist APIを使用してクラウドストレージ
