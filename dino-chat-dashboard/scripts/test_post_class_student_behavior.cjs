const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ctx={window:{}};vm.createContext(ctx);
for(const file of ['post-class-student-behavior-data.js','post-class-student-behavior.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
const data=ctx.window.DINO_POST_CLASS_STUDENT_BEHAVIOR;
assert.equal(data.meta.sampleSize,96);
assert.equal(data.sample.length,96);
assert.ok(Array.isArray(data.weeks)&&data.weeks.length>=3,'weekly filter requires sampled weeks');
assert.ok(data.sample.every(row=>/^\d{4}-\d{2}-\d{2}$/.test(row.week)),'every sampled Session requires a week');
assert.deepEqual([...new Set(data.sample.map(row=>row.level))].sort(),['L1','L2','L3','L4']);
for(const level of ['L1','L2','L3','L4'])assert.equal(data.sample.filter(row=>row.level===level).length,24);
const keys=['confusion','localLanguage','earlyExit','refusal','asksQuestion','elaboration'];
assert.deepEqual(Object.keys(data.definitions),keys);
for(const key of keys){
 assert.ok(data.sample.some(row=>row.flags[key]),`${key} requires sample hits`);
 assert.ok(data.evidence[key].length>=3,`${key} requires multiple evidence rows`);
 for(const evidence of data.evidence[key])assert.ok(data.cases.some(item=>item.id===evidence.caseId),`${key} evidence must resolve`);
}
assert.ok(data.cases.every(item=>/^\d{4}-\d{2}-\d{2}$/.test(item.week)),'every transcript case requires a week');
const nonEnglish=/[\u0600-\u06ff\u0750-\u077f\u0e00-\u0e7f\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff]|[ăâđêôơưĂÂĐÊÔƠƯàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i;
assert.ok(data.cases.every(item=>item.conversation.length>=2));
const localized=data.cases.flatMap(item=>item.conversation.filter(message=>message[2]));
assert.ok(localized.length>0,'localized messages must be present');
assert.ok(localized.some(message=>nonEnglish.test(message[1])),'localized messages must retain source-language text');
assert.ok(localized.every(message=>typeof message[2]==='string'&&message[2].trim()),'localized messages need a separate English translation');
assert.ok(localized.every(message=>message[1]!==message[2]),'the translation must not replace the original');
const vietnamese=data.cases.find(item=>item.id==='S001').conversation[2];
assert.equal(vietnamese[1],'Bạn có thể nói tiếng Việt Nam cho tôi nghe hiểu được không?');
assert.equal(vietnamese[2],'Could you speak Vietnamese so I can understand?');
const caseMap=new Map(data.cases.map(item=>[item.id,item]));
for(const row of data.evidence.localLanguage){
 const needle=row.hit.toLocaleLowerCase();
 const message=caseMap.get(row.caseId).conversation.find(item=>typeof item[2]==='string'&&item[2].toLocaleLowerCase().includes(needle));
 assert.ok(message,`${row.caseId} local-language evidence must resolve to original + translation`);
}
console.log(JSON.stringify({status:'PASS',sample:data.sample.length,cases:data.cases.length,evidence:Object.fromEntries(keys.map(key=>[key,data.evidence[key].length]))}));
