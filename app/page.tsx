"use client";

import { useMemo, useState } from "react";

type View = "archives" | "memory" | "evolution";

const records = [
  {
    date: "2026.08.08",
    issue: "NO. 003",
    title: "把零散想法变成可观看的数字档案",
    summary: "完成档案结构、视觉语言与公开展示链路，让每一次成长都有迹可循。",
    tags: ["体系构建", "公开展示"],
    accent: "mint",
    items: [
      ["能力", "叙事型网页", "将时间、事件与成果组织为清晰的浏览体验。"],
      ["记忆", "内容原则", "只记录产生实际变化的节点，保持档案有密度。"],
      ["进化", "从记录到表达", "记录不再只是备忘，而成为可分享的个人资产。"],
    ],
  },
  {
    date: "2026.07.26",
    issue: "NO. 002",
    title: "建立稳定的协作与复盘节奏",
    summary: "把目标、行动、证据和下一步串成闭环，减少重复沟通与无效尝试。",
    tags: ["协作方法", "流程升级"],
    accent: "violet",
    items: [
      ["记忆", "协作约定", "先对齐结果，再拆分任务；重要决定必须留下依据。"],
      ["进化", "责任闭环", "从完成动作升级到对最终结果负责。"],
    ],
  },
  {
    date: "2026.07.12",
    issue: "NO. 001",
    title: "共同档案馆正式启动",
    summary: "确定以时间线保存共同经历，以记忆与进化两条支线沉淀长期价值。",
    tags: ["起点", "档案体系"],
    accent: "amber",
    items: [
      ["能力", "档案建模", "建立事件、标签、能力与记忆的基础内容模型。"],
      ["进化", "持续积累", "从一次性交付转向长期可增长的内容系统。"],
    ],
  },
];

const memories = records.flatMap((r) => r.items.filter((i) => i[0] === "记忆").map((i) => ({ ...r, item: i })));
const evolutions = records.flatMap((r) => r.items.filter((i) => i[0] === "进化" || i[0] === "能力").map((i) => ({ ...r, item: i })));

export default function Home() {
  const [view, setView] = useState<View>("archives");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => records.filter((r) => `${r.title}${r.summary}${r.tags.join("")}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <main>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="返回顶部"><span className="brandmark">C</span><span>CO·ARCHIVE</span></a>
        <div className="live"><i /> ARCHIVE ONLINE</div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">A LIVING RECORD OF GROWTH</p>
        <h1>共同进化<br /><em>档案馆</em></h1>
        <p className="lead">记录人与伙伴之间真实发生的改变。<br />每一条档案，都是下一次出发的坐标。</p>
        <a className="scroll-link" href="#archive"><span>探索档案</span><b>↓</b></a>
      </section>

      <section className="stats" aria-label="档案数据">
        <div><strong>03</strong><span>成长档案</span></div>
        <div><strong>07</strong><span>能力与记忆</span></div>
        <div><strong>27</strong><span>共同进化日</span></div>
        <p>持续更新中<br /><small>LAST UPDATE · 08 AUG 2026</small></p>
      </section>

      <section className="archive" id="archive">
        <div className="section-head">
          <div><p className="eyebrow">THE COLLECTION</p><h2>浏览档案</h2></div>
          <label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索档案" aria-label="搜索档案" /></label>
        </div>

        <nav className="tabs" aria-label="档案视图">
          {(["archives", "memory", "evolution"] as View[]).map((v) => <button key={v} className={view === v ? "active" : ""} onClick={() => setView(v)}>{v === "archives" ? "全部档案" : v === "memory" ? "长期记忆" : "能力进化"}</button>)}
        </nav>

        {view === "archives" ? (
          <div className="timeline">
            {filtered.map((record) => <article className={`record ${record.accent}`} key={record.issue}>
              <div className="record-meta"><span>{record.date}</span><small>{record.issue}</small></div>
              <div className="record-body">
                <div className="tags">{record.tags.map((t) => <span key={t}>{t}</span>)}</div>
                <h3>{record.title}</h3><p>{record.summary}</p>
                <div className="details">{record.items.map((item) => <div key={item[1]}><b>{item[0]}</b><section><h4>{item[1]}</h4><p>{item[2]}</p></section></div>)}</div>
              </div>
            </article>)}
            {!filtered.length && <p className="empty">没有找到相关档案。</p>}
          </div>
        ) : (
          <div className="card-grid">{(view === "memory" ? memories : evolutions).map(({ date, item }, index) => <article className="insight" key={`${item[1]}${index}`}><span>{String(index + 1).padStart(2, "0")}</span><small>{date}</small><p>{item[0]}</p><h3>{item[1]}</h3><div>{item[2]}</div></article>)}</div>
        )}
      </section>

      <footer><div className="brand"><span className="brandmark">C</span><span>CO·ARCHIVE</span></div><p>成长不是一条直线，<br />但值得被认真保存。</p><small>© 2026 · BUILT FOR THE JOURNEY</small></footer>
    </main>
  );
}
