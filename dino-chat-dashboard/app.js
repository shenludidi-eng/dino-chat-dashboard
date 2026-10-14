(()=>{
const D=window.DINO_DATA, $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const colors=['#ff643d','#129d91','#f5c640','#8c68c9','#527bd1','#cf6298','#cc8840','#5e9f65','#3b759c'];
const params=new URLSearchParams(location.search);
const requestedPage=params.get('page');
const state={page:requestedPage==='entry'?'entry':requestedPage==='badcases'?'badcases':'overview',entry:Math.min(2,Math.max(0,Number(params.get('entry')||0))),tab:['dino','children','sessions','rounds'].includes(params.get('tab'))?params.get('tab'):'dino',start:0,end:D.dimensions.dates.length-1,trendMetric:'sessions',entryTrendMetric:'sessions',profileEntry:'all',topicSearch:'',level:'all',age:'all',country:'all'};
const entryRoundFilters=[0,1,2].map(()=>({week:'all',level:'all',country:'all'}));
let activeInsight=null;
const productHistory=[
  {date:'2026-09-21',title:'V1.8.0 提审',tag:'提审',details:['新增 POST_CLASS 入口','对话模型更换为 GPT 5.6 luna']},
  {date:'2026-09-29',title:'新版本上线',tag:'上线',details:['修复 Dino 提问不主动','减少兜底句过多触发，并放宽对 Dino 的限制']}
];
const sessionUser=new Map(D.sessionRows.map(r=>[r[2],r[1]]));
const fmt=n=>new Intl.NumberFormat('zh-CN').format(Math.round(n||0));
const pct=(n,d,dec=1)=>d?`${(n/d*100).toFixed(dec)}%`:'—';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q=(arr,p)=>{if(!arr.length)return 0;const a=[...arr].sort((x,y)=>x-y),i=(a.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return a[l]+(a[h]-a[l])*(i-l)};
const median=a=>q(a,.5);
const inDate=i=>i>=state.start&&i<=state.end;
const profileAt=(user,dimension)=>D.userProfiles?.[user]?.[dimension]??-1;
const profileMatches=user=>(state.age==='all'||profileAt(user,0)===+state.age)&&(state.level==='all'||profileAt(user,1)===+state.level)&&(state.country==='all'||profileAt(user,2)===+state.country);
let activeSessionIds=new Set();
const sessions=(entry=null)=>D.sessionRows.filter(r=>(entry===null||r[0]===entry)&&activeSessionIds.has(r[2])&&profileMatches(r[1]));
const users=(entry=null)=>D.rows.filter(r=>(entry===null||r[1]===entry)&&inDate(r[0])&&profileMatches(r[3]));
const ais=(entry=null)=>D.aiRows.filter(r=>(entry===null||r[1]===entry)&&inDate(r[0])&&profileMatches(sessionUser.get(r[2])));
const uniq=(rows,i)=>new Set(rows.map(r=>r[i])).size;
const regionNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
const countryName=code=>code==='未记录'?code:`${regionNames?.of(code)||code} · ${code}`;
function kpi(label,value,note,accent){return `<article class="kpi" style="--accent:${accent||colors[0]}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`}
function barRows(items,total,{compact=false,onClick='',suffix='%'}={}){const max=Math.max(...items.map(x=>x.value),1);return `<div class="rank-bars ${compact?'compact':''}">${items.map((x,i)=>`<div class="rank-row" ${onClick?`role="button" tabindex="0" data-action="${onClick}" data-index="${x.index??i}"`:''}><span class="rank-label">${esc(x.label)}</span><span class="rank-track"><i class="rank-fill" style="--accent:${x.color||colors[i%colors.length]};width:${x.value/max*100}%"></i></span><b class="rank-value">${suffix==='%'?pct(x.value,total):fmt(x.value)}${suffix==='raw'?'':suffix==='%'?'':''}</b></div>`).join('')}</div>`}
function stack(items,total,onClick=''){const max=Math.max(...items.map(x=>x.value),1);return items.map((x,i)=>`<div class="stack-item" ${onClick?`role="button" tabindex="0" data-action="${onClick}" data-index="${x.index??i}"`:''}><div class="stack-head"><span>${esc(x.label)}</span><b>${pct(x.value,total)}</b></div><div class="track"><div class="fill" style="--accent:${x.color||colors[i%colors.length]};width:${x.value/max*100}%"></div></div></div>`).join('')}

function renderAll(){activeSessionIds=new Set([...users().map(r=>r[4]),...ais().map(r=>r[2])]);closeDrawer();renderHeader();if(state.page==='overview')renderOverview();else if(state.page==='entry')renderEntry();bindDynamic();document.dispatchEvent(new CustomEvent('dino:render',{detail:{...state}}));if(activeInsight&&state.page==='overview')renderAnalysisInsight(activeInsight);else closeAnalysisDrawer()}
function renderHeader(){
  $('#dateWindow').textContent=`${D.dimensions.dates[state.start]} — ${D.dimensions.dates[state.end]}${D.meta.timeBasis?' · '+D.meta.timeBasis:''}`;
  $('#dateWindow').title=D.meta.coverageNote||'';
  $('#generatedAt').textContent=`UPDATED ${new Date(D.meta.generatedAt).toLocaleString('zh-CN')}`;
  $$('.page').forEach(x=>x.classList.toggle('active',x.id===({overview:'overviewPage',entry:'entryPage',badcases:'badCasePage'}[state.page])));
  $$('.nav-page').forEach(b=>{const active=b.dataset.page===state.page&&(state.page!=='entry'||Number(b.dataset.entry)===state.entry);b.classList.toggle('active',active);if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  document.querySelector('.filter-rail')?.classList.toggle('hidden',state.page==='badcases');
  syncSectionSubnav();
  if(state.page==='overview'){ $('#heroTitle').innerHTML='真实对话，<em>正在发生什么？</em>';$('#heroDeck').textContent='只基于当前 chat history，观察用户行为、对话过程与 Dino 的实际回应。'; }
  else if(state.page==='badcases'){$('#heroTitle').innerHTML='BAD CASE，<em>统一归档与追踪</em>';$('#heroDeck').textContent='汇集 AI 自动识别候选、人工精选与人工录入记录，用统一标签查看用户画像、入口和问题类型。';}
  else{const key=D.dimensions.entryKeys[state.entry];$('#heroTitle').innerHTML=`${D.dimensions.entries[state.entry]}，<em>本入口发生了什么？</em>`;$('#heroDeck').textContent=state.entry===2?`从用户规模、用户构成、对话轮次到环节完成率与对话分析，只观察 ${key} 入口的专属数据。`:`从用户规模、用户构成到对话轮次与抽样分析，只观察 ${key} 入口的专属数据。`;}
}

const overviewSubnav=[['overviewVolumeSection','用户量概览'],['overviewTrafficSection','活跃趋势'],['weeklyTraffic','每周流量'],['profilePanel','用户构成'],['overviewRoundSection','对话轮次'],['overviewVersionSection','版本记录']];
const standardEntrySubnav=[['entryVolumeSection','用户量概览'],['entryProfileSection','用户构成'],['entryRoundsSection','对话轮次'],['sampledConversationAnalysisSection','对话分析']];
const postClassSubnav=[['entryVolumeSection','用户量概览'],['entryProfileSection','用户构成'],['entryRoundsSection','对话轮次'],['postClassCompletionSection','环节完成率'],['postClassConversationAnalysisSection','对话分析']];
const badCaseSubnav=[['badCaseOverviewSection','Bad case 总览'],['badCaseFilterSection','筛选与记录'],['badCaseRecordsSection','全部记录']];
function currentSubnav(){
 if(state.page==='overview')return{title:'总览页面',items:overviewSubnav};
 if(state.page==='badcases')return{title:'Bad case 库页面',items:badCaseSubnav};
 const title=`${D.dimensions.entries[state.entry]} 页面`;
 return{title,items:state.entry===2?postClassSubnav:standardEntrySubnav};
}
function syncSectionSubnav(){
 const nav=$('#sectionSubnav');if(!nav)return;
 $$('.entry-static-subnav').forEach(item=>item.classList.toggle('is-current',state.page==='entry'&&Number(item.dataset.entrySubnav)===state.entry));
 if(state.page==='entry'){
  nav.hidden=true;
  updateSectionSubnav();
  return;
 }
 const activePageLink=$('#pageNav .nav-page.active');
 if(activePageLink&&activePageLink.nextElementSibling!==nav)activePageLink.insertAdjacentElement('afterend',nav);
 const config=currentSubnav(),signature=`${state.page}:${state.entry}`;
 nav.hidden=false;
 if(nav.dataset.signature!==signature){
  nav.dataset.signature=signature;
  nav.setAttribute('aria-label',`${config.title}导航`);
  nav.innerHTML=config.items.map(([id,label],index)=>`<a href="#${id}" data-page-section="${id}"><span>${String(index+1).padStart(2,'0')}</span>${esc(label)}</a>`).join('');
 }
 updateSectionSubnav();
}
function updateSectionSubnav(preferredId=''){
  const nav=state.page==='entry'?document.querySelector(`.entry-static-subnav[data-entry-subnav="${state.entry}"]`):$('#sectionSubnav');if(!nav||nav.hidden)return;
  const offset=(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--filter-height'))||78)+42;
  const sectionLinks=state.page==='entry'?[...nav.querySelectorAll('[data-entry-section]')]:[...nav.querySelectorAll('[data-page-section]')];
  const visibleSections=sectionLinks.map(link=>document.getElementById(link.dataset.entrySection||link.dataset.pageSection)).filter(section=>section&&!section.classList.contains('hidden'));
  const current=preferredId||[...visibleSections].reverse().find(section=>section.getBoundingClientRect().top<=offset)?.id||visibleSections[0]?.id;
  $$('.entry-static-subnav [data-entry-section]').forEach(link=>{
   const active=state.page==='entry'&&Number(link.closest('[data-entry-subnav]').dataset.entrySubnav)===state.entry&&link.dataset.entrySection===current;
   link.classList.toggle('active',active);
   if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
  if(state.page!=='entry')nav.querySelectorAll('[data-page-section]').forEach(link=>{
   const active=link.dataset.pageSection===current;
   link.classList.toggle('active',active);
   if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  });
}

function renderOverview(){
  const ss=sessions(), ur=users();
  $('#globalKpis').innerHTML=[kpi('用户',fmt(uniq(ur,3)),'当前筛选内去重用户',colors[1]),kpi('Session',fmt(ss.length),'一次进入到离开的完整对话',colors[0]),kpi('用户消息',fmt(ur.length),'不把消息数当作用户数',colors[2])].join('');
  renderTrend();
  const byEntry=[0,1,2].map(e=>({label:D.dimensions.entries[e],value:sessions(e).length,color:colors[e]}));$('#entryShare').innerHTML=stack(byEntry,ss.length);
  renderVersionHistory();
  renderProfileOverview(ur);
}
function renderVersionHistory(){
  $('#versionHistory').innerHTML=productHistory.map((item,i)=>`<article class="version-event"><time datetime="${item.date}">${item.date.replaceAll('-','.')}</time><div><div class="version-title"><b>${esc(item.title)}</b><span>${esc(item.tag)}</span></div><ul>${item.details.map(detail=>`<li>${esc(detail)}</li>`).join('')}</ul></div><i style="--event-color:${colors[i%colors.length]}"></i></article>`).join('');
}
function renderProfileOverview(ur){
  const periodLabel=renderProfileWeekFilter();
  const scopes=window.DinoProfileComposition.aggregate(D,ur),selected=scopes.find(s=>s.key===state.profileEntry)||scopes[0],total=selected.total;
  $('#profileEntrySwitch').innerHTML=scopes.map(s=>`<button type="button" data-profile-entry="${s.key}" class="${s.key===selected.key?'active':''}" aria-pressed="${s.key===selected.key}">${esc(s.label)}<small>${fmt(s.total)} 人</small></button>`).join('');
  $('#profileScope').textContent=`${periodLabel} · ${selected.label} · ${fmt(total)} 位去重用户；${total?`每项占比的分母均为这 ${fmt(total)} 人`:'当前筛选无用户，暂不计算占比'}。统计当前筛选内有用户消息的人，同一用户在同一入口只计一次；整体跨入口去重，三个入口人数不可相加。`;
  const specs=[['年龄段',x=>x],['当前 Level',x=>x==='未记录'?x:`Level ${x}`],['来自哪个地区',countryName]];
  $('#profileOverview').innerHTML=specs.map(([title,labeler],pos)=>{
   let items=selected.dimensions[pos].map(item=>({...item,label:labeler(item.raw),color:colors[item.index%colors.length]}));
   if(pos===2&&items.length>12){const unknown=items.find(x=>x.raw==='未记录'),recorded=items.filter(x=>x.raw!=='未记录'),kept=recorded.slice(0,10),other=recorded.slice(10).reduce((sum,x)=>sum+x.value,0);items=[...kept,...(other?[{label:'其他地区',value:other,color:colors[6]}]:[]),...(unknown?[unknown]:[])];}
   const bars=items.map(item=>`<div class="stack-item" title="${esc(item.label)}：${fmt(item.value)} / ${fmt(total)} 人"><div class="stack-head"><span>${esc(item.label)}</span><b>${pct(item.value,total)}</b></div><div class="track" aria-hidden="true"><div class="fill" style="--accent:${item.color};width:${item.value/total*100}%"></div></div></div>`).join('');
   return `<section class="profile-block"><h4>${title}</h4>${total?bars:'<p class="empty-note">当前筛选下没有用户，暂不计算占比。</p>'}</section>`;
  }).join('');
  $$('#profileEntrySwitch button').forEach(button=>button.addEventListener('click',()=>{state.profileEntry=button.dataset.profileEntry;renderProfileOverview(users());$('#profileEntrySwitch').querySelector(`[data-profile-entry="${state.profileEntry}"]`).focus({preventScroll:true})}));
}
function renderProfileWeekFilter(){
  return renderWeekFilter('#profileWeekFilter');
}
function renderWeekFilter(selector){
  const select=$(selector);if(!select)return '';
  const weeks=window.DinoRoundDistribution.calendarWeeks(D.dimensions.dates),allDates=state.start===0&&state.end===D.dimensions.dates.length-1;
  const selected=allDates?null:weeks.find(week=>week.start===state.start&&week.end===state.end);
  const label=week=>`${week.startDate.slice(5)}—${week.endDate.slice(5)}${week.partial?'（不完整周）':''}`;
  select.innerHTML=`<option value="all" ${allDates?'selected':''}>全部统计周</option>${!allDates&&!selected?'<option value="custom" selected>自定义日期范围</option>':''}${weeks.map(week=>`<option value="${week.key}" ${selected?.key===week.key?'selected':''}>${label(week)}</option>`).join('')}`;
  select.onchange=event=>{
   const value=event.target.value,target=value==='all'?{start:0,end:D.dimensions.dates.length-1}:weeks.find(week=>week.key===value);
   if(target)document.dispatchEvent(new CustomEvent('dino:date-filter',{detail:{start:target.start,end:target.end}}));
  };
  return allDates?'全部统计周':selected?`统计周 ${label(selected)}`:`自定义日期 ${D.dimensions.dates[state.start].slice(5)}—${D.dimensions.dates[state.end].slice(5)}`;
}
function table(head,rows){return `<div class="comparison-row header">${head.map(x=>`<span>${x}</span>`).join('')}</div>${rows.map(r=>`<div class="comparison-row">${r.map((x,i)=>i?`<b>${x}</b>`:`<span>${x}</span>`).join('')}</div>`).join('')}`}
function renderTrend(){
  const metric=state.trendMetric,dates=D.dimensions.dates.slice(state.start,state.end+1),ss=sessions(),ur=users(),ar=ais(),series=[0,1,2].map(e=>dates.map(d=>{const day=D.dimensions.dates.indexOf(d);if(metric==='sessions')return ss.filter(r=>r[0]===e&&r[3]===day).length;if(metric==='users')return new Set(ur.filter(r=>r[1]===e&&r[0]===day).map(r=>r[3])).size;return ur.filter(r=>r[1]===e&&r[0]===day).length+ar.filter(r=>r[1]===e&&r[0]===day).length}));
  const W=900,H=260,pad=28,max=Math.max(...series.flat(),1),x=i=>pad+i*(W-pad*2)/Math.max(1,dates.length-1),y=v=>H-pad-v*(H-pad*2)/max;
  let svg=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${[0,.25,.5,.75,1].map(t=>`<line class="grid-line" x1="${pad}" x2="${W-pad}" y1="${y(max*t)}" y2="${y(max*t)}"/><text class="axis-label" x="2" y="${y(max*t)+3}">${fmt(max*t)}</text>`).join('')}`;
  series.forEach((s,e)=>{let points=s.map((v,i)=>`${x(i)},${y(v)}`).join(' ');svg+=`<polyline class="trend-line" stroke="${colors[e]}" points="${points}"/>`});
  svg+=`${dates.map((d,i)=>i%Math.ceil(dates.length/5)===0?`<text class="axis-label" x="${x(i)}" y="${H-3}" text-anchor="middle">${d.slice(5)}</text>`:'').join('')}</svg>`;$('#trendChart').innerHTML=svg;
  $$('#trendMetric button').forEach(b=>b.classList.toggle('active',b.dataset.metric===state.trendMetric));
}

function renderEntryVolume(e,ss,ur){
  const ar=ais(e),metric=state.entryTrendMetric,dates=D.dimensions.dates.slice(state.start,state.end+1);
  $('#entryVolumeKpis').innerHTML=[
    kpi('用户',fmt(uniq(ur,3)),'当前入口去重用户',colors[1]),
    kpi('Session',fmt(ss.length),'当前入口对话数',colors[0]),
    kpi('用户消息',fmt(ur.length),'不把消息数当作用户数',colors[2])
  ].join('');
  const values=dates.map(date=>{const day=D.dimensions.dates.indexOf(date);if(metric==='sessions')return ss.filter(r=>r[3]===day).length;if(metric==='users')return new Set(ur.filter(r=>r[0]===day).map(r=>r[3])).size;return ur.filter(r=>r[0]===day).length+ar.filter(r=>r[0]===day).length});
  const W=1100,H=280,pad=32,max=Math.max(...values,1),x=i=>pad+i*(W-pad*2)/Math.max(1,dates.length-1),y=v=>H-pad-v*(H-pad*2)/max,points=values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');
  $('#entryTrendChart').innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${[0,.25,.5,.75,1].map(t=>`<line class="grid-line" x1="${pad}" x2="${W-pad}" y1="${y(max*t)}" y2="${y(max*t)}"/><text class="axis-label" x="2" y="${y(max*t)+3}">${fmt(max*t)}</text>`).join('')}<path class="entry-trend-area" d="M${x(0)},${H-pad} L${points.replaceAll(' ', ' L')} L${x(values.length-1)},${H-pad} Z"/><polyline class="trend-line" stroke="${colors[e]}" points="${points}"/>${values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${colors[e]}"><title>${dates[i]}：${fmt(v)}</title></circle>`).join('')}${dates.map((d,i)=>i%Math.ceil(dates.length/6)===0||i===dates.length-1?`<text class="axis-label" x="${x(i)}" y="${H-3}" text-anchor="middle">${d.slice(5)}</text>`:'').join('')}</svg>`;
  const metricNotes={sessions:'Session 按导出中的首条消息日期计入当日，一段对话只计一次。',users:'同一用户在同一天、当前入口内只计一次，跨天可重复出现。',messages:'包含孩子与 Dino 双方消息；消息数不等于对话轮次。'};
  $('#entryTrendNote').textContent=metricNotes[metric];
  $$('#entryTrendMetric button').forEach(button=>button.classList.toggle('active',button.dataset.entryMetric===metric));
}

function profileBars(items,total,labeler,pos){
  let list=items.map(item=>({...item,label:labeler(item.raw),color:colors[item.index%colors.length]}));
  if(pos===2&&list.length>12){const unknown=list.find(x=>x.raw==='未记录'),recorded=list.filter(x=>x.raw!=='未记录'),kept=recorded.slice(0,10),other=recorded.slice(10).reduce((sum,x)=>sum+x.value,0);list=[...kept,...(other?[{label:'其他地区',value:other,color:colors[6]}]:[]),...(unknown?[unknown]:[])];}
  return list.map(item=>`<div class="stack-item" title="${esc(item.label)}：${fmt(item.value)} / ${fmt(total)} 人"><div class="stack-head"><span>${esc(item.label)}</span><b>${pct(item.value,total)}</b></div><div class="track" aria-hidden="true"><div class="fill" style="--accent:${item.color};width:${total?item.value/total*100:0}%"></div></div><small>${fmt(item.value)} 人</small></div>`).join('');
}
function renderEntryProfile(e,ur){
  const periodLabel=renderWeekFilter('#entryProfileWeekFilter'),selected=window.DinoProfileComposition.aggregate(D,ur)[0],total=selected.total,key=D.dimensions.entryKeys[e];
  $('#entryProfileScope').textContent=`${periodLabel} · ${key} · ${fmt(total)} 位去重用户；每项占比的分母均为当前筛选下的这 ${fmt(total)} 人。`;
  const specs=[['年龄段',x=>x],['当前 Level',x=>x==='未记录'?x:`Level ${x}`],['来自哪个地区',countryName]];
  $('#entryProfileOverview').innerHTML=specs.map(([title,labeler],pos)=>`<section class="profile-block"><h4>${title}</h4>${total?profileBars(selected.dimensions[pos],total,labeler,pos):'<p class="empty-note">当前筛选下没有用户，暂不计算占比。</p>'}</section>`).join('');
}

function detailedRoundBands(){
  return [
    ...Array.from({length:13},(_,round)=>({label:`${round} 轮`,min:round,max:round})),
    {label:'13–15 轮',min:13,max:15},{label:'16–20 轮',min:16,max:20},{label:'21+ 轮',min:21,max:Infinity}
  ];
}
function renderEntryRoundOverview(e,ss){
  const availableWeeks=window.DinoRoundDistribution.calendarWeeks(D.dimensions.dates.slice(state.start,state.end+1)),detailFilter=entryRoundFilters[e];
  if(detailFilter.week!=='all'&&!availableWeeks.some(week=>week.key===detailFilter.week))detailFilter.week='all';
  const detailSessions=window.DinoRoundDistribution.filterEntrySessions(D,ss,detailFilter);
  const bands=detailedRoundBands(),total=detailSessions.length,values=detailSessions.map(r=>r[5]).filter(Number.isFinite),maxCount=Math.max(1,...bands.map(b=>values.filter(n=>n>=b.min&&n<=b.max).length));
  const rows=bands.map((band,index)=>{const count=values.filter(n=>n>=band.min&&n<=band.max).length,reached=band.min?values.filter(n=>n>=band.min).length:total;return{...band,index,count,reached}});
  const visible=rows.filter(row=>row.count||row.min<=12),mean=values.length?values.reduce((sum,n)=>sum+n,0)/values.length:0;
  const weekly=window.DinoRoundDistribution.weeklyEntryStats(D,state,e),latest=weekly.at(-1),chartValues=weekly.flatMap(item=>[item.median,item.mean]).filter(Number.isFinite);
  const W=1040,H=270,padX=54,padTop=28,padBottom=42,maxWeekly=Math.max(1,...chartValues),x=index=>weekly.length===1?W/2:padX+index*(W-padX*2)/(weekly.length-1),y=value=>H-padBottom-(value??0)*(H-padTop-padBottom)/maxWeekly;
  const line=key=>weekly.map((item,index)=>Number.isFinite(item[key])?`${x(index)},${y(item[key])}`:'').filter(Boolean).join(' ');
  const changeLabel=item=>item?.delta===null?'—':`${item.delta>0?'+':''}${item.delta.toFixed(1)} 轮${item.deltaPct===null?'':` · ${item.deltaPct>0?'+':''}${item.deltaPct.toFixed(1)}%`}`;
  const changeClass=item=>!item||item.delta===null||item.delta===0?'flat':item.delta>0?'positive':'negative';
  const weekLabel=week=>`${week.startDate.slice(5)}—${week.endDate.slice(5)}${week.partial?'（不完整周）':''}`;
  const levelLabel=detailFilter.level==='all'?'全部 Level':D.dimensions.levels[Number(detailFilter.level)]==='未记录'?'未记录':`Level ${D.dimensions.levels[Number(detailFilter.level)]}`;
  const countryLabel=detailFilter.country==='all'?'全部国家／地区':countryName(D.dimensions.countries[Number(detailFilter.country)]);
  const selectedWeek=availableWeeks.find(week=>week.key===detailFilter.week),detailScope=`${selectedWeek?weekLabel(selectedWeek):'全部统计周'} · ${levelLabel} · ${countryLabel}`;
  const optionList=(values,selected,labeler)=>`<option value="all" ${selected==='all'?'selected':''}>全部</option>${values.map((value,index)=>`<option value="${index}" ${selected===String(index)?'selected':''}>${esc(labeler(value))}</option>`).join('')}`;
  const weeklyChart=weekly.length?`<svg class="entry-round-week-chart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${esc(D.dimensions.entries[e])}每周轮次变化趋势">${[0,.25,.5,.75,1].map(t=>`<line class="grid-line" x1="${padX}" x2="${W-padX}" y1="${y(maxWeekly*t)}" y2="${y(maxWeekly*t)}"/><text class="axis-label" x="5" y="${y(maxWeekly*t)+3}">${(maxWeekly*t).toFixed(1)}</text>`).join('')}<polyline class="round-week-line average" points="${line('mean')}"/><polyline class="round-week-line median" points="${line('median')}"/>${weekly.map((item,index)=>`${Number.isFinite(item.mean)?`<circle class="round-week-dot average" cx="${x(index)}" cy="${y(item.mean)}" r="4"><title>${item.startDate}—${item.endDate}：平均 ${item.mean.toFixed(1)} 轮</title></circle>`:''}${Number.isFinite(item.median)?`<circle class="round-week-dot median" cx="${x(index)}" cy="${y(item.median)}" r="5"><title>${item.startDate}—${item.endDate}：中位 ${item.median.toFixed(1)} 轮</title></circle>`:''}<text class="axis-label" x="${x(index)}" y="${H-10}" text-anchor="middle">${item.startDate.slice(5)}${item.partial?'*':''}</text>`).join('')}</svg>`:'<p class="empty-note">当前筛选下没有可展示的统计周。</p>';
  $('#entryRoundOverview').innerHTML=`<article class="panel entry-round-weekly"><div class="panel-head"><div><span class="index">03A</span><h3>轮次总览</h3></div><span class="unit">周一 → 周日 · 按 Session 首条消息归周</span></div><div class="round-week-kpis"><div><span>最新周中位轮次</span><strong>${latest?.median===null||!latest?'—':latest.median.toFixed(1)}</strong><small>轮</small></div><div><span>中位轮次环比</span><strong class="${changeClass(latest)}">${changeLabel(latest)}</strong><small>${latest?.delta===null||!latest?'当前范围内无上一周基准':'较上一个统计周'}</small></div><div><span>最新周平均轮次</span><strong>${latest?.mean===null||!latest?'—':latest.mean.toFixed(1)}</strong><small>轮</small></div><div><span>最新周 Session</span><strong>${fmt(latest?.total||0)}</strong><small>${latest?.startDate?.slice(5)||'—'} — ${latest?.endDate?.slice(5)||'—'}</small></div></div><div class="round-week-legend"><span><i class="median"></i>中位轮次</span><span><i class="average"></i>平均轮次</span></div><div class="round-week-chart-scroll">${weeklyChart}</div><div class="round-table-scroll"><table class="round-table round-week-table"><caption>当前入口每周的轮次水平与相邻周变化。</caption><thead><tr><th scope="col">统计周</th><th scope="col">Session</th><th scope="col">中位轮次</th><th scope="col">平均轮次</th><th scope="col">P25–P75</th><th scope="col">环比变化</th></tr></thead><tbody>${weekly.slice().reverse().map(item=>`<tr><th scope="row">${item.startDate.slice(5)} — ${item.endDate.slice(5)}${item.partial?'<small>不完整周</small>':''}</th><td><b>${fmt(item.total)}</b></td><td><b>${item.median===null?'—':item.median.toFixed(1)}</b></td><td><b>${item.mean===null?'—':item.mean.toFixed(1)}</b></td><td><b>${item.p25===null?'—':`${item.p25.toFixed(1)}–${item.p75.toFixed(1)}`}</b></td><td><b class="round-week-change ${changeClass(item)}">${changeLabel(item)}</b></td></tr>`).join('')}</tbody></table></div><p class="micro-note">环比以轮次中位数计算；“*”表示数据窗口内的不完整周。趋势描述变化，不直接归因。</p></article>
  <section class="entry-round-filters" aria-label="轮次分布与分档明细筛选"><div class="entry-round-filter-intro"><b>筛选轮次分布</b><p>仅更新下方的轮次分布与分档明细。</p></div><label><span>统计周</span><select data-entry-round-filter="week" aria-label="轮次分布统计周"><option value="all" ${detailFilter.week==='all'?'selected':''}>全部统计周</option>${availableWeeks.map(week=>`<option value="${week.key}" ${detailFilter.week===week.key?'selected':''}>${weekLabel(week)}</option>`).join('')}</select></label><label><span>Level</span><select data-entry-round-filter="level" aria-label="轮次分布 Level">${optionList(D.dimensions.levels,detailFilter.level,value=>value==='未记录'?value:`Level ${value}`)}</select></label><label><span>国家／地区</span><select data-entry-round-filter="country" aria-label="轮次分布国家地区">${optionList(D.dimensions.countries,detailFilter.country,countryName)}</select></label><button type="button" id="entryRoundFilterReset" ${detailFilter.week==='all'&&detailFilter.level==='all'&&detailFilter.country==='all'?'disabled':''}>重置</button><p class="entry-round-filter-scope" role="status">${esc(detailScope)} · ${fmt(total)} 个 Session</p></section>
  <div class="entry-round-summary"><article><span>轮次中位数</span><strong>${values.length?median(values).toFixed(1):'—'}</strong><small>轮</small></article><article><span>平均轮次</span><strong>${values.length?mean.toFixed(1):'—'}</strong><small>轮</small></article><article><span>P75</span><strong>${values.length?q(values,.75).toFixed(1):'—'}</strong><small>轮</small></article><article><span>有效 Session</span><strong>${fmt(values.length)}</strong><small>/ ${fmt(total)}</small></article></div>
  <article class="panel entry-round-distribution"><div class="panel-head"><div><span class="index">03B</span><h3>轮次分布</h3></div><span class="unit">实际已记录用户回答数</span></div><div class="entry-round-chart" role="img" aria-label="${esc(D.dimensions.entries[e])}轮次分布">${visible.map(row=>`<div class="entry-round-column"><span>${row.count?pct(row.count,total):''}</span><div class="entry-round-bar-wrap"><i style="height:${row.count/maxCount*100}%;--round-color:${colors[(row.index+e)%colors.length]}"></i></div><b>${row.label}</b><small>${fmt(row.count)}</small></div>`).join('')}</div><p class="micro-note">每个 Session 按完整记录的用户回答数归档。0–12 轮逐轮展示，13 轮以上保留更细的长尾分段。</p></article>
  <article class="panel entry-round-detail"><div class="panel-head"><div><span class="index">03C</span><h3>分档明细</h3></div><span class="unit">占比 · Session 数 · 到达率</span></div><div class="round-table-scroll"><table class="round-table"><caption>当前入口细分轮次档位；“到达该轮”表示实际轮次不低于档位起点的 Session。</caption><thead><tr><th scope="col">轮次档位</th><th scope="col">分布占比</th><th scope="col">Session 数</th><th scope="col">到达该轮</th></tr></thead><tbody>${visible.map(row=>`<tr><th scope="row"><i style="background:${colors[(row.index+e)%colors.length]}"></i>${row.label}</th><td><b>${pct(row.count,total)}</b></td><td><b>${fmt(row.count)}</b><small>/ ${fmt(total)} Session</small></td><td><b>${row.min?pct(row.reached,total):'—'}</b><small>${row.min?`${fmt(row.reached)} 个 Session`:'起始档位'}</small></td></tr>`).join('')}</tbody></table></div></article>
  <section id="roundTranscriptSamples" class="round-transcript-samples" aria-label="按轮次档位抽样对话"></section>
  <details class="round-method"><summary>统计口径与阅读说明</summary><ul><li>一条已记录的用户回答计 1 轮；Dino 单独发言及最终 CLOSE 不额外计轮次。</li><li>日期筛选选中期间内有消息的 Session；轮数取该 Session 在导出中的完整记录。</li><li>“按周”以 Session 首条消息日期归入周一至周日；Level 和国家／地区使用用户当前画像。</li><li>轮数少不直接等于失败；本区域描述实际分布，不作完成率判定。</li></ul></details>`;
  $$('[data-entry-round-filter]').forEach(select=>select.addEventListener('change',()=>{detailFilter[select.dataset.entryRoundFilter]=select.value;renderEntryRoundOverview(e,sessions(e))}));
  $('#entryRoundFilterReset').onclick=()=>{entryRoundFilters[e]={week:'all',level:'all',country:'all'};renderEntryRoundOverview(e,sessions(e))};
  window.DinoRoundTranscriptSampler?.render({entry:e,sessions:detailSessions,scopeKey:detailScope});
}

function renderEntry(){
  const e=state.entry,ss=sessions(e),ur=users(e),rounds=ss.map(r=>r[5]),dur=ss.map(r=>r[6]).filter(x=>x>=0),key=D.dimensions.entryKeys[e];
  const sampledAnalysis=$('#sampledConversationAnalysisSection'),showSampledAnalysis=e!==2;
  sampledAnalysis.classList.toggle('hidden',!showSampledAnalysis);sampledAnalysis.setAttribute('aria-hidden',String(!showSampledAnalysis));
  $('#entryEyebrow').textContent=`ENTRY / ${key}`;$('#entryTitle').textContent=`${D.dimensions.entries[e]}的真实对话`;
  $('#entrySummary').textContent=`${fmt(ss.length)} 个 Session 在筛选期间有消息；完整 Session 中位 ${median(rounds).toFixed(1)} 轮。下方行为统计仅计筛选期间消息，原文可展开整段上下文。`;
  renderEntryVolume(e,ss,ur);renderEntryProfile(e,ur);renderEntryRoundOverview(e,ss);
}
function renderTopics(e,ss){
  const tr=D.topicRows.filter(r=>r[1]===e&&inDate(r[0])&&profileMatches(r[2]));const sessionSets=new Map(),userSets=new Map(),messages=new Counter();
  tr.forEach(r=>{if(!sessionSets.has(r[5]))sessionSets.set(r[5],new Set());if(!userSets.has(r[5]))userSets.set(r[5],new Set());sessionSets.get(r[5]).add(r[3]);userSets.get(r[5]).add(r[2]);messages.add(r[5])});
  let items=D.discoveredTopics[e].map((t,i)=>({label:`「${t.label}」相关表达`,raw:t.label,value:sessionSets.get(i)?.size||0,index:i})).filter(x=>!state.topicSearch||x.raw.includes(state.topicSearch.toLowerCase())).sort((a,b)=>b.value-a.value).slice(0,state.topicSearch?60:15);
  $('#topicChart').innerHTML=barRows(items,ss.length,{onClick:'topic'});
  const ur=users(e),list=D.dimensions.interactions.slice(0,3).map((label,i)=>({label,value:new Set(ur.filter(r=>r[2]===i).map(r=>r[4])).size,index:i,color:colors[i]}));$('#sourceChart').innerHTML=stack(list,ss.length,'interaction');
  renderLevelTopic(e,ss,tr,items.slice(0,8));
}
function renderLevelTopic(e,ss,tr,topics){
  if(!topics.length){$('#levelTopic').innerHTML='<p class="empty-note">当前筛选没有可展示的话题。</p>';return}
  const available=D.dimensions.levels.map((label,i)=>({label,i})).filter(x=>state.level==='all'||x.i===+state.level).filter(x=>ss.some(r=>profileAt(r[1],1)===x.i));
  if(!available.length){$('#levelTopic').innerHTML='<p class="empty-note">当前筛选没有 Level 数据。</p>';return}
  let html=`<div class="topic-heat-grid" style="grid-template-columns:120px repeat(${topics.length},minmax(72px,1fr))"><span class="heat-cell heat-head">Level</span>${topics.map(t=>`<span class="heat-cell heat-head" title="${esc(t.raw)}">${esc(t.raw)}</span>`).join('')}`;
  available.forEach(level=>{const denom=new Set(ss.filter(r=>profileAt(r[1],1)===level.i).map(r=>r[2])).size;html+=`<span class="heat-cell heat-head">${level.label==='未记录'?'未记录':`Level ${level.label}`}</span>`;topics.forEach(t=>{const value=new Set(tr.filter(r=>r[5]===t.index&&profileAt(r[2],1)===level.i).map(r=>r[3])).size,ratio=value/Math.max(1,denom);html+=`<span class="heat-cell" style="--heat:${Math.min(.88,ratio*3)}" title="${value} / ${denom} Session">${pct(value,denom)}</span>`})});
  $('#levelTopic').innerHTML=html+'</div>';
}
class Counter{constructor(){this.m=new Map()}add(k){this.m.set(k,(this.m.get(k)||0)+1)}get(k){return this.m.get(k)||0}}
function hist(el,items,total){const max=Math.max(...items.map(x=>x.value),1);$(el).innerHTML=items.map(x=>`<div class="hist-col"><span>${pct(x.value,total)}</span><i class="hist-bar" style="height:${x.value/max*85}%"></i><b class="hist-label">${x.label}</b></div>`).join('')}
function renderSessions(e,ss){
  const buckets=window.DinoRoundDistribution.entryHistogramBands(e),vals=buckets.map(({label,test})=>({label,value:ss.filter(r=>test(r[5])).length}));hist('#sessionRoundDist',vals,ss.length);
  $('#sessionRoundUnit').textContent=e===2?'6–10 轮逐轮展示':'完整分布';
  $('#sessionRoundNote').textContent=e===2?'POST_CLASS 的 6、7、8、9、10 轮分别展示；每个比例的分母均为当前筛选下的 POST_CLASS Session。':'各档位互斥；每个比例的分母均为当前筛选下该入口的 Session。';
  const db=[['<1m',x=>x<1],['1–3m',x=>x<3],['3–5m',x=>x<5],['5–10m',x=>x<10],['10–20m',x=>x<20],['20m+',x=>x>=20]],ds=ss.filter(r=>r[6]>=0),du=new Set(),dv=db.map(([label,fn])=>{let value=ds.filter(r=>!du.has(r[2])&&fn(r[6])).length;ds.filter(r=>fn(r[6])).forEach(r=>du.add(r[2]));return{label,value}});hist('#durationDist',dv,ds.length);
  const ret=return7d(e);$('#returnPanel').innerHTML=`<strong>${ret.label}</strong><p>${ret.note}<br><small>${D.definitions.return7d}</small></p>`;
  const ints=D.dimensions.interactions.map((label,i)=>({label,value:ss.filter(r=>r[7]&(1<<i)).length,index:i}));$('#sessionBehavior').innerHTML=barRows(ints,ss.length,{compact:true,onClick:'interaction'});
}
function return7d(e){
  const ss=D.sessionRows.filter(r=>r[0]===e&&inDate(r[3])&&profileMatches(r[1])).sort((a,b)=>a[3]-b[3]),cutoff=state.end-7,byUser=new Map();ss.forEach(r=>{if(!byUser.has(r[1]))byUser.set(r[1],[]);byUser.get(r[1]).push(r[3])});let mature=0,returned=0;
  byUser.forEach(ds=>{const first=ds.find(d=>d<=cutoff);if(first===undefined)return;mature++;if(ds.some(d=>d>first&&d<=first+7))returned++});
  return{label:mature?pct(returned,mature):'—',note:mature?`${fmt(returned)} / ${fmt(mature)} 位成熟窗口用户回访`:'当前筛选没有完整 7 日观察窗口'};
}
function renderRounds(e,ss,ur){
  let limit=e===2?Math.max(...ss.map(r=>r[5]),1):Math.ceil(q(ss.map(r=>r[5]),.95));limit=Math.min(limit,30);const reach=Array.from({length:limit},(_,i)=>ss.filter(r=>r[5]>=i+1).length);lineChart('#reachCurve',reach,ss.length);
  $('#reachNote').textContent=e===2?'展示当前观察到的全部 Round；目标轮次待按 Level / Session 接入。':`展示至 P95（第 ${limit} 轮），其余并入长尾；每个点只回答“多少 Session 到达这一轮”。`;
  $('#roundBehavior').innerHTML=heat(ur,limit,D.dimensions.interactions,(r,i)=>r[2]===i);
  $('#roundDifficulty').innerHTML=heat(ur,limit,D.dimensions.difficulties,(r,i)=>r[8]===i);
}
function lineChart(el,values,total){const W=900,H=260,p=32,x=i=>p+i*(W-p*2)/Math.max(1,values.length-1),y=v=>H-p-v/Math.max(total,1)*(H-p*2),pts=values.map((v,i)=>`${x(i)},${y(v)}`).join(' ');$(el).innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${[0,.25,.5,.75,1].map(t=>`<line class="grid-line" x1="${p}" x2="${W-p}" y1="${y(total*t)}" y2="${y(total*t)}"/><text class="axis-label" x="2" y="${y(total*t)+3}">${Math.round(t*100)}%</text>`).join('')}<polyline class="trend-line" stroke="${colors[0]}" points="${pts}"/>${values.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v)}" r="2.5" fill="${colors[0]}"><title>Round ${i+1}: ${pct(v,total)}</title></circle>${(i===0||i===values.length-1||i%5===4)?`<text class="axis-label" x="${x(i)}" y="${H-3}" text-anchor="middle">R${i+1}</text>`:''}`).join('')}</svg>`}
function heat(rows,limit,labels,test){const cols=Math.min(limit,12),grid=[];grid.push('<span class="heat-cell heat-head">行为</span>'+Array.from({length:cols},(_,i)=>`<span class="heat-cell heat-head">R${i+1}</span>`).join(''));labels.forEach((label,li)=>{let s=`<span class="heat-cell heat-head">${label}</span>`;for(let r=1;r<=cols;r++){const at=rows.filter(x=>x[9]===r),v=at.filter(x=>test(x,li)).length/Math.max(1,at.length);s+=`<span class="heat-cell" style="--heat:${Math.min(.85,v*3)}">${pct(v,1)}</span>`}grid.push(s)});return `<div class="heat-grid" style="grid-template-columns:150px repeat(${cols},1fr)">${grid.join('')}</div>`}
function renderDifficulty(e,ss,ur){
  const diffs=D.dimensions.difficulties.map((label,i)=>({label,value:i===4?0:ss.filter(r=>r[9]&(1<<i)).length,index:i,color:colors[(i+3)%colors.length]}));$('#difficultyChart').innerHTML=barRows(diffs,ss.length,{onClick:'difficulty'});
  const nonMsg=ur.filter(r=>r[6]).length,nonSess=new Set(ur.filter(r=>r[6]).map(r=>r[4])).size,nonUsers=new Set(ur.filter(r=>r[6]).map(r=>r[3])).size,helpSess=ss.filter(r=>r[9]&(1<<2)).length;
  $('#languageMetrics').innerHTML=[[pct(nonMsg,ur.length),'非英语消息'],[pct(nonSess,ss.length),'涉及非英语的 Session'],[pct(nonUsers,uniq(ur,3)),'使用过非英语的用户'],[pct(helpSess,ss.length),'明确母语 / 翻译求助']].map(x=>`<div class="language-metric"><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('');
  const ar=ais(e).filter(r=>r[4]>=0),strats=D.dimensions.strategies.map((label,i)=>({label,value:ar.filter(r=>r[5]&(1<<i)).length,index:i}));$('#strategyChart').innerHTML=barRows(strats,ar.length,{compact:true});
  const outcomes=D.dimensions.outcomes.map((label,i)=>({label,value:ar.filter(r=>r[6]===i).length,index:i,color:colors[(i+1)%colors.length]}));$('#outcomeChart').innerHTML=stack(outcomes,ar.length);
  const br=ais(e),bad=D.dimensions.badCases.map((label,i)=>({label,value:br.filter(r=>r[9+i]).length,index:i,color:colors[(i+4)%colors.length]}));$('#badCaseChart').innerHTML=barRows(bad,br.length,{compact:true,onClick:'bad'});
}

function profileSummary(user){const p=D.userProfiles?.[user];if(!p)return '画像未记录';const age=D.dimensions.ageBands[p[0]],level=D.dimensions.levels[p[1]],country=D.dimensions.countries[p[2]];return `${age}岁 · ${level==='未记录'?'Level 未记录':`Level ${level}`} · 来自 ${countryName(country)}`}
function evidenceCard(item,i){return `<article class="evidence-card"><div class="evidence-top"><b>EVIDENCE ${String(i+1).padStart(2,'0')}</b><span>${D.dimensions.entries[item.entry]}</span><span>${item.date}</span><span>ROUND ${item.round||'—'}</span></div><div class="evidence-profile">${esc(profileSummary(item.profileUser))}</div><div class="utterance"><b>DINO</b><span>${esc(item.dino)}</span></div>${item.dino_en?`<div class="translation">${esc(item.dino_en)}</div>`:''}<div class="utterance user"><b>USER</b><span>${esc(item.user)}</span></div>${item.user_en?`<div class="translation">${esc(item.user_en)}</div>`:''}</article>`}
function openDrawer(title,cards,meta=''){const filtered=cards.filter(x=>x.entry===state.entry&&D.dimensions.dates.indexOf(x.date)>=state.start&&D.dimensions.dates.indexOf(x.date)<=state.end&&profileMatches(x.profileUser));$('#drawerTitle').textContent=title;$('#drawerMeta').textContent=meta||`${D.dimensions.entries[state.entry]} · 当前日期与画像筛选`;$('#drawerList').innerHTML=filtered.length?filtered.map(evidenceCard).join(''):'<article class="unavailable"><h3>当前筛选内暂无可展示证据</h3><p>扩大日期范围或放宽画像筛选，查看其他原始片段。</p></article>';$('#evidenceDrawer').classList.add('open');$('#drawerMask').classList.add('open');$('#evidenceDrawer').setAttribute('aria-hidden','false')}
function closeDrawer(){$('#evidenceDrawer').classList.remove('open');$('#drawerMask').classList.remove('open');$('#evidenceDrawer').setAttribute('aria-hidden','true')}
function renderAnalysisInsight(kind){
 const result=window.DinoDashboardInsights?.[kind]?.(D,state);if(!result)return;
 activeInsight=kind;$('#analysisDrawerTitle').textContent=result.title;$('#analysisDrawerMeta').textContent=result.meta;
 $('#analysisDrawerBody').innerHTML=`<section class="analysis-section analysis-key-section"><h3>关键数据结论</h3><ol class="analysis-conclusions">${result.conclusions.map(item=>`<li><span>${esc(item.title)}</span><p>${esc(item.body)}</p></li>`).join('')}</ol></section><section class="analysis-section"><h3>阅读口径</h3><ul class="analysis-notes">${result.notes.map(note=>`<li>${esc(note)}</li>`).join('')}</ul></section>`;
 $('#analysisDrawer').classList.add('open');$('#analysisDrawerMask').classList.add('open');$('#analysisDrawer').setAttribute('aria-hidden','false');
}
function closeAnalysisDrawer(){activeInsight=null;$('#analysisDrawer').classList.remove('open');$('#analysisDrawerMask').classList.remove('open');$('#analysisDrawer').setAttribute('aria-hidden','true')}
function bindDynamic(){
  $$('[data-action="topic"]').forEach(x=>x.onclick=()=>{const i=+x.dataset.index,t=D.discoveredTopics[state.entry][i];openDrawer(`话题：${t.label}`,t.evidence,'探索性自动话题 · 按涉及 Session 排序')});
  $$('[data-action="interaction"]').forEach(x=>x.onclick=()=>{const i=+x.dataset.index;openDrawer(D.dimensions.interactions[i],D.evidence[`interaction:${i}`]||[])});
  $$('[data-action="difficulty"]').forEach(x=>x.onclick=()=>{const i=+x.dataset.index;openDrawer(D.dimensions.difficulties[i],D.evidence[`difficulty:${i}`]||[],'用户困难 · 原始上下文')});
  $$('[data-action="bad"]').forEach(x=>x.onclick=()=>{const i=+x.dataset.index,l=D.dimensions.badCases[i];openDrawer(l,D.badEvidence[l]||[],'Bad case 规则候选 · 需要人工确认')});
  $$('[data-action]').forEach(x=>x.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();x.click()}});
}

const narrowNav=window.matchMedia('(max-width:700px)');
function setSidebar(open,restoreFocus=false){
 const visible=narrowNav.matches&&open;
 document.body.classList.toggle('nav-open',visible);
 $('#sidebarToggle').setAttribute('aria-expanded',String(visible));
 $('#sidebarToggle').setAttribute('aria-label',visible?'关闭导航':'打开导航');
 $('#dashboardSidebar').inert=narrowNav.matches&&!visible;
 if(visible)$('#pageNav a.active')?.focus({preventScroll:true});
 else if(restoreFocus&&narrowNav.matches)$('#sidebarToggle').focus({preventScroll:true});
}
$('#sidebarToggle').onclick=()=>setSidebar(!document.body.classList.contains('nav-open'));
$('#sidebarBackdrop').onclick=()=>setSidebar(false,true);
narrowNav.addEventListener('change',()=>setSidebar(false));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&document.body.classList.contains('nav-open'))setSidebar(false,true)});
setSidebar(false);
function syncUrl(){history.replaceState(null,'',state.page==='overview'?'./':state.page==='badcases'?'?page=badcases':`?page=entry&entry=${state.entry}&tab=${state.tab}`)}
$$('.nav-page').forEach(b=>b.addEventListener('click',event=>{
 // Keep standard link behavior for new-tab clicks, and retain a native-navigation fallback.
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 try{
  state.page=b.dataset.page==='entry'?'entry':b.dataset.page==='badcases'?'badcases':'overview';
  if(state.page==='entry')state.entry=+b.dataset.entry;
  renderAll();syncUrl();
  setSidebar(false,true);
  // Scroll after the new page has its final height, not while the previous page is visible.
  window.scrollTo({top:0,behavior:'instant'});
 }catch(error){console.error('Page navigation failed; opening the link directly.',error);window.location.assign(b.href)}
}));
$('#sectionSubnav').addEventListener('click',event=>{
 const link=event.target.closest('[data-page-section]');if(!link)return;
 event.preventDefault();
 const id=link.dataset.pageSection,target=document.getElementById(id);if(!target)return;
 updateSectionSubnav(id);
 setSidebar(false,true);
 target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
 history.replaceState(null,'',`${location.pathname}${location.search}#${id}`);
});
$$('.entry-static-subnav').forEach(nav=>nav.addEventListener('click',event=>{
 const link=event.target.closest('[data-entry-section]');if(!link)return;
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 const nextEntry=Number(nav.dataset.entrySubnav),id=link.dataset.entrySection;
 const entryChanged=state.page!=='entry'||state.entry!==nextEntry;
 if(entryChanged){
  state.page='entry';state.entry=nextEntry;
  renderAll();syncUrl();
 }
 const scrollToSection=()=>{
  const target=document.getElementById(id);if(!target||target.classList.contains('hidden'))return;
  updateSectionSubnav(id);
  setSidebar(false,true);
  target.scrollIntoView({behavior:entryChanged||window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});
  history.replaceState(null,'',`${location.pathname}${location.search}#${id}`);
 };
 if(entryChanged)requestAnimationFrame(()=>requestAnimationFrame(scrollToSection));
 else requestAnimationFrame(scrollToSection);
}));
let sectionNavFrame=0;
window.addEventListener('scroll',()=>{
 if(sectionNavFrame)return;
 sectionNavFrame=requestAnimationFrame(()=>{sectionNavFrame=0;updateSectionSubnav()});
},{passive:true});
function setTrendMetric(metric){if(['sessions','users','messages'].includes(metric)){state.trendMetric=metric;renderAll()}}
$$('#trendMetric button').forEach(b=>b.addEventListener('click',()=>setTrendMetric(b.dataset.metric)));
document.addEventListener('dino:trend-metric',event=>setTrendMetric(event.detail?.metric));
function setEntryTrendMetric(metric){if(['sessions','users','messages'].includes(metric)){state.entryTrendMetric=metric;renderAll()}}
$$('#entryTrendMetric button').forEach(b=>b.addEventListener('click',()=>setEntryTrendMetric(b.dataset.entryMetric)));
document.addEventListener('dino:entry-trend-metric',event=>setEntryTrendMetric(event.detail?.metric));
function setProfileFilters(patch){
  const dimensions={level:'levels',age:'ageBands',country:'countries'};
  let changed=false;
  Object.entries(dimensions).forEach(([key,dimension])=>{
    if(!Object.hasOwn(patch,key))return;
    const value=String(patch[key]);
    if(value!=='all'&&!D.dimensions[dimension].some((_,i)=>String(i)===value))return;
    state[key]=value;$('#'+key+'Filter').value=value;changed=true;
  });
  if(changed)renderAll();
}
document.addEventListener('dino:profile-filter',event=>setProfileFilters(event.detail||{}));
function fillProfileFilter(id,values,stateKey,labeler=x=>x){const el=$(id);el.innerHTML=`<option value="all">全部</option>`+values.map((x,i)=>`<option value="${i}">${esc(labeler(x))}</option>`).join('');el.addEventListener('change',()=>setProfileFilters({[stateKey]:el.value}))}
fillProfileFilter('#levelFilter',D.dimensions.levels,'level',x=>x==='未记录'?x:`Level ${x}`);
fillProfileFilter('#ageFilter',D.dimensions.ageBands,'age',x=>x==='未记录'?x:`${x} 岁`);
fillProfileFilter('#countryFilter',D.dimensions.countries,'country',countryName);
$('#dateStart').min=D.meta.dateStart;$('#dateStart').max=D.meta.dateEnd;$('#dateEnd').min=D.meta.dateStart;$('#dateEnd').max=D.meta.dateEnd;$('#dateStart').value=D.meta.dateStart;$('#dateEnd').value=D.meta.dateEnd;
function applyDates(){state.start=Math.max(0,D.dimensions.dates.indexOf($('#dateStart').value));state.end=Math.max(state.start,D.dimensions.dates.indexOf($('#dateEnd').value));renderAll()}
document.addEventListener('dino:date-filter',event=>{
 const {start,end}=event.detail||{};
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<start||end>=D.dimensions.dates.length)return;
 state.start=start;state.end=end;
 $('#dateStart').value=D.dimensions.dates[start];$('#dateEnd').value=D.dimensions.dates[end];renderAll();
});
$('#dateStart').addEventListener('change',applyDates);$('#dateEnd').addEventListener('change',applyDates);$('#resetFilter').onclick=()=>{state.start=0;state.end=D.dimensions.dates.length-1;state.level=state.age=state.country='all';$('#dateStart').value=D.meta.dateStart;$('#dateEnd').value=D.meta.dateEnd;$('#levelFilter').value=$('#ageFilter').value=$('#countryFilter').value='all';state.topicSearch='';$('#topicSearch').value='';closeDrawer();renderAll()};
$('#drawerClose').onclick=closeDrawer;$('#drawerMask').onclick=closeDrawer;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});$('#themeToggle').onclick=()=>document.body.classList.toggle('dark');
document.addEventListener('click',event=>{const trigger=event.target.closest?.('[data-insight]');if(trigger)renderAnalysisInsight(trigger.dataset.insight)});
$('#analysisDrawerClose').onclick=closeAnalysisDrawer;$('#analysisDrawerMask').onclick=closeAnalysisDrawer;document.addEventListener('keydown',e=>{if(e.key==='Escape')closeAnalysisDrawer()});
if(params.get('page')==='distribution')syncUrl();
renderAll();
})();
