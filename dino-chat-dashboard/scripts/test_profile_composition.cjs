const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../profile-composition.js'),'utf8'),ctx);
const {aggregate}=ctx.DinoProfileComposition;
const fixture={dimensions:{entries:['HOME','EXPLORE','POST_CLASS'],ageBands:['6-8','未记录'],levels:['1','2','未记录'],countries:['VN','MY','未记录']},userProfiles:[[0,0,0],[0,1,1]]};
const rows=[[0,0,0,0],[0,0,0,0],[0,1,0,0],[0,1,0,1],[0,2,0,2]];
const result=aggregate(fixture,rows);
assert.deepEqual(Array.from(result,s=>s.total),[3,1,2,1]);
assert.equal(result[1].dimensions[0][0].value,1); // repeated messages do not weight users
assert.equal(result[2].dimensions[1].length,2);
for(const dim of result[3].dimensions){assert.equal(dim[0].raw,'未记录');assert.equal(dim[0].value,1)}
for(const s of result)for(const dim of s.dimensions)assert.equal(dim.reduce((n,x)=>n+x.value,0),s.total);
assert.ok(aggregate(fixture,[]).every(s=>s.total===0&&s.dimensions.every(dim=>dim.length===0)));
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),{window});
const D=window.DINO_DATA,full=aggregate(D,D.rows);
assert.deepEqual(Array.from(full,s=>s.total),[new Set(D.rows.map(r=>r[3])).size,...[0,1,2].map(e=>new Set(D.rows.filter(r=>r[1]===e).map(r=>r[3])).size)]);
const level=D.dimensions.levels.indexOf('1'),country=D.dimensions.countries.indexOf('VN');
const filtered=D.rows.filter(r=>r[0]>=14&&r[0]<=20&&D.userProfiles[r[3]]?.[1]===level&&D.userProfiles[r[3]]?.[2]===country);
const subset=aggregate(D,filtered);
assert.deepEqual(Array.from(subset,s=>s.total),[84,68,31,27]);
for(const scopes of [full,subset])for(const s of scopes)for(const dim of s.dimensions)assert.equal(dim.reduce((n,x)=>n+x.value,0),s.total);
for(const s of subset){assert.equal(s.dimensions[1][0].raw,'1');assert.equal(s.dimensions[2][0].raw,'VN');assert.equal(s.dimensions[1][0].value,s.total)}
console.log(JSON.stringify({status:'PASS',checks:['message dedup','cross-entry dedup','missing profile','empty entry','all dimensions reconcile','date + level + country intersection'],full:full.map(s=>({entry:s.label,users:s.total})),filtered:subset.map(s=>({entry:s.label,users:s.total}))},null,2));
