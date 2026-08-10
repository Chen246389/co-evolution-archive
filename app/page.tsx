"use client";

import { useMemo, useState } from "react";

type View = "projects" | "tasks" | "progress" | "skills";

const projects = [
  {
    date: "2026.08",
    issue: "PROJECT 03",
    title: "求职展示型成长档案馆",
    summary: "把长期协作、工程判断与交付结果组织成招聘方可以快速理解的公开作品。",
    tags: ["产品设计", "公开部署", "隐私治理"],
    outcome: "完成从需求分析、信息架构到公开上线的闭环。",
    tasks: ["拆解参考产品的核心逻辑", "建立项目 / 任务 / 进程三层结构", "完成响应式页面与公开发布"],
    progress: "从“展示结果”升级为“同时展示判断过程与成长证据”。",
    skills: ["信息架构", "前端实现", "产品叙事"],
  },
  {
    date: "2026.07",
    issue: "PROJECT 02",
    title: "人机协作工作流标准化",
    summary: "建立目标、行动、证据、复盘四步闭环，让复杂任务的推进状态清晰可追踪。",
    tags: ["流程设计", "AI 协作"],
    outcome: "形成可复用的任务执行框架，降低重复沟通成本。",
    tasks: ["定义任务完成标准", "设计进度检查点", "记录关键决策及依据"],
    progress: "从按指令执行，进化为围绕最终结果主动推进。",
    skills: ["任务拆解", "证据决策", "复盘优化"],
  },
  {
    date: "2026.06",
    issue: "PROJECT 01",
    title: "个人能力档案体系从零搭建",
    summary: "将零散经历转化为可积累、可检索、可验证的职业能力资产。",
    tags: ["体系构建", "知识管理"],
    outcome: "建立项目、能力、记忆与进化节点的统一归档标准。",
    tasks: ["定义归档字段", "区分事实记录与能力提升", "建立更新规则"],
    progress: "从零散笔记转向结构化职业档案。",
    skills: ["系统思维", "内容建模", "长期主义"],
  },
];

const views: { id: View; label: string; note: string }[] = [
  { id: "projects", label: "项目档案", note: "完整成果" },
  { id: "tasks", label: "任务执行", note: "具体行动" },
  { id: "progress", label: "成长进程", note: "能力变化" },
  { id: "skills", label: "能力图谱", note: "职业价值" },
];

export default function Home() {
  const [view, setView] = useState<View>("projects");
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => projects.filter((p) => JSON.stringify(p).toLowerCase().includes(query.toLowerCase())), [query]);
  const skillSet = [...new Set(projects.flatMap((p) => p.skills))];

  return <main>
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <header className="topbar">
      <a className="brand" href="#top" aria-label="返回顶部"><span className="brandmark">E</span><span>EVOLUTION FILE</span></a>
      <div className="privacy"><span>PUBLIC PORTFOLIO</span><b>隐私信息已隐藏</b></div>
    </header>

    <section className="hero" id="top">
      <p className="eyebrow">HUMAN × AI · CAREER ARCHIVE</p>
      <h1>进化<br /><em>档案馆</em></h1>
      <p className="lead">一份持续生长的职业能力证明。<br />记录我如何思考、执行、交付，并在真实任务中不断进化。</p>
      <div className="hero-note"><span>01</span><p>不展示身份隐私<br /><b>只展示能力与成果</b></p></div>
      <a className="scroll-link" href="#archive"><span>查看档案</span><b>↓</b></a>
    </section>

    <section className="stats" aria-label="档案概览">
      <div><strong>03</strong><span>核心项目</span></div>
      <div><strong>09</strong><span>关键任务</span></div>
      <div><strong>09</strong><span>能力标签</span></div>
      <p>STATUS · OPEN TO WORK<br /><small>持续更新的职业作品档案</small></p>
    </section>

    <section className="meaning">
      <p className="eyebrow">WHY THIS ARCHIVE EXISTS</p>
      <div><h2>简历告诉你我做过什么，<br /><em>档案馆展示我是如何做到的。</em></h2><p>这里不是日记，也不是信息堆积。每个项目必须包含具体任务、可见成果和能力变化，让招聘方在几分钟内看见执行力、思考方式与成长速度。</p></div>
    </section>

    <section className="archive" id="archive">
      <div className="section-head"><div><p className="eyebrow">PROOF OF WORK</p><h2>能力证据库</h2></div><label className="search"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索项目或能力" aria-label="搜索项目或能力" /></label></div>
      <nav className="tabs" aria-label="档案视图">{views.map((v) => <button key={v.id} className={view === v.id ? "active" : ""} onClick={() => setView(v.id)}><span>{v.label}</span><small>{v.note}</small></button>)}</nav>

      {view === "projects" && <div className="timeline">{filtered.map((p) => <article className="record" key={p.issue}><div className="record-meta"><span>{p.date}</span><small>{p.issue}</small></div><div className="record-body"><div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div><h3>{p.title}</h3><p>{p.summary}</p><div className="outcome"><b>RESULT</b><span>{p.outcome}</span></div><div className="details">{p.tasks.map((task, i) => <div key={task}><b>0{i + 1}</b><section><h4>{task}</h4><p>{i === p.tasks.length - 1 ? "交付与复盘" : "关键执行节点"}</p></section></div>)}</div></div></article>)}</div>}

      {view === "tasks" && <div className="task-board">{filtered.map((p, i) => <article key={p.issue}><header><span>0{i + 1}</span><div><small>{p.issue}</small><h3>{p.title}</h3></div><b>DONE</b></header>{p.tasks.map((task, n) => <div className="task-row" key={task}><span>0{n + 1}</span><p>{task}</p><small>已完成</small></div>)}</article>)}</div>}

      {view === "progress" && <div className="progress-list">{filtered.map((p, i) => <article key={p.issue}><div className="progress-index">{String(i + 1).padStart(2, "0")}</div><div><small>{p.date} · EVOLUTION NODE</small><h3>{p.title}</h3><p>{p.progress}</p></div><span>↗</span></article>)}</div>}

      {view === "skills" && <div className="skills-grid">{skillSet.map((skill, i) => <article key={skill}><span>{String(i + 1).padStart(2, "0")}</span><p>{i < 3 ? "PRODUCT" : i < 6 ? "EXECUTION" : "THINKING"}</p><h3>{skill}</h3><div className="skill-level"><i style={{width:`${72 + (i % 3) * 9}%`}} /></div><small>由真实项目与任务记录验证</small></article>)}</div>}
    </section>

    <section className="contact"><p className="eyebrow">A NOTE TO RECRUITERS</p><h2>如果你在寻找一个能把模糊目标<br />变成清晰成果的人，<em>欢迎继续了解。</em></h2><p>为保护个人隐私，联系方式将在正式沟通时提供。</p></section>
    <footer><div className="brand"><span className="brandmark">E</span><span>EVOLUTION FILE</span></div><p>用结果证明能力，<br />用进化证明潜力。</p><small>© 2026 · PUBLIC CAREER ARCHIVE</small></footer>
  </main>;
}
