"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Question, AnalysisResult, NoteSet } from "@/types";
import { subjectConfig } from "@/lib/subjectColors";
import { saveNoteSet } from "@/lib/storage";

type AnswerState =
  | { status: "unanswered" }
  | { status: "answered"; userAnswer: string; correct: boolean };

function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function TestPage() {
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryIndices, setRetryIndices] = useState<number[]>([]);
  const [retryIndex, setRetryIndex] = useState(0);

  useEffect(() => {
    const rawQ = sessionStorage.getItem("questions");
    const rawA = sessionStorage.getItem("analysisResult");

    if (!rawQ || !rawA) {
      router.replace("/");
      return;
    }

    const qs = JSON.parse(rawQ) as Question[];
    const a = JSON.parse(rawA) as AnalysisResult;
    setQuestions(qs);
    setAnalysis(a);
    setAnswers(qs.map(() => ({ status: "unanswered" })));

    // 新規生成の場合のみ localStorage に学習セットを保存
    const isExisting = sessionStorage.getItem("isExistingSet") === "true";
    if (!isExisting) {
      const noteSet: NoteSet = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        subject: a.subject,
        analysis: a,
        questions: qs,
      };
      saveNoteSet(noteSet);
    }
    sessionStorage.removeItem("isExistingSet");
  }, [router]);

  if (!analysis || questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        読み込み中…
      </div>
    );
  }

  const cfg = subjectConfig[analysis.subject];

  // 表示対象インデックス
  const activeIndices = retryMode ? retryIndices : questions.map((_, i) => i);
  const activeIndex = retryMode ? retryIndices[retryIndex] : currentIndex;
  const activeCurrent = retryMode ? retryIndex : currentIndex;
  const activeTotal = activeIndices.length;
  const question = questions[activeIndex];
  const answer = answers[activeIndex];

  const progress = activeCurrent / activeTotal;

  // 選択式回答
  const handleChoice = (choice: string) => {
    if (answer.status !== "unanswered") return;
    const correct = choice === question.answer;
    setAnswers((prev) => {
      const next = [...prev];
      next[activeIndex] = { status: "answered", userAnswer: choice, correct };
      return next;
    });
  };

  // 一問一答・記述: 答えを見る
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // 自己採点
  const handleSelfJudge = (correct: boolean) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[activeIndex] = {
        status: "answered",
        userAnswer: inputValue,
        correct,
      };
      return next;
    });
    setShowAnswer(false);
    setInputValue("");
  };

  // 次の問題へ
  const handleNext = () => {
    const nextActive = activeCurrent + 1;
    if (nextActive >= activeTotal) {
      setFinished(true);
      return;
    }
    setShowAnswer(false);
    setInputValue("");
    if (retryMode) {
      setRetryIndex(nextActive);
    } else {
      setCurrentIndex(nextActive);
    }
  };

  // 間違えた問題だけ再挑戦
  const handleRetry = () => {
    const wrongIndices = answers
      .map((a, i) => ({ a, i }))
      .filter((x) => x.a.status === "answered" && !x.a.correct)
      .map((x) => x.i);

    if (wrongIndices.length === 0) return;

    // リセット
    setAnswers((prev) => {
      const next = [...prev];
      wrongIndices.forEach((i) => {
        next[i] = { status: "unanswered" };
      });
      return next;
    });
    setRetryIndices(wrongIndices);
    setRetryIndex(0);
    setRetryMode(true);
    setFinished(false);
    setShowAnswer(false);
    setInputValue("");
  };

  // --- 結果画面 ---
  if (finished) {
    const correctCount = answers.filter(
      (a) => a.status === "answered" && a.correct
    ).length;
    const total = questions.length;
    const wrongList = questions.filter((_, i) => {
      const a = answers[i];
      return a.status === "answered" && !a.correct;
    });

    return (
      <div className="space-y-6">
        <div className={`rounded-xl p-6 text-center ${cfg.bgLight} border-2 ${cfg.border}`}>
          <p className="text-4xl font-black mb-2">
            {correctCount} / {total}
          </p>
          <p className="text-lg font-semibold text-gray-700">正解</p>
        </div>

        {wrongList.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-3">間違えた問題</h2>
            <ul className="space-y-3">
              {wrongList.map((q) => (
                <li key={q.id} className="bg-white border border-red-200 rounded-xl p-4">
                  <p className="font-semibold text-sm mb-1 text-red-700">{q.question}</p>
                  <p className="text-xs text-gray-600">
                    正解: <span className="font-bold">{q.answer}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{q.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="flex flex-col gap-3">
          {wrongList.length > 0 && (
            <button
              onClick={handleRetry}
              className="w-full py-4 rounded-xl font-bold text-lg bg-red-500 text-white hover:bg-red-600 transition shadow-md"
            >
              🔁 間違えた問題だけ再挑戦
            </button>
          )}
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 rounded-xl font-bold text-base bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  // --- 問題画面 ---
  const isAnswered = answer.status === "answered";
  const isCorrect = isAnswered && answer.correct;

  return (
    <div className="space-y-5">
      {/* 進捗 */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>
            {activeCurrent + 1} / {activeTotal} 問
          </span>
          <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${cfg.badge}`}>
            {question.type}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${cfg.bg}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* 問題文 */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <p className="text-base font-semibold leading-relaxed whitespace-pre-wrap">{question.question}</p>
      </div>

      {/* 選択式 */}
      {question.type === "選択式" && question.choices && (
        <div className="grid grid-cols-1 gap-3">
          {question.choices.map((c, ci) => {
            let style = "bg-white border border-gray-200 text-gray-800 hover:border-indigo-400 hover:bg-indigo-50";
            if (isAnswered) {
              if (c === question.answer) {
                style = "bg-green-50 border-2 border-green-500 text-green-800";
              } else if (
                answer.status === "answered" &&
                answer.userAnswer === c
              ) {
                style = "bg-red-50 border-2 border-red-400 text-red-700";
              } else {
                style = "bg-gray-50 border border-gray-200 text-gray-400";
              }
            }
            return (
              <button
                key={ci}
                onClick={() => handleChoice(c)}
                disabled={isAnswered}
                className={`w-full py-4 px-5 rounded-xl text-left text-base transition font-medium ${style} disabled:cursor-default`}
              >
                {ci + 1}. {c}
              </button>
            );
          })}
        </div>
      )}

      {/* 一問一答・記述 */}
      {(question.type === "一問一答" || question.type === "記述") && (
        <div className="space-y-3">
          {!showAnswer && !isAnswered && (
            <>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="解答を入力してください"
                rows={question.type === "記述" ? 4 : 2}
                className="w-full border border-gray-300 rounded-xl p-3 text-base focus:outline-none focus:border-indigo-400 resize-none"
              />
              <button
                onClick={handleShowAnswer}
                className="w-full py-3 rounded-xl font-bold text-base bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                答えを見る
              </button>
            </>
          )}

          {showAnswer && !isAnswered && (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-300 rounded-xl p-4">
                <p className="text-xs font-bold text-green-700 mb-1">模範解答</p>
                <p className="text-base font-semibold text-green-900 whitespace-pre-wrap">
                  {question.answer}
                </p>
              </div>
              {inputValue && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1">あなたの解答</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{inputValue}</p>
                </div>
              )}
              <p className="text-sm font-bold text-gray-600 text-center">正解でしたか？</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelfJudge(true)}
                  className="py-3 rounded-xl font-bold bg-green-500 text-white hover:bg-green-600 transition text-base"
                >
                  ○ 正解
                </button>
                <button
                  onClick={() => handleSelfJudge(false)}
                  className="py-3 rounded-xl font-bold bg-red-400 text-white hover:bg-red-500 transition text-base"
                >
                  × 不正解
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 判定・解説（選択式・回答後） */}
      {isAnswered && (
        <div className={`rounded-xl p-4 border ${isCorrect ? "bg-green-50 border-green-300" : "bg-red-50 border-red-300"}`}>
          <p className={`font-bold text-base mb-2 ${isCorrect ? "text-green-700" : "text-red-600"}`}>
            {isCorrect ? "✅ 正解！" : "❌ 不正解"}
          </p>
          {!isCorrect && question.type === "選択式" && (
            <p className="text-sm mb-1 text-gray-700">
              正解: <span className="font-bold">{question.answer}</span>
            </p>
          )}
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{question.explanation}</p>
        </div>
      )}

      {/* 次へ */}
      {isAnswered && (
        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-xl font-bold text-lg ${cfg.bg} text-white hover:opacity-90 transition shadow-md`}
        >
          {activeCurrent + 1 >= activeTotal ? "結果を見る 🎉" : "次の問題へ →"}
        </button>
      )}
    </div>
  );
}
