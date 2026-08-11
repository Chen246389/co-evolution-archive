"use client";

import { ChangeEvent, useMemo, useState } from "react";

type Module = { id:string; group:string; label:string; desc:string; action:string };
const modules:Module[] = [
  {id:"upload-center",group:"数据接入",label:"数据接入中心",desc:"按报表类型上传并校验数据",action:"检查数据"},
  {id:"dashboard",group:"经营分析",label:"经营驾驶舱",desc:"核心指标、趋势与经营风险",action:"刷新看板"},
  {id:"product-search",group:"经营分析",label:"单品诊断",desc:"按商品查询完整经营表现",action:"查询商品"},
  {id:"plan",group:"经营分析",label:"计划分析",desc:"推广计划分层与止损提醒",action:"运行分层"},
  {id:"product-detail",group:"经营分析",label:"商品明细",desc:"商品表现、标签与筛选",action:"应用筛选"},
  {id:"compare",group:"经营分析",label:"数据对比",desc:"商品与时间段多维对比",action:"生成对比"},
  {id:"category",group:"经营分析",label:"类目分析",desc:"类目贡献、效率与趋势",action:"分析类目"},
  {id:"customer",group:"经营分析",label:"新老客分析",desc:"获客、复购与客群贡献",action:"分析客群"},
  {id:"campaign",group:"经营分析",label:"大促监控",desc:"目标、进度、预警与复盘",action:"新建大促"},
  {id:"market",group:"市场洞察",label:"市场洞察专家",desc:"大盘、季节、机会与排行榜",action:"更新洞察"},
  {id:"split",group:"新品生产",label:"裂变链接",desc:"一品多链定位与人群场景",action:"开始裂变"},
  {id:"selling",group:"新品生产",label:"卖点挖掘",desc:"事实约束下提炼产品卖点",action:"挖掘卖点"},
  {id:"title",group:"新品生产",label:"新品写标题",desc:"关键词组合与平台标题",action:"生成标题"},
  {id:"detail-page",group:"新品生产",label:"详情页框架",desc:"详情页内容结构与顺序",action:"生成框架"},
  {id:"main-images",group:"新品生产",label:"五主图逻辑",desc:"五张主图的信息任务",action:"生成方案"},
];

const products = [
 {name:"轻量防风雨衣",tag:"S款",sales:128420,refund:12842,spend:8600,roi:8.9,trend:18},
 {name:"扫地机替换滤芯套装",tag:"A款",sales:89650,refund:7172,spend:7800,roi:7.4,trend:9},
 {name:"双头清洁棉签",tag:"A款",sales:67480,refund:4049,spend:5350,roi:9.2,trend:22},
 {name:"旅行分装收纳袋",tag:"B款",sales:42680,refund:3414,spend:4920,roi:5.8,trend:-4},
 {name:"温和清洁湿巾",tag:"新品",sales:28620,refund:2576,spend:4100,roi:4.9,trend:31},
];
const money=(n:number)=>`¥${(n/10000).toFixed(2)}万`;

