const assert=require('node:assert/strict');
require('../post-class-completion.js');

const data={
 dimensions:{dates:['2026-09-21','2026-09-22','2026-09-28'],levels:['1','2','未记录'],countries:['MY','VN','未记录']},
 userProfiles:[[0,0,0],[0,0,1],[0,1,1],[0,2,2]],
};
const rows=[
 [0,10,0,1],[0,11,1,1], // same user: completed status repeats on every opened session
 [1,12,1,0],
 [2,13,2,1],
 [3,14,2,0],
];
const all={start:0,end:2,age:'all',level:'all',country:'all'};
const result=globalThis.DinoPostClassCompletion.aggregate(data,rows,all);
assert.equal(result.total,4);
assert.equal(result.completed,2);
assert.equal(result.rate,.5);
assert.deepEqual(result.levels.map(x=>[x.index,x.total,x.completed]),[[0,2,1],[1,1,1],[2,1,0]]);
assert.deepEqual(result.countries.map(x=>[x.index,x.total,x.completed]),[[1,2,1],[0,1,1],[2,1,0]]);

const week=globalThis.DinoPostClassCompletion.aggregate(data,rows,{...all,start:1,end:1});
assert.equal(week.total,2);
assert.equal(week.completed,1);

const filtered=globalThis.DinoPostClassCompletion.aggregate(data,rows,{...all,level:'0',country:'1'});
assert.equal(filtered.total,1);
assert.equal(filtered.completed,0);

const detailWeek=globalThis.DinoPostClassCompletion.aggregate(data,rows,all,{week:'2026-09-21'});
assert.equal(detailWeek.total,2);
assert.equal(detailWeek.completed,1);

const detailProfile=globalThis.DinoPostClassCompletion.aggregate(data,rows,all,{level:'0',country:'1'});
assert.equal(detailProfile.total,1);
assert.equal(detailProfile.completed,0);

const weeks=globalThis.DinoPostClassCompletion.calendarWeeks(data.dimensions.dates);
assert.deepEqual(weeks.map(x=>x.key),['2026-09-21','2026-09-28']);
const weekly=globalThis.DinoPostClassCompletion.weeklyStats(data,rows,all);
assert.deepEqual(weekly.map(x=>[x.total,x.completed]),[[2,1],[2,1]]);
assert.equal(weekly[1].delta,0);

const empty=globalThis.DinoPostClassCompletion.aggregate(data,rows,{...all,start:9,end:10});
assert.equal(empty.total,0);
assert.equal(empty.rate,null);

const sortable=[
 {index:0,total:100,completed:50},
 {index:1,total:20,completed:18},
 {index:2,total:60,completed:42},
];
assert.deepEqual(
 globalThis.DinoPostClassCompletion.sortBreakdown(sortable,'count').map(x=>x.index),
 [0,2,1],
);
assert.deepEqual(
 globalThis.DinoPostClassCompletion.sortBreakdown(sortable,'rate').map(x=>x.index),
 [1,2,0],
);
assert.deepEqual(sortable.map(x=>x.index),[0,1,2]);
console.log('post-class-completion: ok');
