import { NextRequest, NextResponse } from "next/server";
import type { AnalysisResult, Question, Subject } from "@/types";

// 科目別モック問題セット
const MOCK_QUESTIONS: Record<Subject, Question[]> = {
  数学: [
    { id: "q1", type: "一問一答", question: "二次方程式 x²-5x+6=0 を解け。", answer: "x=2, x=3", explanation: "因数分解すると (x-2)(x-3)=0 となり、x=2 または x=3" },
    { id: "q2", type: "一問一答", question: "判別式 D=b²-4ac において D<0 のとき、解は何個か。", answer: "0個（実数解なし）", explanation: "D<0 は平方根の中が負になるため、実数の解は存在しない" },
    { id: "q3", type: "一問一答", question: "x²-4=0 の解を求めよ。", answer: "x=2, x=-2", explanation: "x²=4 より x=±2" },
    { id: "q4", type: "一問一答", question: "解の公式で使う判別式を D とするとき、D を a, b, c で表せ。", answer: "D = b²-4ac", explanation: "ax²+bx+c=0 の解の公式の根号内が判別式" },
    { id: "q5", type: "選択式", question: "二次方程式 x²+2x-3=0 の解はどれか。", choices: ["x=1, x=-3", "x=-1, x=3", "x=2, x=-3", "x=1, x=3"], answer: "x=1, x=-3", explanation: "(x+3)(x-1)=0 より x=-3 または x=1" },
    { id: "q6", type: "選択式", question: "x²-6x+9=0 の解の種類はどれか。", choices: ["異なる2実数解", "重解", "実数解なし", "虚数解2つ"], answer: "重解", explanation: "D = 36-36 = 0 なので重解。x=3（重解）" },
    { id: "q7", type: "選択式", question: "x²+1=0 の解の個数はいくつか。", choices: ["0個", "1個", "2個", "3個"], answer: "0個", explanation: "D = 0-4 = -4 < 0 なので実数解なし" },
    { id: "q8", type: "選択式", question: "2x²-3x+1=0 を解いたとき、正しいものはどれか。", choices: ["x=1, x=1/2", "x=-1, x=-1/2", "x=1, x=-1/2", "x=2, x=1"], answer: "x=1, x=1/2", explanation: "(2x-1)(x-1)=0 より x=1/2 または x=1" },
    { id: "q9", type: "記述", question: "解の公式を用いて x²-3x+1=0 を解け（途中式も示せ）。", answer: "x = (3 ± √5) / 2", explanation: "a=1, b=-3, c=1 を代入。D=9-4=5。x=(3±√5)/2" },
    { id: "q10", type: "記述", question: "二次方程式 x²+bx+4=0 が重解をもつとき、b の値を求めよ。", answer: "b=4 または b=-4", explanation: "重解条件は D=0。b²-16=0 より b=±4" },
  ],
  国語: [
    { id: "q1", type: "一問一答", question: "『枕草子』の作者は誰か。", answer: "清少納言", explanation: "平安中期の女流文学者。一条天皇の中宮定子に仕えた" },
    { id: "q2", type: "一問一答", question: "枕草子の中心となる美意識を一語で答えよ。", answer: "をかし", explanation: "知的で趣のある面白さを表す概念。源氏物語の「もののあはれ」と対比される" },
    { id: "q3", type: "一問一答", question: "「春はあけぼの」に続く季節と時間帯を答えよ（夏）。", answer: "夏は夜", explanation: "夏は夜が美しいとされ、月のある夜や蛍の光が描かれる" },
    { id: "q4", type: "一問一答", question: "「随筆」とはどのような文学形式か。", answer: "日常の見聞・感想を自由に書き記した文章", explanation: "随筆の三大作品：枕草子・徒然草・方丈記" },
    { id: "q5", type: "選択式", question: "枕草子が書かれた時代はいつか。", choices: ["奈良時代", "平安時代", "鎌倉時代", "室町時代"], answer: "平安時代", explanation: "清少納言は平安中期（966年頃〜1025年頃）の人物" },
    { id: "q6", type: "選択式", question: "「もののあはれ」を基調とする作品はどれか。", choices: ["枕草子", "源氏物語", "徒然草", "方丈記"], answer: "源氏物語", explanation: "紫式部による源氏物語が「もののあはれ」の代表。枕草子は「をかし」" },
    { id: "q7", type: "選択式", question: "枕草子の文学ジャンルはどれか。", choices: ["物語", "随筆", "日記", "和歌集"], answer: "随筆", explanation: "日本最初の随筆文学とされる。日記文学とは異なる" },
    { id: "q8", type: "選択式", question: "清少納言が仕えたのは誰か。", choices: ["一条天皇", "中宮定子", "藤原道長", "紫式部"], answer: "中宮定子", explanation: "一条天皇の中宮（皇后）定子に女房として仕えた" },
    { id: "q9", type: "記述", question: "「春はあけぼの」の意味と、なぜその時間帯が美しいとされるかを説明せよ。", answer: "春は夜明け方が趣深い。山の端が明るくなり、紫がかった雲がたなびく様子が美しい。", explanation: "あけぼの＝夜明け。空が段階的に明るくなるグラデーションの美しさを表現" },
    { id: "q10", type: "記述", question: "「をかし」と「もののあはれ」の違いを説明せよ。", answer: "をかしは知的・明朗な美意識（枕草子）、もののあはれは感傷的・情緒的な美意識（源氏物語）", explanation: "作者の性格も反映：清少納言の機智 vs 紫式部の感受性" },
  ],
  英語: [
    { id: "q1", type: "一問一答", question: "現在完了形の基本構造を答えよ。", answer: "have/has + 過去分詞", explanation: "主語が三人称単数のときは has を使う" },
    { id: "q2", type: "一問一答", question: "「私は一度も富士山に登ったことがない」を英語にせよ。", answer: "I have never climbed Mt. Fuji.", explanation: "経験用法。never は have と過去分詞の間に置く" },
    { id: "q3", type: "一問一答", question: "継続用法でよく使われる前置詞2つを答えよ。", answer: "for と since", explanation: "for + 期間（for 3 years）、since + 起点（since 2020）" },
    { id: "q4", type: "一問一答", question: "「彼女はちょうど宿題を終えた」を英語にせよ。", answer: "She has just finished her homework.", explanation: "完了用法。just は have と過去分詞の間に置く" },
    { id: "q5", type: "選択式", question: "「あなたは今までに寿司を食べたことがありますか？」の英文として正しいのはどれか。", choices: ["Did you ever eat sushi?", "Have you ever eaten sushi?", "Do you ever eat sushi?", "Were you ever eating sushi?"], answer: "Have you ever eaten sushi?", explanation: "経験用法の疑問文。Have you ever + 過去分詞の形" },
    { id: "q6", type: "選択式", question: "次の空欄に入る語として正しいのはどれか。She has lived here ___ 2019.", choices: ["for", "since", "during", "from"], answer: "since", explanation: "2019（起点・時点）なので since。for は期間（3 years など）に使う" },
    { id: "q7", type: "選択式", question: "「彼はもう昼食を食べましたか？」の英文はどれか。", choices: ["Has he eaten lunch yet?", "Did he eat lunch yet?", "Has he eaten lunch already?", "Have he eaten lunch yet?"], answer: "Has he eaten lunch yet?", explanation: "疑問文・否定文では yet を使う。already は肯定文" },
    { id: "q8", type: "選択式", question: "「私は3年間日本語を勉強しています」の英文はどれか。", choices: ["I studied Japanese for 3 years.", "I have studied Japanese for 3 years.", "I am studying Japanese for 3 years.", "I was studying Japanese for 3 years."], answer: "I have studied Japanese for 3 years.", explanation: "過去から現在まで続く継続用法。for 3 years と共に現在完了を使う" },
    { id: "q9", type: "記述", question: "次の文を現在完了形を使って英語にせよ。「私はその映画を2回見たことがある。」", answer: "I have seen the movie twice.", explanation: "経験用法。twice（2回）は文末に置く" },
    { id: "q10", type: "記述", question: "for と since の違いを例文を挙げて説明せよ。", answer: "for は期間（for two years）、since は起点（since Monday）。例: I have lived here for 5 years. / I have lived here since 2019.", explanation: "for は長さ、since は始まりの時点を示す" },
  ],
  理科: [
    { id: "q1", type: "一問一答", question: "オームの法則を式で答えよ。", answer: "V = IR（電圧＝電流×抵抗）", explanation: "V[V]、I[A]、R[Ω]の関係。変形するとI=V/R、R=V/I" },
    { id: "q2", type: "一問一答", question: "直列回路で抵抗R₁=3Ω、R₂=5Ω のとき合成抵抗はいくらか。", answer: "8Ω", explanation: "直列の合成抵抗は和: R=R₁+R₂=3+5=8Ω" },
    { id: "q3", type: "一問一答", question: "電力の単位は何か。", answer: "ワット（W）", explanation: "電力P=VI=I²R=V²/R で計算する" },
    { id: "q4", type: "一問一答", question: "並列回路では、各抵抗にかかる電圧はどうなるか。", answer: "すべて等しい（同じ電圧がかかる）", explanation: "並列回路では電圧は共通。電流は抵抗の逆比に分かれる" },
    { id: "q5", type: "選択式", question: "10Vの電圧を2Ωの抵抗に加えると電流は何Aか。", choices: ["5A", "20A", "0.2A", "8A"], answer: "5A", explanation: "I=V/R=10/2=5A" },
    { id: "q6", type: "選択式", question: "並列回路の合成抵抗の求め方はどれか。", choices: ["R=R₁+R₂", "1/R=1/R₁+1/R₂", "R=R₁×R₂", "R=R₁-R₂"], answer: "1/R=1/R₁+1/R₂", explanation: "並列では逆数の和の逆数が合成抵抗" },
    { id: "q7", type: "選択式", question: "2Aの電流が流れる5Ωの抵抗で消費される電力はいくらか。", choices: ["10W", "2.5W", "20W", "7W"], answer: "20W", explanation: "P=I²R=2²×5=4×5=20W" },
    { id: "q8", type: "選択式", question: "直列回路の電流について正しいものはどれか。", choices: ["各部分で電流は異なる", "回路のどこでも電流は等しい", "抵抗が大きいほど電流が大きい", "電圧が小さいほど電流が大きい"], answer: "回路のどこでも電流は等しい", explanation: "直列回路では電流は一定。電圧が各抵抗に分かれる" },
    { id: "q9", type: "記述", question: "抵抗4Ωと6Ωを並列につないだ合成抵抗を求め、計算過程も示せ。", answer: "2.4Ω", explanation: "1/R=1/4+1/6=3/12+2/12=5/12 より R=12/5=2.4Ω" },
    { id: "q10", type: "記述", question: "オームの法則を使って、20Vの電圧源に8Ωの抵抗をつないだときの電流と消費電力を求めよ。", answer: "電流 I=2.5A、消費電力 P=50W", explanation: "I=V/R=20/8=2.5A、P=VI=20×2.5=50W" },
  ],
  社会: [
    { id: "q1", type: "一問一答", question: "明治維新が始まった年はいつか。", answer: "1868年", explanation: "江戸幕府が倒れ、明治新政府が成立した年" },
    { id: "q2", type: "一問一答", question: "明治政府の基本方針を2つ答えよ。", answer: "富国強兵・殖産興業", explanation: "経済力と軍事力の強化（富国強兵）、近代産業の育成（殖産興業）" },
    { id: "q3", type: "一問一答", question: "1871年に行われた地方制度の改革を何というか。", answer: "廃藩置県", explanation: "藩を廃止して府県を設置し、中央集権体制を確立した" },
    { id: "q4", type: "一問一答", question: "岩倉使節団の正使（代表）は誰か。", answer: "岩倉具視", explanation: "1871〜73年に欧米を視察。近代化の手本を学び、不平等条約改正も目指した" },
    { id: "q5", type: "選択式", question: "学制が公布された年はいつか。", choices: ["1868年", "1871年", "1872年", "1889年"], answer: "1872年", explanation: "全国に小学校を設置する近代的教育制度。身分に関わらず就学が求められた" },
    { id: "q6", type: "選択式", question: "富国強兵の「富国」が意味するのはどれか。", choices: ["軍事力の強化", "経済力の強化", "外交力の強化", "文化力の強化"], answer: "経済力の強化", explanation: "富国＝豊かな国＝経済力強化。強兵＝強い軍隊＝軍事力強化" },
    { id: "q7", type: "選択式", question: "廃藩置県の目的として最も適切なものはどれか。", choices: ["外国との貿易拡大", "中央集権体制の確立", "農民の生活向上", "仏教の普及"], answer: "中央集権体制の確立", explanation: "藩（地方の武士政権）を廃止して、政府が直接支配する府県を置いた" },
    { id: "q8", type: "選択式", question: "明治政府が近代化を進めた理由として最も重要なものはどれか。", choices: ["欧米文化への憧れ", "欧米列強に対抗するため", "江戸文化の否定", "農業生産の向上"], answer: "欧米列強に対抗するため", explanation: "欧米に植民地化されないよう、軍事・経済力を急速に強化する必要があった" },
    { id: "q9", type: "記述", question: "廃藩置県が中央集権体制の確立に必要だった理由を説明せよ。", answer: "各藩が独自の支配権を持っていたため、国家として統一的な政策を実施できなかった。廃藩置県により政府が全国を直接支配できるようになった。", explanation: "江戸時代は約260の藩が存在し、それぞれが独立した行政・財政・軍事を持っていた" },
    { id: "q10", type: "記述", question: "岩倉使節団派遣の目的を2つ挙げ、その結果を説明せよ。", answer: "目的：①欧米の近代化を視察・学習 ②不平等条約の改正交渉。結果：条約改正は失敗したが、帰国後に近代化政策（学制・地租改正など）が加速した。", explanation: "使節団には伊藤博文・大久保利通など明治の指導者が多く参加した" },
  ],
};

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const subject = body?.subject as Subject | undefined;
  const analysis = body?.analysis as AnalysisResult | undefined;

  if (!subject || !analysis) {
    return NextResponse.json(
      { ok: false, error: "subject と analysis は必須です。" },
      { status: 400 }
    );
  }

  if (!(subject in MOCK_QUESTIONS)) {
    return NextResponse.json(
      { ok: false, error: "subject が不正です。" },
      { status: 400 }
    );
  }

  // 疑似的な処理時間（0.5秒）
  await new Promise((r) => setTimeout(r, 500));

  return NextResponse.json({ ok: true, data: MOCK_QUESTIONS[subject] });
}