export default function Home(){
 const [active,setActive]=useState("dashboard");
 const [query,setQuery]=useState("");
 const [range,setRange]=useState("近30天");
 const [platform,setPlatform]=useState("全部平台");
 const [tag,setTag]=useState("全部标签");
 const [uploaded,setUploaded]=useState<string[]>([]);
 const [reportFiles,setReportFiles]=useState<Record<string,string[]>>({});
 const [notice,setNotice]=useState("");
 const [sideOpen,setSideOpen]=useState(false);
 const current=modules.find(m=>m.id===active)!;
 const filtered=useMemo(()=>products.filter(p=>(tag==="全部标签"||p.tag===tag)&&p.name.includes(query)),[tag,query]);
 const run=(label=current.action)=>{setNotice(`${label}已完成 · 当前为脱敏演示结果`); setTimeout(()=>setNotice(""),2600)};
 const upload=(e:ChangeEvent<HTMLInputElement>)=>{const names=Array.from(e.target.files||[]).map(f=>f.name); if(names.length){setUploaded(v=>[...new Set([...v,...names])]); setNotice(`已读取 ${names.length} 个文件，可开始分析`)};};
 const uploadReport=(report:string,e:ChangeEvent<HTMLInputElement>)=>{const names=Array.from(e.target.files||[]).map(f=>f.name);if(!names.length)return;setReportFiles(v=>({...v,[report]:[...new Set([...(v[report]||[]),...names])]}));setUploaded(v=>[...new Set([...v,...names])]);setNotice(`${report}：已选择 ${names.length} 个文件`)};
 return <div className="app-shell">
   <aside className={sideOpen?"sidebar open":"sidebar"}>
    <div className="logo"><span>策</span><div><b>经营智能台</b><small>本地分析样板</small></div></div>
    {Array.from(new Set(modules.map(m=>m.group))).map(group=><section className="nav-group" key={group}><p>{group}</p>{modules.filter(m=>m.group===group).map(m=><button className={active===m.id?"nav-item active":"nav-item"} key={m.id} onClick={()=>{setActive(m.id);setSideOpen(false)}}><i>{m.label.slice(0,1)}</i><span>{m.label}<small>{m.desc}</small></span></button>)}</section>)}
    <div className="privacy-card"><b>隐私模式开启</b><span>数据仅在当前演示环境处理</span></div>
   </aside>
   <main className="workspace">
    <header className="topbar"><button className="menu" onClick={()=>setSideOpen(v=>!v)}>☰</button><div><small>电商经营系统 / {current.group}</small><h1>{current.label}</h1></div><div className="header-actions"><label className="upload">＋ 上传数据<input type="file" multiple accept=".csv,.xlsx,.xls" onChange={upload}/></label><button className="primary" onClick={()=>run()}>{current.action}</button></div></header>
    <div className="coverage"><b>数据覆盖</b><span className="dot"/> 淘宝经营报表 <em>演示数据</em><span className="dot"/> 抖音经营报表 <em>待接入</em>{uploaded.length>0&&<strong>已读取 {uploaded.length} 个文件</strong>}</div>
    <section className="filters">
      <select value={platform} onChange={e=>setPlatform(e.target.value)} aria-label="平台"><option>全部平台</option><option>淘宝</option><option>抖音</option></select>
      <div className="range-tabs">{["近7天","近15天","近30天","自定义"].map(x=><button className={range===x?"active":""} onClick={()=>setRange(x)} key={x}>{x}</button>)}</div>
      <label className="search">⌕<input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索商品、计划或类目"/></label>
      <select value={tag} onChange={e=>setTag(e.target.value)} aria-label="标签"><option>全部标签</option><option>S款</option><option>A款</option><option>B款</option><option>新品</option></select>
    </section>
    {active==="upload-center"&&<DataUpload files={reportFiles} onUpload={uploadReport} onRun={run}/>} 
    {active==="dashboard"&&<Dashboard />}
    {active==="plan"&&<Plan />}
    {active==="compare"&&<Compare />}
    {active==="category"&&<Category />}
    {active==="customer"&&<Customer />}
    {active==="campaign"&&<Campaign onRun={run}/>} 
    {active==="market"&&<Market />}
    {["product-search","product-detail"].includes(active)&&<Products rows={filtered} detail={active==="product-detail"}/>} 
    {["split","selling","title","detail-page","main-images"].includes(active)&&<Studio module={active} onRun={run}/>} 
    <footer>统计口径 v0.1 · 销售额以支付口径为主 · 净销售额＝销售额－退款 · 所有执行建议需运营确认</footer>
   </main>
   {notice&&<div className="toast">✓ {notice}</div>}
 </div>
}

