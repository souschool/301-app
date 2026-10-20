import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, Subject } from "@/types";

// 科目別モックデータ
const MOCK_DATA: Record<Subject, AnalysisResult> = {
  数学: {
    subject: "数学",
    topic: "二次方程式",
    summary:
      "二次方程式の解き方には因数分解・平方完成・解の公式の3種類がある。判別式Dで解の個数を判定できる。",
    keyPoints: [
      {
        term: "解の公式",
        explanation: "ax²+bx+c=0 のとき x = (-b ± √(b²-4ac)) / 2a",
        examLikelihood: "高",
      },
      {
        term: "判別式",
        explanation: "D = b²-4ac。D>0 で異なる2実数解、D=0 で重解、D<0 で実数解なし",
        examLikelihood: "高",
      },
      {
        term: "因数分解による解法",
        explanation: "(x-α)(x-β)=0 の形に変形して x=α, x=β を求める",
        examLikelihood: "中",
      },
      {
        term: "平方完成",
        explanation: "ax²+bx+c を a(x+p)²+q の形に変形する方法",
        examLikelihood: "中",
      },
    ],
    formulas: [
      "x = (-b ± √(b²-4ac)) / 2a",
      "D = b²-4ac",
      "(x+a)(x+b) = x²+(a+b)x+ab",
    ],
  },
  国語: {
    subject: "国語",
    topic: "枕草子・随筆文学",
    summary:
      "清少納言による平安時代の随筆。「をかし」の美意識を基調とし、自然・人物・行事を鋭い観察眼で描く。",
    keyPoints: [
      {
        term: "をかし",
        explanation: "知的な面白さ・趣のある美しさを表す枕草子の中心概念",
        examLikelihood: "高",
      },
      {
        term: "清少納言",
        explanation: "平安中期の女流文学者。一条天皇の中宮定子に仕えた",
        examLikelihood: "高",
      },
      {
        term: "春はあけぼの",
        explanation: "有名な書き出し。季節ごとの美しい時間帯を列挙する形式",
        examLikelihood: "中",
      },
      {
        term: "随筆",
        explanation: "日常の出来事・感想・見聞を自由に書き記した文章形式",
        examLikelihood: "中",
      },
    ],
    formulas: [],
  },
  英語: {
    subject: "英語",
    topic: "現在完了形",
    summary:
      "現在完了形（have/has + 過去分詞）は「経験・継続・完了・結果」の4用法で使われ、現在との関連を表す。",
    keyPoints: [
      {
        term: "現在完了形の構造",
        explanation: "have/has + 過去分詞（past participle）",
        examLikelihood: "高",
      },
      {
        term: "経験用法 (experience)",
        explanation:
          "ever / never / once / before などと使う。例: I have never seen it.",
        examLikelihood: "高",
      },
      {
        term: "継続用法 (duration)",
        explanation:
          "for / since と使い、過去から現在まで続く状態を表す。例: She has lived here for 5 years.",
        examLikelihood: "高",
      },
      {
        term: "完了・結果用法 (completion)",
        explanation:
          "just / already / yet と使う。例: I have just finished my homework.",
        examLikelihood: "中",
      },
    ],
    formulas: [
      "have/has + 過去分詞",
      "疑問文: Have you ever ~?",
      "否定文: I have never ~",
    ],
  },
  理科: {
    subject: "理科",
    topic: "オームの法則と電気回路",
    summary:
      "電流・電圧・抵抗の関係を示すオームの法則。直列・並列回路での合成抵抗の求め方が重要。",
    keyPoints: [
      {
        term: "オームの法則",
        explanation: "電圧V = 電流I × 抵抗R の関係。V[V] = I[A] × R[Ω]",
        examLikelihood: "高",
      },
      {
        term: "直列回路の合成抵抗",
        explanation: "R = R₁ + R₂ + … 各抵抗の和になる",
        examLikelihood: "高",
      },
      {
        term: "並列回路の合成抵抗",
        explanation: "1/R = 1/R₁ + 1/R₂ + … 逆数の和の逆数",
        examLikelihood: "高",
      },
      {
        term: "電力",
        explanation: "P = V × I = I²R = V²/R 単位はワット[W]",
        examLikelihood: "中",
      },
    ],
    formulas: [
      "V = IR （オームの法則）",
      "直列: R合 = R₁ + R₂",
      "並列: 1/R合 = 1/R₁ + 1/R₂",
      "電力: P = VI",
    ],
  },
  社会: {
    subject: "社会",
    topic: "明治維新と近代化",
    summary:
      "1868年の明治維新により江戸幕府が倒れ、天皇中心の新政府が近代国家建設を推進。富国強兵・殖産興業が基本方針。",
    keyPoints: [
      {
        term: "富国強兵",
        explanation:
          "経済力強化（富国）と軍事力強化（強兵）を同時に進めた明治政府の基本方針",
        examLikelihood: "高",
      },
      {
        term: "廃藩置県（1871年）",
        explanation:
          "藩を廃止して府県を置き、中央集権体制を確立。地方の武士勢力を解体",
        examLikelihood: "高",
      },
      {
        term: "学制（1872年）",
        explanation: "全国に小学校を設置する近代的な教育制度。身分に関わらず就学義務",
        examLikelihood: "中",
      },
      {
        term: "岩倉使節団（1871〜73年）",
        explanation:
          "岩倉具視を正使とする欧米視察団。近代化の手本を学ぶとともに不平等条約改正を目指した",
        examLikelihood: "中",
      },
    ],
    formulas: [],
  },
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const subject = body?.subject as Subject | undefined;

  if (!subject || !(subject in MOCK_DATA)) {
    return NextResponse.json(
      { ok: false, error: "subject が不正です。" },
      { status: 400 }
    );
  }

  // 疑似的な処理時間（0.5秒）
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json({ ok: true, data: MOCK_DATA[subject] });
}
