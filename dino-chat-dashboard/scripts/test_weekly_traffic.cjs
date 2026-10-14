const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);
for(const file of ['round-distribution.js','weekly-traffic.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
const {aggregate}=ctx.DinoWeeklyTraffic;
const dates=Array.from({length:10},(_,i)=>new Date(Date.UTC(2026,8,14+i)).toISOString().slice(0,10));
const all={start:0,end:9,age:'all',level:'all',country:'all'};
const fixture={dimensions:{dates,entries:['HOME','EXPLORE','POST_CLASS']},userProfiles:[[0,0,0],[0,1,1]],
 rows:[[0,0,0,0,0],[1,0,0,0,0],[6,0,0,0,1],[7,0,0,0,1],[6,1,0,0,2],[8,1,0,1,3]],
 aiRows:[[0,0,0],[1,0,0],[6,0,1],[7,0,1],[6,1,2],[8,1,3],[8,2,4]],
 sessionRows:[[0,0,0,0,1],[0,0,1,6,7],[1,0,2,6,6],[1,1,3,8,8],[2,1,4,8,8]]};
const results=aggregate(fixture,all);
assert.equal(results.length,2);
assert.equal(results[0].partial,false);assert.equal(results[1].partial,true);assert.equal(results[1].days,3);
assert.equal(results[0].entries[0].users,1); // several days / sessions, one weekly user
assert.equal(results[0].entries[1].users,1);assert.equal(results[0].total.users,1); // deduplicate across entries
assert.equal(results[1].total.users,2);assert.equal(results[1].entries[2].users,0); // no user message
assert.equal(results[0].entries[0].sessions,2);assert.equal(results[1].entries[0].sessions,0); // cross-week session assigned once
assert.equal(results[1].entries[0].messages,2); // messages still belong to their own week
assert.equal(results[1].entries[2].messages,1);assert.equal(results[1].entries[2].sessions,1); // Dino-only remains in traffic
assert.equal(results.reduce((n,w)=>n+w.total.sessions,0),5);
assert.equal(results.reduce((n,w)=>n+w.total.messages,0),13);
const sliced=aggregate(fixture,{...all,start:2,end:7});
assert.equal(sliced[0].days,5);assert.equal(sliced[0].partial,true);assert.equal(sliced[1].days,1);
const filtered=aggregate(fixture,{...all,level:'0',country:'0'});
assert.equal(filtered[1].total.sessions,0);assert.equal(filtered[1].total.users,1);
assert.ok(aggregate(fixture,{...all,level:'0',country:'1'}).every(w=>w.total.sessions===0&&w.total.messages===0&&w.total.users===0));
assert.ok(aggregate(fixture,{...all,age:'1'}).every(w=>w.total.users===0));
assert.equal(aggregate(fixture,{...all,start:11,end:12}).length,0);
const sparse=aggregate({...fixture,dimensions:{...fixture.dimensions,dates:['2026-09-14','2026-09-20']},rows:[],aiRows:[],sessionRows:[]},{...all,end:1});
assert.equal(sparse[0].partial,true);assert.equal(sparse[0].days,2);
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),{window});
const D=window.DINO_DATA,state={...all,end:D.dimensions.dates.length-1};
const actual=aggregate(D,state);
assert.equal(actual.length,4);assert.equal(actual.at(-1).days,7);
assert.equal(actual.at(-1).partial,false);
assert.equal(actual.reduce((n,w)=>n+w.total.sessions,0),D.sessionRows.length);
assert.equal(actual.reduce((n,w)=>n+w.total.messages,0),D.rows.length+D.aiRows.length);
const filteredState={...state,start:14,end:20,level:String(D.dimensions.levels.indexOf('1')),country:String(D.dimensions.countries.indexOf('VN'))};
for(const query of [state,filteredState,{...state,start:7,end:9}]){
 const weeks=aggregate(D,query),sessionUser=new Map(D.sessionRows.map(r=>[r[2],r[1]]));
 const match=u=>['age','level','country'].every((key,i)=>query[key]==='all'||D.userProfiles[u]?.[i]===Number(query[key]));
 for(const w of weeks){
  const inWeek=day=>day>=query.start&&day<=query.end&&D.dimensions.dates[day]>=w.startDate&&D.dimensions.dates[day]<=w.endDate;
  const users=D.rows.filter(r=>inWeek(r[0])&&match(r[3]));
  const ais=D.aiRows.filter(r=>inWeek(r[0])&&match(sessionUser.get(r[2])));
  assert.equal(w.total.users,new Set(users.map(r=>r[3])).size);
  assert.equal(w.total.messages,users.length+ais.length);
  for(let e=0;e<3;e++){
   assert.equal(w.entries[e].users,new Set(users.filter(r=>r[1]===e).map(r=>r[3])).size);
   assert.equal(w.entries[e].sessions,D.sessionRows.filter(r=>r[0]===e&&inWeek(r[3])&&match(r[1])).length);
  }
 }
}
console.log(JSON.stringify({status:'PASS',checks:['weekly dedup','cross-entry union','cross-week session attribution','message dates','Dino-only','profile intersection','partial weeks','empty result','source reconciliation'],weeks:actual},null,2));
