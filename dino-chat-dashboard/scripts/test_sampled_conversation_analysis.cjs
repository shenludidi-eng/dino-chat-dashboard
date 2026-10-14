const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),ctx={window:{},Intl};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'sampled-conversation-analysis-data.js'),'utf8'),ctx);
const data=ctx.window.DINO_SAMPLED_CONVERSATION_ANALYSIS;
assert.ok(data&&data.meta&&data.codebooks&&data.samples);
assert.ok(data.codebooks.behaviors.HOME&&data.codebooks.behaviors.EXPLORE,'entry-specific behavior codebooks');
assert.notDeepEqual(Object.keys(data.codebooks.behaviors.HOME),Object.keys(data.codebooks.behaviors.EXPLORE),'HOME and EXPLORE behavior categories are independently coded');
assert.ok(data.codebooks.behaviors.HOME.brief_opening_reply&&data.codebooks.behaviors.HOME.preference);
assert.ok(data.codebooks.behaviors.EXPLORE.topic_control&&data.codebooks.behaviors.EXPLORE.request_activity);
for(const entry of ['HOME','EXPLORE','POST_CLASS']){
 const rows=data.samples[entry];assert.equal(rows.length,160,`${entry} fixed sample size`);
 for(const level of ['1','2','3','4'])assert.equal(rows.filter(row=>row.level===level).length,40,`${entry} Level ${level} stratum`);
 assert.ok(rows.every(row=>row.sid!==undefined&&row.date&&row.age&&row.country));
 assert.ok(rows.every(row=>row.intentReview&&row.intentReview.messageCount>0));
 assert.ok(rows.every(row=>(row.intents.length>0)===(row.intentReview.status==='coded')),'no forced fallback intent');
}
const reviewedPostClass=data.samples.POST_CLASS.find(row=>row.sid===11602);
assert.ok(reviewedPostClass,'human-reviewed POST_CLASS sample is retained');
assert.deepEqual(reviewedPostClass.intents,['lesson'],'human review replaces social with lesson');
assert.equal(reviewedPostClass.quotes.intents.lesson.original,'My friend.');
assert.ok(!reviewedPostClass.quotes.intents.social,'removed AI label has no remaining evidence');
const reviewedSing=data.samples.POST_CLASS.find(row=>row.sid===13152);
assert.ok(reviewedSing,'human-reviewed Sing sample is retained');
assert.deepEqual(reviewedSing.intents,['lesson'],'Sing is corrected from entertainment to lesson');
assert.equal(reviewedSing.quotes.intents.lesson.original,'Sing.');
assert.ok(!reviewedSing.quotes.intents.entertainment,'corrected Sing sample has no entertainment evidence');
for(const sid of [12688,12187,12720,12799,12424,12925,13152]){
 const row=data.samples.POST_CLASS.find(item=>item.sid===sid);
 assert.ok(row&&row.intents.includes('lesson'),`POST_CLASS entertainment-like sample ${sid} is lesson follow-up`);
}
assert.ok(data.samples.POST_CLASS.every(row=>!row.intents.includes('entertainment')),'POST_CLASS removes entertainment intent');
assert.ok(data.samples.POST_CLASS.every(row=>!row.quotes.intents.entertainment),'POST_CLASS removes entertainment evidence');
const reviewedReading=data.samples.POST_CLASS.find(row=>row.sid===13081);
assert.ok(reviewedReading,'human-reviewed reading sample is retained');
assert.deepEqual(reviewedReading.intents,['lesson'],'lesson reading response is corrected from practice to lesson');
assert.equal(reviewedReading.quotes.intents.lesson.original,'I read a book.');
assert.ok(!reviewedReading.quotes.intents.practice,'corrected reading response has no practice evidence');
const reviewedVietnam=data.samples.POST_CLASS.find(row=>row.sid===11965);
assert.ok(reviewedVietnam,'human-reviewed Vietnam self-expression sample is retained');
assert.ok(reviewedVietnam.intents.includes('identity_curiosity'),'Dino origin question remains identity curiosity');
assert.ok(reviewedVietnam.intents.includes('self_expression'),'student location statement is also self-expression');
assert.equal(reviewedVietnam.quotes.intents.self_expression.original,"I'm from Vietnam East.");
assert.equal(data.codebooks.intents.identity_curiosity.label,'对Dino身份、能力好奇');
const identitySamples=data.samples.POST_CLASS.filter(row=>row.intents.includes('identity_curiosity'));
assert.ok(identitySamples.length>=2,'POST_CLASS includes Dino identity curiosity evidence');
assert.ok(identitySamples.some(row=>/how old are you/i.test(row.quotes.intents.identity_curiosity.original)),'age question is identity curiosity');
assert.ok(identitySamples.some(row=>/what(?:'s| is) your name/i.test(row.quotes.intents.identity_curiosity.original)),'name question is identity curiosity');
assert.ok(!data.codebooks.intents.capability,'capability merged into identity curiosity');
for(const [entry,expected] of Object.entries({HOME:19,EXPLORE:19,POST_CLASS:7})){
 const rows=data.samples[entry];
 assert.equal(rows.filter(row=>row.intents.includes('identity_curiosity')).length,expected);
 assert.ok(rows.every(row=>!row.intents.includes('capability')&&!row.quotes.intents.capability));
 assert.ok(rows.every(row=>new Set(row.intents).size===row.intents.length));
}
for(const [entry,sid,index] of [['HOME',5060,52],['HOME',10396,0],['POST_CLASS',13206,2]]){
 const row=data.samples[entry].find(item=>item.sid===sid);
 assert.equal(row.quotes.intents.identity_curiosity.messageIndex,index,'original capability evidence anchor retained');
}
assert.equal(data.codebooks.intents.self_expression.label,'自我表达与倾诉');
const reviewedExpression=data.samples.POST_CLASS.find(row=>row.sid===13178);
assert.ok(reviewedExpression.intents.includes('self_expression'),'music-homework conversation is self-expression');
assert.match(reviewedExpression.quotes.intents.self_expression.original,/can we talk for a second/i,'explicit request to talk is preferred as evidence');
assert.ok(data.samples.POST_CLASS.every(row=>!row.intents.includes('information')),'POST_CLASS removes unsupported information-seeking intent');
assert.ok(data.samples.POST_CLASS.every(row=>!row.quotes.intents.information),'POST_CLASS removes information-seeking evidence');
for(const entry of ['HOME','EXPLORE']){
 const rows=data.samples[entry];
 assert.ok(Object.keys(data.codebooks.topics[entry]).filter(key=>rows.some(row=>row.topics.includes(key))).length>=6);
 const behaviorKeys=Object.keys(data.codebooks.behaviors[entry]);
 assert.ok(behaviorKeys.filter(key=>rows.some(row=>row.behaviors.includes(key))).length>=7,`${entry} behavior coverage`);
 assert.ok(rows.every(row=>row.behaviors.every(key=>behaviorKeys.includes(key))),`${entry} only uses its own behavior codebook`);
}
const source=fs.readFileSync(path.join(root,'sampled-conversation-analysis.js'),'utf8');
assert.ok(source.includes("data-sample-filter=\"level\""));
assert.ok(source.includes('FIXED_OPENING_POOL'));
assert.ok(source.includes(`What's your favorite color?`));
assert.ok(source.includes(`It's time to chat! Are you ready?`));
assert.ok(source.includes('chat history 不包含 Dino 的首句话'));
assert.ok(source.includes('数据源不记录 Dino 的首条固定引导'));
assert.ok(source.includes('POST_CLASS 只作为观察框架参考'));
assert.ok(source.includes("data-sample-filter=\"age\""));
assert.ok(source.includes("data-sample-filter=\"country\""));
assert.ok(source.includes('analysis/transcripts/'));
assert.ok(source.includes('北京时间'));
assert.ok(source.includes('每批最多 10 条'));
assert.ok(source.includes('data-sample-evidence-next'));
assert.ok(source.includes('查看取数与计算规则'),'intent section exposes calculation details');
assert.ok(source.includes('意图 Session 出现率 = 命中该意图的 Session 数 ÷ 当前抽样 Session 数'),'intent formula is explicit');
assert.ok(source.includes('同一个 Session 可以同时命中'),'intent overlap is explicit');
assert.ok(source.includes('这不是“命中消息数 ÷ 所有消息数”'),'message-share interpretation is rejected');
console.log(JSON.stringify({status:'PASS',samples:Object.fromEntries(Object.entries(data.samples).map(([entry,rows])=>[entry,rows.length])),checks:['level-stratified fixed sample','topic codebooks by entry','profile filters','full timestamped transcript evidence']}));
