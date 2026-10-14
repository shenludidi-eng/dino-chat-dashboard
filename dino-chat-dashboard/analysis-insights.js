/* Filter-aware descriptive conclusions for the overview analysis drawer. */
((root)=>{
'use strict';
const DIMENSIONS=['age','level','country'];
const regionNames=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
const countryName=code=>code==='未记录'?code:`${regionNames?.of(code)||code} · ${code}`;
const profileMatches=(data,state,user)=>DIMENSIONS.every((key,pos)=>state[key]==='all'||data.userProfiles?.[user]?.[pos]===Number(state[key]));
const pct=(value,total)=>total?value/total*100:0;
const change=(current,previous)=>previous?(current-previous)/previous*100:null;
const signed=value=>value===null?'样本不足':`${value>=0?'+':''}${value.toFixed(1)}%`;
function filteredRows(data,state){return data.rows.filter(r=>r[0]>=state.start&&r[0]<=state.end&&profileMatches(data,state,r[3]))}
function traffic(data,state){
 const rows=filteredRows(data,state),byEntry=data.dimensions.entries.map((label,entry)=>{
  const scope=rows.filter(r=>r[1]===entry),users=new Set(scope.map(r=>r[3])).size;
  return {entry,label,users,messages:scope.length};
 });
 const ranked=[...byEntry].sort((a,b)=>b.users-a.users),top=ranked[0];
 const selectedDates=data.dimensions.dates.slice(state.start,state.end+1);
 const weeks=root.DinoRoundDistribution.calendarWeeks(selectedDates).reverse().map(week=>{
  const userSets=data.dimensions.entries.map(()=>new Set());
  for(const row of rows){const date=data.dimensions.dates[row[0]];if(date>=week.startDate&&date<=week.endDate)userSets[row[1]].add(row[3]);}
  return {...week,entries:userSets.map(s=>s.size),total:new Set(userSets.flatMap(s=>[...s])).size};
 });
 const complete=weeks.filter(w=>!w.partial),latest=complete.at(-1),previous=complete.at(-2);
 const trends=byEntry.map(item=>({label:item.label,users:item.users,weeklyChange:latest&&previous?change(latest.entries[item.entry],previous.entries[item.entry]):null,
  latestUsers:latest?.entries[item.entry]??null,previousUsers:previous?.entries[item.entry]??null}));
 const postClass=trends.find(x=>x.label==='POST_CLASS');
 const entryChanges=trends.map(x=>`${x.label} ${signed(x.weeklyChange)}`).join('，');
 const conclusions=[];
 if(top?.users)conclusions.push({title:`${top.label} 用户量最大`,body:`当前筛选下，${top.label} 覆盖 ${top.users.toLocaleString('zh-CN')} 位去重用户，是三个入口中用户量最大的入口。`});
 if(postClass)conclusions.push({title:'POST_CLASS 增幅明显',body:postClass.weeklyChange===null?'当前筛选不足两个完整周，暂时无法计算 POST_CLASS 的周增长率。':`最近完整周较前一周，POST_CLASS 用户量变化 ${signed(postClass.weeklyChange)}；三个入口分别为：${entryChanges}。这里只描述变化，不判断原因。`});
 return {kind:'traffic',title:'流量分析',meta:`${data.dimensions.dates[state.start]} — ${data.dimensions.dates[state.end]} · ${data.meta.timeBasis||'北京时间'} · 响应当前画像筛选`,
  conclusions:conclusions.length?conclusions:[{title:'当前筛选暂无结论',body:'当前筛选没有用户消息。'}],
  notes:['周趋势按北京时间的周一至周日计算。','同一用户可出现在多个入口；入口用户量只能用于入口内规模比较。','结论随日期、Level、年龄和地区筛选自动更新。']};
}
function topItem(items){return items?.[0]||null}
function profile(data,state){
 const rows=filteredRows(data,state),scopes=root.DinoProfileComposition.aggregate(data,rows);
 const labelers=[x=>x,x=>x==='未记录'?x:`Level ${x}`,countryName];
 const scopeCards=scopes.map(scope=>{
  const tops=scope.dimensions.map((items,pos)=>{const item=topItem(items);return item?{label:labelers[pos](item.raw),value:item.value,share:pct(item.value,scope.total)}:null});
  return {label:scope.label,total:scope.total,tops};
 });
 const overall=scopeCards[0],dimensionNames=['年龄段','Level','地区'];
 const conclusions=[];
 if(overall.total)conclusions.push({title:'整体用户构成',body:dimensionNames.map((name,pos)=>`${name}最多的是 ${overall.tops[pos]?.label||'—'}（${overall.tops[pos]?.share.toFixed(1)||'0.0'}%）`).join('；').replace('Level最多','Level 最多')+'。'});
 for(const scope of scopeCards.slice(1))if(scope.total)conclusions.push({title:`${scope.label} 用户构成`,body:`主要年龄段为 ${scope.tops[0]?.label||'—'}（${scope.tops[0]?.share.toFixed(1)||'0.0'}%），主要 Level 为 ${scope.tops[1]?.label||'—'}（${scope.tops[1]?.share.toFixed(1)||'0.0'}%），主要地区为 ${scope.tops[2]?.label||'—'}（${scope.tops[2]?.share.toFixed(1)||'0.0'}%）。`});
 return {kind:'profile',title:'用户构成分析',meta:`${data.dimensions.dates[state.start]} — ${data.dimensions.dates[state.end]} · 响应当前筛选`,
  conclusions:conclusions.length?conclusions:[{title:'当前筛选暂无结论',body:'当前筛选没有用户消息。'}],
  notes:['每个入口内按去重用户计算；整体跨入口去重。','“未记录”保留在分母中，避免高估已知画像占比。','地区来自最近设备记录，不代表国籍或对话发生地。']};
}
root.DinoDashboardInsights={traffic,profile};
})(typeof window==='undefined'?globalThis:window);