const reportGroups=[
 {title:"推广数据",note:"用于计划、单元、创意、关键词、人群和地域分析",reports:["营销场景","计划报表","单元报表","内容报表","创意报表","关键词报表","人群报表","地域报表","商品报表"]},
 {title:"商品数据",note:"用于销售、退款、流量、类目和新老客分析",reports:["生意参谋数据","商品效果数据","单品流量来源","新老客报表"]},
 {title:"市场数据",note:"用于选品、价格带、季节性和类目机会判断",reports:["类目洞察","市场排行","竞品商品","抖音内容排行"]},
];
function DataUpload({files,onUpload,onRun}:{files:Record<string,string[]>;onUpload:(r:string,e:ChangeEvent<HTMLInputElement>)=>void;onRun:(s?:string)=>void}){const total=Object.values(files).reduce((n,v)=>n+v.length,0);return <div className="content data-upload"><div className="upload-intro"><div><span>STEP 01 · DATA INPUT</span><h2>按报表类型上传经营数据</h2><p>同一种报表可以多选上传。当前阶段先检查文件和字段，确认口径后再生成分析图表。</p></div><div><strong>{total}</strong><span>已选择文件</span><button className="primary" onClick={()=>onRun("数据完整性检查")}>检查数据完整性</button></div></div>{reportGroups.map((group,gi)=><section className="report-group" key={group.title}><header><i className={`group-mark g${gi}`}/><div><h2>{group.title}<small>{group.reports.length} 种报表</small></h2><p>{group.note}</p></div></header><div className="report-grid">{group.reports.map((report,ri)=>{const count=(files[report]||[]).length;return <article className={count?"report-card ready":"report-card"} key={report}><div className="report-name"><span>{String(ri+1).padStart(2,"0")}</span><div><b>{report}</b><small>CSV / Excel · 可多选</small></div>{count>0&&<em>已选择 {count}</em>}</div><label className="report-picker">{count?"继续添加文件":"选择文件（可多选）"}<input type="file" accept=".csv,.xlsx,.xls" multiple onChange={e=>onUpload(report,e)}/></label>{count>0&&<div className="file-list">{files[report].slice(0,3).map(name=><span key={name}>✓ {name}</span>)}{count>3&&<small>另有 {count-3} 个文件</small>}</div>}<footer><span>{count?"等待字段检查":"尚未上传"}</span><button disabled={!count} onClick={()=>onRun(`${report}字段检查`)}>检查字段 →</button></footer></article>})}</div></section>)}<section className="next-step"><b>接下来的处理顺序</b><div><span className={total?"done":""}>1　上传报表</span><span>2　检查字段</span><span>3　确认统计口径</span><span>4　运行分析</span><span>5　生成图表</span></div><p>文件目前只用于当前步骤；在正式建立私有数据仓库前，不会写入公开档案馆。</p></section></div>}

