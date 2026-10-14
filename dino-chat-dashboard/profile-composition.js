/* rows must already reflect the dashboard date and profile filters. */
((root)=>{
'use strict';
function aggregate(data,rows){
 const scopes=[{key:'all',label:'整体',ids:new Set()},...data.dimensions.entries.map((label,i)=>({key:String(i),label,ids:new Set()}))];
 for(const row of rows){scopes[0].ids.add(row[3]);scopes[row[1]+1].ids.add(row[3])}
 return scopes.map(({key,label,ids})=>({key,label,total:ids.size,dimensions:['ageBands','levels','countries'].map((dim,pos)=>{
  const labels=data.dimensions[dim],counts=new Map(labels.map((raw,index)=>[raw,{raw,index,value:0}]));
  for(const user of ids){
   const raw=labels[data.userProfiles?.[user]?.[pos]]??'未记录';
   if(!counts.has(raw))counts.set(raw,{raw,index:labels.length,value:0});
   counts.get(raw).value++;
  }
  return [...counts.values()].filter(item=>item.value).sort((a,b)=>b.value-a.value||a.index-b.index);
 })}));
}
root.DinoProfileComposition={aggregate};
})(typeof window==='undefined'?globalThis:window);
