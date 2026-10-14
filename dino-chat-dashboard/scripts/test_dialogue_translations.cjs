const assert=require('assert'),fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..'),ctx={window:{},Intl};vm.createContext(ctx);
function load(name){vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),ctx)}
load('sampled-conversation-analysis-data.js');
load('post-class-lesson-alignment-data.js');
load('post-class-student-behavior-data.js');
const samples=ctx.window.DINO_SAMPLED_CONVERSATION_ANALYSIS;
const stripTranslations=value=>JSON.stringify(value,(k,v)=>['translation','user_en','dino_en'].includes(k)?undefined:Array.isArray(v)&&['child','dino'].includes(v[0])&&typeof v[1]==='string'?[v[0],v[1],null,...v.slice(3)]:v);
const before=stripTranslations(samples);
const lessonsBefore=stripTranslations(ctx.window.DINO_POST_CLASS_LESSON_ALIGNMENT);
const behaviorsBefore=stripTranslations(ctx.window.DINO_POST_CLASS_STUDENT_BEHAVIOR);
load('dialogue-translations-data.js');load('dialogue-translations.js');
const helper=ctx.window.DinoDialogueTranslations;
assert.equal(helper.get('Cakap bahasa Melayu boleh?'),'Can you speak Malay?');
assert.equal(helper.get('I can help with Korean a little. Say: “Annyeonghaseyo.”'),'I can help with Korean a little. Say: “Hello.”','romanized Korean in Dino speech');
assert.equal(helper.get('Cakap bahasa Melayu boleh?','Verified translation'),'Verified translation');
assert.equal(helper.get('Ordinary English sentence.'),'');
assert.equal(helper.get('__proto__'),'');
assert.equal(stripTranslations(samples),before,'no sample, original, timestamp, intent or count changes');
assert.equal(stripTranslations(ctx.window.DINO_POST_CLASS_LESSON_ALIGNMENT),lessonsBefore,'lesson evidence originals and timestamps unchanged');
assert.equal(stripTranslations(ctx.window.DINO_POST_CLASS_STUDENT_BEHAVIOR),behaviorsBefore,'behavior evidence originals and labels unchanged');
for(const role of ['user','assistant']){
 const source={messages:[{role,text:'Cakap bahasa Melayu boleh?',language:0,timestamp:'2026-10-08 13:18:32'}]};
 const copy=helper.session(source);
 assert.equal(copy.messages[0].translation,'Can you speak Malay?','both roles / ASCII local language');
 assert.equal(source.messages[0].translation,undefined,'source transcript not mutated');
 assert.equal(copy.messages[0].text,source.messages[0].text);
 assert.equal(copy.messages[0].timestamp,source.messages[0].timestamp);
}
const tuple=['dino','Cakap bahasa Melayu boleh?',null,'2026-10-08 13:18:32'];helper.hydrate(tuple);
assert.equal(tuple[2],'Can you speak Malay?');assert.equal(tuple[3],'2026-10-08 13:18:32');
const card={user:'Cakap bahasa Melayu boleh?',dino:'Cakap bahasa Melayu boleh?'};helper.hydrate(card);
assert.ok(card.user_en&&card.dino_en);
const context={original:'Cakap bahasa Melayu boleh?',messageIndex:3};helper.hydrate(context);
assert.equal(context.translation,'Can you speak Malay?');
// A service refusal must be visible and must not be mistaken for a translation.
const blockedContext={window:{DINO_DIALOGUE_TRANSLATIONS:{blocked:['blocked excerpt']}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'dialogue-translations.js'),'utf8'),blockedContext);
assert.match(blockedContext.window.DinoDialogueTranslations.get('blocked excerpt'),/translation unavailable/);
console.log(JSON.stringify({status:'PASS',checks:['Malay ASCII','both speakers','evidence and modal overlay','originals/timestamps unchanged','sample labels/counts unchanged']}));