function Dashboard(){return <div className="content"><div className="kpis">{[["总销售额","¥35.69万","+12.8%"],["净销售额","¥32.69万","+9.6%"],["推广花费","¥3.08万","-2.1%"],["整体 ROI","10.62","+0.8"],["退款率","8.41%","-1.2%"]].map(x=><article key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small className={x[2].startsWith("-")?"down":"up"}>{x[2]} 较上期</small></article>)}</div><div className="grid two"><Panel title="销售额与推广花费趋势"><div className="chart"><i style={{height:"38%"}}/><i style={{height:"52%"}}/><i style={{height:"47%"}}/><i style={{height:"70%"}}/><i style={{height:"61%"}}/><i style={{height:"82%"}}/><i style={{height:"73%"}}/><svg viewBox="0 0 600 180" preserveAspectRatio="none"><polyline points="0,130 100,115 200,121 300,72 400,90 500,42 600,58"/></svg></div></Panel><Panel title="经营行动清单"><div className="action-list"><p><b className="red">2</b><span>紧急止损<small>高花费、零成交或退款异常</small></span></p><p><b className="amber">6</b><span>待优化<small>高投入、效率低于目标</small></span></p><p><b className="green">4</b><span>建议放量<small>稳定增长且利润空间充足</small></span></p><p><b className="blue">9</b><span>持续观察<small>样本量尚未达到决策标准</small></span></p></div></Panel></div><div className="grid three"><Panel title="类目销售贡献"><Donut/></Panel><Panel title="新老客结构"><div className="split"><b style={{width:"64%"}}>新客 64%</b><b>老客 36%</b></div><p className="muted">新客贡献 ¥21.7万 · 老客贡献 ¥12.1万</p></Panel><Panel title="今日数据质量"><div className="quality"><strong>82</strong><span>/100</span><p>7 类报表完整 · 2 类待上传</p></div></Panel></div></div>}
function Panel({title,children}:{title:string;children:React.ReactNode}){return <article className="panel"><header><h2>{title}</h2><button>查看明细 →</button></header>{children}</article>}
function Donut(){return <div className="donut-wrap"><div className="donut"><span>5类</span></div><ul><li>个人清洁 38%</li><li>家居收纳 27%</li><li>生活配件 19%</li></ul></div>}
function Products({rows,detail}:{rows:typeof products;detail:boolean}){return <div className="content"><Panel title={detail?"店铺商品明细":"单品业绩诊断"}><div className="table-wrap"><table><thead><tr><th>商品名称</th><th>标签</th><th>总销售额</th><th>退款</th><th>净销售额</th><th>推广花费</th><th>总 ROI</th><th>趋势</th></tr></thead><tbody>{rows.map(p=><tr key={p.name}><td><b>{p.name}</b><small>演示商品 · 已脱敏</small></td><td><span className={`tag ${p.tag}`}>{p.tag}</span></td><td>{money(p.sales)}</td><td className="danger">{money(p.refund)}</td><td>{money(p.sales-p.refund)}</td><td>{money(p.spend)}</td><td className="good">{p.roi}</td><td className={p.trend<0?"danger":"good"}>{p.trend>0?"↑":"↓"}{Math.abs(p.trend)}%</td></tr>)}</tbody></table></div></Panel>{!detail&&<div className="grid two"><Panel title="流量来源诊断"><div className="empty-state"><b>上传近30天单品流量数据</b><span>将识别搜索、推荐、付费与内容流量变化</span><button>选择文件上传</button></div></Panel><Panel title="单品建议"><div className="recommend"><b>保持核心词投放</b><p>自然流量增长稳定，建议优先优化主图点击率，并观察退款原因变化。</p><span>建议可信度 78%</span></div></Panel></div>}</div>}
function Plan(){let cats=[["潜力新星",8,"观察"],["核心标杆",5,"维持"],["金牛爆款",4,"放量"],["待优化区",12,"优化"],["风险预警",3,"复核"],["紧急止损",2,"止损"]];return <div className="content"><div className="kpis compact"><article><span>计划总数</span><strong>34</strong></article><article><span>推广花费</span><strong>¥3.08万</strong></article><article><span>整体 ROI</span><strong>10.62</strong></article><article><span>ROI 中位数</span><strong>7.84</strong></article></div><div className="classification">{cats.map((c,i)=><article key={String(c[0])}><i className={`c${i}`}/><div><b>{c[0]}</b><small>{c[2]}策略</small></div><strong>{c[1]}</strong><button>查看</button></article>)}</div><Panel title="计划明细"><SimpleTable/></Panel></div>}
function SimpleTable(){return <div className="table-wrap"><table><thead><tr><th>计划名称</th><th>场景</th><th>花费</th><th>成交金额</th><th>ROI</th><th>建议</th></tr></thead><tbody>{[1,2,3,4].map((x)=><tr key={x}><td>推广计划 0{x}</td><td>关键词推广</td><td>¥{(x*863).toLocaleString()}</td><td>¥{(x*7860).toLocaleString()}</td><td className="good">{(6.8+x).toFixed(1)}</td><td><span className="tag A款">持续优化</span></td></tr>)}</tbody></table></div>}
function Compare(){return <div className="content"><Panel title="时间段筛选对比"><div className="compare-controls">{["时间段 1","时间段 2","时间段 3"].map((x,i)=><div key={x}><b>{x}</b><input type="date" defaultValue={`2026-0${6+i}-01`}/><span>至</span><input type="date" defaultValue={`2026-0${6+i}-07`}/></div>)}</div></Panel><div className="grid two"><Panel title="核心指标变化"><div className="compare-bars">{[["销售额",83,72,68],["净销售额",75,62,66],["推广费",48,55,51],["买家数",71,64,60]].map(x=><div key={String(x[0])}><span>{x[0]}</span>{x.slice(1).map((n,i)=><i key={i} style={{width:`${n}%`}}/>)}</div>)}</div></Panel><Panel title="自动结论"><div className="recommend"><b>销售额环比上升 15.3%</b><p>增长主要来自新品与搜索流量；推广费增幅低于销售增幅，整体效率改善。</p><span>对比周期长度一致</span></div></Panel></div></div>}
function Category(){return <div className="content"><Panel title="类目销售占比分析"><div className="table-wrap"><table><thead><tr><th>类目</th><th>销售额</th><th>推广费</th><th>销售占比</th><th>推广占比</th><th>ROI</th><th>机会评分</th></tr></thead><tbody>{[["个人清洁",135000,12600,38,41,9.7,82],["收纳整理",96300,7800,27,25,11.3,91],["雨具",67800,4900,19,16,12.4,88],["清洁配件",42800,5300,12,17,7.2,66]].map(x=><tr key={String(x[0])}><td><b>{x[0]}</b></td><td>{money(Number(x[1]))}</td><td>{money(Number(x[2]))}</td><td>{x[3]}%</td><td>{x[4]}%</td><td className="good">{x[5]}</td><td><progress value={Number(x[6])} max="100"/> {x[6]}</td></tr>)}</tbody></table></div></Panel></div>}
function Customer(){return <div className="content"><div className="kpis compact"><article><span>支付买家</span><strong>2,861</strong></article><article><span>支付金额</span><strong>¥35.69万</strong></article><article><span>新客占比</span><strong>63.8%</strong></article><article><span>老客占比</span><strong>36.2%</strong></article></div><div className="grid two"><Panel title="支付买家每日趋势"><div className="line-only"><svg viewBox="0 0 600 180" preserveAspectRatio="none"><polyline points="0,110 90,86 180,102 270,48 360,70 450,35 540,62 600,49"/></svg></div></Panel><Panel title="新老客贡献"><div className="customer-stat"><div><b>新客</b><strong>1,826</strong><span>¥22.4万</span></div><div><b>老客</b><strong>1,035</strong><span>¥13.3万</span></div></div></Panel></div></div>}
function Campaign({onRun}:{onRun:(s?:string)=>void}){return <div className="content"><div className="campaign-head"><div><span>进行中</span><h2>下一场大促监控</h2><p>目标尚未设置 · 建议先完成经营目标</p></div><button className="primary" onClick={()=>onRun("大促项目创建")}>＋ 新增大促监控</button></div><div className="steps">{[["01","制定目标","日期、GMV、净销售额、推广费"],["02","导入明细","按日期和类目拆分目标"],["03","确认口径","退款、跨日与归因规则"],["04","查看监控","目标达成、趋势与预警"]].map((s,i)=><article className={i===0?"active":""} key={s[0]}><b>{s[0]}</b><div><h3>{s[1]}</h3><p>{s[2]}</p></div><button>{i===0?"开始设置":"待完成"}</button></article>)}</div></div>}
function Market(){return <div className="content"><div className="market-tabs"><button className="active">淘宝天猫大盘</button><button>抖音排行</button><button>淘天类目排行</button><button>蓝海类目筛选</button><button>市场排行榜</button></div><div className="grid two"><Panel title="类目机会分析"><div className="heatmap">{[82,45,66,91,74,38,56,87,69,52,78,94].map((n,i)=><i key={i} style={{opacity:n/100}}><span>{i+1}月</span><b>{n}</b></i>)}</div></Panel><Panel title="机会排行"><ol className="ranking"><li><b>01</b><span>家庭收纳用品<small>规模稳定 · 增长较快</small></span><strong>91.2</strong></li><li><b>02</b><span>个人清洁用品<small>规模较大 · 竞争适中</small></span><strong>86.7</strong></li><li><b>03</b><span>旅行雨具<small>季节机会 · 增速明显</small></span><strong>82.4</strong></li></ol></Panel></div><Panel title="热销商品与内容排行"><SimpleTable/></Panel></div>}
function Studio({module,onRun}:{module:string;onRun:(s?:string)=>void}){const config:Record<string,[string,string,string]>={split:["爆款一品多链","上传产品图片和介绍，生成不同人群与场景的链接定位","开始裂变"],selling:["AI 新品卖点挖掘","根据产品事实、资料和目标人群提炼可验证卖点","挖掘卖点"],title:["AI 新品写标题","导入关键词数据，分别生成淘宝与抖音标题","生成标题"],"detail-page":["AI 新品详情页设计","围绕购买决策顺序设计详情页信息框架","生成详情页框架"],"main-images":["五主图逻辑","为五张主图分配明确的信息任务与视觉重点","生成五主图方案"]};let c=config[module];return <div className="content studio"><div className="studio-title"><span>AI</span><div><h2>{c[0]}</h2><p>{c[1]}</p></div></div><div className="form-card"><div className="progress-note"><b>产品档案完成度</b><progress value="45" max="100"/><span>45%</span></div><div className="form-grid"><label className="dropzone">＋<b>上传产品图片或资料</b><span>支持 JPG、PNG、CSV、Excel</span><input type="file" multiple/></label><div><label>产品名称<input placeholder="例如：轻量防风雨衣"/></label><label>目标平台<select><option>淘宝</option><option>抖音</option><option>淘宝 + 抖音</option></select></label><label>产品描述<textarea placeholder="品牌、规格、材质、功能、目标人群、价格区间……"/></label></div></div><label>补充要求<textarea placeholder="希望突出什么、禁止出现什么、需要面向哪类人群……"/></label><div className="safety">产品事实、供应商描述与 AI 推断会分别标记；未经人工确认的内容不会进入正式商品包。</div><button className="primary large" onClick={()=>onRun(c[2])}>{c[2]}</button></div></div>}
