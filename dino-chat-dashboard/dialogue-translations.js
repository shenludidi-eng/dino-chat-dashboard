/* Presentation-only English translations. Never recode labels or rewrite source transcripts. */
((root)=>{
'use strict';
const data=root.DINO_DIALOGUE_TRANSLATIONS||{},dictionary=data.translations||{},blocked=new Set(data.blocked||[]);
const get=(original,existing='')=>typeof existing==='string'&&existing.trim()?existing:
  typeof original==='string'&&Object.hasOwn(dictionary,original.trim())?dictionary[original.trim()]:
  typeof original==='string'&&blocked.has(original.trim())?'[English translation unavailable: this batch was blocked by the translation service. Original text retained.]':'';
function hydrate(value){
 if(!value||typeof value!=='object')return value;
 if(Array.isArray(value)){
  if(['child','dino'].includes(value[0])&&typeof value[1]==='string'){
   const translated=get(value[1],value[2]);if(translated)value[2]=translated;
  }else value.forEach(hydrate);
  return value;
 }
 if(typeof value.original==='string'){
  const translated=get(value.original,value.translation);if(translated)value.translation=translated;
 }
 if(typeof value.text==='string'&&['user','assistant','child','dino'].includes(value.role)){
  const translated=get(value.text,value.translation);if(translated)value.translation=translated;
 }
 for(const role of ['user','dino'])if(typeof value[role]==='string'){
  const translated=get(value[role],value[`${role}_en`]);if(translated)value[`${role}_en`]=translated;
 }
 Object.values(value).forEach(hydrate);
 return value;
}
// Copy fetched messages; cached/source transcripts and their integrity hashes stay intact.
const session=value=>value?{...value,messages:value.messages.map(m=>({...m,translation:get(m.text,m.translation)}))}:value;
root.DinoDialogueTranslations={get,hydrate,session,meta:data.meta||{}};
for(const key of ['DINO_DATA','DINO_SAMPLED_CONVERSATION_ANALYSIS','DINO_POST_CLASS_LESSON_ALIGNMENT','DINO_POST_CLASS_STUDENT_BEHAVIOR'])hydrate(root[key]);
})(typeof window==='undefined'?globalThis:window);
