"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Subject, NoteSet } from "@/types";
import { subjectConfig } from "@/lib/subjectColors";
import { resizeAndEncodeImage } from "@/lib/imageUtils";
import { loadNoteSets, deleteNoteSet } from "@/lib/storage";

const SUBJECTS: Subject[] = ["国語", "数学", "英語", "理科", "社会"];
const MAX_IMAGES = 4;

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [subject, setSubject] = useState<Subject | null>(null);
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [noteSets, setNoteSets] = useState<NoteSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNoteSets(loadNoteSets());
  }, []);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const remaining = MAX_IMAGES - previews.length;
      const newFiles = Array.from(files).slice(0, remaining);
      const newPreviews = newFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
    },
    [previews.length]
  );

  const removeImage = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAnalyze = async () => {
    if (!subject) {
      setError("科目を選択してください。");
      return;
    }
    if (previews.length === 0) {
      setError("画像を1枚以上選択してください。");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const images = await Promise.all(
        previews.map((p) => resizeAndEncodeImage(p.file))
      );

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, images }),
      });

      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "分析に失敗しました。");
        return;
      }

      // 分析結果をsessionStorageに一時保存してリダイレクト
      sessionStorage.setItem("analysisResult", JSON.stringify(json.data));
      router.push("/analysis");
    } catch (e) {
      setError(e instanceof Error ? e.message : "予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteNoteSet(id);
    setNoteSets(loadNoteSets());
  };

  const handleStartTest = (noteSet: NoteSet) => {
    sessionStorage.setItem("questions", JSON.stringify(noteSet.questions));
    sessionStorage.setItem("analysisResult", JSON.stringify(noteSet.analysis));
    sessionStorage.setItem("isExistingSet", "true");
    router.push("/test");
  };

  return (
    <div className="space-y-8">
      {/* 科目選択 */}
      <section>
        <h2 className="text-lg font-bold mb-3">① 科目を選ぶ</h2>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => {
            const cfg = subjectConfig[s];
            const isSelected = subject === s;
            return (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-5 py-3 rounded-xl font-bold text-base border-2 transition-all min-w-[80px] ${
                  isSelected
                    ? `${cfg.bg} text-white ${cfg.border} shadow-md scale-105`
                    : `bg-white ${cfg.text} ${cfg.border} hover:${cfg.bgLight}`
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>

      {/* 画像入力 */}
      <section>
        <h2 className="text-lg font-bold mb-3">② ノートの写真を選ぶ（最大4枚）</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={previews.length >= MAX_IMAGES}
          className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
        >
          <span className="text-2xl">📷</span>
          写真を選択 / カメラで撮影
        </button>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {previews.map((p, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={`ノート画像 ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-black/80"
                  aria-label="この画像を削除"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <p>{error}</p>
            <button
              onClick={handleAnalyze}
              className="mt-2 text-sm underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        </div>
      )}

      {/* 分析ボタン */}
      <button
        onClick={handleAnalyze}
        disabled={loading || !subject || previews.length === 0}
        className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            分析中です…数十秒かかる場合があります
          </span>
        ) : (
          "📖 分析する"
        )}
      </button>

      {/* 過去の学習セット */}
      {noteSets.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">過去の学習セット</h2>
          <ul className="space-y-3">
            {noteSets.map((ns) => {
              const cfg = subjectConfig[ns.subject];
              const date = new Date(ns.createdAt).toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              return (
                <li
                  key={ns.id}
                  className={`bg-white rounded-xl border-2 ${cfg.border} p-4 flex flex-col sm:flex-row sm:items-center gap-3`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {ns.subject}
                      </span>
                      <span className="font-semibold truncate">{ns.analysis.topic}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{date}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleStartTest(ns)}
                      className={`px-4 py-2 rounded-lg font-bold text-sm ${cfg.bg} text-white hover:opacity-90 transition`}
                    >
                      問題を解く
                    </button>
                    <button
                      onClick={() => handleDelete(ns.id)}
                      className="px-4 py-2 rounded-lg font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition"
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
