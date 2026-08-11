"use client";

import { ChangeEvent, useMemo, useState } from "react";
import * as XLSX from "xlsx";

type Row = Record<string, string | number | null | undefined>;
type Module = { id: string; group: string; label: string; desc: string; action: string };
type Product = { id: string; name: string; status: string; visitors: number; buyers: number; sales: number; refund: number; spend: number; promoSales: number; roi: number; tag: string };
type Plan = { id: string; name: string; scene: string; spend: number; sales: number; orders: number; roi: number; tier: string };
type Daily = { date: string; spend: number; sales: number; orders: number };

const modules: Module[] = [
  { id: "upload-center", group: "数据接入", label: "数据接入中心", desc: "上传、识别并校验经营报表", action: "检查数据" },
  { id: "dashboard", group: "经营分析", label: "经营驾驶舱", desc: "真实指标、趋势与风险", action: "刷新看板" },
  { id: "product-search", group: "经营分析", label: "单品诊断", desc: "查询商品完整经营表现", action: "查询商品" },
  { id: "plan", group: "经营分析", label: "计划分析", desc: "推广计划分层与止损提醒", action: "运行分层" },
  { id: "product-detail", group: "经营分析", label: "商品明细", desc: "商品表现、标签与筛选", action: "应用筛选" },
  { id: "compare", group: "经营分析", label: "数据对比", desc: "商品与时间段多维对比", action: "生成对比" },
  { id: "category", group: "经营分析", label: "类目分析", desc: "类目贡献、效率与趋势", action: "分析类目" },
  { id: "customer", group: "经营分析", label: "新老客分析", desc: "获客、复购与客群贡献", action: "分析客群" },
  { id: "campaign", group: "经营分析", label: "大促监控", desc: "目标、进度、预警与复盘", action: "新建大促" },
  { id: "market", group: "市场洞察", label: "市场洞察专家", desc: "大盘、季节、机会与排行榜", action: "更新洞察" },
  { id: "split", group: "新品生产", label: "裂变链接", desc: "一品多链定位与场景", action: "开始裂变" },
  { id: "selling", group: "新品生产", label: "卖点挖掘", desc: "基于事实提炼产品卖点", action: "挖掘卖点" },
  { id: "title", group: "新品生产", label: "新品写标题", desc: "关键词组合与平台标题", action: "生成标题" },
  { id: "detail-page", group: "新品生产", label: "详情页框架", desc: "详情页内容结构与顺序", action: "生成框架" },
  { id: "main-images", group: "新品生产", label: "五主图逻辑", desc: "五张主图的信息任务", action: "生成方案" },
];

