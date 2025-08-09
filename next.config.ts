import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 静的サイト生成
  trailingSlash: true, // GitHub Pages対応
  images: {
    unoptimized: true, // 静的エクスポート時の画像最適化無効
  },
  // GitHub Pagesのベースパスを設定（リポジトリ名がURLに含まれる場合）
  // basePath: '/house-maker', // 必要に応じてコメントアウト解除
  // eslint: {
  //   // GitHub Pages デプロイ時はESLintエラーを無視
  //   ignoreDuringBuilds: true,
  // },
  // typescript: {
  //   // GitHub Pages デプロイ時はTypeScriptエラーを無視
  //   ignoreBuildErrors: true,
  // },
};

export default nextConfig;
