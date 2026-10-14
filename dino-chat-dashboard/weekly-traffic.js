/* Exact weekly counts, independent of conversation labels. Beijing-time calendar weeks. */
((root)=>{
'use strict';
const metrics={sessions:'Session',users:'用户',messages:'消息'};
const colors=['#ff643d','#129d91','#f5c640'];
function aggregate(data,state){
 const dates=data.dimensions.dates,selected=dates.slice(state.start,state.end+1);
 const weeks=root.DinoRoundDistribution.calendarWeeks(selected).reverse().map(w=>({
  startDate:w.startDate,endDate:w.endDate,
  actualStart:selected[w.start],actualEnd:selected[w.end],days:w.end-w.start+1,
  partial:w.partial||w.end-w.start+1<7,
  entries:data.dimensions.entries.map(()=>({sessions:0,messages:0,userIds:new Set()})),userIds:new Set()
 }));
 const byDate=new Map();
 for(const w of weeks)for(let i=state.start;i<=state.end;i++)if(dates[i]>=w.startDate&&dates[i]<=w.endDate)byDate.set(i,w);
 const matches=user=>['age','level','country'].every((key,i)=>state[key]==='all'||(data.userProfiles?.[user]?.[i]??-1)===Number(state[key]));
 const sessionUser=new Map(data.sessionRows.map(r=>[r[2],r[1]]));
 const active=new Set();
 for(const r of data.rows){
  const w=byDate.get(r[0]);if(!w)continue;
  active.add(r[4]);if(!matches(r[3]))continue;
  w.entries[r[1]].messages++;w.entries[r[1]].userIds.add(r[3]);w.userIds.add(r[3]);
 }
 for(const r of data.aiRows){
  const w=byDate.get(r[0]);if(!w)continue;
  active.add(r[2]);if(matches(sessionUser.get(r[2])))w.entries[r[1]].messages++;
 }
 // Match the existing daily trend: a session is assigned to its first recorded date only.
 for(const r of data.sessionRows){const w=byDate.get(r[3]);if(w&&active.has(r[2])&&matches(r[1]))w.entries[r[0]].sessions++}
 return weeks.map(({userIds,entries,...week})=>{
  const counts=entries.map(({userIds,...entry})=>({...entry,users:userIds.size}));
  return {...week,entries:counts,total:{sessions:counts.reduce((n,e)=>n+e.sessions,0),messages:counts.reduce((n,e)=>n+e.messages,0),users:userIds.size}};
 });
}
root.DinoWeeklyTraffic={aggregate};
if(typeof document==='undefined')return;
const D=root.DINO_DATA,fmt=n=>new Intl.NumberFormat('zh-CN').format(n);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(state){
 const el=document.querySelector('#weeklyTraffic');if(!el)return;
 const weeks=aggregate(D,state),metric=state.trendMetric,label=metrics[metric];
 const weekLabel=w=>`${w.startDate.slice(5)}—${w.endDate.slice(5)}`;
 const coverageLabel=w=>w.partial?`不完整周 · ${w.days}/7 天`:'完整周 · 7 天';
 const scope=`${D.dimensions.dates[state.start]} — ${D.dimensions.dates[state.end]}`;
 const definitions={
  sessions:'Session 按本次导出中的首条消息日期归周，跨周只计一次；与上方每日 Session 趋势一致。与「期间有消息即计入」的轮次分布页口径不同。',
  users:'每个入口内，同一用户一周只计一次（当周有用户消息）；全入口用户合并去重，不等于三个入口相加，也不是每日人数相加。同一用户可在不同周重复出现。',
  messages:'按消息记录日期汇总，包含孩子和 Dino 双方消息；一条记录计一条消息，不等于对话轮次。'
 };
 const width=Math.max(840,weeks.length*185+70),height=320,left=62,right=18,top=30,bottom=76,plotH=height-top-bottom;
 const max=Math.max(1,...weeks.flatMap(w=>w.entries.map(e=>e[metric])));
 const rawStep=max/4,power=10**Math.floor(Math.log10(rawStep));
 const step=Math.max(1,[1,2,2.5,5,10].map(n=>n*power).find(n=>n>=rawStep));
 const ceiling=Math.ceil(max/step)*step,y=n=>top+plotH-n/ceiling*plotH;
 const groupWidth=(width-left-right)/Math.max(1,weeks.length),barWidth=Math.min(32,groupWidth/5),gap=9;
 let chart=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="weeklyChartTitle weeklyChartDesc"><title id="weeklyChartTitle">每周各入口${label}对比</title><desc id="weeklyChartDesc">周一至周日，三个入口并列柱状图。数值见下方明细表。${weeks.some(w=>w.partial)?'斜线柱代表不完整周。':''}</desc><defs>${colors.map((color,i)=>`<pattern id="weeklyPartial${i}" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${color}" fill-opacity=".35"/><path d="M-1 1L1-1M0 7L7 0M6 8L8 6" stroke="${color}" stroke-width="2"/></pattern>`).join('')}</defs>`;
 for(let v=0;v<=ceiling;v+=step)chart+=`<line x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}" class="weekly-grid"/><text x="${left-12}" y="${y(v)+4}" text-anchor="end" class="weekly-axis">${fmt(v)}</text>`;
 weeks.forEach((w,wi)=>{
  const cx=left+groupWidth*(wi+.5),begin=cx-(barWidth*3+gap*2)/2;
  w.entries.forEach((entry,e)=>{const n=entry[metric],x=begin+e*(barWidth+gap);
   chart+=`<g><title>${esc(D.dimensions.entries[e])} · ${w.startDate}—${w.endDate}：${fmt(n)} ${label}；${coverageLabel(w)}</title><rect x="${x}" y="${y(n)}" width="${barWidth}" height="${n/ceiling*plotH}" fill="${w.partial?`url(#weeklyPartial${e})`:colors[e]}"/><text x="${x+barWidth/2}" y="${y(n)-8}" text-anchor="middle" class="weekly-value">${fmt(n)}</text></g>`;
  });
  chart+=`<text x="${cx}" y="${height-48}" text-anchor="middle" class="weekly-week">${weekLabel(w)}</text><text x="${cx}" y="${height-26}" text-anchor="middle" class="weekly-axis">${coverageLabel(w)}</text>`;
 });
 chart+='</svg>';
 el.innerHTML=`<div class="panel-head"><div><span class="index">02B</span><h3>每周流量对比</h3></div><div class="panel-tools"><div class="metric-switch" aria-label="每周流量指标">${Object.entries(metrics).map(([key,text])=>`<button type="button" data-weekly-metric="${key}" class="${metric===key?'active':''}" aria-pressed="${metric===key}">${text}</button>`).join('')}</div><button type="button" class="insight-trigger" data-insight="traffic">查看分析</button></div></div>
 <p class="weekly-intro">看一周的规模，也看三个入口之间的变化。<span>周一 → 周日 · 与每日趋势及顶部筛选同步</span></p>
 <div class="weekly-legend">${D.dimensions.entries.map((entry,e)=>`<span><i style="background:${colors[e]}"></i>${esc(entry)}</span>`).join('')}${weeks.some(w=>w.partial)?'<span class="weekly-partial-key"><i></i>不完整周</span>':''}</div>
 <p class="weekly-scope">当前日期：${scope} · 单位：${label}${metric==='messages'?'（双方）':metric==='users'?'（周内去重）':''}</p>
 <div class="weekly-chart-scroll" tabindex="0" role="region" aria-label="每周流量柱状图，可横向滚动">${chart}</div>
 <div class="weekly-table-scroll" tabindex="0" role="region" aria-label="每周流量明细，可横向滚动"><table class="weekly-table"><caption class="weekly-sr-only">每周${label}明细</caption><thead><tr><th scope="col">统计周</th><th scope="col">${metric==='users'?'全入口去重用户':'全入口合计'}</th>${D.dimensions.entries.map(entry=>`<th scope="col">${esc(entry)}</th>`).join('')}</tr></thead><tbody>${weeks.map(w=>`<tr><th scope="row"><b>${weekLabel(w)}</b><small>${w.startDate.slice(0,4)} · ${coverageLabel(w)}${w.partial?`<br>实际：${w.actualStart.slice(5)}—${w.actualEnd.slice(5)}`:''}</small></th><td><strong>${fmt(w.total[metric])}</strong></td>${w.entries.map(e=>`<td>${fmt(e[metric])}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 ${weeks.every(w=>w.total[metric]===0)?'<p class="weekly-empty" role="status">当前筛选没有记录，请调整级别、地区或日期。</p>':''}
 <div class="weekly-notes"><p>${definitions[metric]}</p><p>全部消息先从 UTC 换算为北京时间，再按周一至周日归周。不完整周只统计数据窗口内日期，不直接与整周总量比较；“完整周”表示时间窗口完整，不保证源数据没有漏记。</p>${D.meta?.coverageNote?`<p>${esc(D.meta.coverageNote)}</p>`:''}</div>`;
 el.querySelectorAll('[data-weekly-metric]').forEach(button=>button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('dino:trend-metric',{detail:{metric:button.dataset.weeklyMetric}}))));
}
function renderEntry(state){
 const el=document.querySelector('#entryWeeklyTraffic');if(!el)return;
 const weeks=aggregate(D,state),metric=state.entryTrendMetric||'sessions',label=metrics[metric],entry=state.entry,key=D.dimensions.entryKeys[entry],color=colors[entry];
 const weekLabel=w=>`${w.startDate.slice(5)}—${w.endDate.slice(5)}`,coverage=w=>w.partial?`不完整周 · ${w.days}/7 天`:'完整周 · 7 天';
 const values=weeks.map(w=>w.entries[entry][metric]),width=Math.max(760,weeks.length*150+80),height=300,left=58,right=24,top=34,bottom=70,plotH=height-top-bottom,max=Math.max(1,...values),raw=max/4,power=10**Math.floor(Math.log10(raw)),step=Math.max(1,[1,2,2.5,5,10].map(n=>n*power).find(n=>n>=raw)),ceiling=Math.ceil(max/step)*step,y=n=>top+plotH-n/ceiling*plotH,group=(width-left-right)/Math.max(1,weeks.length),barWidth=Math.min(54,group*.48);
 let chart=`<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(key)} 每周${label}趋势"><defs><pattern id="entryWeeklyPartial" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="${color}" fill-opacity=".35"/><path d="M-1 1L1-1M0 7L7 0M6 8L8 6" stroke="${color}" stroke-width="2"/></pattern></defs>`;
 for(let v=0;v<=ceiling;v+=step)chart+=`<line x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}" class="weekly-grid"/><text x="${left-10}" y="${y(v)+4}" text-anchor="end" class="weekly-axis">${fmt(v)}</text>`;
 weeks.forEach((w,i)=>{const n=values[i],cx=left+group*(i+.5),x=cx-barWidth/2;chart+=`<g><title>${w.startDate}—${w.endDate}：${fmt(n)} ${label}；${coverage(w)}</title><rect x="${x}" y="${y(n)}" width="${barWidth}" height="${n/ceiling*plotH}" fill="${w.partial?'url(#entryWeeklyPartial)':color}"/><text x="${cx}" y="${y(n)-8}" text-anchor="middle" class="weekly-value">${fmt(n)}</text></g><text x="${cx}" y="${height-42}" text-anchor="middle" class="weekly-week">${weekLabel(w)}</text><text x="${cx}" y="${height-20}" text-anchor="middle" class="weekly-axis">${coverage(w)}</text>`});
 chart+='</svg>';
 const definitions={sessions:'Session 按本次导出中的首条消息日期归周，跨周只计一次。',users:'同一用户在同一统计周、当前入口内只计一次，跨周可重复出现。',messages:'按消息记录日期汇总，包含孩子和 Dino 双方消息。'};
 el.innerHTML=`<div class="panel-head"><div><span class="index">01B</span><h3>每周流量对比</h3></div><div class="metric-switch" aria-label="当前入口每周流量指标">${Object.entries(metrics).map(([metricKey,text])=>`<button type="button" data-entry-weekly-metric="${metricKey}" class="${metric===metricKey?'active':''}" aria-pressed="${metric===metricKey}">${text}</button>`).join('')}</div></div><p class="weekly-intro">只看 ${esc(key)} 入口的周度规模变化。<span>周一 → 周日 · 与每日趋势及顶部筛选同步</span></p><div class="weekly-legend"><span><i style="background:${color}"></i>${esc(key)}</span>${weeks.some(w=>w.partial)?'<span class="weekly-partial-key"><i></i>不完整周</span>':''}</div><p class="weekly-scope">当前入口：${esc(key)} · 单位：${label}</p><div class="weekly-chart-scroll" tabindex="0" role="region" aria-label="${esc(key)} 每周流量柱状图，可横向滚动">${chart}</div><div class="weekly-table-scroll" tabindex="0" role="region" aria-label="${esc(key)} 每周流量明细"><table class="weekly-table entry-weekly-table"><caption class="weekly-sr-only">${esc(key)} 每周${label}明细</caption><thead><tr><th scope="col">统计周</th><th scope="col">${esc(key)} ${label}</th><th scope="col">周覆盖</th></tr></thead><tbody>${weeks.map((w,i)=>`<tr><th scope="row"><b>${weekLabel(w)}</b><small>${w.startDate.slice(0,4)}</small></th><td><strong>${fmt(values[i])}</strong></td><td>${coverage(w)}</td></tr>`).join('')}</tbody></table></div><div class="weekly-notes"><p>${definitions[metric]}</p><p>不完整周只统计数据窗口内的日期，不建议直接与完整周总量比较。</p></div>`;
 el.querySelectorAll('[data-entry-weekly-metric]').forEach(button=>button.addEventListener('click',()=>document.dispatchEvent(new CustomEvent('dino:entry-trend-metric',{detail:{metric:button.dataset.entryWeeklyMetric}}))));
}
document.addEventListener('dino:render',event=>{if(event.detail.page==='overview')render(event.detail)});
document.addEventListener('dino:render',event=>{if(event.detail.page==='entry')renderEntry(event.detail)});
})(typeof window==='undefined'?globalThis:window);
