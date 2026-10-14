const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={Intl};vm.createContext(ctx);
for(const file of ['round-distribution.js','profile-composition.js','analysis-insights.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
const window={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../data.js'),'utf8'),{window});
const D=window.DINO_DATA,state={start:0,end:D.dimensions.dates.length-1,age:'all',level:'all',country:'all'};
const traffic=ctx.DinoDashboardInsights.traffic(D,state);
assert.equal(traffic.conclusions.length,2);
assert.match(traffic.conclusions[0].title,/HOME 用户量最大/);
assert.match(traffic.conclusions[1].title,/POST_CLASS 增幅明显/);
assert.equal(traffic.actions,undefined);
assert.equal(traffic.cards,undefined);
assert.match(traffic.notes[0],/北京时间/);
const profile=ctx.DinoDashboardInsights.profile(D,state);
assert.equal(profile.conclusions.length,4);
assert.match(profile.conclusions[0].body,/沙特阿拉伯 · SA/);
assert.equal(profile.actions,undefined);
const filtered=ctx.DinoDashboardInsights.profile(D,{...state,start:21,level:String(D.dimensions.levels.indexOf('1')),country:String(D.dimensions.countries.indexOf('VN'))});
for(const conclusion of filtered.conclusions){assert.match(conclusion.body,/Level 1/);assert.match(conclusion.body,/越南 · VN/)}
console.log(JSON.stringify({status:'PASS',checks:['two traffic conclusions','weekly trend','profile overall and entries','filters','no product actions'],traffic:traffic.conclusions,profile:profile.conclusions},null,2));
