/* Actual recorded session depth, independent of conversation classification rules. */
((root)=>{
'use strict';
const bands=[
 {label:'≤2 轮',max:2,color:'#c77850'},
 {label:'3–5 轮',max:5,color:'#d8ad59'},
 {label:'6–10 轮',max:10,color:'#279e94'},
 {label:'11–20 轮',max:20,color:'#477ba5'},
 {label:'21+ 轮',max:Infinity,color:'#8668aa'},
];
const standardEntryBands=[
 {label:'1 轮',test:rounds=>rounds===1},
 {label:'2 轮',test:rounds=>rounds===2},
 {label:'3–4 轮',test:rounds=>rounds>=3&&rounds<=4},
 {label:'5–7 轮',test:rounds=>rounds>=5&&rounds<=7},
 {label:'8–10 轮',test:rounds=>rounds>=8&&rounds<=10},
 {label:'11+ 轮',test:rounds=>rounds>=11},
];
const postClassEntryBands=[
 {label:'≤2 轮',test:rounds=>rounds<=2},
 {label:'3–5 轮',test:rounds=>rounds>=3&&rounds<=5},
 ...[6,7,8,9,10].map(round=>({label:`${round} 轮`,test:rounds=>rounds===round})),
 {label:'11+ 轮',test:rounds=>rounds>=11},
];
function entryHistogramBands(entry){return entry===2?postClassEntryBands:standardEntryBands}
function bucket(rounds){return Number.isInteger(rounds)&&rounds>=0?bands.findIndex(b=>rounds<=b.max):-1}
function calendarWeeks(dates){
 if(!dates.length)return [];
 const day=86400000,first=Date.parse(dates[0]+'T00:00:00Z'),last=Date.parse(dates.at(-1)+'T00:00:00Z');
 const monday=first-((new Date(first).getUTCDay()+6)%7)*day,weeks=[];
 const iso=t=>new Date(t).toISOString().slice(0,10);
 for(let t=monday;t<=last;t+=7*day){
  const startDate=iso(t),endDate=iso(t+6*day),start=dates.findIndex(d=>d>=startDate),end=dates.findLastIndex(d=>d<=endDate);
  if(start<0||end<start)continue;
  weeks.push({key:startDate,startDate,endDate,start,end,partial:t<first||t+6*day>last});
 }
 return weeks.reverse();
}
function quantile(values,p){
 if(!values.length)return null;
 const sorted=[...values].sort((a,b)=>a-b),position=(sorted.length-1)*p,low=Math.floor(position),high=Math.ceil(position);
 return sorted[low]+(sorted[high]-sorted[low])*(position-low);
}
function weeklyEntryStats(data,state,entry){
 const dates=data.dimensions.dates,selectedDates=dates.slice(state.start,state.end+1),weeks=calendarWeeks(selectedDates).reverse();
 const profileMatches=user=>['age','level','country'].every((key,index)=>state[key]==='all'||data.userProfiles[user]?.[index]===Number(state[key]));
 const scoped=data.sessionRows.filter(row=>row[0]===entry&&row[3]>=state.start&&row[3]<=state.end&&profileMatches(row[1]));
 let previousMedian=null;
 return weeks.map(week=>{
  const sessions=scoped.filter(row=>{const date=dates[row[3]];return date>=week.startDate&&date<=week.endDate});
  const values=sessions.map(row=>row[5]).filter(Number.isFinite).sort((a,b)=>a-b);
  const median=quantile(values,.5),mean=values.length?values.reduce((sum,value)=>sum+value,0)/values.length:null;
  const delta=median===null||previousMedian===null?null:median-previousMedian;
  const deltaPct=delta===null||previousMedian===0?null:delta/previousMedian*100;
  const result={...week,total:sessions.length,known:values.length,median,mean,p25:quantile(values,.25),p75:quantile(values,.75),delta,deltaPct};
  previousMedian=median;
  return result;
 });
}
function filterEntrySessions(data,sessions,filters={}){
 const weekStart=filters.week&&filters.week!=='all'?Date.parse(`${filters.week}T00:00:00Z`):null;
 const weekEnd=weekStart===null?null:weekStart+6*86400000;
 return sessions.filter(row=>{
  const profile=data.userProfiles[row[1]];
  if(filters.level&&filters.level!=='all'&&profile?.[1]!==Number(filters.level))return false;
  if(filters.country&&filters.country!=='all'&&profile?.[2]!==Number(filters.country))return false;
  if(weekStart!==null){const date=Date.parse(`${data.dimensions.dates[row[3]]}T00:00:00Z`);if(date<weekStart||date>weekEnd)return false}
  return true;
 });
}
function aggregate(data,state){
 const active=new Set();
 for(const r of data.rows)if(r[0]>=state.start&&r[0]<=state.end)active.add(r[4]);
 for(const r of data.aiRows)if(r[0]>=state.start&&r[0]<=state.end)active.add(r[2]);
 const scope=data.sessionRows.filter(r=>active.has(r[2])&&['age','level','country'].every((key,i)=>state[key]==='all'||data.userProfiles[r[1]]?.[i]===Number(state[key])));
 return data.dimensions.entries.map((entry,i)=>{
  const ss=scope.filter(r=>r[0]===i),counts=bands.map(()=>0),known=[];let unknown=0,zero=0;
  for(const r of ss){const bi=bucket(r[5]);if(bi<0)unknown++;else{counts[bi]++;known.push(r[5]);if(r[5]===0)zero++}}
  known.sort((a,b)=>a-b);const mid=Math.floor(known.length/2);
  return {entry,total:ss.length,users:new Set(ss.map(r=>r[1])).size,counts,unknown,zero,median:known.length?(known.length%2?known[mid]:(known[mid-1]+known[mid])/2):null};
 });
}
root.DinoRoundDistribution={aggregate,bucket,bands,calendarWeeks,entryHistogramBands,weeklyEntryStats,filterEntrySessions};
if(typeof document==='undefined')return;
const D=root.DINO_DATA,fmt=n=>new Intl.NumberFormat('zh-CN').format(n),pct=(n,d)=>d?`${(100*n/d).toFixed(1)}%`:'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const regions=new Intl.DisplayNames(['zh-CN'],{type:'region'}),countryName=c=>c==='未记录'?c:`${regions.of(c)} · ${c}`,levelName=l=>l==='未记录'?'未记录':`Level ${l}`;
function render(state){
 const weeks=calendarWeeks(D.dimensions.dates),allDates=state.start===0&&state.end===D.dimensions.dates.length-1;
 const week=allDates?null:weeks.find(w=>w.start===state.start&&w.end===state.end);
 const weekLabel=w=>`${w.startDate.slice(5)}—${w.endDate.slice(5)}${w.partial?'（不完整周）':''}`;
 const result=aggregate(D,state),hasUnknown=result.some(r=>r.unknown),allBands=hasUnknown?[...bands,{label:'轮次未记录',color:'#899095'}]:bands;
 const options=(key,values,labeler)=>`<option value="all">全部</option>`+values.map((v,i)=>`<option value="${i}" ${state[key]===String(i)?'selected':''}>${esc(labeler(v))}</option>`).join('');
 const countAt=(r,i)=>i===5?r.unknown:r.counts[i];
 const selectLabel=(key,values,labeler)=>state[key]==='all'?'全部':labeler(values[Number(state[key])]);
 const scope=`级别：${selectLabel('level',D.dimensions.levels,levelName)} · 国家／地区：${selectLabel('country',D.dimensions.countries,countryName)} · 年龄：${selectLabel('age',D.dimensions.ageBands,x=>x==='未记录'?x:`${x} 岁`)}`;
 const rootEl=document.querySelector('#roundDistribution');
 rootEl.innerHTML=`
 <section class="round-filters" aria-label="轮次分布筛选"><div><b>选择统计范围</b><p>按周一至周日统计，与顶部日期和画像筛选同步。</p></div>
 <label>统计周<select id="roundWeekFilter" aria-label="统计周"><option value="all" ${allDates?'selected':''}>全部统计周</option>${!allDates&&!week?'<option value="custom" selected>自定义日期范围</option>':''}${weeks.map(w=>`<option value="${w.key}" ${week?.key===w.key?'selected':''}>${weekLabel(w)}</option>`).join('')}</select></label>
 <label>级别<select data-round-filter="level" aria-label="轮次分布级别">${options('level',D.dimensions.levels,levelName)}</select></label>
 <label>国家／地区<select data-round-filter="country" aria-label="轮次分布国家／地区">${options('country',D.dimensions.countries,countryName)}</select></label>
 <button type="button" id="roundFilterReset" ${state.level==='all'&&state.country==='all'?'disabled':''}>重置级别与国家</button></section>
 <p class="round-scope" role="status">统计周：${week?weekLabel(week):allDates?'全部':'自定义日期范围'} · ${esc(scope)} · 实际数据日期：${D.dimensions.dates[state.start]} — ${D.dimensions.dates[state.end]}</p>
 <div class="round-cards">${result.map(r=>`<article class="panel"><p class="eyebrow">${esc(r.entry)}</p><strong>${fmt(r.total)}<small> Session</small></strong><p>${fmt(r.users)} 位孩子 · 中位 ${r.median===null?'—':r.median.toFixed(1)} 轮</p><p class="round-fact">${r.total?`≤2 轮的对话占 <b>${pct(r.counts[0],r.total)}</b>（${fmt(r.counts[0])} / ${fmt(r.total)}）`:'当前筛选没有 Session，不显示为 0%。'}</p></article>`).join('')}</div>
 <article class="panel"><div class="panel-head"><h3>各入口实际轮次分布</h3><span class="unit">每行独立计算 · 百分比堆叠图</span></div>
 <p class="micro-note">占比 = 该档位 Session 数 ÷ 当前筛选下该入口 Session 总数。每段对话只落入一个档位，合计 100%（显示值可能有四舍五入误差）。</p>
 <div class="round-legend">${allBands.map(b=>`<span><i style="background:${b.color}"></i>${b.label}</span>`).join('')}</div>
 <div class="round-stacks">${result.map(r=>`<div class="round-stack-row"><div class="round-entry-label"><b>${esc(r.entry)}</b><small>${fmt(r.total)} Session</small></div><div class="round-stack" role="img" aria-label="${esc(r.entry)}：${r.total?allBands.map((b,i)=>`${b.label} ${pct(countAt(r,i),r.total)}`).join('，'):'无数据'}">${r.total?allBands.map((b,i)=>{const n=countAt(r,i),p=n/r.total*100;return n?`<span tabindex="0" class="round-segment" style="width:${p}%;background:${b.color}" aria-label="${esc(r.entry)}，${b.label}：${fmt(n)} / ${fmt(r.total)} 个 Session，${pct(n,r.total)}" title="${b.label}：${fmt(n)} / ${fmt(r.total)} 个 Session · ${pct(n,r.total)}">${p>=7?`<b>${pct(n,r.total)}</b>`:''}</span>`:''}).join(''):'<span class="round-no-data">当前筛选无数据</span>'}</div></div>`).join('')}</div>
 </article>
 <article class="panel round-table-panel"><div class="panel-head"><h3>分档明细</h3><span class="unit">中位数 + 占比 + Session 数 / 分母</span></div><div class="round-table-scroll"><table class="round-table"><caption>不同入口的轮次中位数与实际已完成轮次分档；分档占比的分母为各入口当前筛选 Session 数</caption><thead><tr><th scope="col">实际轮次</th>${result.map(r=>`<th scope="col">${esc(r.entry)}<small>共 ${fmt(r.total)} Session</small></th>`).join('')}</tr></thead><tbody><tr class="round-median-row"><th scope="row">轮次中位数<small>一半 Session 不高于此轮数</small></th>${result.map(r=>`<td><b>${r.median===null?'—':`${r.median.toFixed(1)} 轮`}</b><small>${r.median===null?'当前筛选暂无有效轮次':'按当前筛选 Session 计算'}</small></td>`).join('')}</tr>${allBands.map((b,i)=>`<tr><th scope="row"><i style="background:${b.color}"></i>${b.label}</th>${result.map(r=>`<td><b>${pct(countAt(r,i),r.total)}</b><small>${fmt(countAt(r,i))} / ${fmt(r.total)} Session</small></td>`).join('')}</tr>`).join('')}</tbody></table></div></article>
 <details class="round-method"><summary>统计口径与阅读说明</summary><ul>
 <li>一条已记录的用户回答计 1 轮；Dino 单独发言及最终 CLOSE 不额外计轮次。这不是“达成目标轮次的完成率”。</li>
 <li>日期用于选择期间有消息的 Session；轮数取该 Session 在本次导出中的全部用户回答，不因日期筛选截短。记录可能受导出边界影响，不保证是真实最终结束轮次。</li>
 <li>统计周按北京时间的周一至周日划分。不完整周仅统计数据窗口内日期；跨周 Session 可在多个有消息的周中出现，各周 Session 数不能直接相加。</li>
 <li>档位互斥：≤2（含 0）、3–5、6–10、11–20、21+。${result.some(r=>r.zero)?`当前包含 ${fmt(result.reduce((sum,r)=>sum+r.zero,0))} 段 0 轮 Session。`:'当前筛选没有 0 轮 Session。'}${hasUnknown?'轮次缺失单列，仍保留在分母。':''}</li>
 <li>级别和年龄是当前画像。国家／地区来自最近设备记录，不代表国籍或对话发生地。画像未记录的 Session 默认保留，也可单独筛选。</li>
 <li>轮数少不直接等于失败；POST_CLASS 缺少每个 Session 的目标轮次，暂不判断完成或提前结束。请结合样本量与原始对话分析差异。</li></ul></details>`;
 rootEl.querySelectorAll('[data-round-filter]').forEach(el=>el.addEventListener('change',()=>document.dispatchEvent(new CustomEvent('dino:profile-filter',{detail:{[el.dataset.roundFilter]:el.value}}))));
 rootEl.querySelector('#roundFilterReset').onclick=()=>document.dispatchEvent(new CustomEvent('dino:profile-filter',{detail:{level:'all',country:'all'}}));
 rootEl.querySelector('#roundWeekFilter').onchange=event=>{
  const value=event.target.value,target=value==='all'?{start:0,end:D.dimensions.dates.length-1}:weeks.find(w=>w.key===value);
  if(target)document.dispatchEvent(new CustomEvent('dino:date-filter',{detail:{start:target.start,end:target.end}}));
 };
}
document.addEventListener('dino:render',event=>{
 const state=event.detail;
 if(state.page!=='overview')return;
 render(state);
});
})(typeof window==='undefined'?globalThis:window);
