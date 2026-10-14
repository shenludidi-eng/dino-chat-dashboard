((root)=>{
'use strict';

const COLORS=['#129d91','#ff643d','#f5c640','#8c68c9','#527bd1','#cf6298','#cc8840','#5e9f65','#3b759c'];
const detailFilters={week:'all',level:'all',country:'all',sort:'count'};
let lastState=null;

const pct=(n,d)=>d?`${(n/d*100).toFixed(1)}%`:'—';
const fmt=n=>new Intl.NumberFormat('zh-CN').format(n||0);
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const parseDate=value=>new Date(`${value}T00:00:00Z`);
const isoDate=date=>date.toISOString().slice(0,10);
const shortDate=value=>value?.slice(5).replace('-','–')||'—';

function calendarWeeks(dates){
 const valid=(dates||[]).filter(Boolean).sort();
 if(!valid.length)return[];
 const first=parseDate(valid[0]),last=parseDate(valid.at(-1));
 const start=new Date(first);start.setUTCDate(start.getUTCDate()-((start.getUTCDay()+6)%7));
 const weeks=[];
 for(let cursor=new Date(start);cursor<=last;cursor.setUTCDate(cursor.getUTCDate()+7)){
  const monday=isoDate(cursor),sundayDate=new Date(cursor);sundayDate.setUTCDate(sundayDate.getUTCDate()+6);
  const sunday=isoDate(sundayDate),coveredStart=monday<valid[0]?valid[0]:monday,coveredEnd=sunday>valid.at(-1)?valid.at(-1):sunday;
  weeks.push({key:monday,startDate:monday,endDate:sunday,coveredStart,coveredEnd,partial:coveredStart!==monday||coveredEnd!==sunday,label:`${shortDate(monday)}—${shortDate(sunday)}`});
 }
 return weeks;
}

function aggregate(data,rows,state,filters={}){
 const week=filters.week&&filters.week!=='all'?calendarWeeks(data.dimensions?.dates).find(item=>item.key===filters.week):null;
 const selected={
  level:filters.level??'all',
  country:filters.country??'all',
 };
 const profileMatches=user=>['age','level','country'].every((key,index)=>{
  const globalValue=state[key]??'all';
  if(globalValue!=='all'&&data.userProfiles?.[user]?.[index]!==Number(globalValue))return false;
  if((key==='level'||key==='country')&&selected[key]!=='all'&&data.userProfiles?.[user]?.[index]!==Number(selected[key]))return false;
  return true;
 });
 const people=new Map();
 for(const row of rows||[]){
  const [user,,date,completed]=row,dateValue=data.dimensions?.dates?.[date];
  if(date<state.start||date>state.end||!profileMatches(user))continue;
  if(week&&(!dateValue||dateValue<week.startDate||dateValue>week.endDate))continue;
  people.set(user,(people.get(user)||false)||Boolean(completed));
 }
 const completed=[...people.values()].filter(Boolean).length;
 const breakdown=dimension=>{
  const counts=new Map();
  for(const [user,done] of people){
   const index=data.userProfiles?.[user]?.[dimension]??-1;
   const item=counts.get(index)||{index,total:0,completed:0};
   item.total++;if(done)item.completed++;counts.set(index,item);
  }
  return [...counts.values()].sort((a,b)=>b.total-a.total||a.index-b.index);
 };
 return{total:people.size,completed,rate:people.size?completed/people.size:null,levels:breakdown(1),countries:breakdown(2)};
}

function weeklyStats(data,rows,state){
 const weeks=calendarWeeks(data.dimensions?.dates).filter(week=>{
  const startIndex=data.dimensions.dates.findIndex(value=>value>=week.startDate);
  const endIndex=data.dimensions.dates.findLastIndex(value=>value<=week.endDate);
  return startIndex>=0&&endIndex>=0&&startIndex<=state.end&&endIndex>=state.start;
 });
 let previousRate=null;
 return weeks.map(week=>{
  const result=aggregate(data,rows,state,{week:week.key});
  const delta=result.rate===null||previousRate===null?null:(result.rate-previousRate)*100;
  if(result.rate!==null)previousRate=result.rate;
  return{...week,...result,delta};
 });
}

function renderTrend(weeks){
 const valid=weeks.filter(item=>item.rate!==null);
 if(!valid.length)return'<p class="empty-note">当前筛选下没有可绘制的周数据。</p>';
 const width=1000,height=270,pad={left:62,right:30,top:38,bottom:54},chartWidth=width-pad.left-pad.right,chartHeight=height-pad.top-pad.bottom;
 const x=index=>valid.length===1?pad.left+chartWidth/2:pad.left+(index/(valid.length-1))*chartWidth;
 const y=rate=>pad.top+(1-rate)*chartHeight;
 const ticks=[0,25,50,75,100];
 const grid=ticks.map(value=>`<g><line x1="${pad.left}" y1="${y(value/100)}" x2="${width-pad.right}" y2="${y(value/100)}"/><text x="${pad.left-14}" y="${y(value/100)+4}" text-anchor="end">${value}%</text></g>`).join('');
 const path=valid.map((item,index)=>`${index?'L':'M'} ${x(index)} ${y(item.rate)}`).join(' ');
 const points=valid.map((item,index)=>`<g class="completion-trend-point"><circle cx="${x(index)}" cy="${y(item.rate)}" r="5"><title>${esc(item.label)}：${pct(item.completed,item.total)}，${fmt(item.completed)} / ${fmt(item.total)} 人</title></circle><text class="completion-trend-value" x="${x(index)}" y="${Math.max(16,y(item.rate)-14)}" text-anchor="middle">${pct(item.completed,item.total)}</text><text class="completion-trend-label" x="${x(index)}" y="${height-18}" text-anchor="middle">${esc(shortDate(item.startDate))}</text></g>`).join('');
 return`<div class="completion-trend-scroll"><svg class="completion-trend" viewBox="0 0 ${width} ${height}" role="img" aria-label="POST_CLASS 每周用户环节完成率趋势"><g class="completion-trend-grid">${grid}</g><path class="completion-trend-line" d="${path}"/>${points}</svg></div>`;
}

function sortBreakdown(items,mode='count'){
 return[...(items||[])].sort((a,b)=>{
  if(mode==='rate'){
   const rateA=a.total?a.completed/a.total:-1,rateB=b.total?b.completed/b.total:-1;
   if(rateA!==rateB)return rateB-rateA;
  }
  return b.total-a.total||b.completed-a.completed||a.index-b.index;
 });
}

function renderRows(data,items,dimension,labeler,activeValue,sortMode){
 if(!items.length)return'<p class="empty-note">当前明细筛选下没有用户。</p>';
 const sortedItems=sortBreakdown(items,sortMode);
 return`<div class="completion-list">${sortedItems.map((item,position)=>{
  const raw=data.dimensions[dimension][item.index]??'未记录',label=labeler(raw),rate=item.total?item.completed/item.total:0,filterName=dimension==='levels'?'level':'country';
  return`<button type="button" class="completion-row${String(item.index)===String(activeValue)?' active':''}" data-completion-filter="${filterName}" data-filter-value="${item.index}" aria-pressed="${String(item.index)===String(activeValue)}" aria-label="在完成率明细中只看${esc(label)}"><span class="completion-row-label"><b>${esc(label)}</b><small>${fmt(item.total)} 位打开用户</small></span><span class="completion-row-bar" aria-hidden="true"><i style="--rate:${rate*100}%;--bar-color:${COLORS[position%COLORS.length]}"></i></span><span class="completion-row-value"><strong>${pct(item.completed,item.total)}</strong><small>${fmt(item.completed)} / ${fmt(item.total)} 人</small></span></button>`;
 }).join('')}</div>`;
}

function optionList(values,labeler,selected){
 return(values||[]).map((value,index)=>`<option value="${index}"${String(index)===String(selected)?' selected':''}>${esc(labeler(value))}</option>`).join('');
}

function render(state){
 lastState=state;
 const section=document.querySelector('#postClassCompletionSection'),target=document.querySelector('#postClassCompletion');
 if(!section||!target)return;
 const visible=state.page==='entry'&&state.entry===2;
 section.classList.toggle('hidden',!visible);if(!visible)return;
 const data=root.DINO_DATA,source=root.DINO_POST_CLASS_COMPLETION;
 if(!source?.rows){target.innerHTML='<article class="panel"><p class="empty-note">完成数据尚未加载。</p></article>';return}
 const weeks=calendarWeeks(data.dimensions?.dates).filter(week=>{
  const startIndex=data.dimensions.dates.findIndex(value=>value>=week.startDate);
  const endIndex=data.dimensions.dates.findLastIndex(value=>value<=week.endDate);
  return startIndex>=0&&endIndex>=0&&startIndex<=state.end&&endIndex>=state.start;
 });
 if(detailFilters.week!=='all'&&!weeks.some(week=>week.key===detailFilters.week))detailFilters.week='all';
 const overview=aggregate(data,source.rows,state),trend=weeklyStats(data,source.rows,state),detail=aggregate(data,source.rows,state,detailFilters);
 const regions=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
 const countryName=code=>code==='未记录'?code:`${regions?.of(code)||code} · ${code}`;
 const latest=[...trend].reverse().find(item=>item.rate!==null),deltaClass=!latest||latest.delta===null?'flat':latest.delta>0?'positive':latest.delta<0?'negative':'flat';
 const filterLabels=[];
 if(detailFilters.week!=='all')filterLabels.push(weeks.find(item=>item.key===detailFilters.week)?.label||detailFilters.week);
 if(detailFilters.level!=='all')filterLabels.push(`Level ${data.dimensions.levels[Number(detailFilters.level)]}`);
 if(detailFilters.country!=='all')filterLabels.push(countryName(data.dimensions.countries[Number(detailFilters.country)]));
 const weekRows=trend.map(item=>`<tr><th scope="row">${esc(item.label)}${item.partial?' <sup>*</sup>':''}</th><td>${fmt(item.total)}</td><td>${fmt(item.completed)}</td><td><b>${pct(item.completed,item.total)}</b></td><td class="${item.delta===null?'flat':item.delta>0?'positive':item.delta<0?'negative':'flat'}">${item.delta===null?'—':`${item.delta>0?'+':''}${item.delta.toFixed(1)} pp`}</td></tr>`).join('');
 target.innerHTML=`
  <section class="completion-chapter" aria-labelledby="completionOverviewTitle">
   <div class="completion-chapter-head"><div><span class="index">01</span><h3 id="completionOverviewTitle">总览 · 完成率趋势</h3><p>按周查看打开用户中“已完成过 SPEAKING”的占比；人数帮助判断比例背后的样本量。</p></div><div class="completion-latest"><span>最近一周</span><strong>${latest?pct(latest.completed,latest.total):'—'}</strong><small class="${deltaClass}">${latest?.delta===null||!latest?'暂无环比':`较前一周 ${latest.delta>0?'+':''}${latest.delta.toFixed(1)} pp`}</small></div></div>
   <div class="completion-kpis"><article class="completion-kpi" style="--completion-accent:var(--coral)"><span>打开环节用户</span><strong>${fmt(overview.total)}</strong><small>当前顶部筛选内打开过 POST_CLASS 的去重用户</small></article><article class="completion-kpi" style="--completion-accent:var(--teal)"><span>完成环节用户</span><strong>${fmt(overview.completed)}</strong><small>其中完成过 SPEAKING 环节的去重用户</small></article><article class="completion-kpi" style="--completion-accent:var(--yellow)"><span>环节完成率</span><strong>${pct(overview.completed,overview.total)}</strong><small>${fmt(overview.completed)} / ${fmt(overview.total)} 位用户</small><div class="completion-rate-track" aria-hidden="true"><i style="--rate:${(overview.rate||0)*100}%"></i></div></article></div>
   <article class="panel completion-trend-panel"><div class="panel-head"><div><span class="index">04A</span><h3>每周完成率</h3></div><span class="unit">完成用户 / 打开用户</span></div>${renderTrend(trend)}<div class="completion-week-table-wrap"><table class="completion-week-table"><thead><tr><th>统计周</th><th>打开用户</th><th>完成用户</th><th>完成率</th><th>较前一周</th></tr></thead><tbody>${weekRows}</tbody></table></div><p class="micro-note">* 不完整周表示当前数据或顶部日期筛选未覆盖完整周；环比以百分点（pp）表示。</p></article>
  </section>
  <section class="completion-chapter" aria-labelledby="completionDetailTitle">
   <div class="completion-chapter-head"><div><span class="index">02</span><h3 id="completionDetailTitle">明细 · 人群拆解</h3><p>以下筛选只改变本板块明细，不影响页面上方的其他数据。</p></div></div>
   <div class="completion-filters" role="group" aria-label="环节完成率明细筛选"><label><span>统计周</span><select data-completion-detail-filter="week"><option value="all">全部周</option>${weeks.map(week=>`<option value="${week.key}"${week.key===detailFilters.week?' selected':''}>${esc(week.label)}${week.partial?' · 不完整':''}</option>`).join('')}</select></label><label><span>Level</span><select data-completion-detail-filter="level"><option value="all">全部 Level</option>${optionList(data.dimensions.levels,value=>value==='未记录'?value:`Level ${value}`,detailFilters.level)}</select></label><label><span>国家／地区</span><select data-completion-detail-filter="country"><option value="all">全部国家／地区</option>${optionList(data.dimensions.countries,countryName,detailFilters.country)}</select></label><label><span>排序方式</span><select data-completion-detail-filter="sort"><option value="count"${detailFilters.sort==='count'?' selected':''}>按人数 · 高到低</option><option value="rate"${detailFilters.sort==='rate'?' selected':''}>按完成率 · 高到低</option></select></label><button type="button" id="completionDetailReset">重置明细筛选</button><p class="completion-filter-scope">当前明细：${filterLabels.length?filterLabels.map(esc).join(' · '):'全部周 · 全部 Level · 全部国家／地区'} · ${detailFilters.sort==='rate'?'按完成率排序':'按人数排序'}</p></div>
   <div class="completion-detail-summary"><span>打开用户 <b>${fmt(detail.total)}</b></span><span>完成用户 <b>${fmt(detail.completed)}</b></span><span>完成率 <b>${pct(detail.completed,detail.total)}</b></span></div>
   <div class="completion-grid"><article class="panel completion-panel"><div class="panel-head"><div><span class="index">04B</span><h3>按当前 Level</h3></div><span class="unit">完成用户 / 打开用户</span></div>${renderRows(data,detail.levels,'levels',value=>value==='未记录'?value:`Level ${value}`,detailFilters.level,detailFilters.sort)}</article><article class="panel completion-panel"><div class="panel-head"><div><span class="index">04C</span><h3>按国家／地区</h3></div><span class="unit">完成用户 / 打开用户</span></div>${renderRows(data,detail.countries,'countries',countryName,detailFilters.country,detailFilters.sort)}</article></div>
  </section>
  <p class="completion-definition"><b>口径：</b>分母是当前筛选内打开过 POST_CLASS 的去重用户；分子是其中在 <code>class_user_lesson_task</code> 存在 <code>task_code = SPEAKING</code> 且 <code>status = COMPLETED</code> 记录的去重用户。打开多次、完成多次都只计 1 人；只要在看板数据截止前完成过一次即计为完成。周趋势按“当周打开用户”分组，再判断这些用户是否曾完成。Level 与国家／地区取当前用户画像；国家／地区代表最近设备位置，不代表国籍。</p>`;
 target.querySelectorAll('[data-completion-detail-filter]').forEach(select=>select.addEventListener('change',()=>{detailFilters[select.dataset.completionDetailFilter]=select.value;render(lastState)}));
 target.querySelector('#completionDetailReset')?.addEventListener('click',()=>{detailFilters.week='all';detailFilters.level='all';detailFilters.country='all';detailFilters.sort='count';render(lastState)});
 target.querySelectorAll('[data-completion-filter]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.completionFilter,value=button.dataset.filterValue;detailFilters[key]=String(detailFilters[key])===String(value)?'all':value;render(lastState)}));
}

root.DinoPostClassCompletion={aggregate,calendarWeeks,weeklyStats,sortBreakdown,render};
if(typeof document!=='undefined')document.addEventListener('dino:render',event=>render(event.detail||{}));
})(typeof window==='undefined'?globalThis:window);
