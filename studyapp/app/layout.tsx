import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ノート分析・学習支援",
  description: "板書ノートをAIが分析し、重要ポイント抽出と対策問題を生成します",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span className="font-bold text-lg tracking-tight">ノート分析・学習支援</span>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