const n = (value: unknown) => {
  const text = String(value ?? "").replace(/[,%¥\s]/g, "");
  if (!text || text === "-" || text === "--") return 0;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : 0;
};
const money = (value: number) => value >= 10000 ? `¥${(value / 10000).toFixed(2)}万` : `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
const pct = (value: number) => `${(value * 100).toFixed(2)}%`;
const rowText = (row: Row, key: string) => String(row[key] ?? "").trim();

async function parseWorkbook(file: File): Promise<Row[]> {
  const buffer = await file.arrayBuffer();
  let workbook: XLSX.WorkBook;
  if (file.name.toLowerCase().endsWith(".csv")) {
    let text = new TextDecoder("utf-8").decode(buffer);
    if (text.includes("�") || !text.includes(",")) text = new TextDecoder("gb18030").decode(buffer);
    workbook = XLSX.read(text, { type: "string" });
  } else {
    workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  }
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const matrix = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, { header: 1, defval: "", raw: false });
  const headerIndex = matrix.findIndex(r => r.some(v => ["商品ID", "日期", "统计日期", "场景ID"].includes(String(v).trim())));
  if (headerIndex < 0) throw new Error("没有识别到标准表头");
  const headers = matrix[headerIndex].map(v => String(v).trim());
  return matrix.slice(headerIndex + 1).filter(r => r.some(v => String(v).trim())).map(r => Object.fromEntries(headers.map((h, i) => [h, r[i] ?? ""])));
}

function classifyPlan(spend: number, sales: number, orders: number, roi: number) {
  if (spend === 0) return "观察样本";
  if (sales === 0 || orders === 0) return "零成交";
  if (roi < 2) return "紧急止损";
  if (roi < 4) return "风险预警";
  if (roi < 6) return "待优化区";
  if (roi >= 15) return "金牛爆款";
  if (roi >= 10) return "核心标杆";
  if (orders <= 3) return "潜力新星";
  return "稳健梯队";
}

function buildPlans(rows: Row[]): Plan[] {
  const map = new Map<string, Plan>();
  rows.forEach(row => {
    const id = rowText(row, "计划ID");
    if (!id) return;
    const item = map.get(id) ?? { id, name: rowText(row, "计划名字") || `计划 ${id.slice(-5)}`, scene: rowText(row, "场景名字"), spend: 0, sales: 0, orders: 0, roi: 0, tier: "" };
    item.spend += n(row["花费"]); item.sales += n(row["总成交金额"]); item.orders += n(row["总成交笔数"]); map.set(id, item);
  });
  return [...map.values()].map(x => ({ ...x, roi: x.spend ? x.sales / x.spend : 0, tier: classifyPlan(x.spend, x.sales, x.orders, x.spend ? x.sales / x.spend : 0) })).sort((a, b) => b.spend - a.spend);
}

function buildDaily(rows: Row[]): Daily[] {
  const map = new Map<string, Daily>();
  rows.forEach(row => {
    const date = rowText(row, "日期"); if (!date) return;
    const item = map.get(date) ?? { date, spend: 0, sales: 0, orders: 0 };
    item.spend += n(row["花费"]); item.sales += n(row["总成交金额"]); item.orders += n(row["总成交笔数"]); map.set(date, item);
  });
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function buildProducts(business: Row[], promo: Row[]): Product[] {
  const promoMap = new Map<string, { spend: number; sales: number }>();
  promo.forEach(row => { const id = rowText(row, "主体ID"); if (!id) return; const x = promoMap.get(id) ?? { spend: 0, sales: 0 }; x.spend += n(row["花费"]); x.sales += n(row["总成交金额"]); promoMap.set(id, x); });
  const rows = business.map(row => {
    const id = rowText(row, "商品ID"), p = promoMap.get(id) ?? { spend: 0, sales: 0 };
    const sales = n(row["支付金额"]), refund = n(row["成功退款金额"]), roi = p.spend ? p.sales / p.spend : 0;
    return { id, name: rowText(row, "商品名称"), status: rowText(row, "商品状态"), visitors: n(row["商品访客数"]), buyers: n(row["支付买家数"]), sales, refund, spend: p.spend, promoSales: p.sales, roi, tag: "待评估" };
  }).filter(x => x.id);
  const ranked = [...rows].sort((a, b) => (b.sales - b.refund) - (a.sales - a.refund));
  const cutS = ranked[Math.max(0, Math.floor(ranked.length * .1) - 1)]?.sales ?? 0, cutA = ranked[Math.max(0, Math.floor(ranked.length * .3) - 1)]?.sales ?? 0;
  return rows.map(x => ({ ...x, tag: x.sales >= cutS ? "S款" : x.sales >= cutA ? "A款" : x.sales > 0 ? "B款" : "待优化" })).sort((a, b) => b.sales - a.sales);
}

export default function Home() {
  const [active, setActive] = useState("upload-center");
  const [businessRows, setBusinessRows] = useState<Row[]>([]);
  const [promoRows, setPromoRows] = useState<Row[]>([]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [query, setQuery] = useState(""); const [tag, setTag] = useState("全部标签"); const [notice, setNotice] = useState(""); const [loading, setLoading] = useState(false); const [sideOpen, setSideOpen] = useState(false);
  const current = modules.find(x => x.id === active)!;
  const products = useMemo(() => buildProducts(businessRows, promoRows), [businessRows, promoRows]);
  const plans = useMemo(() => buildPlans(promoRows), [promoRows]);
  const daily = useMemo(() => buildDaily(promoRows), [promoRows]);
  const filtered = products.filter(x => (tag === "全部标签" || x.tag === tag) && (!query || x.name.includes(query) || x.id.includes(query)));
  const hasReal = businessRows.length > 0 || promoRows.length > 0;
  const notify = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 3200); };
  const ingest = async (kind: "business" | "promo", event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return; setLoading(true);
    try {
      const rows = await parseWorkbook(file);
      const headers = Object.keys(rows[0] ?? {});
      if (kind === "business" && !headers.includes("商品ID")) throw new Error("这不是生意参谋商品表");
      if (kind === "promo" && !(headers.includes("计划ID") && headers.includes("主体ID"))) throw new Error("这不是推广商品日报");
      if (kind === "business") setBusinessRows(rows); else setPromoRows(rows);
      setFiles(v => ({ ...v, [kind]: file.name })); notify(`已识别 ${rows.length.toLocaleString()} 条数据，经营智能台已同步更新`);
    } catch (error) { notify(error instanceof Error ? error.message : "文件读取失败"); } finally { setLoading(false); event.target.value = ""; }
  };
  const groups = [...new Set(modules.map(x => x.group))];
  return <div className="app-shell">
    <aside className={sideOpen ? "sidebar open" : "sidebar"}>
      <div className="logo"><span>策</span><div><b>经营智能台</b><small>电商数据分析与决策</small></div></div>
      {groups.map(group => <section className="nav-group" key={group}><p>{group}</p>{modules.filter(x => x.group === group).map(item => <button key={item.id} className={active === item.id ? "nav-item active" : "nav-item"} onClick={() => { setActive(item.id); setSideOpen(false); }}><i>{item.label.slice(0, 1)}</i><span>{item.label}<small>{item.desc}</small></span></button>)}</section>)}
      <div className="privacy-card"><b>隐私保护模式</b><span>当前版本在浏览器内分析，不把原始报表写入公开档案馆</span></div>
    </aside>
    <main className="workspace">
      <header className="topbar"><button className="menu" onClick={() => setSideOpen(v => !v)}>☰</button><div><small>淘宝经营系统 / {current.group}</small><h1>{current.label}</h1></div><div className="header-actions"><span className={hasReal ? "data-badge live" : "data-badge"}>{hasReal ? "真实数据" : "等待上传"}</span><button className="primary" onClick={() => setActive("upload-center")}>上传数据</button></div></header>
      <div className="coverage"><b>数据覆盖</b><span className={businessRows.length ? "dot" : "dot off"}/> 生意参谋商品表 <em>{businessRows.length ? `${businessRows.length.toLocaleString()}条` : "待上传"}</em><span className={promoRows.length ? "dot" : "dot off"}/> 推广商品日报 <em>{promoRows.length ? `${promoRows.length.toLocaleString()}条 / ${daily.length}天` : "待上传"}</em>{hasReal && <strong>最近一次更新：刚刚</strong>}</div>
      {active !== "upload-center" && <section className="filters"><div className="range-tabs"><button>近7天</button><button>近15天</button><button className="active">近30天</button><button>自定义</button></div><label className="search">⌕<input value={query} onChange={e => setQuery(e.target.value)} placeholder="搜索商品名称或ID"/></label><select value={tag} onChange={e => setTag(e.target.value)}><option>全部标签</option><option>S款</option><option>A款</option><option>B款</option><option>待优化</option></select></section>}
      {active === "upload-center" && <UploadCenter files={files} loading={loading} onBusiness={e => ingest("business", e)} onPromo={e => ingest("promo", e)} businessCount={businessRows.length} promoCount={promoRows.length}/>} 
      {active === "dashboard" && <Dashboard products={products} plans={plans} daily={daily}/>} 
      {active === "plan" && <PlanView plans={plans}/>} 
      {["product-search", "product-detail"].includes(active) && <ProductView rows={filtered}/>} 
      {!["upload-center", "dashboard", "plan", "product-search", "product-detail"].includes(active) && <ModulePlaceholder module={current} ready={hasReal}/>} 
      <footer>统计口径 v1.0 · 净销售额=支付金额−成功退款金额 · 推广ROI=总成交金额÷花费 · 所有执行建议需运营确认</footer>
    </main>{notice && <div className="toast">✓ {notice}</div>}
  </div>;
}

function UploadCenter({ files, loading, onBusiness, onPromo, businessCount, promoCount }: { files: Record<string, string>; loading: boolean; onBusiness: (e: ChangeEvent<HTMLInputElement>) => void; onPromo: (e: ChangeEvent<HTMLInputElement>) => void; businessCount: number; promoCount: number }) {
  return <div className="content data-upload"><div className="upload-intro"><div><span>STEP 01 · DATA INPUT</span><h2>上传两张核心报表，经营智能台自动联动</h2><p>系统自动识别字段、检查数据并通过商品ID关联。原始报表只在当前浏览器处理。</p></div><div><strong>{Number(Boolean(businessCount)) + Number(Boolean(promoCount))}/2</strong><span>核心报表已就绪</span></div></div>
    <section className="core-upload-grid"><UploadCard title="生意参谋商品表" note="商品销售、退款、访客、支付、搜索转化" file={files.business} count={businessCount} accept=".xls,.xlsx" onChange={onBusiness}/><UploadCard title="推广商品日报" note="日期、计划、商品、花费、成交、ROI" file={files.promo} count={promoCount} accept=".csv,.xls,.xlsx" onChange={onPromo}/></section>
    <section className="sync-flow"><h2>同步处理状态</h2>{[["1", "读取文件", businessCount || promoCount], ["2", "识别字段", businessCount || promoCount], ["3", "商品ID关联", businessCount && promoCount], ["4", "计算指标", businessCount && promoCount], ["5", "刷新经营智能台", businessCount && promoCount]].map(x => <article className={x[2] ? "done" : ""} key={String(x[0])}><b>{x[2] ? "✓" : x[0]}</b><span>{x[1]}</span></article>)}</section>
    <section className="next-step"><b>后续可继续接入的报表</b><div>{["计划报表", "关键词报表", "人群报表", "地域报表", "新老客报表"].map(x => <span key={x}>{x} · 待接入</span>)}</div><p>当前两张核心表已足够完成商品经营、推广趋势、计划分层和止损预警。</p></section>
  </div>;
}
function UploadCard({ title, note, file, count, accept, onChange }: { title: string; note: string; file?: string; count: number; accept: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }) { return <article className={count ? "core-upload-card ready" : "core-upload-card"}><span>{count ? "已完成" : "待上传"}</span><h2>{title}</h2><p>{note}</p>{file && <small>✓ {file}</small>}<label>{count ? "重新上传并同步" : "选择报表"}<input type="file" accept={accept} onChange={onChange}/></label>{count > 0 && <strong>{count.toLocaleString()} 条数据</strong>}</article>; }

function Dashboard({ products, plans, daily }: { products: Product[]; plans: Plan[]; daily: Daily[] }) {
  const sales = products.reduce((s, x) => s + x.sales, 0), refund = products.reduce((s, x) => s + x.refund, 0), spend = plans.reduce((s, x) => s + x.spend, 0), promoSales = plans.reduce((s, x) => s + x.sales, 0), visitors = products.reduce((s, x) => s + x.visitors, 0), buyers = products.reduce((s, x) => s + x.buyers, 0);
  const risk = plans.filter(x => ["紧急止损", "零成交"].includes(x.tier)).length, optimize = plans.filter(x => ["风险预警", "待优化区"].includes(x.tier)).length;
  if (!products.length && !plans.length) return <EmptyRealData/>;
  return <div className="content"><div className="kpis">{[["支付金额", money(sales)], ["净销售额", money(sales - refund)], ["推广花费", money(spend)], ["推广ROI", spend ? (promoSales / spend).toFixed(2) : "—"], ["支付转化率", visitors ? pct(buyers / visitors) : "—"]].map(x => <article key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small className="up">真实报表计算</small></article>)}</div>
    <div className="grid two"><Panel title="推广成交与花费每日趋势"><DailyChart rows={daily}/></Panel><Panel title="经营行动清单"><div className="action-list"><p><b className="red">{risk}</b><span>紧急处理<small>零成交或投入产出严重不足</small></span></p><p><b className="amber">{optimize}</b><span>待优化<small>低于当前经营效率基准</small></span></p><p><b className="green">{plans.filter(x => ["金牛爆款", "核心标杆"].includes(x.tier)).length}</b><span>建议保持<small>投入产出稳定的计划</small></span></p><p><b className="blue">{products.filter(x => x.spend === 0).length}</b><span>未推广商品<small>可作为自然流量对照组</small></span></p></div></Panel></div>
    <div className="grid three"><Panel title="数据关联情况"><div className="quality"><strong>{products.filter(x => x.spend > 0).length}</strong><span>个商品</span><p>已关联商品经营与推广数据</p></div></Panel><Panel title="商品状态"><div className="customer-stat"><div><b>在线</b><strong>{products.filter(x => x.status.includes("在线")).length}</strong></div><div><b>下架</b><strong>{products.filter(x => x.status.includes("下架")).length}</strong></div></div></Panel><Panel title="数据覆盖"><div className="quality"><strong>{daily.length}</strong><span>天</span><p>{products.length.toLocaleString()} 个商品 · {plans.length} 个计划</p></div></Panel></div>
  </div>;
}
function DailyChart({ rows }: { rows: Daily[] }) { if (!rows.length) return <div className="empty-state"><b>等待推广商品日报</b><span>上传后显示每日花费和成交趋势</span></div>; const max = Math.max(...rows.map(x => x.sales), 1); return <div className="real-chart">{rows.map((x, i) => <div key={x.date} title={`${x.date} · 成交${money(x.sales)} · 花费${money(x.spend)}`}><i style={{ height: `${Math.max(3, x.sales / max * 100)}%` }}/>{(i % 5 === 0 || i === rows.length - 1) && <span>{x.date.slice(5)}</span>}</div>)}</div>; }
function PlanView({ plans }: { plans: Plan[] }) { if (!plans.length) return <EmptyRealData/>; const tiers = ["潜力新星", "核心标杆", "金牛爆款", "观察样本", "稳健梯队", "待优化区", "风险预警", "紧急止损", "零成交"]; return <div className="content"><div className="classification">{tiers.map((tier, i) => <article key={tier}><i className={`c${Math.min(i, 5)}`}/><div><b>{tier}</b><small>系统规则分层</small></div><strong>{plans.filter(x => x.tier === tier).length}</strong></article>)}</div><Panel title="推广计划明细"><div className="table-wrap"><table><thead><tr><th>计划名称</th><th>场景</th><th>花费</th><th>成交金额</th><th>成交笔数</th><th>ROI</th><th>系统分层</th></tr></thead><tbody>{plans.slice(0, 100).map(x => <tr key={x.id}><td><b>{x.name}</b><small>ID：{x.id}</small></td><td>{x.scene}</td><td>{money(x.spend)}</td><td>{money(x.sales)}</td><td>{x.orders.toLocaleString()}</td><td className={x.roi < 4 ? "danger" : "good"}>{x.roi.toFixed(2)}</td><td><span className="tag">{x.tier}</span></td></tr>)}</tbody></table></div></Panel></div>; }
function ProductView({ rows }: { rows: Product[] }) { if (!rows.length) return <EmptyRealData/>; return <div className="content"><Panel title={`商品明细（${rows.length.toLocaleString()}）`}><div className="table-wrap"><table><thead><tr><th>商品名称</th><th>状态</th><th>标签</th><th>访客</th><th>支付金额</th><th>退款</th><th>净销售额</th><th>推广花费</th><th>推广ROI</th></tr></thead><tbody>{rows.slice(0, 200).map(x => <tr key={x.id}><td><b>{x.name}</b><small>ID：{x.id}</small></td><td>{x.status}</td><td><span className={`tag ${x.tag}`}>{x.tag}</span></td><td>{x.visitors.toLocaleString()}</td><td>{money(x.sales)}</td><td className="danger">{money(x.refund)}</td><td>{money(x.sales - x.refund)}</td><td>{money(x.spend)}</td><td className={x.roi && x.roi < 4 ? "danger" : "good"}>{x.spend ? x.roi.toFixed(2) : "未推广"}</td></tr>)}</tbody></table></div></Panel></div>; }
function ModulePlaceholder({ module, ready }: { module: Module; ready: boolean }) { return <div className="content"><div className="module-placeholder"><span>{module.label.slice(0, 1)}</span><h2>{module.label}</h2><p>{module.desc}</p><div className="placeholder-controls"><input type="date"/><input type="date"/><button>查询</button><button>筛选</button></div><strong>{ready ? "核心数据已接入；该板块等待对应专项报表后自动启用。" : "请先在数据接入中心上传报表。"}</strong></div></div>; }
function EmptyRealData() { return <div className="content"><div className="empty-real"><span>DATA</span><h2>等待真实经营数据</h2><p>前往“数据接入中心”上传生意参谋商品表和推广商品日报，页面会立即同步更新。</p></div></div>; }
function Panel({ title, children }: { title: string; children: React.ReactNode }) { return <article className="panel"><header><h2>{title}</h2><button>真实数据</button></header>{children}</article>; }
