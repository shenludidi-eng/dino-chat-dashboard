const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../round-distribution.js'),'utf8'),ctx);
const {aggregate,bucket,calendarWeeks,entryHistogramBands,weeklyEntryStats,filterEntrySessions}=ctx.DinoRoundDistribution;
for(const [n,expected] of [[0,0],[1,0],[2,0],[3,1],[5,1],[6,2],[10,2],[11,3],[20,3],[21,4],[1000,4],[-1,-1],[null,-1],[2.5,-1]])assert.equal(bucket(n),expected);
assert.deepEqual(Array.from(entryHistogramBands(2),item=>item.label),['≤2 轮','3–5 轮','6 轮','7 轮','8 轮','9 轮','10 轮','11+ 轮']);
for(const round of [0,1,2,3,4,5,6,7,8,9,10,11,20])assert.equal(entryHistogramBands(2).filter(item=>item.test(round)).length,1);
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),{window});
const D=window.DINO_DATA;
const state={start:0,end:D.dimensions.dates.length-1,age:'all',level:'all',country:'all'};
const weeks=calendarWeeks(D.dimensions.dates);
assert.deepEqual(Array.from(weeks,w=>[w.startDate,w.endDate,w.partial]),[
 ['2026-10-05','2026-10-11',false],['2026-09-28','2026-10-04',false],['2026-09-21','2026-09-27',false],['2026-09-14','2026-09-20',false]
]);
assert.equal(weeks[0].end,D.dimensions.dates.length-1);
assert.equal(calendarWeeks([]).length,0);
const yearBoundary=calendarWeeks(['2026-12-30','2026-12-31','2027-01-01']);
assert.equal(yearBoundary[0].startDate,'2026-12-28');assert.equal(yearBoundary[0].endDate,'2027-01-03');assert.equal(yearBoundary[0].partial,true);
const gapWeeks=calendarWeeks(['2026-09-14','2026-09-28']);
assert.equal(gapWeeks.length,2); // no invented week containing no dates
const selectedWeek=weeks.find(w=>w.key==='2026-09-28');
const weekly=aggregate(D,{...state,start:selectedWeek.start,end:selectedWeek.end});
for(let e=0;e<3;e++){
 const ids=new Set(D.rows.filter(r=>r[1]===e&&r[0]>=selectedWeek.start&&r[0]<=selectedWeek.end).map(r=>r[4]));
 for(const r of D.aiRows)if(r[1]===e&&r[0]>=selectedWeek.start&&r[0]<=selectedWeek.end)ids.add(r[2]);
 assert.equal(weekly[e].total,ids.size);
 assert.equal(weekly[e].counts.reduce((a,b)=>a+b,0)+weekly[e].unknown,ids.size);
}
const all=aggregate(D,state);
assert.equal(all.reduce((s,r)=>s+r.total,0),D.sessionRows.length);
assert.deepEqual(Array.from(all,r=>r.total),[0,1,2].map(e=>D.sessionRows.filter(r=>r[0]===e).length));
assert.deepEqual(Array.from(all,r=>r.median),[4,4,7]);
const homeWeekly=weeklyEntryStats(D,state,0);
assert.equal(homeWeekly.length,4);
assert.deepEqual(Array.from(homeWeekly,item=>item.startDate),['2026-09-14','2026-09-21','2026-09-28','2026-10-05']);
for(const item of homeWeekly){
 const expected=D.sessionRows.filter(r=>r[0]===0&&D.dimensions.dates[r[3]]>=item.startDate&&D.dimensions.dates[r[3]]<=item.endDate);
 assert.equal(item.total,expected.length);
 assert.equal(item.known,expected.filter(r=>Number.isFinite(r[5])).length);
}
assert.equal(homeWeekly.reduce((sum,item)=>sum+item.total,0),D.sessionRows.filter(r=>r[0]===0).length);
const postClassSessions=D.sessionRows.filter(r=>r[0]===2),postClassDetail=entryHistogramBands(2).map(item=>postClassSessions.filter(r=>item.test(r[5])).length);
assert.equal(postClassDetail.reduce((sum,value)=>sum+value,0),postClassSessions.length);
const roundsBySession=new Map();for(const r of D.rows)roundsBySession.set(r[4],(roundsBySession.get(r[4])||0)+1);
for(const r of D.sessionRows)assert.equal(r[5],roundsBySession.get(r[2])||0);
for(const r of all)assert.equal(r.counts.reduce((a,b)=>a+b,0)+r.unknown,r.total);
const level=String(D.dimensions.levels.indexOf('1')),country=String(D.dimensions.countries.indexOf('VN'));
const filtered=aggregate(D,{...state,level,country});
assert.deepEqual(Array.from(filtered,r=>r.total),[0,1,2].map(e=>D.sessionRows.filter(r=>r[0]===e&&D.userProfiles[r[1]][1]===Number(level)&&D.userProfiles[r[1]][2]===Number(country)).length));
const fixture={dimensions:{entries:['HOME','EXPLORE','POST_CLASS'],dates:['2026-09-14','2026-09-15','2026-09-21','2026-09-22']},userProfiles:[[0,0,0],[0,1,0]],rows:[[1,0,0,0,0],[2,0,0,0,0],[1,1,0,1,1]],aiRows:[[1,2,2]],sessionRows:[[0,0,0,1,2,10],[1,1,1,1,1,2],[2,0,2,1,1,0]]};
const oneDay=aggregate(fixture,{...state,start:1,end:1});
assert.equal(oneDay[0].counts[2],1); // date window does not truncate full-session rounds
assert.equal(oneDay[2].counts[0],1); // assistant-only session remains in denominator
assert.equal(oneDay[2].zero,1);
assert.equal(aggregate(fixture,{...state,start:1,end:1,level:'0'})[1].total,0);
assert.ok(aggregate(fixture,{...state,start:9,end:9}).every(r=>r.total===0&&r.median===null));
fixture.sessionRows.push([0,0,3,2,1,4],[0,0,4,3,1,6],[0,1,5,3,1,8]);
const fixtureWeekly=weeklyEntryStats(fixture,{...state,start:0,end:3},0);
assert.deepEqual(Array.from(fixtureWeekly,item=>item.total),[1,3]);
assert.deepEqual(Array.from(fixtureWeekly,item=>item.median),[10,6]);
assert.equal(fixtureWeekly[1].mean,6);
assert.equal(fixtureWeekly[1].delta,-4);
assert.equal(fixtureWeekly[1].deltaPct,-40);
assert.equal(weeklyEntryStats(fixture,{...state,start:0,end:3,level:'0'},0)[1].total,2);
const fixtureHome=fixture.sessionRows.filter(row=>row[0]===0);
assert.equal(filterEntrySessions(fixture,fixtureHome,{week:'2026-09-21',level:'all',country:'all'}).length,3);
assert.equal(filterEntrySessions(fixture,fixtureHome,{week:'2026-09-21',level:'1',country:'all'}).length,1);
assert.equal(filterEntrySessions(fixture,fixtureHome,{week:'all',level:'0',country:'0'}).length,3);
fixture.sessionRows[0][5]=null;
assert.equal(aggregate(fixture,{...state,start:1,end:1})[0].unknown,1);
console.log(JSON.stringify({status:'PASS',checks:['bucket boundaries','POST_CLASS 6–10 detail bands','rounds equal user answers','full-data reconciliation','median rounds','weekly round trend','weekly change','weekly profile filters','entry detail week filter','entry detail level filter','entry detail country filter','combined profile filters','date scope','zero rounds','no data','missing rounds'],all,postClassDetail,level1Vietnam:filtered},null,2));
