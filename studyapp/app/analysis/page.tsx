"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { AnalysisResult, KeyPoint } from "@/types";
import { subjectConfig } from "@/lib/subjectColors";

export default function AnalysisPage() {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("analysisResult");
    if (!raw) {
      router.replace("/");
      return;
    }
    setAnalysis(JSON.parse(raw) as AnalysisResult);
  }, [router]);

  if (!analysis) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        読み込み中…
      </div>
    );
  }

  const cfg = subjectConfig[analysis.subject];

  // --- keyPoints 編集 ---
  const updateKeyPoint = (index: number, updated: KeyPoint) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const kps = [...prev.keyPoints];
      kps[index] = updated;
      return { ...prev, keyPoints: kps };
    });
  };

  const deleteKeyPoint = (index: number) => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const kps = prev.keyPoints.filter((_, i) => i !== index);
      return { ...prev, keyPoints: kps };
    });
  };

  const addKeyPoint = () => {
    setAnalysis((prev) => {
      if (!prev) return prev;
      const newKp: KeyPoint = { term: "", explanation: "", examLikelihood: "中" };
      return { ...prev, keyPoints: [...prev.keyPoints, newKp] };
    });
  };

  // --- 問題生成 ---
  const handleGenerate = async () => {
    if (!analysis) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: analysis.subject, analysis }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error ?? "問題生成に失敗しました。");
        return;
      }
      sessionStorage.setItem("questions", JSON.stringify(json.data));
      sessionStorage.setItem("analysisResult", JSON.stringify(analysis));
      router.push("/test");
    } catch (e) {
      setError(e instanceof Error ? e.message : "予期しないエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const likelihoodColor = {
    高: "bg-red-100 text-red-700",
    中: "bg-yellow-100 text-yellow-700",
    低: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className={`rounded-xl p-4 ${cfg.bgLight} border-2 ${cfg.border}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
            {analysis.subject}
          </span>
          <h1 className="text-xl font-bold">{analysis.topic}</h1>
        </div>
        <p className="text-sm text-gray-700">{analysis.summary}</p>
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-500 border border-gray-200 rounded-lg p-3 bg-white">
        ※出題可能性はAIの推測であり、実際の試験を予測するものではありません
      </p>

      {/* 重要ポイント */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">重要ポイント</h2>
          <button
            onClick={addKeyPoint}
            className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition font-medium"
          >
            ＋ 追加
          </button>
        </div>
        <ul className="space-y-3">
          {analysis.keyPoints.map((kp, i) => (
            <li key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex gap-2">
                <input
                  value={kp.term}
                  onChange={(e) => updateKeyPoint(i, { ...kp, term: e.target.value })}
                  placeholder="用語・概念名"
                  className="flex-1 font-semibold border-b border-gray-300 focus:outline-none focus:border-indigo-400 bg-transparent text-base"
                />
                <span className={`text-xs font-bold px-2 py-1 rounded-full shrink-0 self-start ${likelihoodColor[kp.examLikelihood]}`}>
                  出題{kp.examLikelihood}
                </span>
              </div>
              <textarea
                value={kp.explanation}
                onChange={(e) => updateKeyPoint(i, { ...kp, explanation: e.target.value })}
                placeholder="説明"
                rows={2}
                className="w-full text-sm text-gray-700 border-b border-gray-200 focus:outline-none focus:border-indigo-400 bg-transparent resize-none"
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-gray-500">出題可能性:</span>
                  {(["高", "中", "低"] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => updateKeyPoint(i, { ...kp, examLikelihood: l })}
                      className={`text-xs px-2 py-1 rounded-full font-bold transition ${
                        kp.examLikelihood === l
                          ? likelihoodColor[l] + " ring-1 ring-current"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => deleteKeyPoint(i)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 公式・重要表現 */}
      {analysis.formulas.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">公式・重要表現</h2>
          <ul className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
            {analysis.formulas.map((f, i) => (
              <li key={i} className="px-4 py-3 font-mono text-sm text-gray-800">
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl p-4 flex items-start gap-2">
          <span>⚠️</span>
          <div>
            <p>{error}</p>
            <button
              onClick={handleGenerate}
              className="mt-2 text-sm underline hover:no-underline"
            >
              再試行
            </button>
          </div>
        </div>
      )}

      {/* 問題生成ボタン */}
      <button
        onClick={handleGenerate}
        disabled={loading || analysis.keyPoints.length === 0}
        className="w-full py-4 rounded-xl font-bold text-lg bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            問題を生成中…数十秒かかる場合があります
          </span>
        ) : (
          "✏️ この内容で問題を作る"
        )}
      </button>
    </div>
  );
}
